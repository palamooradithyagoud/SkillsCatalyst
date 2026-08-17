import re
from fastapi import APIRouter, Depends
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id
from backend.routers.profile import _clean_handle

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

ROADMAP_SPECS = {
    "c-programming": {
        "name": "C Programming Mastery",
        "nodes": [
            "1. Introduction", "2. Setting Up", "3. Variables",
            "4. Data Types", "5. Operators", "6. Control Flow", "7. Functions",
            "8. Pointers & Memory", "9. Arrays", "10. Strings", "11. User Defined Types", "12. Common Data Structures",
            "13. Structuring Codebase", "14. Error Handling", "15. File I/O", "16. Standard Library", "17. Build & Compilation",
            "18. Debugging", "19. Testing", "20. Idioms & Design Patterns", "21. Concurrency & Process Management", "22. C Standards"
        ]
    },
    "cpp-programming": {
        "name": "C++ Development Mastery",
        "nodes": [
            "1. Introduction to Language", "2. Setting up your Environment", "3. Basic Operations", "4. Control Flow & Statements", "5. Functions", "6. Data Types", "7. Pointers and References", "8. Structuring Codebase", "9. Structures and Classes", "10. Templates", "11. Language Concepts", "12. Exception Handling", "13. Standard Library + STL", "14. Debuggers", "15. Compilers", "16. Build Systems", "17. Package Managers", "18. Working with Libraries", "19. Frameworks", "20. Idioms", "21. Standards"
        ]
    },
    "python-mastery": {
        "name": "Python Mastery",
        "nodes": [
            "1. Learn the Basics", "2. Data Structures & Algorithms", "3. Modules", "4. Lambdas", "5. Decorators", "6. Iterators", "7. Regular Expressions", "8. Object Oriented Programming", "9. Package Managers", "10. Common Packages", "11. List Comprehensions", "12. Generator Expressions", "13. Paradigms", "14. Context Manager", "15. Learn a Framework", "16. Concurrency", "17. Environments", "18. Static Typing", "19. Code Formatting", "20. Documentation", "21. Testing"
        ]
    },
    "java-spring-boot": {
        "name": "Java & Spring Boot Mastery",
        "nodes": [
            "1. Learn the Basics", "2. Object Oriented Programming", "3. Exception Handling", "4. Lambda & Modern Java", "5. Collections", "6. Dependency Injection", "7. I/O Operations", "8. Concurrency", "9. Core Java Utilities", "10. Functional Programming", "11. Build Tools", "12. Web Frameworks", "13. Database Access", "14. Logging Frameworks", "15. Testing"
        ]
    },
    "react-development": {
        "name": "React Mastery",
        "nodes": [
            "1. CLI Tools", "2. Components", "3. Hooks", "4. Routers", "5. State Management", "6. Writing CSS", "7. Component Libraries", "8. Headless Component Libraries", "9. API Calls", "10. Testing", "11. Frameworks", "12. Forms", "13. Types & Validation", "14. Advanced Topics", "15. Mobile Applications"
        ]
    },
    "nextjs-framework": {
        "name": "Next.js Mastery",
        "nodes": [
            "1. Introduction", "2. Getting Started", "3. Routing", "4. Structuring Routes", "5. Working with data", "6. Rendering & Runtimes", "7. Writing CSS", "8. Optimizations", "9. Configuring", "10. Testing", "11. Deployment"
        ]
    },
    "nodejs-runtime": {
        "name": "Node.js Architecture Mastery",
        "nodes": [
            "1. Introduction to Node.js", "2. Modules", "3. Package Management (npm & npx)", "4. Async Programming", "5. Error Handling", "6. Working with Files", "7. Command Line Apps", "8. Building & Consuming APIs", "9. Development & Templating Tools", "10. Working with Databases", "11. Process & App Management", "12. Testing & Logging", "13. Debugging & Performance"
        ]
    },
    "full-stack-developer": {
        "name": "Full Stack Developer Track",
        "nodes": [
            "HTML", "CSS", "JavaScript", "Checkpoint - Static Webpages", "Checkpoint - Interactivity",
            "Git", "GitHub", "Checkpoint - Collaborative Work", "npm", "Checkpoint - External Packages",
            "React", "Tailwind CSS", "Checkpoint - Frontend Apps",
            "Node.js", "Checkpoint - CLI Apps", "PostgreSQL", "Checkpoint - Simple CRUD Apps",
            "RESTful APIs", "JWT Auth", "Redis", "Checkpoint - Complete App",
            "Linux Basics", "Basic AWS Services (EC2, S3, VPC, Route53, SES)", "Checkpoint - Deployment",
            "Monit", "Checkpoint - Monitoring", "GitHub Actions", "Checkpoint - CI / CD",
            "Ansible", "Checkpoint - Automation", "Terraform", "Checkpoint - Infrastructure"
        ]
    },
    "ai-engineer": {
        "name": "AI Engineer Track",
        "nodes": [
            "Introduction to AI Engineering", "LLM Fundamentals & Tokenization", "Sampling Parameters (Temperature, Top-K, Top-P)",
            "Prompting Techniques (Zero-Shot, Few-Shot, ReAct, CoT)", "Prompt Anatomy & System Prompting", "Model Interaction (Function Calling, Streaming)",
            "Context Engineering & Compaction", "Closed Models (Claude, Gemini, GPT-4o, Cohere)", "Open Source Models (Llama 3, DeepSeek, Qwen)",
            "Hugging Face Ecosystem & Transformers.js", "Local LLM Runtimes (Ollama, LM Studio)", "APIs & SDKs (OpenAI, Anthropic, Gemini)",
            "What are Embeddings & Semantic Search", "Embedding Models (OpenAI, Sentence Transformers)", "Popular Vector DBs (Pinecone, Chroma, Supabase, FAISS)", "Implementing Vector Search & Indexing",
            "What are RAGs & RAG Usecases", "Chunking & Retrieval Pipelines", "RAG Frameworks (LangChain, LlamaIndex, RAGFlow)", "RAG vs Fine-tuning",
            "AI Agents & Multi-Agent Workflows", "Agent SDKs & Tools Calling", "Model Context Protocol (MCP Host, Client, Server)", "Building & Connecting MCP Servers (Local & Remote)",
            "AI Safety, Bias & Prompt Injection Attacks", "Safety Best Practices & Content Moderation APIs", "LLM Observability & Tracing (LangSmith, Langfuse, Helicone)", "LLM Evaluations & Regression Testing (DeepEval, RAGAS)",
            "Multimodal AI (Vision, DALL-E, Whisper, Speech-to-Text)", "Multimodal Application Frameworks", "AI Coding & Dev Tools (Claude Code, Cursor, Windsurf)"
        ]
    },
    "data-analyst": {
        "name": "Data Analyst Track",
        "nodes": [
            "Introduction & Types of Data Analytics", "Key Concepts of Data (Collection, Cleanup, Exploration)", "Excel Analysis & Functions (VLOOKUP, IF, CONCAT, TRIM)", "Excel Charting & Pivot Tables",
            "SQL Database Querying (Joins, CTEs, Aggregations)", "Data Collection (CSV, APIs, Web Scraping)", "Data Cleanup & Transformation (Pandas, Dplyr)", "Handling Missing Data, Outliers & Duplicates",
            "Measures of Central Tendency & Dispersion (Mean, Std Dev, Variance)", "Distribution Shapes (Skewness, Kurtosis)", "Descriptive & Exploratory Analysis", "Statistical Analysis (Hypothesis Testing, Correlation, Regression)",
            "BI Dashboarding (Power BI & Tableau)", "Data Visualization Libraries (Matplotlib, Seaborn, ggplot2)", "Chart Types (Bar, Histograms, Line, Heatmaps, Funnel)",
            "Machine Learning Fundamentals (Supervised & Unsupervised)", "Popular ML Algorithms (Decision Trees, KNN, K-Means, Logistic Regression)", "Model Evaluation Techniques", "Big Data Technologies (Hadoop, Spark, MapReduce)", "Portfolio Projects & Kaggle Competitions"
        ]
    },
    "data-scientist": {
        "name": "Data Scientist Track",
        "nodes": [
            "Inferential Statistics", "Bayesian Probability", "Confidence Intervals", "Sampling Methods",
            "Feature Engineering", "XGBoost & Random Forests", "Hyperparameter Tuning", "ROC-AUC Scoring",
            "Neural Net Architectures", "Time Series Forecasting", "Text Mining & Sentiment",
            "PySpark MLlib", "BigQuery ML", "Distributed Feature Store",
            "FastAPI Model Endpoint", "A/B Test Deployment", "Model Drift Tracking"
        ]
    },
    "devops-engineer": {
        "name": "DevOps Engineer Track",
        "nodes": [
            "1. Learn a Programming Language", "2. Operating System", "3. Terminal Knowledge", "4. Version Control Systems", "5. VCS Hosting", "6. Containers", "7. What is and how to setup X ?", "8. Networking & Protocols", "9. Cloud Providers", "10. Serverless", "11. Provisioning", "12. Configuration Management", "13. CI / CD Tools", "14. Secret Management", "15. Infrastructure Monitoring", "16. Logs Management", "17. Container Orchestration", "18. Observability & Application Monitoring", "19. Artifact Management", "20. GitOps", "21. Service Mesh"
        ]
    },
    "cybersecurity": {
        "name": "Cybersecurity Specialist Track",
        "nodes": [
            "TCP/IP & SSL/TLS Protocols", "Linux Security Hardening", "PKI & Encryption",
            "Nmap Reconnaissance", "Metasploit Exploitation", "Burp Suite Web Security", "OWASP Top 10",
            "Firewall & IDS/IPS Config", "Zero Trust Architecture", "VPN & Tunnels", "Endpoint Protection",
            "Splunk / Elastic SIEM", "Wireshark Packet Analysis", "Threat Hunting Playbooks",
            "SOC2 & ISO 27001 Audit", "PCI-DSS Security Controls", "PenTest Final Reports"
        ]
    },
    "machine-learning": {
        "name": "Machine Learning Engineer Track",
        "nodes": [
            "Calculus (Derivatives, Partial Derivatives, Gradients, Jacobian, Hessian)", "Linear Algebra (Vectors, Matrices, SVD, Eigenvalues, Diagonalization)", "Probability & Statistics (Bayes Theorem, Random Variables, Distributions)", "Python Programming & OOP Syntax", "Essential Libraries (NumPy, Pandas, Matplotlib, Seaborn)",
            "Data Sources & Formats (SQL/NoSQL, APIs, CSV, JSON, Parquet)", "Data Preprocessing & Cleaning Techniques", "Feature Engineering, Selection & Scaling", "Dimensionality Reduction (PCA, Autoencoders)",
            "Supervised Classification (KNN, Logistic Regression, SVM, Decision Trees, Random Forest, XGBoost)", "Supervised Regression (Linear, Polynomial, Lasso, Ridge, ElasticNet)", "Unsupervised Clustering (Exclusive, Overlapping, Hierarchical, Probabilistic)", "Reinforcement Learning (DQN, Policy Gradient, Actor-Critic, Q-Learning)", "Scikit-Learn ML Pipelines (Train-Test Split, Tuning, Model Selection)",
            "Model Evaluation Metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix)", "Validation Techniques (K-Fold Cross Validation, LOOCV)", "Neural Network Basics (Perceptrons, Backpropagation, Activations, Loss Functions)", "Deep Learning Frameworks (PyTorch, TensorFlow, Keras)", "Convolutional Neural Networks (CNNs) & Applications", "Recurrent Neural Networks (RNN, GRU, LSTM)",
            "Attention Mechanisms & Transformers (Self-Attention, Multi-Head)", "Generative Adversarial Networks (GANs) & Autoencoders", "Natural Language Processing (Tokenization, Lemmatization, Embeddings)", "Explainable AI (XAI)"
        ]
    }
}

def _normalize_rid(rid: str) -> str:
    if not rid:
        return "c-programming"
    clean = str(rid).lower().strip()
    if "cpp" in clean or "c++" in clean or "2. c++" in clean:
        return "cpp-programming"
    if "c-prog" in clean or "c prog" in clean or "systems c" in clean or "c programming" in clean or "1. c" in clean:
        return "c-programming"
    if "python" in clean:
        return "python-mastery"
    if "java" in clean or "spring" in clean:
        return "java-spring-boot"
    if "react" in clean and "native" not in clean:
        return "react-development"
    if "next" in clean:
        return "nextjs-framework"
    if "node" in clean:
        return "nodejs-runtime"
    if "machine learning" in clean or "ml engineer" in clean or "machine-learning" in clean:
        return "machine-learning"
    if "ai" in clean or "ai engineer" in clean:
        return "ai-engineer"
    if "data analyst" in clean or "analyst" in clean:
        return "data-analyst"
    if "data scientist" in clean or "scientist" in clean:
        return "data-scientist"
    if "cyber" in clean or "security" in clean or "hacking" in clean:
        return "cybersecurity"
    if "devops" in clean or "cloud" in clean:
        return "devops-engineer"
    if "full" in clean or "web" in clean:
        return "full-stack-developer"
    return clean


def _build_roadmap_item(rid: str, completed_set: set, last_timestamp: str = None) -> dict:
    completed_count = len(completed_set)
    matched_key = _normalize_rid(rid)

    spec = ROADMAP_SPECS.get(matched_key)
    if spec:
        title = spec["name"]
        spec_nodes = spec["nodes"]
        total_milestones = len(spec_nodes)
        progress_percent = min(100, round((completed_count / max(1, total_milestones)) * 100))

        current_node = None
        next_node = None
        for node in spec_nodes:
            if node in completed_set or any(c.lower() in node.lower() for c in completed_set if isinstance(c, str)):
                current_node = node
            elif not next_node:
                next_node = node

        current_module = {"id": current_node, "title": current_node} if current_node else None
        next_module = {"id": next_node, "title": next_node} if next_node else {"id": "completed", "title": "Roadmap Completed 🎉"}
    else:
        title = re.sub(r'^\d+\.\s*', '', str(rid)).replace("-", " ").title()
        total_milestones = max(15, completed_count)
        progress_percent = min(100, round((completed_count / total_milestones) * 100))
        current_module = None
        next_module = {"id": "next", "title": "Next Milestone Topic"}

    return {
        "roadmap_id": matched_key,
        "title": title,
        "progress_percent": progress_percent,
        "completed_milestones": completed_count,
        "total_milestones": total_milestones,
        "current_module": current_module,
        "next_module": next_module,
        "last_activity_at": last_timestamp
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
        ordered_rids = []
        timestamps = {}

        for r in res_roadmap.data:
            raw_rid = r.get("roadmap_id")
            if not raw_rid:
                continue
            norm_rid = _normalize_rid(raw_rid)
            if norm_rid not in roadmap_groups:
                roadmap_groups[norm_rid] = set()
                ordered_rids.append(norm_rid)
                timestamps[norm_rid] = r.get("completed_at")
            nid = r.get("node_id") or r.get("node_title")
            st = r.get("status")
            if nid and nid != "_roadmap_started" and st == "completed":
                roadmap_groups[norm_rid].add(nid)

        if not ordered_rids:
            return {"has_active_roadmap": False}

        active_items = []
        for rid in ordered_rids:
            item = _build_roadmap_item(rid, roadmap_groups.get(rid, set()), timestamps.get(rid))
            active_items.append(item)

        first = active_items[0]
        return {
            "has_active_roadmap": True,
            "roadmaps": active_items,
            "roadmap_id": first.get("roadmap_id"),
            "title": first.get("title"),
            "progress_percent": first.get("progress_percent", 0),
            "completed_milestones": first.get("completed_milestones", 0),
            "total_milestones": first.get("total_milestones", 20),
            "current_module": first.get("current_module"),
            "next_module": first.get("next_module"),
            "last_activity_at": first.get("last_activity_at")
        }
    except Exception as e:
        print(f"Error getting active roadmap data: {e}")
        return {"has_active_roadmap": False}


@router.get("/active-roadmap")
def get_active_roadmap_endpoint(user_id: str = Depends(get_current_user_id)):
    return get_active_roadmap_data(user_id)


@router.delete("/active-roadmap/{roadmap_id}")
def delete_active_roadmap_endpoint(roadmap_id: str, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    if not sb:
        return {"success": False, "message": "Database error"}
    try:
        norm_id = _normalize_rid(roadmap_id)
        target_clean = roadmap_id.lower().replace("-", " ").strip()
        res = sb.table("roadmap_progress").select("id, roadmap_id").eq("user_id", user_id).execute()
        if res.data:
            ids_to_delete = []
            for r in res.data:
                raw_rid = r.get("roadmap_id") or ""
                raw_norm = _normalize_rid(raw_rid)
                raw_clean = raw_rid.lower().replace("-", " ").strip()
                if (
                    raw_norm == norm_id
                    or raw_rid.lower() == roadmap_id.lower()
                    or norm_id in raw_rid.lower()
                    or raw_norm in target_clean
                    or target_clean in raw_clean
                    or raw_clean in target_clean
                ):
                    ids_to_delete.append(r["id"])
            if ids_to_delete:
                sb.table("roadmap_progress").delete().in_("id", ids_to_delete).execute()
        return {"success": True, "message": f"Removed roadmap {roadmap_id}"}
    except Exception as e:
        print(f"Error removing roadmap {roadmap_id}: {e}")
        return {"success": False, "message": str(e)}


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
            leetcode_solved = 0
            leetcode_easy = 0
            leetcode_med = 0
            leetcode_hard = 0
            leetcode_user = ""
            leetcode_ranking = 0
            leetcode_configured = False

            res_code = (
                sb.table("user_coding_profiles")
                .select("leetcode_url, stats_json")
                .eq("user_id", user_id)
                .execute()
            )
            if res_code.data and len(res_code.data) > 0:
                code_row = res_code.data[0]
                stats_json = code_row.get("stats_json") or {}
                raw_lc_url = code_row.get("leetcode_url") or ""

                lc = stats_json.get("leetcode", {})
                if isinstance(lc, dict) and (lc.get("configured") or "total_solved" in lc):
                    leetcode_configured = True
                    leetcode_solved = lc.get("total_solved") or lc.get("solved") or 0
                    leetcode_easy = lc.get("easy_solved", 0)
                    leetcode_med = lc.get("medium_solved", 0)
                    leetcode_hard = lc.get("hard_solved", 0)
                    leetcode_user = lc.get("username", "") or _clean_handle(raw_lc_url)
                    leetcode_ranking = lc.get("ranking", 0)
                elif raw_lc_url:
                    leetcode_user = _clean_handle(raw_lc_url)
                    leetcode_configured = bool(leetcode_user)

                for platform, pdata in stats_json.items():
                    if isinstance(pdata, dict):
                        ts = pdata.get("total_solved") or pdata.get("solved") or 0
                        if isinstance(ts, (int, float)):
                            extracted_solved += int(ts)

            # Problems solved strictly reflects connected external coding platform stats
            problems_solved = extracted_solved if extracted_solved > 0 else leetcode_solved

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

    leetcode_subtitle = (
        f"Easy: {leetcode_easy} • Med: {leetcode_med} • Hard: {leetcode_hard}"
        if (leetcode_solved > 0 or (leetcode_easy + leetcode_med + leetcode_hard) > 0)
        else (f"Linked @{leetcode_user}" if leetcode_user else "Connect in Settings")
    )

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
                "roadmapId": active_rm.get("roadmap_id"),
                "roadmaps": active_rm.get("roadmaps", [])
            },
            "resumeReadiness": {
                "percentage": resume_score,
                "subtitle": resume_subtitle
            },
            "leetcodeProgress": {
                "totalSolved": leetcode_solved or problems_solved,
                "easySolved": leetcode_easy,
                "mediumSolved": leetcode_med,
                "hardSolved": leetcode_hard,
                "username": leetcode_user,
                "ranking": leetcode_ranking,
                "configured": leetcode_configured,
                "subtitle": leetcode_subtitle
            },
            "codingProgress": {
                "totalSolved": problems_solved,
                "leetcodeSolved": leetcode_solved or problems_solved,
                "easySolved": leetcode_easy,
                "mediumSolved": leetcode_med,
                "hardSolved": leetcode_hard,
                "username": leetcode_user,
                "ranking": leetcode_ranking,
                "configured": leetcode_configured,
                "subtitle": leetcode_subtitle
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
