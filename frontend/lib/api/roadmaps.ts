import { supabase } from "@/lib/supabase";
import { API_BASE, apiFetch, getAuthHeaders } from "./client";

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

export function getActivePlaylistTotal(): number {
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
