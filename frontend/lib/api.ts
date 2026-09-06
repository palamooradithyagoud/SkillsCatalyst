import { supabase } from "@/lib/supabase";

export function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim().replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

export const API_BASE = getApiBaseUrl();

export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "guest_session_default";
  try {
    let sid = localStorage.getItem("skillscatalyst_guest_session_id");
    if (!sid || sid === "undefined" || sid === "null") {
      sid = "guest_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("skillscatalyst_guest_session_id", sid);
    }
    return sid;
  } catch {
    return "guest_session_default";
  }
}

/**
 * Extracts raw underlying guest ID without signature for direct Supabase DB queries
 * (e.g., 'guest_abc123' from 'guest_abc123.signature').
 */
export function getRawGuestSessionId(): string {
  const sid = getGuestSessionId();
  if (sid && sid.startsWith("guest_") && sid.includes(".")) {
    return sid.split(".")[0];
  }
  return sid;
}

/**
 * Stores HMAC-signed guest session token issued by FastAPI backend.
 * Never generates a fresh client ID once a signed token exists.
 */
export function storeGuestSessionToken(token: string | null | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const cleaned = token.trim();
  if (cleaned && cleaned !== "undefined" && cleaned !== "null" && cleaned !== "guest_session_default") {
    try {
      localStorage.setItem("skillscatalyst_guest_session_id", cleaned);
    } catch {}
  }
}

/**
 * Inspects response headers for 'X-Guest-Session-Token' and updates local storage if present.
 */
export function handleGuestTokenFromResponse(res: Response | XMLHttpRequest | null | undefined): void {
  if (typeof window === "undefined" || !res) return;
  try {
    let token: string | null = null;
    if ("headers" in res && res.headers && typeof res.headers.get === "function") {
      token = res.headers.get("X-Guest-Session-Token") || res.headers.get("x-guest-session-token");
    } else if ("getResponseHeader" in res && typeof (res as XMLHttpRequest).getResponseHeader === "function") {
      token = (res as XMLHttpRequest).getResponseHeader("X-Guest-Session-Token") || (res as XMLHttpRequest).getResponseHeader("x-guest-session-token");
    }
    if (token) {
      storeGuestSessionToken(token);
    }
  } catch {}
}

/**
 * Centralized fetch wrapper for FastAPI backend API calls.
 * Automatically captures X-Guest-Session-Token and handles 401 unauthenticated cleanup.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  handleGuestTokenFromResponse(res);
  handleUnauthenticated(res);
  return res;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "x-session-id": getGuestSessionId(),
  };
  try {
    const { data } = await supabase.auth.getSession();
    let session = data.session;

    // Auto-refresh token if expired or expiring within 30 seconds
    if (session && session.expires_at) {
      const isExpiringSoon = Date.now() / 1000 >= session.expires_at - 30;
      if (isExpiringSoon) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr && refreshed.session) {
          session = refreshed.session;
        } else {
          session = null;
          await supabase.auth.signOut().catch(() => {});
        }
      }
    }

    const token = session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

function handleUnauthenticated(res: Response) {
  if ((res.status === 401 || res.status === 403) && typeof window !== "undefined") {
    try {
      localStorage.removeItem("skillscatalyst_user_session");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("skillscatalyst_") || key.startsWith("sc_") || key.startsWith("sb-"))) {
          localStorage.removeItem(key);
        }
      }
      supabase.auth.signOut().catch(() => {});
    } catch {}
  }
}


export async function fetchDashboardData() {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await apiFetch(`${API_BASE}/api/dashboard`, {
        headers: { ...authHeaders },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.metrics) {
          return await mergeLocalDashboardMetrics(json);
        }
      }
    }
  } catch (error) {
    console.warn("Backend fetchDashboardData failed, using Supabase/LocalStorage fallback:", error);
  }

  return await getFallbackDashboardData();
}

export async function fetchActiveRoadmap() {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await apiFetch(`${API_BASE}/api/dashboard/active-roadmap`, {
        headers: { ...authHeaders },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json) return json;
      }
    }
  } catch (error) {
    console.warn("Backend fetchActiveRoadmap failed, using local/supabase fallback:", error);
  }

  return await getFallbackActiveRoadmapData();
}

export async function removeEnrolledRoadmap(roadmapId: string) {
  const normId = normalizeRoadmapId(roadmapId);
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      await apiFetch(`${API_BASE}/api/dashboard/active-roadmap/${encodeURIComponent(normId)}`, {
        method: "DELETE",
        headers: { ...authHeaders },
      });
    }
  } catch (e) {
    console.warn("Backend removeEnrolledRoadmap failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const userId = session.user.id;
      const { data: userRows } = await supabase
        .from("roadmap_progress")
        .select("id, roadmap_id")
        .eq("user_id", userId);

      if (userRows && userRows.length > 0) {
        const targetClean = roadmapId.toLowerCase().replace(/-/g, " ").trim();
        const idsToDelete = userRows
          .filter((row: any) => {
            const rawRid = row.roadmap_id || "";
            const rowNorm = normalizeRoadmapId(rawRid);
            const rowClean = rawRid.toLowerCase().replace(/-/g, " ").trim();
            return (
              rowNorm === normId ||
              rawRid.toLowerCase() === roadmapId.toLowerCase() ||
              rawRid.toLowerCase() === normId ||
              rowClean.includes(targetClean) ||
              targetClean.includes(rowClean)
            );
          })
          .map((row: any) => row.id);

        if (idsToDelete.length > 0) {
          await supabase
            .from("roadmap_progress")
            .delete()
            .in("id", idsToDelete);
        }
      }
    }
  } catch (err) {
    console.warn("Supabase removeEnrolledRoadmap failed:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const rawRemoved = localStorage.getItem("skillscatalyst_removed_roadmaps") || "[]";
      const removedList: string[] = JSON.parse(rawRemoved);
      if (!removedList.includes(normId)) {
        removedList.push(normId);
        localStorage.setItem("skillscatalyst_removed_roadmaps", JSON.stringify(removedList));
      }

      const rawActive = localStorage.getItem("skillscatalyst_active_roadmap");
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        const activeNorm = normalizeRoadmapId(parsed?.id || parsed?.title);
        if (activeNorm === normId) {
          localStorage.removeItem("skillscatalyst_active_roadmap");
        }
      }

      const rawEnrolled = localStorage.getItem("skillscatalyst_enrolled_roadmaps");
      if (rawEnrolled) {
        const list = JSON.parse(rawEnrolled);
        const filtered = list.filter((item: any) => normalizeRoadmapId(item.id || item.title) !== normId);
        localStorage.setItem("skillscatalyst_enrolled_roadmaps", JSON.stringify(filtered));
      }

      const rawNodes = localStorage.getItem("skillscatalyst_roadmap_completed_nodes");
      if (rawNodes) {
        const nodesMap = JSON.parse(rawNodes);
        const updatedMap: Record<string, boolean> = {};
        for (const [key, val] of Object.entries(nodesMap)) {
          const firstDash = key.indexOf("-");
          const keyRid = firstDash > 0 ? key.substring(0, firstDash) : key;
          if (normalizeRoadmapId(keyRid) !== normId) {
            updatedMap[key] = val as boolean;
          }
        }
        localStorage.setItem("skillscatalyst_roadmap_completed_nodes", JSON.stringify(updatedMap));
      }
    } catch {}
  }

  return { success: true };
}

export function normalizeRoadmapId(rawId: string): string {
  if (!rawId) return "c-programming";
  const clean = rawId.toLowerCase().trim();
  if (clean.includes("cpp") || clean.includes("c++") || clean.includes("2. c++")) {
    return "cpp-programming";
  }
  if (clean.includes("c-prog") || clean.includes("c prog") || clean.includes("systems c") || clean.includes("c programming") || clean.includes("1. c")) {
    return "c-programming";
  }
  if (clean.includes("python")) {
    return "python-mastery";
  }
  if (clean.includes("java") || clean.includes("spring")) {
    return "java-spring-boot";
  }
  if (clean.includes("react") && !clean.includes("native")) {
    return "react-development";
  }
  if (clean.includes("next")) {
    return "nextjs-framework";
  }
  if (clean.includes("ai") || clean.includes("ml") || clean.includes("machine learning")) {
    return "ai-engineer";
  }
  if (clean.includes("data analyst") || clean.includes("analyst")) {
    return "data-analyst";
  }
  if (clean.includes("data scientist") || clean.includes("scientist")) {
    return "data-scientist";
  }
  if (clean.includes("machine learning") || clean.includes("ml engineer")) {
    return "machine-learning";
  }
  if (clean.includes("cyber") || clean.includes("security") || clean.includes("hacking")) {
    return "cybersecurity";
  }
  if (clean.includes("devops") || clean.includes("cloud")) {
    return "devops-engineer";
  }
  if (clean.includes("full") || clean.includes("web")) {
    return "full-stack-developer";
  }
  return clean;
}

export async function getFallbackActiveRoadmapData() {
  let userId: string | null = null;
  let rmData: any[] = [];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      userId = session.user.id;
      const { data } = await supabase
        .from("roadmap_progress")
        .select("roadmap_id, node_id, node_title, status, completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });
      if (data) rmData = data;
    }
  } catch {}

  let localActiveTitle = "";
  let localActiveId = "";
  let localEnrolled: any[] = [];
  let localCompletedMap: Record<string, boolean> = {};

  let localRemovedList: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const rawActive = localStorage.getItem("skillscatalyst_active_roadmap");
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (parsed?.title) localActiveTitle = parsed.title;
        if (parsed?.id) localActiveId = parsed.id;
      }
      const rawEnrolled = localStorage.getItem("skillscatalyst_enrolled_roadmaps");
      if (rawEnrolled) localEnrolled = JSON.parse(rawEnrolled);
      const rawNodes = localStorage.getItem("skillscatalyst_roadmap_completed_nodes");
      if (rawNodes) localCompletedMap = JSON.parse(rawNodes);
      const rawRemoved = localStorage.getItem("skillscatalyst_removed_roadmaps");
      if (rawRemoved) localRemovedList = JSON.parse(rawRemoved);
    } catch {}
  }

  const groups: Record<string, { completedNodes: string[]; lastActivity: string }> = {};
  const orderedIds: string[] = [];

  const addRidGroup = (rawRid: string, activityTime = new Date().toISOString()) => {
    if (!rawRid) return null;
    const rid = normalizeRoadmapId(rawRid);
    if (localRemovedList.includes(rid)) return null;
    if (!groups[rid]) {
      groups[rid] = { completedNodes: [], lastActivity: activityTime };
      orderedIds.push(rid);
    }
    return rid;
  };

  for (const r of rmData) {
    const rawRid = r.roadmap_id;
    if (!rawRid) continue;
    const rid = addRidGroup(rawRid, r.completed_at || new Date().toISOString());
    if (rid && r.status === "completed" && r.node_id !== "_roadmap_started") {
      const nid = r.node_id || r.node_title;
      if (nid && !groups[rid].completedNodes.includes(nid)) {
        groups[rid].completedNodes.push(nid);
      }
    }
  }

  if (localActiveId) addRidGroup(localActiveId);
  for (const e of localEnrolled) {
    if (e?.id) addRidGroup(e.id);
  }

  // Aggregate local completed nodes
  for (const [key, isDone] of Object.entries(localCompletedMap)) {
    if (!isDone) continue;
    const firstDash = key.indexOf("-");
    if (firstDash > 0) {
      const rawRid = key.substring(0, firstDash);
      const nid = key.substring(firstDash + 1);
      const rid = addRidGroup(rawRid);
      if (rid && nid && !groups[rid].completedNodes.includes(nid)) {
        groups[rid].completedNodes.push(nid);
      }
    }
  }

  if (orderedIds.length === 0) {
    return { has_active_roadmap: false };
  }

  const roadmaps = orderedIds.map((rid) => {
    const g = groups[rid];
    const meta = getRoadmapMeta(rid, g.completedNodes);
    const completedCount = g.completedNodes.length;
    const title = meta.name || localActiveTitle || rid;
    const total = meta.total || 20;
    const pct = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

    return {
      roadmap_id: rid,
      title: title,
      progress_percent: pct,
      completed_milestones: completedCount,
      total_milestones: total,
      current_module: null,
      next_module: {
        id: meta.nextTopic,
        title: meta.nextTopic,
      },
      last_activity_at: g.lastActivity,
    };
  });

  const first = roadmaps[0];

  return {
    has_active_roadmap: true,
    roadmaps,
    roadmap_id: first.roadmap_id,
    title: first.title,
    progress_percent: first.progress_percent,
    completed_milestones: first.completed_milestones,
    total_milestones: first.total_milestones,
    current_module: first.current_module,
    next_module: first.next_module,
    last_activity_at: first.last_activity_at,
  };
}

function getActivePlaylistTotal(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("skillscatalyst_active_playlist_total");
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveActivePlaylistTotal(total: number) {
  if (typeof window === "undefined" || !total || total <= 0) return;
  try {
    const current = getActivePlaylistTotal();
    if (total > current) {
      localStorage.setItem("skillscatalyst_active_playlist_total", String(total));
    }
  } catch {}
}

export function getRoadmapMeta(rawTitleOrId: string, userCompletedNodes: string[] = []) {
  if (!rawTitleOrId) return { name: "", nextTopic: "Explore roadmaps on Roadmaps page", total: 20 };

  const norm = normalizeRoadmapId(rawTitleOrId);

  const ROADMAP_MAP: Record<string, { name: string; nodes: string[] }> = {
    "c-programming": {
      name: "C Programming Mastery",
      nodes: [
        "1. Introduction", "2. Setting Up", "3. Variables",
        "4. Data Types", "5. Operators", "6. Control Flow", "7. Functions",
        "8. Pointers & Memory", "9. Arrays", "10. Strings", "11. User Defined Types", "12. Common Data Structures",
        "13. Structuring Codebase", "14. Error Handling", "15. File I/O", "16. Standard Library", "17. Build & Compilation",
        "18. Debugging", "19. Testing", "20. Idioms & Design Patterns", "21. Concurrency & Process Management", "22. C Standards"
      ]
    },
    "cpp-programming": {
      name: "C++ Development Mastery",
      nodes: [
        "1. Introduction to Language", "2. Setting up your Environment", "3. Basic Operations", "4. Control Flow & Statements", "5. Functions", "6. Data Types", "7. Pointers and References", "8. Structuring Codebase", "9. Structures and Classes", "10. Templates", "11. Language Concepts", "12. Exception Handling", "13. Standard Library + STL", "14. Debuggers", "15. Compilers", "16. Build Systems", "17. Package Managers", "18. Working with Libraries", "19. Frameworks", "20. Idioms", "21. Standards"
      ]
    },
    "python-mastery": {
      name: "Python Mastery",
      nodes: [
        "1. Learn the Basics", "2. Data Structures & Algorithms", "3. Modules", "4. Lambdas", "5. Decorators", "6. Iterators", "7. Regular Expressions", "8. Object Oriented Programming", "9. Package Managers", "10. Common Packages", "11. List Comprehensions", "12. Generator Expressions", "13. Paradigms", "14. Context Manager", "15. Learn a Framework", "16. Concurrency", "17. Environments", "18. Static Typing", "19. Code Formatting", "20. Documentation", "21. Testing"
      ]
    },
    "java-spring-boot": {
      name: "Java & Spring Boot Mastery",
      nodes: [
        "1. Learn the Basics", "2. Object Oriented Programming", "3. Exception Handling", "4. Lambda & Modern Java", "5. Collections", "6. Dependency Injection", "7. I/O Operations", "8. Concurrency", "9. Core Java Utilities", "10. Functional Programming", "11. Build Tools", "12. Web Frameworks", "13. Database Access", "14. Logging Frameworks", "15. Testing"
      ]
    },
    "react-development": {
      name: "React Mastery",
      nodes: [
        "1. CLI Tools", "2. Components", "3. Hooks", "4. Routers", "5. State Management", "6. Writing CSS", "7. Component Libraries", "8. Headless Component Libraries", "9. API Calls", "10. Testing", "11. Frameworks", "12. Forms", "13. Types & Validation", "14. Advanced Topics", "15. Mobile Applications"
      ]
    },
    "nextjs-framework": {
      name: "Next.js Mastery",
      nodes: [
        "1. Introduction", "2. Getting Started", "3. Routing", "4. Structuring Routes", "5. Working with data", "6. Rendering & Runtimes", "7. Writing CSS", "8. Optimizations", "9. Configuring", "10. Testing", "11. Deployment"
      ]
    },
    "nodejs-runtime": {
      name: "Node.js Architecture Mastery",
      nodes: [
        "1. Introduction to Node.js", "2. Modules", "3. Package Management (npm & npx)", "4. Async Programming", "5. Error Handling", "6. Working with Files", "7. Command Line Apps", "8. Building & Consuming APIs", "9. Development & Templating Tools", "10. Working with Databases", "11. Process & App Management", "12. Testing & Logging", "13. Debugging & Performance"
      ]
    },
    "full-stack-developer": {
      name: "Full Stack Developer Track",
      nodes: [
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
      name: "AI Engineer Track",
      nodes: [
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
      name: "Data Analyst Track",
      nodes: [
        "Introduction & Types of Data Analytics", "Key Concepts of Data (Collection, Cleanup, Exploration)", "Excel Analysis & Functions (VLOOKUP, IF, CONCAT, TRIM)", "Excel Charting & Pivot Tables",
        "SQL Database Querying (Joins, CTEs, Aggregations)", "Data Collection (CSV, APIs, Web Scraping)", "Data Cleanup & Transformation (Pandas, Dplyr)", "Handling Missing Data, Outliers & Duplicates",
        "Measures of Central Tendency & Dispersion (Mean, Std Dev, Variance)", "Distribution Shapes (Skewness, Kurtosis)", "Descriptive & Exploratory Analysis", "Statistical Analysis (Hypothesis Testing, Correlation, Regression)",
        "BI Dashboarding (Power BI & Tableau)", "Data Visualization Libraries (Matplotlib, Seaborn, ggplot2)", "Chart Types (Bar, Histograms, Line, Heatmaps, Funnel)",
        "Machine Learning Fundamentals (Supervised & Unsupervised)", "Popular ML Algorithms (Decision Trees, KNN, K-Means, Logistic Regression)", "Model Evaluation Techniques", "Big Data Technologies (Hadoop, Spark, MapReduce)", "Portfolio Projects & Kaggle Competitions"
      ]
    },
    "data-scientist": {
      name: "Data Scientist Track",
      nodes: [
        "Inferential Statistics", "Bayesian Probability", "Confidence Intervals", "Sampling Methods",
        "Feature Engineering", "XGBoost & Random Forests", "Hyperparameter Tuning", "ROC-AUC Scoring",
        "Neural Net Architectures", "Time Series Forecasting", "Text Mining & Sentiment",
        "PySpark MLlib", "BigQuery ML", "Distributed Feature Store",
        "FastAPI Model Endpoint", "A/B Test Deployment", "Model Drift Tracking"
      ]
    },
    "devops-engineer": {
      name: "DevOps Engineer Track",
      nodes: [
        "1. Learn a Programming Language", "2. Operating System", "3. Terminal Knowledge", "4. Version Control Systems", "5. VCS Hosting", "6. Containers", "7. What is and how to setup X ?", "8. Networking & Protocols", "9. Cloud Providers", "10. Serverless", "11. Provisioning", "12. Configuration Management", "13. CI / CD Tools", "14. Secret Management", "15. Infrastructure Monitoring", "16. Logs Management", "17. Container Orchestration", "18. Observability & Application Monitoring", "19. Artifact Management", "20. GitOps", "21. Service Mesh"
      ]
    },
    "cybersecurity": {
      name: "Cybersecurity Specialist Track",
      nodes: [
        "TCP/IP & SSL/TLS Protocols", "Linux Security Hardening", "PKI & Encryption",
        "Nmap Reconnaissance", "Metasploit Exploitation", "Burp Suite Web Security", "OWASP Top 10",
        "Firewall & IDS/IPS Config", "Zero Trust Architecture", "VPN & Tunnels", "Endpoint Protection",
        "Splunk / Elastic SIEM", "Wireshark Packet Analysis", "Threat Hunting Playbooks",
        "SOC2 & ISO 27001 Audit", "PCI-DSS Security Controls", "PenTest Final Reports"
      ]
    },
    "machine-learning": {
      name: "Machine Learning Engineer Track",
      nodes: [
        "Calculus (Derivatives, Partial Derivatives, Gradients, Jacobian, Hessian)", "Linear Algebra (Vectors, Matrices, SVD, Eigenvalues, Diagonalization)", "Probability & Statistics (Bayes Theorem, Random Variables, Distributions)", "Python Programming & OOP Syntax", "Essential Libraries (NumPy, Pandas, Matplotlib, Seaborn)",
        "Data Sources & Formats (SQL/NoSQL, APIs, CSV, JSON, Parquet)", "Data Preprocessing & Cleaning Techniques", "Feature Engineering, Selection & Scaling", "Dimensionality Reduction (PCA, Autoencoders)",
        "Supervised Classification (KNN, Logistic Regression, SVM, Decision Trees, Random Forest, XGBoost)", "Supervised Regression (Linear, Polynomial, Lasso, Ridge, ElasticNet)", "Unsupervised Clustering (Exclusive, Overlapping, Hierarchical, Probabilistic)", "Reinforcement Learning (DQN, Policy Gradient, Actor-Critic, Q-Learning)", "Scikit-Learn ML Pipelines (Train-Test Split, Tuning, Model Selection)",
        "Model Evaluation Metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix)", "Validation Techniques (K-Fold Cross Validation, LOOCV)", "Neural Network Basics (Perceptrons, Backpropagation, Activations, Loss Functions)", "Deep Learning Frameworks (PyTorch, TensorFlow, Keras)", "Convolutional Neural Networks (CNNs) & Applications", "Recurrent Neural Networks (RNN, GRU, LSTM)",
        "Attention Mechanisms & Transformers (Self-Attention, Multi-Head)", "Generative Adversarial Networks (GANs) & Autoencoders", "Natural Language Processing (Tokenization, Lemmatization, Embeddings)", "Explainable AI (XAI)"
      ]
    }
  };

  const matched = ROADMAP_MAP[norm];
  if (matched) {
    const next = matched.nodes.find((n) => !userCompletedNodes.some((c) => c.toLowerCase().includes(n.toLowerCase()))) || "Roadmap Completed 🎉";
    return { name: matched.name, nextTopic: next, total: matched.nodes.length };
  }

  const formattedName = rawTitleOrId.replace(/^\d+\.\s*/, "").replace(/-/g, " ").trim();
  return { name: formattedName, nextTopic: "Next Milestone Topic", total: 15 };
}

async function mergeLocalDashboardMetrics(backendData: any) {
  if (!backendData || !backendData.metrics) return backendData;
  if (!backendData.metrics.roadmapProgress?.roadmaps) {
    const activeRm = await getFallbackActiveRoadmapData();
    if (activeRm && activeRm.roadmaps) {
      backendData.metrics.roadmapProgress = {
        ...backendData.metrics.roadmapProgress,
        roadmaps: activeRm.roadmaps,
      };
    }
  }
  return backendData;
}


async function getFallbackDashboardData() {
  let savedPlaylistsCount = 0;
  let totalVideos = 0;
  let completedCount = 0;
  let resumeScore = 0;
  let roadmapCount = 0;
  let streakDays = 0;
  let userName = "Learner";
  let userId = "";

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Learner";
      userId = session.user.id;

      // Query saved playlists for dynamic total video counts
      const { data: savedData } = await supabase
        .from("saved_playlists")
        .select("video_count")
        .eq("user_id", userId);

      if (savedData && savedData.length > 0) {
        savedPlaylistsCount = savedData.length;
        for (const row of savedData) {
          const match = String(row.video_count || "0").match(/\d+/);
          if (match) totalVideos += parseInt(match[0], 10);
        }
      }

      // Query completed video progress
      const { data: progData } = await supabase
        .from("video_progress")
        .select("video_id, playlist_id")
        .eq("user_id", userId)
        .eq("watched", true);

      if (progData) {
        completedCount = progData.length;
      }

      // Query latest resume score
      const { data: resumeData } = await supabase
        .from("resume_scores")
        .select("overall_score, ats_compatibility_score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (resumeData && resumeData.length > 0) {
        const sc = resumeData[0].overall_score || resumeData[0].ats_compatibility_score;
        if (sc) resumeScore = Math.round(Number(sc));
      }

      // Query active roadmap and completed roadmap nodes
      const { data: rmData } = await supabase
        .from("roadmap_progress")
        .select("roadmap_id, node_id, status")
        .eq("user_id", userId);

      if (rmData && rmData.length > 0) {
        const completedNodes = rmData.filter((r: any) => r.status === "completed" && r.node_id !== "_roadmap_started");
        roadmapCount = completedNodes.length;
      }

      // Query streak days from user_progress
      const { data: progRow } = await supabase
        .from("user_progress")
        .select("streak_days")
        .eq("user_id", userId)
        .maybeSingle();

      if (progRow && typeof progRow.streak_days === "number") {
        streakDays = progRow.streak_days;
      }
    }
  } catch (e) {
    console.warn("Supabase dashboard fallback error:", e);
  }

  // Parse active roadmap from localStorage if present
  let localActiveRoadmapName = "";
  if (typeof window !== "undefined") {
    try {
      const rawActive = localStorage.getItem("skillscatalyst_active_roadmap");
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (parsed?.title) {
          localActiveRoadmapName = parsed.title;
        }
      }
    } catch {}
  }

  const localResumeScoreRaw = typeof window !== "undefined" ? localStorage.getItem("skillscatalyst_latest_resume_score") : null;
  if (localResumeScoreRaw) {
    const lScore = parseInt(localResumeScoreRaw, 10);
    if (lScore > resumeScore) resumeScore = lScore;
  }

  const activeTotal = getActivePlaylistTotal();
  if (activeTotal > totalVideos) {
    totalVideos = activeTotal;
  }

  if (totalVideos > 0 && completedCount > totalVideos) {
    totalVideos = completedCount;
  }

  const pct = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
  const subtitle = totalVideos > 0 ? `${completedCount}/${totalVideos} videos completed` : `${completedCount} video${completedCount !== 1 ? "s" : ""} completed`;

  const roadmapPct = roadmapCount > 0 ? Math.min(100, Math.round((roadmapCount / 20) * 100)) : 0;
  const roadmapSubtitle = roadmapCount > 0 ? `${roadmapCount} topic${roadmapCount !== 1 ? "s" : ""} completed` : "0 topics completed";
  const resumeSubtitle = resumeScore > 0 ? `ATS Score: ${resumeScore}/100` : "No upload yet";

  const activeRm = await getFallbackActiveRoadmapData();

  return {
    user: {
      name: userName,
      status: "ACTIVE",
      streakDays: streakDays,
    },
    metrics: {
      learningProgress: {
        percentage: pct,
        completedVideos: completedCount,
        totalVideos: totalVideos,
        subtitle: subtitle,
      },
      roadmapProgress: {
        has_active_roadmap: activeRm.has_active_roadmap,
        roadmaps: activeRm.roadmaps || [],
        count: activeRm.completed_milestones ?? roadmapCount,
        percentage: activeRm.progress_percent ?? 0,
        subtitle: activeRm.title ? `Following: ${activeRm.title}` : "No active roadmap",
        roadmapName: activeRm.title,
        nextTopic: activeRm.next_module?.title || "",
        roadmapId: activeRm.roadmap_id,
      },
      resumeReadiness: {
        percentage: resumeScore,
        subtitle: resumeSubtitle,
      },
      interviewReadiness: {
        isLocked: true,
        subtitle: "Currently Locked",
      },
    },
    upcoming: [],
    practiceOverview: {
      problemsSolved: 0,
      successRate: 0,
      contests: 0,
      chartData: [
        { day: "Mon", solved: 0 },
        { day: "Tue", solved: 0 },
        { day: "Wed", solved: 0 },
        { day: "Thu", solved: 0 },
        { day: "Fri", solved: 0 },
        { day: "Sat", solved: 0 },
        { day: "Sun", solved: 0 },
      ],
    },
  };
}


export async function sendMentorMessage(prompt: string) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Failed to reach AI mentor");
    return await res.json();
  } catch {
    return { reply: "I am your SkillsCatalyst AI Mentor powered by Groq. Please start the FastAPI backend to interact live!" };
  }
}

export async function extractResume(file: File): Promise<{ success: boolean; text?: string; filename?: string; char_count?: number; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const authHeaders = await getAuthHeaders();

    const res = await apiFetch(`${API_BASE}/api/resume/extract`, {
      method: "POST",
      headers: { ...authHeaders },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Failed to extract resume (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      text: data.text,
      filename: data.filename,
      char_count: data.char_count,
    };
  } catch (error: any) {
    console.error("Resume extraction network error:", error);
    return {
      success: false,
      message: error?.message || "Failed to reach backend extraction service. Ensure backend is running.",
    };
  }
}

export async function reviewResume(resumeText: string, targetRole: string, yearsExperience: string, companyType: string = "Product-Based", jobDescription: string = "") {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/review-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        years_experience: yearsExperience,
        company_type: companyType,
        job_description: jobDescription,
      }),
    });
    if (!res.ok) throw new Error("Failed to evaluate resume");
    const data = await res.json();
    if (data?.review) {
      const match = data.review.match(/(?:Final Score:|Score:)?\s*(\d+(?:\.\d+)?)\s*\/\s*(100|10)/i) || data.review.match(/(\d+(?:\.\d+)?)\s*\/\s*(100|10)/);
      if (match) {
        let val = parseFloat(match[1]);
        if (match[2] === "10" || val <= 10) val = val * 10;
        const scoreVal = Math.round(val);
        if (typeof window !== "undefined") {
          localStorage.setItem("skillscatalyst_latest_resume_score", String(scoreVal));
        }

        // Direct Supabase DB insert for guaranteed persistence across sessions
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase.from("resume_scores").insert({
              user_id: session.user.id,
              filename: "resume.pdf",
              target_role: targetRole,
              company_type: companyType,
              overall_score: scoreVal,
              ats_compatibility_score: scoreVal,
              skills_match_score: scoreVal,
              experience_score: scoreVal,
              full_review_json: { review: data.review },
            });
            await supabase.from("user_progress").upsert({
              user_id: session.user.id,
              resume_readiness_score: scoreVal,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
          }
        } catch (dbErr) {
          console.warn("Direct Supabase resume_scores insert warning:", dbErr);
        }
      }
    }
  } catch (error: any) {
    console.error("Resume review error:", error);
    return { review: "Error: Unable to connect to Groq AI Resume Evaluator. Please ensure the backend is running." };
  }
}

// ── Learning API ──────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  title: string;
  channel: string;
  description: string;
  language?: string;
  level: string;
  video_count: string;
  duration: string;
  playlist_url: string;
  channel_url?: string;
  thumbnail: string;
  source: "csv" | "youtube";
  skill_query?: string;
  created_at?: string;
}

export interface SearchResult {
  query: string;
  level: string;
  language: string;
  source: "csv" | "youtube";
  count: number;
  results: Playlist[];
}

export async function searchSkill(
  query: string,
  level = "all",
  language = "all",
  max_results = 10
): Promise<SearchResult> {
  if (!query || !query.trim() || query.trim().length < 2) {
    return { query, level, language, source: "csv", count: 0, results: [] };
  }
  const params = new URLSearchParams({ query: query.trim(), level, language, max_results: String(max_results) });
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/search?${params}`, { headers: { ...authHeaders }, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.slice(0, 10);
      data.count = data.results.length;
    }
    return data;
  } catch (e) {
    console.warn("Learning search failed:", e);
    return { query, level, language, source: "csv", count: 0, results: [] };
  }
}

export async function savePlaylist(playlist: Playlist, skillQuery: string) {
  const cleanId = cleanPlaylistId(playlist.id);
  const row = {
    playlist_id: cleanId || playlist.id,
    title: playlist.title || "Untitled Playlist",
    channel: playlist.channel || "",
    description: playlist.description || "",
    level: playlist.level || "all",
    video_count: playlist.video_count || "?",
    duration: playlist.duration || "?",
    playlist_url: playlist.playlist_url || "",
    thumbnail: playlist.thumbnail || "",
    source: playlist.source || "youtube",
    skill_query: skillQuery || "",
    created_at: new Date().toISOString(),
  };

  const sessionId = getRawGuestSessionId();

  // 1. Save via FastAPI backend
  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.warn("Backend save playlist failed:", e);
  }

  // 2. Direct Supabase DB write (saved_playlists table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      await supabase
        .from("saved_playlists")
        .upsert({ ...row, user_id: targetUserId }, { onConflict: "user_id,playlist_id" });
    }
  } catch (e) {
    console.warn("Save playlist to Supabase DB failed:", e);
  }

  // 3. Direct Supabase DB write (learning_progress JSONB table - supports both auth user & guest session)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: existingLp } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    const steps = existingLp && existingLp.length > 0 ? existingLp[0].completed_steps || [] : [];
    if (!steps.some((p: any) => (p.id || p.playlist_id) === row.playlist_id)) {
      steps.push({ ...row, id: row.playlist_id, completed: false, videos: [] });
      await supabase.from("learning_progress").upsert({
        session_id: sid,
        user_id: session?.user?.id || null,
        skill_name: "saved_playlists",
        completed_steps: steps,
        updated_at: new Date().toISOString()
      }, { onConflict: "session_id,skill_name" });
    }
  } catch (e) {
    console.warn("Save playlist to learning_progress JSONB failed:", e);
  }

  return { success: true };
}

export async function syncSavedPlaylists(playlists: any[]): Promise<{ success: boolean; completion_pct?: number }> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/sync-saved-playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ playlists }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend syncSavedPlaylists failed:", e);
  }

  try {
    const sessionId = getRawGuestSessionId();
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;

    const totalVideos = playlists.reduce((acc, p) => acc + (p.videos?.length || 0), 0);
    const completedVideos = playlists.reduce((acc, p) => acc + (p.videos?.filter((v: any) => v.completed || v.watched)?.length || 0), 0);
    const pct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 10000) / 100 : 0;

    await supabase.from("learning_progress").upsert({
      session_id: sid,
      user_id: session?.user?.id || null,
      skill_name: "saved_playlists",
      completed_steps: playlists,
      completion_pct: pct,
      updated_at: new Date().toISOString()
    }, { onConflict: "session_id,skill_name" });

    return { success: true, completion_pct: pct };
  } catch (e) {
    console.warn("Supabase syncSavedPlaylists failed:", e);
  }
  return { success: false };
}

export async function unsavePlaylist(playlistId: string) {
  const cleanId = cleanPlaylistId(playlistId);

  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/save/${encodeURIComponent(cleanId)}`, {
      method: "DELETE",
      headers: { ...authHeaders },
    });
  } catch (e) {
    console.warn("Backend unsave playlist failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase
        .from("saved_playlists")
        .delete()
        .eq("user_id", session.user.id)
        .or(`playlist_id.eq.${cleanId},playlist_id.eq.${playlistId}`);
    }
  } catch (e) {
    console.warn("Unsave playlist from Supabase DB failed:", e);
  }

  try {
    const sessionId = getRawGuestSessionId();
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const steps = (lpData[0].completed_steps || []).filter(
        (p: any) => (p.id || p.playlist_id) !== cleanId && (p.id || p.playlist_id) !== playlistId
      );
      await supabase.from("learning_progress").upsert({
        session_id: sid,
        user_id: session?.user?.id || null,
        skill_name: "saved_playlists",
        completed_steps: steps,
        updated_at: new Date().toISOString()
      }, { onConflict: "session_id,skill_name" });
    }
  } catch (e) {
    console.warn("Unsave playlist from learning_progress failed:", e);
  }

  return { success: true };
}

export async function fetchSavedPlaylists(): Promise<{ saved: Playlist[]; count: number }> {
  let backendSaved: Playlist[] = [];
  const sessionId = getRawGuestSessionId();

  // 1. Primary: Fetch saved playlists from Supabase via FastAPI backend API
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/saved`, {
      headers: { ...authHeaders },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.saved && Array.isArray(json.saved) && json.saved.length > 0) {
        return { saved: json.saved, count: json.saved.length };
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from backend failed:", e);
  }

  // 2. Direct Supabase DB Query (saved_playlists table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const { data } = await supabase
        .from("saved_playlists")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        backendSaved = data.map((row: any) => ({
          id: row.playlist_id,
          title: row.title,
          channel: row.channel,
          description: row.description,
          level: row.level,
          video_count: row.video_count,
          duration: row.duration,
          playlist_url: row.playlist_url,
          thumbnail: row.thumbnail,
          source: row.source,
        }));
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from Supabase DB failed:", e);
  }

  // 3. Direct Supabase DB Query (learning_progress JSONB table - supports both auth user & guest session)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const jsonbItems = lpData[0].completed_steps || [];
      const seenIds = new Set(backendSaved.map((p) => p.id));
      for (const item of jsonbItems) {
        const itemId = item.id || item.playlist_id;
        if (itemId && !seenIds.has(itemId)) {
          seenIds.add(itemId);
          backendSaved.push({
            id:           itemId,
            title:        item.title || "Untitled Playlist",
            channel:      item.channel || "",
            description:  item.description || "",
            level:        item.level || "all",
            video_count:  item.video_count || "?",
            duration:     item.duration || "?",
            playlist_url: item.playlist_url || "",
            thumbnail:    item.thumbnail || "",
            source:       item.source || "youtube",
            skill_query:  item.skill_query || "",
            created_at:   item.created_at || "",
          });
        }
      }
    }
  } catch (e) {
    console.warn("Fetch saved playlists from learning_progress failed:", e);
  }

  return { saved: backendSaved, count: backendSaved.length };
}



// ── Video Progress API ─────────────────────────────────────────────────────────

export interface PlaylistVideo {
  videoId: string;
  title: string;
  position: number;
  thumbnail: string;
  watched: boolean;
  /** Resume playback position in seconds (saved every 10 s) */
  last_position?: number;
  /** Cumulative seconds actually watched (anti-cheat tracked) */
  watch_time?: number;
  /** ISO timestamp set when video is auto-completed */
  completed_at?: string | null;
}

export function cleanPlaylistId(rawIdOrUrl: string): string {
  if (!rawIdOrUrl) return "";
  try {
    if (rawIdOrUrl.includes("list=")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const listParam = url.searchParams.get("list");
      if (listParam) return listParam;
    }
    if (rawIdOrUrl.includes("watch?v=") || rawIdOrUrl.includes("v=")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;
    }
    if (rawIdOrUrl.includes("youtu.be/")) {
      const url = new URL(rawIdOrUrl.startsWith("http") ? rawIdOrUrl : `https://${rawIdOrUrl}`);
      const pathId = url.pathname.replace(/^\//, "");
      if (pathId) return pathId;
    }
  } catch {}
  return rawIdOrUrl.replace(/^.*list=/, "").replace(/^.*v=/, "").split("&")[0].trim();
}

export async function fetchPlaylistVideos(
  playlistId: string,
): Promise<{ videos: PlaylistVideo[]; count: number }> {
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();
  let resultVideos: PlaylistVideo[] = [];

  // 1. Primary: Fetch full YouTube playlist items + merged progress from Supabase via FastAPI backend API
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(
      `${API_BASE}/api/learning/playlist-videos?playlist_id=${encodeURIComponent(cleanId)}`,
      { headers: { ...authHeaders }, cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.videos && Array.isArray(json.videos) && json.videos.length > 0) {
        saveActivePlaylistTotal(json.videos.length);
        resultVideos = json.videos;
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos from backend failed:", e);
  }

  // 2. Direct Supabase DB Query (video_progress table)
  if (resultVideos.length === 0) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const targetUserId = session?.user?.id;
      if (targetUserId) {
        const { data } = await supabase
          .from("video_progress")
          .select("*")
          .eq("user_id", targetUserId)
          .or(`playlist_id.eq.${cleanId},playlist_id.eq.${playlistId}`);

        if (data && data.length > 0) {
          resultVideos = data.map((row: any, idx: number) => ({
            videoId: row.video_id,
            title: `Video ${idx + 1}`,
            position: idx + 1,
            thumbnail: "",
            watched: !!row.watched,
            last_position: row.last_position || 0,
            watch_time: row.watch_time || 0,
            completed_at: row.completed_at || null,
          }));
        }
      }
    } catch (e) {
      console.warn("Fetch playlist videos fallback failed:", e);
    }
  }

  // 3. Always merge watched status from learning_progress JSONB table (guest & auth session)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const playlists = lpData[0].completed_steps || [];
      const match = playlists.find((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (match && match.videos && match.videos.length > 0) {
        const lpMap = new Map<string, any>();
        match.videos.forEach((v: any) => {
          const vidKey = v.videoId || v.id;
          if (vidKey) lpMap.set(vidKey, v);
        });

        if (resultVideos.length > 0) {
          resultVideos = resultVideos.map((v) => {
            const lpv = lpMap.get(v.videoId);
            if (lpv) {
              return {
                ...v,
                watched: v.watched || !!(lpv.completed || lpv.watched),
                last_position: Math.max(v.last_position || 0, lpv.lastPosition || lpv.last_position || 0),
                watch_time: Math.max(v.watch_time || 0, lpv.watchTime || lpv.watch_time || 0),
              };
            }
            return v;
          });
        } else {
          resultVideos = match.videos.map((v: any, idx: number) => ({
            videoId: v.videoId || v.id || String(idx + 1),
            title: v.title || `Video ${idx + 1}`,
            position: idx + 1,
            thumbnail: v.thumbnail || "",
            watched: !!(v.completed || v.watched),
            last_position: v.lastPosition || v.last_position || 0,
            watch_time: v.watchTime || v.watch_time || 0,
            completed_at: v.completedAt || v.completed_at || null,
          }));
        }
      }
    }
  } catch (e) {
    console.warn("Fetch playlist videos from learning_progress failed:", e);
  }

  return { videos: resultVideos, count: resultVideos.length };
}

export async function markVideoWatched(
  playlistId: string,
  videoId: string,
  watched: boolean
): Promise<void> {
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();

  // 1. Save to Supabase via FastAPI backend
  try {
    const authHeaders = await getAuthHeaders();
    await apiFetch(`${API_BASE}/api/learning/video-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        playlist_id: cleanId,
        video_id: videoId,
        watched: watched,
      }),
    });
  } catch (e) {
    console.warn("Backend markVideoWatched failed:", e);
  }

  // 2. Direct Supabase DB Client write (video_progress table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const row = {
        user_id: targetUserId,
        playlist_id: cleanId,
        video_id: videoId,
        watched: watched,
        completed_at: watched ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch (e) {
    console.warn("Mark video watched in Supabase DB failed:", e);
  }

  // 3. Direct Supabase DB Client write (learning_progress JSONB table)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const playlists = lpData[0].completed_steps || [];
      const plIndex = playlists.findIndex((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (plIndex !== -1) {
        const pl = playlists[plIndex];
        const videos = pl.videos || [];
        const vIdx = videos.findIndex((v: any) => (v.videoId || v.id) === videoId);
        if (vIdx !== -1) {
          videos[vIdx].watched = watched;
          videos[vIdx].completed = watched;
          videos[vIdx].completedAt = watched ? new Date().toISOString() : null;
        } else {
          videos.push({
            videoId,
            id: videoId,
            watched,
            completed: watched,
            completedAt: watched ? new Date().toISOString() : null,
          });
        }
        playlists[plIndex].videos = videos;

        const totalV = videos.length;
        const compV = videos.filter((v: any) => v.watched || v.completed).length;
        const pct = totalV > 0 ? Math.round((compV / totalV) * 10000) / 100 : 0;

        await supabase.from("learning_progress").upsert({
          session_id: sid,
          user_id: session?.user?.id || null,
          skill_name: "saved_playlists",
          completed_steps: playlists,
          completion_pct: pct,
          updated_at: new Date().toISOString()
        }, { onConflict: "session_id,skill_name" });
      }
    }
  } catch (e) {
    console.warn("Mark video watched in learning_progress JSONB failed:", e);
  }
}


/**
 * Periodic resume save (every 10 s while playing).
 * Updates last_position + watch_time WITHOUT touching the `watched` flag.
 */
export async function saveVideoProgress(
  playlistId: string,
  videoId: string,
  lastPosition: number,
  watchTime: number,
): Promise<void> {
  try {
    const authHeaders = await getAuthHeaders();
    apiFetch(`${API_BASE}/api/learning/save-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        playlist_id: playlistId,
        video_id: videoId,
        last_position: Math.round(lastPosition),
        watch_time: Math.round(watchTime),
      }),
    }).catch(() => {});
  } catch {}

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const row = {
        user_id: session.user.id,
        playlist_id: playlistId,
        video_id: videoId,
        last_position: Math.round(lastPosition),
        watch_time: Math.round(watchTime),
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch {}
}

/**
 * Auto-completion endpoint.
 * Called by useYouTubePlayer when ≥95% of the video is genuinely watched.
 * Returns updated playlist statistics for instant UI refresh.
 */
export async function completeVideo(
  playlistId: string,
  videoId: string,
  watchTime: number,
): Promise<{ success: boolean; completed_at?: string; playlist_stats?: { completed_videos: number } }> {
  const cleanId = cleanPlaylistId(playlistId);
  const sessionId = getRawGuestSessionId();
  const nowIso = new Date().toISOString();

  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/complete-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        playlist_id: cleanId,
        video_id: videoId,
        watch_time: Math.round(watchTime),
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend completeVideo failed:", e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = session?.user?.id;
    if (targetUserId) {
      const row = {
        user_id: targetUserId,
        playlist_id: cleanId,
        video_id: videoId,
        watched: true,
        watch_time: Math.round(watchTime),
        completed_at: nowIso,
        updated_at: nowIso,
      };
      await supabase
        .from("video_progress")
        .upsert(row, { onConflict: "user_id,playlist_id,video_id" });
    }
  } catch (e) {
    console.warn("completeVideo DB failed:", e);
  }

  // Direct update to learning_progress JSONB table
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const sid = session?.user?.id || sessionId;
    const { data: lpData } = await supabase
      .from("learning_progress")
      .select("completed_steps")
      .eq("session_id", sid)
      .eq("skill_name", "saved_playlists")
      .limit(1);

    if (lpData && lpData.length > 0) {
      const playlists = lpData[0].completed_steps || [];
      const plIndex = playlists.findIndex((p: any) => (p.id || p.playlist_id) === cleanId || (p.id || p.playlist_id) === playlistId);
      if (plIndex !== -1) {
        const pl = playlists[plIndex];
        const videos = pl.videos || [];
        const vIdx = videos.findIndex((v: any) => (v.videoId || v.id) === videoId);
        if (vIdx !== -1) {
          videos[vIdx].watched = true;
          videos[vIdx].completed = true;
          videos[vIdx].completedAt = nowIso;
        } else {
          videos.push({
            videoId,
            id: videoId,
            watched: true,
            completed: true,
            completedAt: nowIso,
          });
        }
        playlists[plIndex].videos = videos;

        await supabase.from("learning_progress").upsert({
          session_id: sid,
          user_id: session?.user?.id || null,
          skill_name: "saved_playlists",
          completed_steps: playlists,
          updated_at: nowIso
        }, { onConflict: "session_id,skill_name" });
      }
    }
  } catch (e) {
    console.warn("completeVideo learning_progress failed:", e);
  }

  return { success: true, completed_at: nowIso };
}

export async function markAllVideosWatched(
  playlistId: string,
  watched: boolean = true
): Promise<{ success: boolean; count: number }> {
  try {
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      const res = await apiFetch(`${API_BASE}/api/learning/mark-all-watched`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          playlist_id: playlistId,
          watched: watched,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn("markAllVideosWatched failed:", e);
  }
  return { success: false, count: 0 };
}


// ── Tier 3: AI Roadmap API ───────────────────────────────────────────────────

export interface RoadmapTier {
  tier: number;
  name: string;
  description: string;
  nodes: string[];
}

export interface RoadmapData {
  title: string;
  tiers: RoadmapTier[];
}

export async function generateRoadmap(skill: string): Promise<RoadmapData | null> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/learning/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ skill }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.roadmap ?? null;
  } catch (e) {
    console.warn("Roadmap generation failed:", e);
    return null;
  }
}

// ── Practice / Company Questions API ─────────────────────────────────────────

export interface PracticeQuestion {
  id: number;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  acceptance: string;
  frequency: string;
}

export interface CompanyQuestionsResult {
  company: string;
  period: string;
  total: number;
  offset: number;
  limit: number;
  questions: PracticeQuestion[];
}

export type QuestionPeriod =
  | "all"
  | "six-months"
  | "three-months"
  | "thirty-days"
  | "more-than-six-months";

/** Fetches the sorted list of all 663 company slugs. */
export async function fetchPracticeCompanies(): Promise<string[]> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/practice/companies`, { headers: { ...authHeaders }, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.companies ?? [];
  } catch (e) {
    console.warn("Failed to fetch practice companies:", e);
    return [];
  }
}

/** Fetches questions for a specific company with optional filters. */
export async function fetchCompanyQuestions(
  company: string,
  period: QuestionPeriod = "all",
  difficulty?: string,
  search?: string,
  limit = 100,
  offset = 0,
): Promise<CompanyQuestionsResult | null> {
  try {
    const params = new URLSearchParams({ period, limit: String(limit), offset: String(offset) });
    if (difficulty) params.set("difficulty", difficulty);
    if (search) params.set("search", search);

    const authHeaders = await getAuthHeaders();
    const res = await apiFetch(
      `${API_BASE}/api/practice/questions/${encodeURIComponent(company)}?${params}`,
      { headers: { ...authHeaders }, cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to fetch questions for '${company}':`, e);
    return null;
  }
}

// ── Profile & Developer Coding Platforms API ─────────────────────────────────

export interface AcademicProfile {
  user_id?: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: string;
  target_role: string;
}

export interface CodingProfilesInput {
  user_id?: string;
  leetcode?: string;
  github?: string;
  hackerrank?: string;
  codechef?: string;
  geeksforgeeks?: string;
  codeforces?: string;
}

export interface PlatformStat {
  configured: boolean;
  username?: string;
  url?: string;
  badge?: string;
  summary?: string;
  [key: string]: any;
}

export async function fetchProfileData() {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const userId = session.user.id;

    // Fetch profile data directly from Supabase DB
    const [academicRes, codingRes] = await Promise.all([
      supabase.from("user_academic_profile").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_coding_profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const academic = academicRes.data || null;
    const coding = codingRes.data || null;

    let codingInputs: any = null;
    let codingStats: any = null;

    if (coding) {
      codingInputs = {
        leetcode: coding.leetcode_url || "",
        github: coding.github_url || "",
        hackerrank: coding.hackerrank_url || "",
        codechef: coding.codechef_url || "",
        geeksforgeeks: coding.geeksforgeeks_url || "",
        codeforces: coding.codeforces_url || "",
      };
      codingStats = coding.stats_json || {};
    }

    return {
      academic,
      coding_inputs: codingInputs,
      coding_stats: codingStats,
    };
  } catch (e) {
    console.warn("Failed to fetch profile data:", e);
    return null;
  }
}

export async function saveAcademicProfile(data: AcademicProfile) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const payload = {
      user_id: session.user.id,
      full_name: data.full_name || "",
      college: data.college || "",
      department: data.department || "",
      academic_year: data.academic_year || "",
      target_role: data.target_role || "",
      updated_at: new Date().toISOString(),
    };

    // Save directly to Supabase DB
    const { error } = await supabase
      .from("user_academic_profile")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    // Async sync to FastAPI backend if online
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      apiFetch(`${API_BASE}/api/profile/academic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    return { success: true };
  } catch (e) {
    console.warn("Failed to save academic profile:", e);
    return null;
  }
}

export async function saveCodingProfiles(data: CodingProfilesInput) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const payload = {
      user_id: session.user.id,
      leetcode_url: data.leetcode || "",
      github_url: data.github || "",
      hackerrank_url: data.hackerrank || "",
      codechef_url: data.codechef || "",
      geeksforgeeks_url: data.geeksforgeeks || "",
      codeforces_url: data.codeforces || "",
      updated_at: new Date().toISOString(),
    };

    // Save directly to Supabase DB
    const { error } = await supabase
      .from("user_coding_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    let extractedStats = {};
    const authHeaders = await getAuthHeaders();
    if (authHeaders.Authorization) {
      try {
        const res = await apiFetch(`${API_BASE}/api/profile/coding`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.stats) extractedStats = json.stats;
        }
      } catch {}
    }

    return { success: true, stats: extractedStats };
  } catch (e) {
    console.warn("Failed to save coding profiles:", e);
    return null;
  }
}

/**
 * Dispatches or synchronizes a one-time welcome email for newly registered users.
 * Transmits the authenticated Supabase access token in Authorization header.
 */
export async function sendWelcomeEmail(payload: {
  is_signup?: boolean;
  full_name?: string;
  email?: string;
  user_id?: string;
} = {}): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      return { success: false, error: "No active session token" };
    }

    const res = await fetch(`${API_BASE}/api/auth/welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_signup: payload.is_signup ?? false,
        full_name: payload.full_name,
      }),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn("Welcome email dispatch warning:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ── Daily Login Streak & Dynamic Level Engine ────────────────────────────────

/**
 * Returns YYYY-MM-DD string in the user's local timezone.
 */
export function getLocalCalendarDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Syncs the user's daily login streak against Supabase user_progress.
 * - If user logged in today: maintains streak.
 * - If user logged in yesterday: increments streak.
 * - If user missed a day or is logging in for first time: sets streak to 1.
 */
export async function syncDailyLoginStreak(userId: string): Promise<number> {
  if (!userId) return 0;

  const todayStr = getLocalCalendarDateStr(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalCalendarDateStr(yesterdayDate);

  const LS_STREAK = `sc_daily_streak_${userId}`;
  const LS_LAST_LOGIN = `sc_last_login_date_${userId}`;

  let currentStreak = 0;
  let lastLoginDate: string | null = null;

  try {
    const cachedStreak = localStorage.getItem(LS_STREAK);
    const cachedDate = localStorage.getItem(LS_LAST_LOGIN);
    if (cachedStreak) currentStreak = parseInt(cachedStreak, 10) || 0;
    if (cachedDate) lastLoginDate = cachedDate;
  } catch {}

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const hasAuthSession = sessionData?.session?.user?.id === userId;

    if (hasAuthSession) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("streak_days, last_login_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        if (typeof data.streak_days === "number") currentStreak = data.streak_days;
        if (data.last_login_date) lastLoginDate = data.last_login_date;
      }
    }

    let nextStreak = currentStreak;

    if (lastLoginDate === todayStr) {
      // Already logged in today
      nextStreak = Math.max(1, currentStreak);
    } else if (lastLoginDate === yesterdayStr) {
      // Logged in yesterday -> streak increments!
      nextStreak = (currentStreak > 0 ? currentStreak : 0) + 1;
    } else {
      // Streak broken or first login today -> starts at 1
      nextStreak = 1;
    }

    // Persist to Supabase only if authenticated
    if (hasAuthSession) {
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          streak_days: nextStreak,
          last_login_date: todayStr,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    try {
      localStorage.setItem(LS_STREAK, String(nextStreak));
      localStorage.setItem(LS_LAST_LOGIN, todayStr);
    } catch {}

    return nextStreak;
  } catch (err) {
    console.warn("Error syncing daily login streak:", err);
    return Math.max(0, currentStreak);
  }
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  category: "practice" | "learning" | "streak" | "level";
  progressText?: string;
}

export interface UserProgressStats {
  streakDays: number;
  badgesCount: number;
  questionsSolved: number;
  completedVideos: number;
  completedRoadmaps: number;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpPercent: number;
  badges: BadgeItem[];
}

/**
 * Fetches accurate progress statistics starting from 0 for all users:
 * - Questions solved: Strictly counts ticked questions in practice (leetcode_progress status = 'solved').
 * - Videos completed: Counts watched saved videos (video_progress watched = true).
 * - Roadmaps completed: Counts completed roadmap topics (roadmap_progress).
 * - Streak: Daily login streak tracked by calendar day.
 * - XP & Levels: Dynamically computed from videos, questions, and roadmaps.
 * - Badges: Evaluated dynamically from real achievements.
 */
export async function fetchUserProgressStats(
  userId: string,
  hasConnectedProfile: boolean = false
): Promise<UserProgressStats> {
  const defaultStats: UserProgressStats = {
    streakDays: 0,
    badgesCount: 0,
    questionsSolved: 0,
    completedVideos: 0,
    completedRoadmaps: 0,
    totalXP: 0,
    level: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    xpPercent: 0,
    badges: [],
  };

  if (!userId) return defaultStats;

  // 1. Fetch ticked questions from practice (leetcode_progress)
  let dbSolved = 0;
  try {
    const { count } = await supabase
      .from("leetcode_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "solved");
    if (typeof count === "number") dbSolved = count;
  } catch (err) {
    console.warn("Failed to fetch leetcode_progress count:", err);
  }

  // Local storage fallback for ticked practice questions
  let localSolved = 0;
  try {
    const savedSolved = localStorage.getItem(`skillscatalyst_solved_questions_${userId}`);
    if (savedSolved) {
      const parsed = JSON.parse(savedSolved);
      localSolved = Object.keys(parsed).filter((k) => !!parsed[k]).length;
    }
  } catch {}

  const questionsSolved = Math.max(dbSolved, localSolved);

  // 2. Fetch watched saved videos (video_progress)
  let dbVideos = 0;
  try {
    const { count } = await supabase
      .from("video_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("watched", true);
    if (typeof count === "number") dbVideos = count;
  } catch (err) {
    console.warn("Failed to fetch video_progress count:", err);
  }

  let localVideos = 0;
  try {
    const savedVideos = localStorage.getItem(`skillscatalyst_video_progress_${userId}`);
    if (savedVideos) {
      const parsed = JSON.parse(savedVideos);
      localVideos = Object.keys(parsed).filter((k) => !!parsed[k]?.watched).length;
    }
  } catch {}

  const completedVideos = Math.max(dbVideos, localVideos);

  // 3. Fetch completed roadmap topics (roadmap_progress)
  let dbRoadmaps = 0;
  try {
    const { count } = await supabase
      .from("roadmap_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .neq("node_id", "_roadmap_started");
    if (typeof count === "number") dbRoadmaps = count;
  } catch (err) {
    console.warn("Failed to fetch roadmap_progress count:", err);
  }

  let localRoadmaps = 0;
  try {
    const savedNodes = localStorage.getItem("skillscatalyst_completed_roadmap_nodes");
    if (savedNodes) {
      const parsed = JSON.parse(savedNodes);
      if (Array.isArray(parsed)) localRoadmaps = parsed.length;
    }
  } catch {}

  const completedRoadmaps = Math.max(dbRoadmaps, localRoadmaps);

  // 4. Sync Daily Login Streak
  const streakDays = await syncDailyLoginStreak(userId);

  // 5. Calculate XP and Level
  // 50 XP per ticked question, 25 XP per watched video, 50 XP per completed roadmap topic
  const totalXP = (completedVideos * 25) + (questionsSolved * 50) + (completedRoadmaps * 50);
  const XP_PER_LEVEL = 100;
  const level = Math.floor(totalXP / XP_PER_LEVEL);
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const nextLevelXP = XP_PER_LEVEL;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  // 6. Asynchronously update Supabase user_progress record
  try {
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        problems_solved: questionsSolved,
        total_xp: totalXP,
        level: level,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {}

  // 7. Dynamic Badge Unlocking (Starts at 0 if no requirements met)
  const badges: BadgeItem[] = [
    {
      id: "first_problem",
      name: "Code Starter",
      desc: "Solve your first practice question",
      icon: "💻",
      unlocked: questionsSolved >= 1,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 1)}/1 solved`,
    },
    {
      id: "five_problems",
      name: "Problem Solver",
      desc: "Solve 5 practice questions",
      icon: "⚡",
      unlocked: questionsSolved >= 5,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 5)}/5 solved`,
    },
    {
      id: "fifteen_problems",
      name: "Algo Apprentice",
      desc: "Solve 15 practice questions",
      icon: "🧠",
      unlocked: questionsSolved >= 15,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 15)}/15 solved`,
    },
    {
      id: "thirty_problems",
      name: "DSA Master",
      desc: "Solve 30 practice questions",
      icon: "👑",
      unlocked: questionsSolved >= 30,
      category: "practice",
      progressText: `${Math.min(questionsSolved, 30)}/30 solved`,
    },
    {
      id: "first_video",
      name: "Curious Mind",
      desc: "Complete your first saved video",
      icon: "🎬",
      unlocked: completedVideos >= 1,
      category: "learning",
      progressText: `${Math.min(completedVideos, 1)}/1 watched`,
    },
    {
      id: "five_videos",
      name: "Video Scholar",
      desc: "Complete 5 saved videos",
      icon: "📺",
      unlocked: completedVideos >= 5,
      category: "learning",
      progressText: `${Math.min(completedVideos, 5)}/5 watched`,
    },
    {
      id: "first_roadmap",
      name: "Pathfinder",
      desc: "Complete your first roadmap topic",
      icon: "🗺️",
      unlocked: completedRoadmaps >= 1,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 1)}/1 topic`,
    },
    {
      id: "five_roadmaps",
      name: "Trailblazer",
      desc: "Complete 5 roadmap topics",
      icon: "🚀",
      unlocked: completedRoadmaps >= 5,
      category: "learning",
      progressText: `${Math.min(completedRoadmaps, 5)}/5 topics`,
    },
    {
      id: "streak_3",
      name: "Habit Builder",
      desc: "Maintain a 3-day daily login streak",
      icon: "🔥",
      unlocked: streakDays >= 3,
      category: "streak",
      progressText: `${Math.min(streakDays, 3)}/3 days`,
    },
    {
      id: "streak_7",
      name: "Weekly Champion",
      desc: "Maintain a 7-day daily login streak",
      icon: "🌟",
      unlocked: streakDays >= 7,
      category: "streak",
      progressText: `${Math.min(streakDays, 7)}/7 days`,
    },
    {
      id: "streak_14",
      name: "Unstoppable",
      desc: "Maintain a 14-day daily login streak",
      icon: "🛡️",
      unlocked: streakDays >= 14,
      category: "streak",
      progressText: `${Math.min(streakDays, 14)}/14 days`,
    },
    {
      id: "level_1",
      name: "Level 1 Achiever",
      desc: "Reach Level 1 (Earn 100 XP)",
      icon: "✨",
      unlocked: level >= 1,
      category: "level",
      progressText: `${Math.min(totalXP, 100)}/100 XP`,
    },
    {
      id: "level_5",
      name: "Veteran Learner",
      desc: "Reach Level 5 (Earn 500 XP)",
      icon: "🏅",
      unlocked: level >= 5,
      category: "level",
      progressText: `${Math.min(totalXP, 500)}/500 XP`,
    },
    {
      id: "profile_linked",
      name: "Profile Connected",
      desc: "Connect at least 1 coding profile",
      icon: "🔗",
      unlocked: hasConnectedProfile,
      category: "practice",
      progressText: hasConnectedProfile ? "Connected" : "0/1 linked",
    },
  ];

  const badgesCount = badges.filter((b) => b.unlocked).length;

  return {
    streakDays,
    badgesCount,
    questionsSolved,
    completedVideos,
    completedRoadmaps,
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    xpPercent,
    badges,
  };
}


