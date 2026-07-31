import re
from fastapi import APIRouter, Depends
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

ROADMAP_SPECS = {
    "c-programming": {
        "name": "C Programming Mastery",
        "nodes": [
            "Introduction (C vs Assembly / C vs C++)", "Installing C & Toolchains", "Running Your First C Program", "Code Editors & IDEs (VSCode / Vim / NVim)",
            "Variables (Declaration vs Definition)", "Initialization & Printing Variables", "Basic Data Types (int / float / double / char)", "Fixed-Width Integers & Booleans", "Type Conversion & Casting", "Type Qualifiers (const / volatile / restrict / _Atomic)",
            "Operators (Arithmetic / Comparison / Logical / Ternary / Bitwise)", "Control Flow (if-else / switch)", "Loops (for / while / do-while / break / continue)", "main Function & Command-Line Arguments", "Variable Scopes", "Recursive & Variadic Functions",
            "Memory Model (Stack vs Heap & Lifetimes)", "Pointer Basics & Syntax", "Null Pointers & void Pointers", "Pointer Arithmetic",
            "Structs & Typedef", "Unions & Enums", "Arrays & Dynamic Arrays", "Strings & Text Processing", "Linked Lists, Hash Maps & Ring Buffers",
            "Dynamic Memory Allocation (malloc / calloc / realloc / free)", "Memory Leakage & Valgrind", "Dangling Pointers & Undefined Behavior", "Buffer Overflow Prevention",
            "Header Files & Code Structure", "Linkage & Storage Classes (static / extern)", "Error Handling (errno & Exit Codes)", "Non-Local Jumps (setjmp / longjmp)",
            "Streams & File Pointers (stdio.h)", "Binary vs Text File Mode", "Data Utilities & Text Processing (stdlib.h / string.h / ctype.h)", "Math, Time & Diagnostics (math.h / time.h / assert.h)", "OS & Signal Interfaces (signal.h)",
            "Preprocessor Macros & Conditional Compilation", "Compilers & Optimization (GCC / Clang / TinyCC)", "Symbol Tables, Linking & ABI", "Build Systems (GNU Make / CMake / Ninja / Meson)", "C Package Managers (vcpkg / Conan)",
            "Debugging (GDB / LLDB / Valgrind / ASan / LSan)", "Testing Frameworks (assert.h / Unity / CMocka / Check)", "Idioms (Function Pointers / Callbacks / Opaque Pointers / OOP C)", "Concurrency & Processes (POSIX Threads / Mutexes / IPC)", "C Standards (C89 / C99 / C11 / C17 / C23)"
        ]
    },
    "cpp-programming": {
        "name": "C++ Development",
        "nodes": [
            "Introduction to Language (What is C++ / Why C++ / C vs C++)", "Setting Up Environment (Installing C++ / IDEs / VSCode)", "Running Your First C++ Program",
            "Variables & Basic Data Types", "Operators (Arithmetic / Comparison / Logical / Bitwise)", "Control Flow (if-else / switch / loops)",
            "Functions & Pass-by-Value vs Reference", "Pointers & References", "Dynamic Memory (new / delete)",
            "Classes & Objects", "Constructors & Destructors", "Inheritance & Polymorphism", "Virtual Functions & Abstract Classes",
            "STL Vectors & Strings", "STL Maps & Sets", "Iterators & Algorithms",
            "Templates & Generic Programming", "Smart Pointers (unique_ptr / shared_ptr)", "Lambda Expressions & Move Semantics"
        ]
    },
    "python": {
        "name": "Python Mastery",
        "nodes": [
            "Introduction & Installing Python", "Variables & Data Types", "Control Flow & Loops",
            "Functions & Lambdas", "Lists, Tuples, Dicts & Sets", "Modules & Imports",
            "File I/O & Exception Handling", "OOP in Python (Classes & Inheritance)", "Virtual Environments & Pip",
            "NumPy & Pandas Basics", "FastAPI / Django Web Framework", "PyTest & Unit Testing"
        ]
    },
    "full-stack": {
        "name": "Full Stack Developer",
        "nodes": [
            "HTML5 & Semantic Markup", "CSS3, Flexbox & Grid", "JavaScript ES6+ Fundamentals",
            "DOM Manipulation & Events", "Async JS, Promises & Fetch", "React.js Components & Hooks",
            "Next.js App Router & SSR", "TailwindCSS Styling", "Node.js & Express APIs",
            "Supabase & PostgreSQL Databases", "REST & GraphQL APIs", "Git, GitHub & Vercel Deployment"
        ]
    },
    "devops": {
        "name": "DevOps & Cloud",
        "nodes": [
            "Linux Command Line & Shell Scripting", "Networking & SSH Fundamentals", "Git Version Control & Branching",
            "Docker Containers & Dockerfile", "Docker Compose Multi-container Setup", "CI/CD Pipelines (GitHub Actions)",
            "Kubernetes Architecture & Deployments", "Terraform Infrastructure as Code", "AWS / Cloud Services & IAM"
        ]
    }
}

def get_active_roadmap_data(user_id: str) -> dict:
    sb = get_supabase()
    if not sb:
        return {"has_active_roadmap": False}

    try:
        res_roadmap = (
            sb.table("roadmap_progress")
            .select("roadmap_id, node_id, node_title, status, completed_at")
            .eq("user_id", user_id)
            .order("completed_at", desc=True)
            .execute()
        )

        if not res_roadmap.data or len(res_roadmap.data) == 0:
            return {"has_active_roadmap": False}

        roadmap_groups = {}
        latest_roadmap_id = None
        latest_timestamp = None

        for r in res_roadmap.data:
            rid = r.get("roadmap_id")
            if rid and not latest_roadmap_id:
                latest_roadmap_id = rid
                latest_timestamp = r.get("completed_at")
            nid = r.get("node_id") or r.get("node_title")
            st = r.get("status")
            if rid:
                if rid not in roadmap_groups:
                    roadmap_groups[rid] = set()
                if nid and nid != "_roadmap_started" and st == "completed":
                    roadmap_groups[rid].add(nid)

        if not latest_roadmap_id:
            return {"has_active_roadmap": False}

        target_rid = latest_roadmap_id
        user_completed_for_active = roadmap_groups.get(target_rid, set())
        completed_count = len(user_completed_for_active)

        target_clean = str(target_rid).lower().strip()
        matched_key = None
        if "c-prog" in target_clean or "c prog" in target_clean or "c programming" in target_clean or "1. c" in target_clean:
            matched_key = "c-programming"
        elif "cpp" in target_clean or "c++" in target_clean or "2. c++" in target_clean:
            matched_key = "cpp-programming"
        elif "python" in target_clean:
            matched_key = "python"
        elif "full" in target_clean or "web" in target_clean or "react" in target_clean:
            matched_key = "full-stack"
        elif "devops" in target_clean or "cloud" in target_clean:
            matched_key = "devops"
        else:
            matched_key = target_rid

        spec = ROADMAP_SPECS.get(matched_key)
        if spec:
            title = spec["name"]
            spec_nodes = spec["nodes"]
            total_milestones = len(spec_nodes)
            progress_percent = min(100, round((completed_count / max(1, total_milestones)) * 100))

            current_node = None
            next_node = None
            for node in spec_nodes:
                if node in user_completed_for_active or any(c.lower() in node.lower() for c in user_completed_for_active if isinstance(c, str)):
                    current_node = node
                elif not next_node:
                    next_node = node

            current_module = {"id": current_node, "title": current_node} if current_node else None
            next_module = {"id": next_node, "title": next_node} if next_node else {"id": "completed", "title": "Roadmap Completed 🎉"}
        else:
            title = re.sub(r'^\d+\.\s*', '', str(target_rid)).replace("-", " ").title()
            total_milestones = max(15, completed_count)
            progress_percent = min(100, round((completed_count / total_milestones) * 100))
            current_module = None
            next_module = {"id": "next", "title": "Next Milestone Topic"}

        return {
            "has_active_roadmap": True,
            "roadmap_id": target_rid,
            "title": title,
            "progress_percent": progress_percent,
            "completed_milestones": completed_count,
            "total_milestones": total_milestones,
            "current_module": current_module,
            "next_module": next_module,
            "last_activity_at": latest_timestamp
        }
    except Exception as e:
        print(f"Error getting active roadmap data: {e}")
        return {"has_active_roadmap": False}


@router.get("/active-roadmap")
def get_active_roadmap_endpoint(user_id: str = Depends(get_current_user_id)):
    return get_active_roadmap_data(user_id)


@router.get("")
def get_dashboard_data(user_id: str = Depends(get_current_user_id)):
    # user_id is now guaranteed to be a valid authenticated Supabase UUID (auth raises 401 otherwise)
    sb = get_supabase()
    completed_count = 0
    total_videos = 0
    problems_solved = 0
    saved_playlists_count = 0
    user_success_rate = 0.0
    display_name = user_id.split("@")[0] if "@" in user_id else user_id

    if sb:
        try:
            # 1. Count completed videos for this user
            res_completed = (
                sb.table("video_progress")
                .select("video_id", count="exact")
                .eq("user_id", user_id)
                .eq("watched", True)
                .execute()
            )
            completed_count = res_completed.count or (len(res_completed.data) if res_completed.data else 0)

            # 2. Get total videos and count from saved playlists
            res_saved = (
                sb.table("saved_playlists")
                .select("video_count")
                .eq("user_id", user_id)
                .execute()
            )
            if res_saved.data:
                saved_playlists_count = len(res_saved.data)
                for row in res_saved.data:
                    vc_str = str(row.get("video_count", "0"))
                    match = re.search(r'\d+', vc_str)
                    if match:
                        total_videos += int(match.group())

            # 3. Get problems solved count from leetcode_progress table
            res_problems = (
                sb.table("leetcode_progress")
                .select("question_id", count="exact")
                .eq("user_id", user_id)
                .eq("status", "solved")
                .execute()
            )
            db_leetcode_solved = res_problems.count or (len(res_problems.data) if res_problems.data else 0)

            # 4. Fetch extracted coding profiles stats (LeetCode, GFG, Codeforces, CodeChef, HackerRank)
            extracted_solved = 0
            res_code = (
                sb.table("user_coding_profiles")
                .select("stats_json")
                .eq("user_id", user_id)
                .execute()
            )
            if res_code.data and res_code.data[0].get("stats_json"):
                stats_json = res_code.data[0].get("stats_json", {})
                for platform, pdata in stats_json.items():
                    if isinstance(pdata, dict):
                        ts = pdata.get("total_solved") or pdata.get("solved") or 0
                        if isinstance(ts, (int, float)):
                            extracted_solved += int(ts)

            # Aggregated Total Problems Solved across DB progress + pasted coding profiles
            problems_solved = max(db_leetcode_solved, extracted_solved) if db_leetcode_solved > 0 and extracted_solved > 0 else (db_leetcode_solved + extracted_solved)

            # 5. Fetch user name from academic profile if exists
            res_profile = (
                sb.table("user_academic_profile")
                .select("full_name")
                .eq("user_id", user_id)
                .execute()
            )
            if res_profile.data and res_profile.data[0].get("full_name"):
                name_val = res_profile.data[0].get("full_name")
                if name_val:
                    display_name = name_val

            # 6. Fetch user_progress stats if present
            res_user_prog = (
                sb.table("user_progress")
                .select("success_rate, resume_readiness_score")
                .eq("user_id", user_id)
                .execute()
            )
            if res_user_prog.data:
                user_success_rate = float(res_user_prog.data[0].get("success_rate") or 0.0)

            # 7. Fetch latest resume score from resume_scores table
            resume_score = 0
            res_resume = (
                sb.table("resume_scores")
                .select("overall_score, ats_compatibility_score")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if res_resume.data and len(res_resume.data) > 0:
                sc = res_resume.data[0].get("overall_score") or res_resume.data[0].get("ats_compatibility_score")
                if sc is not None:
                    resume_score = round(float(sc))
            elif res_user_prog.data and res_user_prog.data[0].get("resume_readiness_score"):
                resume_score = round(float(res_user_prog.data[0].get("resume_readiness_score")))

        except Exception as e:
            print(f"Dashboard metrics query error: {e}")

    active_rm = get_active_roadmap_data(user_id)
    if active_rm.get("has_active_roadmap"):
        roadmap_completed_count = active_rm.get("completed_milestones", 0)
        roadmap_pct = active_rm.get("progress_percent", 0)
        active_roadmap_name = active_rm.get("title", "")
        next_topic = active_rm.get("next_module", {}).get("title", "")
        roadmap_subtitle = f"Following: {active_roadmap_name}"
    else:
        roadmap_completed_count = 0
        roadmap_pct = 0
        active_roadmap_name = ""
        next_topic = ""
        roadmap_subtitle = "No active roadmap"

    if total_videos > 0:
        if completed_count > total_videos:
            total_videos = completed_count
        pct = round((completed_count / total_videos) * 100)
        subtitle_text = f"{completed_count}/{total_videos} videos completed"
    elif completed_count > 0:
        pct = 0
        subtitle_text = f"{completed_count} video{'s' if completed_count != 1 else ''} completed"
    else:
        pct = 0
        subtitle_text = "0 videos completed"

    calc_success_rate = round(user_success_rate) if user_success_rate > 0 else (75 if problems_solved > 0 else 0)
    resume_subtitle = f"ATS Score: {resume_score}/100" if resume_score > 0 else "No upload yet"

    # Calculate Personal Readiness Index (PRI) with 15% Learning Progress weight
    coding_score = min(100.0, (problems_solved / 50.0) * 100.0)
    pri_score = round((resume_score * 0.35) + (coding_score * 0.35) + (pct * 0.15) + (roadmap_pct * 0.15), 1)

    return {
        "user": {
            "name": display_name,
            "status": "ACTIVE",
            "streakDays": 0
        },
        "metrics": {
            "personalReadinessIndex": {
                "score": pri_score,
                "learningWeightPct": 15,
                "resumeWeightPct": 35,
                "codingWeightPct": 35,
                "roadmapWeightPct": 15
            },
            "learningProgress": {
                "percentage": pct,
                "completedVideos": completed_count,
                "totalVideos": total_videos,
                "subtitle": subtitle_text
            },
            "roadmapProgress": {
                "has_active_roadmap": active_rm.get("has_active_roadmap", False),
                "count": roadmap_completed_count,
                "percentage": roadmap_pct,
                "subtitle": roadmap_subtitle,
                "roadmapName": active_roadmap_name,
                "nextTopic": next_topic,
                "roadmapId": active_rm.get("roadmap_id")
            },
            "resumeReadiness": {
                "percentage": resume_score,
                "subtitle": resume_subtitle
            },
            "interviewReadiness": {
                "isLocked": True,
                "subtitle": "Unlocks at 50% completion"
            }
        },
        "upcoming": [
            {
                "id": "1",
                "title": "C Programming Assessment",
                "type": "Practice",
                "time": "Tomorrow, 10:00 AM"
            }
        ],
        "practiceOverview": {
            "problemsSolved": problems_solved,
            "successRate": calc_success_rate,
            "contests": 0,
            "chartData": [
                {"day": "Mon", "solved": 0},
                {"day": "Tue", "solved": 0},
                {"day": "Wed", "solved": 0},
                {"day": "Thu", "solved": 0},
                {"day": "Fri", "solved": 0},
                {"day": "Sat", "solved": 0},
                {"day": "Sun", "solved": 0}
            ]
        }
    }
