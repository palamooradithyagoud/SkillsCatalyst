"""
backend/services/ai_mentor/smart_planner.py
Deterministic Smart Task Planning, Prioritization, Workload Balancing, and Conflict Detection.

Core Features:
1. Feature A: AI Daily Planner (scheduling pending tasks into coherent daily time blocks).
2. Feature B: Smart Prioritization (ranking tasks by urgency, deadline proximity, and priority).
3. Feature C: Deadline-Aware Planning (respecting real deadlines and flagging infeasible workloads).
4. Feature D: Workload Balancing (distributing tasks smoothly across multiple days).
5. Feature E: Schedule Conflict Detection (identifying overlaps, past times, and capacity breaches).
6. Feature F: Plan Adjustment (revising and recalculating plans based on user constraints).
"""

import datetime
import logging
import re
from typing import Optional, List, Dict, Any, Tuple

from backend.models.ai_mentor_tasks import (
    ScheduledPlanItem,
    SchedulePlanData,
    TaskPriority,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Feature B: Smart Prioritization Algorithm
# ---------------------------------------------------------------------------

def prioritize_user_tasks(
    tasks: List[Dict[str, Any]],
    ref_now: Optional[datetime.datetime] = None,
    user_tz: str = "UTC",
    available_minutes: Optional[int] = None,
    include_completed: bool = False,
    reference_now: Optional[datetime.datetime] = None,
) -> List[Dict[str, Any]]:
    """
    Ranks pending tasks using a multi-factor deterministic scoring algorithm:
    - Urgency based on deadline proximity (overdue > due today > due tomorrow > upcoming > backlog).
    - Authentic existing task priority (high: +30, medium: +15, low: +0).
    - Missing duration identification (flags unestimated tasks without hallucinating).
    - Distinguishes authentic task priority from AI-recommended priority.
    """
    if not tasks:
        return []

    effective_now = reference_now if reference_now is not None else (ref_now if ref_now is not None else datetime.datetime.now(datetime.timezone.utc))
    if effective_now.tzinfo is None:
        effective_now = effective_now.replace(tzinfo=datetime.timezone.utc)

    ranked_tasks = []

    for t in tasks:
        st = t.get("status") or "todo"
        if not include_completed and st == "completed":
            continue

        tid = t.get("id")
        title = t.get("title") or "Untitled Task"
        authentic_priority = (t.get("priority") or "medium").lower()
        due_at_str = t.get("due_at")
        est_mins = t.get("estimated_minutes")

        # 1. Base Priority Score
        priority_weights = {"high": 30, "medium": 15, "low": 0}
        priority_score = priority_weights.get(authentic_priority, 15)

        # 2. Deadline Urgency Score & Urgency Reason
        urgency_score = 10
        urgency_reason = "No target deadline set."
        is_overdue = False
        hours_remaining = None

        if due_at_str:
            try:
                due_dt = datetime.datetime.fromisoformat(due_at_str.replace("Z", "+00:00"))
                diff_seconds = (due_dt - effective_now).total_seconds()
                hours_remaining = diff_seconds / 3600.0

                if diff_seconds < 0 or st == "past_due":
                    is_overdue = True
                    urgency_score = 100
                    overdue_hrs = abs(hours_remaining)
                    if overdue_hrs >= 24:
                        days = int(overdue_hrs // 24)
                        urgency_reason = f"Overdue by {days} day(s)!"
                    else:
                        urgency_reason = f"Overdue by {int(overdue_hrs)} hour(s)!"
                elif hours_remaining <= 12:
                    urgency_score = 90
                    urgency_reason = f"Critical deadline in {max(1, int(hours_remaining))} hour(s)!"
                elif hours_remaining <= 24:
                    urgency_score = 75
                    urgency_reason = "Due today!"
                elif hours_remaining <= 48:
                    urgency_score = 50
                    urgency_reason = "Due tomorrow."
                elif hours_remaining <= 168:  # 7 days
                    days = int(hours_remaining // 24)
                    urgency_score = 30
                    urgency_reason = f"Due in {days} day(s)."
                else:
                    urgency_score = 15
                    urgency_reason = "Upcoming deadline."
            except Exception:
                urgency_score = 10
                urgency_reason = "Unparseable deadline date."

        # 3. Duration Feasibility Score
        duration_penalty = 0
        missing_duration = False
        if est_mins is None:
            missing_duration = True
            duration_penalty = -5  # Slight penalty for unestimated tasks
        elif est_mins > 240:
            duration_penalty = -10  # Large tasks should be broken down

        # 4. Total Deterministic Score
        total_score = urgency_score + priority_score + duration_penalty

        # 5. AI Recommended Priority vs Authentic Priority
        if is_overdue or urgency_score >= 75:
            ai_recommended_priority = "high"
        elif urgency_score >= 30 or priority_score >= 15:
            ai_recommended_priority = "medium"
        else:
            ai_recommended_priority = "low"

        ranked_tasks.append({
            "id": tid,
            "title": title,
            "status": st,
            "authentic_priority": authentic_priority,
            "ai_recommended_priority": ai_recommended_priority,
            "due_at": due_at_str,
            "is_overdue": is_overdue,
            "hours_remaining": hours_remaining,
            "estimated_minutes": est_mins,
            "missing_duration": missing_duration,
            "urgency_score": urgency_score,
            "urgency_reason": urgency_reason,
            "urgency_reasons": [urgency_reason],
            "total_score": total_score,
        })

    # Sort descending by total score, then by deadline proximity
    def sort_key(item: Dict[str, Any]):
        return (
            -item["total_score"],
            item["hours_remaining"] if item["hours_remaining"] is not None else 999999,
            item["title"].lower(),
        )

    ranked_tasks.sort(key=sort_key)
    for idx, r in enumerate(ranked_tasks, 1):
        r["urgency_rank"] = idx

    return ranked_tasks


# ---------------------------------------------------------------------------
# Feature E: Schedule Conflict Detection
# ---------------------------------------------------------------------------

def _get_item_attr(item: Any, attr: str, default: Any = None) -> Any:
    """Helper to read attributes or dict keys interchangeably."""
    if isinstance(item, dict):
        return item.get(attr, default)
    return getattr(item, attr, default)


def _set_item_attr(item: Any, attr: str, val: Any) -> None:
    """Helper to set attributes or dict keys interchangeably."""
    if isinstance(item, dict):
        item[attr] = val
    else:
        try:
            setattr(item, attr, val)
        except Exception:
            pass


def analyze_schedule_conflicts(
    schedule_items: List[Any],
    ref_now: Optional[datetime.datetime] = None,
    client_tz: str = "UTC",
    available_minutes: Optional[int] = None,
    reference_now: Optional[datetime.datetime] = None,
) -> Tuple[List[Any], bool, List[str]]:
    """
    Scans a list of proposed schedule items for realistic physical conflicts:
    1. Overlapping proposed time blocks (e.g. 09:00-10:00 and 09:30-10:30).
    2. Scheduling in the past relative to the student's current local time.
    3. Tasks scheduled past their authoritative deadlines.
    4. Duration mismatch (allocated time slot < estimated task minutes).
    5. Workload capacity overload (total minutes exceeding available time or 8-hour workday limit).

    Returns:
        (validated_items, detected_conflicts_bool, global_warnings_list)
    """
    conflicts: List[str] = []
    warnings: List[str] = []
    detected_conflicts = False

    if not schedule_items:
        return schedule_items, False, []

    effective_now = reference_now if reference_now is not None else (ref_now if ref_now is not None else datetime.datetime.now(datetime.timezone.utc))
    if effective_now.tzinfo is None:
        effective_now = effective_now.replace(tzinfo=datetime.timezone.utc)

    total_allocated_minutes = 0
    parsed_slots: List[Tuple[int, int, Any, Optional[datetime.datetime], Optional[datetime.datetime]]] = []

    for item in schedule_items:
        title = _get_item_attr(item, "title", "Untitled Task")
        start_str = _get_item_attr(item, "start_time", "") or ""
        end_str = _get_item_attr(item, "end_time", "") or ""
        time_range = _get_item_attr(item, "time_range", "") or ""
        est_mins = _get_item_attr(item, "estimated_minutes")
        due_at_str = _get_item_attr(item, "due_at")

        item_warnings = list(_get_item_attr(item, "warnings") or [])
        item_is_conflict = bool(_get_item_attr(item, "is_conflict", False))

        start_dt: Optional[datetime.datetime] = None
        end_dt: Optional[datetime.datetime] = None

        if start_str:
            try:
                start_dt = datetime.datetime.fromisoformat(str(start_str).replace("Z", "+00:00"))
                if start_dt.tzinfo is None:
                    start_dt = start_dt.replace(tzinfo=datetime.timezone.utc)
            except Exception:
                pass

        if end_str:
            try:
                end_dt = datetime.datetime.fromisoformat(str(end_str).replace("Z", "+00:00"))
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=datetime.timezone.utc)
            except Exception:
                pass

        # 1. Parse time slot into minutes from midnight
        start_min, end_min = _parse_time_range_or_times(start_str, end_str, time_range)

        if start_min is not None and end_min is not None:
            slot_duration = end_min - start_min
            if slot_duration <= 0:
                detected_conflicts = True
                item_is_conflict = True
                msg = f"Invalid time window for '{title}': End time must be after start time."
                conflicts.append(msg)
                item_warnings.append(msg)
            else:
                total_allocated_minutes += slot_duration
                parsed_slots.append((start_min, end_min, item, start_dt, end_dt))

                # Check duration vs slot
                if est_mins and slot_duration < est_mins:
                    w_msg = f"Allocated time for '{title}' ({slot_duration}m) is less than estimated duration ({est_mins}m)."
                    warnings.append(w_msg)
                    item_warnings.append(w_msg)

        # 2. Check past time scheduling
        if start_dt is not None:
            # Check absolute datetime
            if start_dt < (effective_now - datetime.timedelta(minutes=5)):
                detected_conflicts = True
                item_is_conflict = True
                past_msg = f"Scheduled in the past: '{title}' start time has already passed."
                conflicts.append(past_msg)
                item_warnings.append(past_msg)
        elif start_min is not None:
            current_day_minutes = effective_now.hour * 60 + effective_now.minute
            if start_min < (current_day_minutes - 5):
                detected_conflicts = True
                item_is_conflict = True
                past_msg = f"Scheduled in the past: '{title}' starts at {start_str or _min_to_time(start_min)}."
                conflicts.append(past_msg)
                item_warnings.append(past_msg)

        # 3. Check deadline breach
        if due_at_str:
            try:
                due_dt = datetime.datetime.fromisoformat(str(due_at_str).replace("Z", "+00:00"))
                if due_dt.tzinfo is None:
                    due_dt = due_dt.replace(tzinfo=datetime.timezone.utc)

                if end_dt and end_dt > due_dt:
                    detected_conflicts = True
                    item_is_conflict = True
                    dl_msg = f"Scheduled block ends after deadline for '{title}'."
                    conflicts.append(dl_msg)
                    item_warnings.append(dl_msg)
                elif due_dt < effective_now:
                    w_msg = f"Task deadline has already elapsed; scheduled as overdue recovery for '{title}'."
                    warnings.append(w_msg)
                    item_warnings.append(w_msg)
            except Exception:
                pass

        _set_item_attr(item, "warnings", item_warnings)
        _set_item_attr(item, "is_conflict", item_is_conflict)

    # 4. Overlap detection
    parsed_slots.sort(key=lambda s: s[0])
    for i in range(1, len(parsed_slots)):
        prev_start, prev_end, prev_item, p_sdt, p_edt = parsed_slots[i - 1]
        curr_start, curr_end, curr_item, c_sdt, c_edt = parsed_slots[i]

        overlap = False
        if p_edt and c_sdt:
            if c_sdt < p_edt:
                overlap = True
        elif curr_start < prev_end:
            overlap = True

        if overlap:
            detected_conflicts = True
            prev_t = _get_item_attr(prev_item, "title", "Task")
            curr_t = _get_item_attr(curr_item, "title", "Task")
            overlap_msg = f"Time slot overlaps with another scheduled task: '{prev_t}' and '{curr_t}'."
            conflicts.append(overlap_msg)

            _set_item_attr(prev_item, "is_conflict", True)
            _set_item_attr(curr_item, "is_conflict", True)

            p_warns = list(_get_item_attr(prev_item, "warnings") or [])
            if overlap_msg not in p_warns:
                p_warns.append(overlap_msg)
                _set_item_attr(prev_item, "warnings", p_warns)

            c_warns = list(_get_item_attr(curr_item, "warnings") or [])
            if overlap_msg not in c_warns:
                c_warns.append(overlap_msg)
                _set_item_attr(curr_item, "warnings", c_warns)

    # 5. Capacity & Overload Analysis
    if available_minutes is not None and available_minutes > 0:
        if total_allocated_minutes > available_minutes:
            detected_conflicts = True
            excess = total_allocated_minutes - available_minutes
            cap_msg = f"Workload capacity exceeded: Total planned time ({total_allocated_minutes}m) exceeds available time ({available_minutes}m) by {excess}m."
            conflicts.append(cap_msg)
            warnings.append(cap_msg)
    elif total_allocated_minutes > 480:
        w_msg = f"Heavy workload: Total planned time ({total_allocated_minutes // 60}h {total_allocated_minutes % 60}m) exceeds 8 hours."
        warnings.append(w_msg)

    global_warnings = list(dict.fromkeys(conflicts + warnings))
    return schedule_items, detected_conflicts, global_warnings


# ---------------------------------------------------------------------------
# Feature D: Workload Balancing Across Days
# ---------------------------------------------------------------------------

def distribute_tasks_across_days(
    ranked_tasks: List[Dict[str, Any]],
    num_days: int = 3,
    days_count: Optional[int] = None,
    ref_now: Optional[datetime.datetime] = None,
    reference_now: Optional[datetime.datetime] = None,
    daily_capacity_minutes: Optional[int] = None,
    daily_limit_minutes: int = 240,
) -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """
    Distributes pending tasks smoothly across a multi-day planning period.
    Avoids overloading Day 1 while keeping downstream days empty.
    Prioritizes earlier deadlines on earlier days.
    Returns:
        (schedule_by_day, overload_notes)
    """
    target_days = days_count or num_days or 3
    target_days = max(1, min(target_days, 14))
    limit_mins = daily_capacity_minutes or daily_limit_minutes or 240

    effective_now = reference_now if reference_now is not None else (ref_now if ref_now is not None else datetime.datetime.now(datetime.timezone.utc))

    schedule_days: List[Dict[str, Any]] = []
    for d in range(1, target_days + 1):
        day_date = (effective_now + datetime.timedelta(days=d - 1)).strftime("%Y-%m-%d")
        schedule_days.append({
            "day_index": d,
            "date": day_date,
            "allocated_minutes": 0,
            "tasks": [],
        })

    overload_notes: Optional[str] = None
    total_needed = 0

    for t_info in ranked_tasks:
        est = t_info.get("estimated_minutes") or 60
        total_needed += est

        # Find day with space
        placed = False
        for day in schedule_days:
            if day["allocated_minutes"] + est <= limit_mins:
                day["tasks"].append(t_info)
                day["allocated_minutes"] += est
                placed = True
                break

        if not placed:
            # Place in day with least allocated minutes
            least_day = min(schedule_days, key=lambda d: d["allocated_minutes"])
            least_day["tasks"].append(t_info)
            least_day["allocated_minutes"] += est

    total_capacity = target_days * limit_mins
    if total_needed > total_capacity:
        excess = total_needed - total_capacity
        overload_notes = f"Total workload ({total_needed}m) exceeds total capacity ({total_capacity}m) across {target_days} days by {excess} minutes."

    return schedule_days, overload_notes


# ---------------------------------------------------------------------------
# Prompt Context Formatter for AI Mentor
# ---------------------------------------------------------------------------

def format_smart_planner_context(
    user_tasks: List[Dict[str, Any]],
    ref_now: Optional[datetime.datetime] = None,
    client_tz: str = "UTC",
    available_hours: Optional[float] = None,
    reference_now: Optional[datetime.datetime] = None,
) -> str:
    """
    Generates an enriched, authoritative <smart_planning_analysis> XML block
    injected into the AI Mentor prompt whenever task planning is requested.
    """
    effective_now = reference_now if reference_now is not None else (ref_now if ref_now is not None else datetime.datetime.now(datetime.timezone.utc))
    available_minutes = int(available_hours * 60) if available_hours else None
    ranked = prioritize_user_tasks(user_tasks, effective_now, client_tz, available_minutes)

    overdue_tasks = [t for t in ranked if t["is_overdue"]]
    due_today_tasks = [t for t in ranked if not t["is_overdue"] and t["urgency_score"] == 75]
    unestimated_tasks = [t for t in ranked if t["missing_duration"]]

    total_pending_count = len(ranked)
    total_known_minutes = sum(t["estimated_minutes"] for t in ranked if t["estimated_minutes"])

    lines = [
        f'<smart_planning_analysis pending_count="{total_pending_count}" overdue_count="{len(overdue_tasks)}">',
        f"  <!-- REFERENCE TIME: {effective_now.strftime('%A, %d %B %Y, %H:%M:%S')} ({client_tz}) -->",
        f"  <!-- TOTAL PENDING TASKS: {total_pending_count} | KNOWN ESTIMATED TIME: {total_known_minutes} minutes ({round(total_known_minutes / 60, 1)} hrs) -->",
    ]

    if available_minutes:
        lines.append(f"  <!-- USER STATED AVAILABILITY: {available_minutes} minutes ({available_hours} hrs) -->")

    # Overdue summary
    if overdue_tasks:
        lines.append(f'  <overdue_alert count="{len(overdue_tasks)}">')
        for ot in overdue_tasks:
            lines.append(
                f'    <task id="{ot["id"]}" title="{ot["title"]}" is_overdue="{ot["is_overdue"]}" '
                f'priority="{ot["authentic_priority"]}" ai_priority="{ot["ai_recommended_priority"]}" '
                f'reason="{ot["urgency_reason"]}" />'
            )
        lines.append("  </overdue_alert>")

    # Tasks due today
    if due_today_tasks:
        lines.append(f'  <due_today count="{len(due_today_tasks)}">')
        for dt in due_today_tasks:
            lines.append(
                f'    <task id="{dt["id"]}" title="{dt["title"]}" priority="{dt["authentic_priority"]}" '
                f'ai_priority="{dt["ai_recommended_priority"]}" est_mins="{dt["estimated_minutes"] or "unestimated"}" />'
            )
        lines.append("  </due_today>")

    # Unestimated notice
    if unestimated_tasks:
        unest_titles = ", ".join(f"'{t['title']}'" for t in unestimated_tasks[:5])
        lines.append(f'  <missing_estimates count="{len(unestimated_tasks)}">Tasks without duration: {unest_titles}. Mention to student if planning requires precise scheduling.</missing_estimates>')

    # Top Ranked Items
    lines.append('  <ranked_recommendations top="10">')
    for idx, r in enumerate(ranked[:10], 1):
        lines.append(
            f'    <item rank="{idx}" id="{r["id"]}" title="{r["title"]}" '
            f'authentic_pri="{r["authentic_priority"]}" recommended_pri="{r["ai_recommended_priority"]}" '
            f'score="{r["total_score"]}" urgency="{r["urgency_reason"]}" est_mins="{r["estimated_minutes"] or "none"}" />'
        )
    lines.append("  </ranked_recommendations>")

    lines.append("</smart_planning_analysis>")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Internal Time Parsing Helpers
# ---------------------------------------------------------------------------

_TIME_PATTERN = re.compile(r"(\d{1,2}):(\d{2})")
_TIME_RANGE_PATTERN = re.compile(r"(\d{1,2}:\d{2})\s*[-–—to]+\s*(\d{1,2}:\d{2})", re.IGNORECASE)


def _parse_time_range_or_times(
    start_str: str,
    end_str: str,
    time_range_str: str,
) -> Tuple[Optional[int], Optional[int]]:
    """Converts time strings ('09:00', '10:30') or ranges into minutes from midnight (0..1439)."""
    # 1. Try explicit start and end
    s_min = _time_str_to_minutes(start_str)
    e_min = _time_str_to_minutes(end_str)
    if s_min is not None and e_min is not None:
        return s_min, e_min

    # 2. Try parsing from time_range_str
    if time_range_str:
        match = _TIME_RANGE_PATTERN.search(time_range_str)
        if match:
            s_min = _time_str_to_minutes(match.group(1))
            e_min = _time_str_to_minutes(match.group(2))
            if s_min is not None and e_min is not None:
                return s_min, e_min

    return None, None


def _time_str_to_minutes(val: str) -> Optional[int]:
    """Converts 'HH:MM' or ISO string to minutes from midnight."""
    if not val or not isinstance(val, str):
        return None
    val_clean = val.strip()

    # Match simple HH:MM
    match = _TIME_PATTERN.search(val_clean)
    if match:
        h = int(match.group(1))
        m = int(match.group(2))
        if 0 <= h < 24 and 0 <= m < 60:
            return h * 60 + m

    # Try ISO timestamp parse
    try:
        dt = datetime.datetime.fromisoformat(val_clean.replace("Z", "+00:00"))
        return dt.hour * 60 + dt.minute
    except Exception:
        pass

    return None


def _min_to_time(minutes: int) -> str:
    """Converts minutes from midnight to 'HH:MM' format."""
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"
