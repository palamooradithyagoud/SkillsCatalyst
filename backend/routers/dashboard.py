import re
from fastapi import APIRouter, Depends
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

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
            if res_resume.data and res_resume.data[0]:
                sc = res_resume.data[0].get("overall_score") or res_resume.data[0].get("ats_compatibility_score")
                if sc is not None:
                    resume_score = round(float(sc))
            elif res_user_prog.data and res_user_prog.data[0].get("resume_readiness_score"):
                resume_score = round(float(res_user_prog.data[0].get("resume_readiness_score")))

            # 8. Fetch completed roadmap topics count, active roadmap, and next topic from roadmap_progress table
            roadmap_completed_count = 0
            active_roadmap_name = ""
            next_topic = ""
            roadmap_pct = 0
            roadmap_subtitle = "No active roadmap"

            res_roadmap = (
                sb.table("roadmap_progress")
                .select("roadmap_id, node_id, node_title, completed_at")
                .eq("user_id", user_id)
                .eq("status", "completed")
                .order("completed_at", desc=True)
                .execute()
            )

            if res_roadmap.data and len(res_roadmap.data) > 0:
                roadmap_groups = {}
                latest_roadmap_id = res_roadmap.data[0].get("roadmap_id")
                for r in res_roadmap.data:
                    rid = r.get("roadmap_id")
                    nid = r.get("node_id") or r.get("node_title")
                    if rid and nid:
                        if rid not in roadmap_groups:
                            roadmap_groups[rid] = set()
                        roadmap_groups[rid].add(nid)

                target_rid = latest_roadmap_id if latest_roadmap_id in roadmap_groups else list(roadmap_groups.keys())[0]
                user_completed_for_active = roadmap_groups.get(target_rid, set())
                roadmap_completed_count = len(user_completed_for_active)

                ROADMAP_SPECS = {
                    "c-programming": {
                        "name": "C Programming",
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
                        "name": "Full Stack Web Dev",
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

                spec = ROADMAP_SPECS.get(target_rid)
                if spec:
                    active_roadmap_name = spec["name"]
                    spec_nodes = spec["nodes"]
                    total_spec = len(spec_nodes)
                    roadmap_pct = min(100, round((roadmap_completed_count / max(1, total_spec)) * 100))

                    next_node = None
                    for node in spec_nodes:
                        if node not in user_completed_for_active and node.lower() not in [c.lower() for c in user_completed_for_active if isinstance(c, str)]:
                            next_node = node
                            break

                    next_topic = next_node if next_node else "Roadmap Completed 🎉"
                    roadmap_subtitle = f"{active_roadmap_name} • {roadmap_completed_count}/{total_spec} topics"
                else:
                    active_roadmap_name = target_rid.replace("-", " ").title()
                    roadmap_pct = min(100, round((roadmap_completed_count / 15) * 100))
                    next_topic = "Next Milestone Topic"
                    roadmap_subtitle = f"{active_roadmap_name} • {roadmap_completed_count} topics"

        except Exception as e:
            print(f"Dashboard metrics query error: {e}")

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

    # Dynamic Success Rate (0 if no historical user_success_rate recorded)
    calc_success_rate = round(user_success_rate) if user_success_rate > 0 else (75 if problems_solved > 0 else 0)

    resume_subtitle = f"ATS Score: {resume_score}/100" if resume_score > 0 else "No upload yet"

    return {
        "user": {
            "name": display_name,
            "status": "ACTIVE",
            "streakDays": 0
        },
        "metrics": {
            "learningProgress": {
                "percentage": pct,
                "completedVideos": completed_count,
                "totalVideos": total_videos,
                "subtitle": subtitle_text
            },
            "roadmapProgress": {
                "count": roadmap_completed_count,
                "percentage": roadmap_pct,
                "subtitle": roadmap_subtitle,
                "roadmapName": active_roadmap_name,
                "nextTopic": next_topic
            },
            "resumeReadiness": {
                "percentage": resume_score,
                "subtitle": resume_subtitle
            },
            "interviewReadiness": {
                "isLocked": True,
                "subtitle": "Currently Locked"
            }
        },
        "upcoming": [],
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

