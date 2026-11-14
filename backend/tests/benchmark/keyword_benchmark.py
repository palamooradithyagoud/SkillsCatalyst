"""
Comprehensive Keyword Matching Benchmark Suite (Phase 2.2).

Constructs 104 rigorous test combinations across 10 engineering domains:
1. Programming Languages
2. Web Frameworks & Libraries
3. Databases & Caching
4. Cloud Infrastructure
5. DevOps & CI/CD
6. AI / Machine Learning
7. Data Science & Big Data
8. Software Engineering & Architecture
9. Soft Skills & Leadership
10. Domain-Specific (FinTech, Security, Embedded)

Exercises 12 difficult scenarios:
1. Exact matches
2. Alias matches (e.g. k8s -> Kubernetes, postgres -> PostgreSQL)
3. Case variations (e.g. pYtHoN, REACT.JS)
4. Short acronyms (e.g. Go, C, R, AWS, GCP, SQL)
5. Substring collisions (e.g. Java in JavaScript, Rust in Trust)
6. Repeated keywords (deduplicated frequency tracking)
7. Explicit negations (e.g. "no experience with Kubernetes")
8. Unrelated context (e.g. "drank Java coffee while waiting")
9. Skills appearing only in JD (correctly flagged as missing)
10. Future learning goals (e.g. "planning to learn Rust")
11. Lacking experience statements (e.g. "lack experience in AWS")
12. Deep project context (skills embedded in complex impact bullets)

Measures:
- Precision
- Recall
- F1 Score
- False Positive Rate (FPR)
- False Negative Rate (FNR)
- Exact-Match Accuracy
- Alias-Match Accuracy
"""

from typing import Dict, List, Set, Any, NamedTuple, Optional
from dataclasses import dataclass, field

from backend.services.keyword_matcher import match_keywords, TAXONOMY_DICTIONARY


@dataclass
class KeywordBenchmarkCase:
    case_id: str
    category: str
    scenario: str
    resume_text: str
    job_description: Optional[str]
    target_role: Optional[str]
    expected_matched: Set[str]      # Canonical skill names expected to be matched
    expected_missing: Set[str]      # Canonical skill names expected to be missing from resume
    expected_negated: Set[str] = field(default_factory=set)  # Must NOT be matched
    description: str = ""


def build_keyword_benchmark_dataset() -> List[KeywordBenchmarkCase]:
    cases: List[KeywordBenchmarkCase] = []

    # -----------------------------------------------------------------------
    # Scenario 1: Exact Matches (12 cases)
    # -----------------------------------------------------------------------
    exact_data = [
        ("Python", "Languages", "Backend developer with 3 years building Python APIs.", "backend"),
        ("JavaScript", "Languages", "Frontend engineer writing modern JavaScript applications.", "frontend"),
        ("TypeScript", "Languages", "Strong TypeScript proficiency building React apps.", "frontend"),
        ("Java", "Languages", "Enterprise backend engineer using Java and Spring Boot.", "backend"),
        ("Rust", "Languages", "Systems programming in Rust with memory safety focus.", "backend"),
        ("React", "Frameworks", "Built interactive UI components using React and Vite.", "frontend"),
        ("Next.js", "Frameworks", "Shipped server-rendered applications using Next.js 14.", "fullstack"),
        ("Django", "Frameworks", "Developed secure REST APIs using Django framework.", "backend"),
        ("PostgreSQL", "Databases", "Administered PostgreSQL databases with partitioned tables.", "backend"),
        ("Docker", "DevOps", "Containerized microservices using Docker and multi-stage builds.", "devops"),
        ("Kubernetes", "DevOps", "Deployed and scaled pods using Kubernetes helm charts.", "devops"),
        ("AWS", "Cloud", "Architected serverless applications on AWS Lambda and S3.", "cloud"),
    ]
    for idx, (skill, cat, text, role) in enumerate(exact_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-EXACT-{idx:02d}",
            category=cat,
            scenario="Exact Match",
            resume_text=text,
            job_description=f"Looking for engineer proficient in {skill}.",
            target_role=role,
            expected_matched={skill},
            expected_missing=set(),
            description=f"Exact match detection for {skill}"
        ))

    # -----------------------------------------------------------------------
    # Scenario 2: Alias Matches (12 cases)
    # -----------------------------------------------------------------------
    alias_data = [
        ("k8s", "Kubernetes", "Managed cluster deployments with k8s orchestration."),
        ("reactjs", "React", "Developed fast responsive interfaces with reactjs."),
        ("postgres", "PostgreSQL", "Optimized queries and schemas in postgres."),
        ("mongo", "MongoDB", "Document storage and aggregation pipelines with mongo."),
        ("tf", "TensorFlow", "Trained deep convolutional networks using tf 2.0."),
        ("node", "Node.js", "Built async event-driven services using node runtime."),
        ("amazon web services", "AWS", "Hosted cloud infrastructure on amazon web services."),
        ("google cloud", "GCP", "Deployed cloud run functions on google cloud."),
        ("k8s", "Kubernetes", "Automated deployment pipelines to k8s clusters."),
        ("ts", "TypeScript", "Refactored legacy codebase into strict ts."),
        ("golang", "Go", "Built microservices backend using golang with gRPC."),
        ("vuejs", "Vue.js", "Built client dashboards using vuejs 3."),
    ]
    for idx, (alias, canonical, text) in enumerate(alias_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-ALIAS-{idx:02d}",
            category="Frameworks/Tools",
            scenario="Alias Match",
            resume_text=text,
            job_description=f"Requires {canonical}.",
            target_role=None,
            expected_matched={canonical},
            expected_missing=set(),
            description=f"Alias mapping '{alias}' -> '{canonical}'"
        ))

    # -----------------------------------------------------------------------
    # Scenario 3: Case Variations (8 cases)
    # -----------------------------------------------------------------------
    case_vars = [
        ("pYtHoN", "Python", "Experienced pYtHoN programmer."),
        ("REACT.JS", "React", "Proficient in REACT.JS ecosystem."),
        ("kUbErNeTeS", "Kubernetes", "Orchestrated kUbErNeTeS clusters."),
        ("DOCKER", "Docker", "Created DOCKER containers for local dev."),
        ("pOsTgReSqL", "PostgreSQL", "Stored relational data in pOsTgReSqL."),
        ("gItHuB", "Git", "Managed code reviews on gItHuB with Git workflows."),
        ("tEnSoRfLoW", "TensorFlow", "Trained models with tEnSoRfLoW."),
        ("GrApHqL", "GraphQL", "Defined schemas in GrApHqL."),
    ]
    for idx, (raw, canonical, text) in enumerate(case_vars, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-CASE-{idx:02d}",
            category="Variations",
            scenario="Case Variation",
            resume_text=text,
            job_description=f"Requires {canonical}.",
            target_role=None,
            expected_matched={canonical},
            expected_missing=set(),
            description=f"Case insensitive matching for '{raw}'"
        ))

    # -----------------------------------------------------------------------
    # Scenario 4: Short Acronyms with Boundary Verification (8 cases)
    # -----------------------------------------------------------------------
    acronym_data = [
        ("Go", "Backend developer programming in Go. Always delivers Good solutions.", "Must have experience with Go.", {"Go"}, {"Good", "Google"}),
        ("C and C++", "Skilled in C programming and C++ firmware.", "Must have experience with C and C++.", {"C", "C++"}, {"Cat"}),
        ("R", "Used R for statistical regression analysis.", "Must have experience with R.", {"R"}, {"React"}),
        ("AWS", "Deployed multi-tier architectures on AWS cloud.", "Must have experience with AWS.", {"AWS"}, set()),
        ("GCP", "Migrated Kubernetes clusters to GCP engine.", "Must have experience with GCP.", {"GCP"}, set()),
        ("SQL", "Wrote complex analytical SQL queries.", "Must have experience with SQL.", {"SQL"}, set()),
        ("API", "Designed secure REST API endpoints with OAuth2.", "Must have experience with API.", {"API"}, set()),
        ("CI/CD", "Set up automated CI/CD workflows using Git and CI/CD.", "Must have experience with CI/CD and Git.", {"CI/CD", "Git"}, set()),
    ]
    for idx, (acronym, text, jd_text, exp_match, exp_neg) in enumerate(acronym_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-ACR-{idx:02d}",
            category="Acronyms",
            scenario="Short Acronyms",
            resume_text=text,
            job_description=jd_text,
            target_role=None,
            expected_matched=exp_match,
            expected_missing=set(),
            expected_negated=exp_neg,
            description=f"Boundary-isolated acronym test for {acronym}"
        ))

    # -----------------------------------------------------------------------
    # Scenario 5: Substring Collisions (10 cases)
    # -----------------------------------------------------------------------
    collision_data = [
        ("JavaScript only, NOT Java", "Experienced in JavaScript and Node.js.", "Required: JavaScript and Node.js.", {"JavaScript", "Node.js"}, {"Java"}),
        ("Trust but not Rust", "Established client trust and robust security protocols.", "Required: Rust.", set(), {"Rust"}),
        ("Catastrophe not C", "Prevented data catastrophe through proactive backups.", "Required: C.", set(), {"C"}),
        ("Good vs Go", "Consistently demonstrated good communication and great teamwork.", "Required: Go.", set(), {"Go"}),
        ("Readability vs R", "Emphasized code readability and clean architecture.", "Required: R.", set(), {"R"}),
        ("Action vs C", "Implemented user action logging across systems.", "Required: C and C++.", set(), {"C"}),
        ("Java Developer", "Java developer building backend enterprise services.", "Required: Java developer.", {"Java"}, {"JavaScript"}),
        ("C++ Developer", "Low latency trading systems in C++.", "Required: C++ systems engineer.", {"C++"}, {"C"}),
        ("Docker vs Dock", "Docked cargo vessels across ports.", "Required: Docker.", set(), {"Docker"}),
        ("Git vs Digit", "Calculated 8-digit verification codes.", "Required: Git.", set(), {"Git"}),
    ]
    for idx, (title, text, jd_text, exp_match, exp_neg) in enumerate(collision_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-COLL-{idx:02d}",
            category="Substring Collisions",
            scenario="Collision Safety",
            resume_text=text,
            job_description=jd_text,
            target_role=None,
            expected_matched=exp_match,
            expected_missing=set(),
            expected_negated=exp_neg,
            description=f"Collision test: {title}"
        ))

    # -----------------------------------------------------------------------
    # Scenario 6: Repeated Keywords & Deduplication (6 cases)
    # -----------------------------------------------------------------------
    rep_data = [
        ("Python", "Python developer. Used Python for backend, Python for scripting, and Python for tests.", {"Python"}),
        ("React", "Built React UI, customized React hooks, debugged React rendering performance.", {"React"}),
        ("Docker", "Wrote Dockerfile, orchestrated Docker compose, pushed Docker images to registry.", {"Docker"}),
        ("AWS", "Configured AWS VPC, deployed AWS ECS, monitored AWS CloudWatch.", {"AWS"}),
        ("PostgreSQL", "PostgreSQL tuning, PostgreSQL indexing, PostgreSQL migration scripts.", {"PostgreSQL"}),
        ("Kubernetes", "Kubernetes cluster, Kubernetes ingress, Kubernetes daemonsets.", {"Kubernetes"}),
    ]
    for idx, (kw, text, exp_match) in enumerate(rep_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-REP-{idx:02d}",
            category="Deduplication",
            scenario="Repeated Keywords",
            resume_text=text,
            job_description=f"Proficiency in {kw}.",
            target_role=None,
            expected_matched=exp_match,
            expected_missing=set(),
            description=f"Repeated mention deduplication for {kw}"
        ))

    # -----------------------------------------------------------------------
    # Scenario 7: Explicit Negations (12 cases)
    # -----------------------------------------------------------------------
    neg_data = [
        ("Kubernetes", "Skilled in Docker; have no experience with Kubernetes."),
        ("AWS", "Strong GCP knowledge, not familiar with AWS."),
        ("Rust", "Experienced in C++, lack of experience in Rust."),
        ("GraphQL", "REST API specialist, never used GraphQL in production."),
        ("Docker", "Bare metal server admin with zero knowledge of Docker."),
        ("Python", "Frontend specialist, no experience in Python."),
        ("PostgreSQL", "MongoDB developer, no prior experience with PostgreSQL."),
        ("Terraform", "Cloud engineer with lack of experience with Terraform."),
        ("Kafka", "RabbitMQ engineer, have never worked with Kafka."),
        ("React", "Backend Java dev, not experienced in React."),
        ("TypeScript", "Vanilla JS programmer, zero familiarity with TypeScript."),
        ("Next.js", "Express developer, no experience with Next.js."),
    ]
    for idx, (denied_skill, text) in enumerate(neg_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-NEG-{idx:02d}",
            category="Negation",
            scenario="Explicit Negation",
            resume_text=text,
            job_description=f"Requires {denied_skill}.",
            target_role=None,
            expected_matched=set(),
            expected_missing={denied_skill},
            expected_negated={denied_skill},
            description=f"Denied skill '{denied_skill}' must not be credited"
        ))

    # -----------------------------------------------------------------------
    # Scenario 8: Skills in Unrelated / Hobby Context (6 cases)
    # -----------------------------------------------------------------------
    unrelated_data = [
        ("Java Coffee", "Enjoyed a warm cup of Java while writing algorithms.", set(), {"Java"}),
        ("Go to office", "Always ready to go to the office and tackle challenges.", set(), {"Go"}),
        ("Rust on tools", "Cleaned up old iron equipment to remove surface rust.", set(), {"Rust"}),
        ("Git out", "Helped teammates git out of tricky scheduling conflicts.", set(), {"Git"}),
        ("Swift run", "Completed a swift 5k marathon in record time.", set(), {"Swift"}),
        ("Chef cooking", "Passionate amateur chef cooking artisanal pastries.", set(), {"Chef"}),
    ]
    for idx, (title, text, exp_match, exp_neg) in enumerate(unrelated_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-UNREL-{idx:02d}",
            category="Unrelated Context",
            scenario="False Context Filtering",
            resume_text=text,
            job_description="Seeking technical engineers.",
            target_role=None,
            expected_matched=exp_match,
            expected_missing=set(),
            expected_negated=exp_neg,
            description=f"Colloquial non-tech mention: {title}"
        ))

    # -----------------------------------------------------------------------
    # Scenario 9: Skills in Job Description ONLY (10 cases)
    # -----------------------------------------------------------------------
    jd_only_data = [
        ("Terraform", "Built web apps using React and Python.", "Requires expertise in Terraform."),
        ("Kubernetes", "Junior developer proficient in Node.js and MongoDB.", "Must have production Kubernetes experience."),
        ("Kafka", "Full stack engineer building Vue and Django applications.", "Seeking engineer with Apache Kafka stream processing."),
        ("GraphQL", "REST API developer with FastAPI and PostgreSQL.", "Position requires GraphQL API development."),
        ("Redis", "Frontend developer proficient in React, Tailwind, and CSS.", "Backend candidate must know Redis caching."),
        ("AWS", "Local full stack developer using SQLite and Express.", "AWS cloud deployment required."),
        ("Docker", "Data scientist working with Pandas, Scikit-learn, and Jupyter.", "Candidate must be proficient in Docker."),
        ("Go", "Backend developer with 5 years in Python and Ruby.", "Must write microservices in Go."),
        ("Rust", "Embedded developer in C and Assembly.", "Job requires modern Rust systems programming."),
        ("CI/CD", "Manual QA tester inspecting web portals.", "Must automate CI/CD pipelines."),
    ]
    for idx, (missing_skill, resume_txt, jd_txt) in enumerate(jd_only_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-JDONLY-{idx:02d}",
            category="Missing in Resume",
            scenario="JD-Only Skill",
            resume_text=resume_txt,
            job_description=jd_txt,
            target_role=None,
            expected_matched=set(),
            expected_missing={missing_skill},
            expected_negated={missing_skill},
            description=f"Skill '{missing_skill}' in JD but absent from resume"
        ))

    # -----------------------------------------------------------------------
    # Scenario 10: Future Learning Goals (8 cases)
    # -----------------------------------------------------------------------
    future_data = [
        ("Rust", "Current stack: Python. Planning to learn Rust in upcoming quarters."),
        ("Kubernetes", "Docker user aspiring to learn Kubernetes next year."),
        ("GraphQL", "REST developer interested in learning GraphQL."),
        ("AWS", "Enrolled in course to study AWS next month."),
        ("Go", "Keen interest in studying Go in the future."),
        ("Next.js", "Currently building React apps, eager to learn Next.js."),
        ("Terraform", "Will start learning Terraform next quarter."),
        ("Kafka", "Hope to gain exposure to Kafka down the road."),
    ]
    for idx, (future_skill, text) in enumerate(future_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-FUTR-{idx:02d}",
            category="Future Goal",
            scenario="Future Learning",
            resume_text=text,
            job_description=f"Must have hands-on experience in {future_skill}.",
            target_role=None,
            expected_matched=set(),
            expected_missing={future_skill},
            expected_negated={future_skill},
            description=f"Aspirational skill '{future_skill}' must not count as demonstrated"
        ))

    # -----------------------------------------------------------------------
    # Scenario 11: Lacking Experience Statements (8 cases)
    # -----------------------------------------------------------------------
    lacking_data = [
        ("AWS", "Deep GCP experience, currently lacking experience in AWS."),
        ("Docker", "Server admin lacking hands-on experience with Docker."),
        ("Kubernetes", "Container user with lack of practical experience with Kubernetes."),
        ("Python", "Rubyist lacking commercial experience with Python."),
        ("TypeScript", "JS developer lacking professional experience with TypeScript."),
        ("PostgreSQL", "MySQL admin lacking familiarity with PostgreSQL."),
        ("Terraform", "Sysadmin lacking experience with Terraform automation."),
        ("Redis", "Memcached engineer lacking experience in Redis."),
    ]
    for idx, (lack_skill, text) in enumerate(lacking_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-LACK-{idx:02d}",
            category="Lacking Exp",
            scenario="Lacking Experience",
            resume_text=text,
            job_description=f"Requires {lack_skill}.",
            target_role=None,
            expected_matched=set(),
            expected_missing={lack_skill},
            expected_negated={lack_skill},
            description=f"Lacking experience statement for '{lack_skill}'"
        ))

    # -----------------------------------------------------------------------
    # Scenario 12: Project Descriptions with Deep Stack (10 cases)
    # -----------------------------------------------------------------------
    project_data = [
        ("E-Commerce Portal", "Architected e-commerce frontend using React, TypeScript, and Tailwind CSS; processed payments via Stripe API.", {"React", "TypeScript", "Tailwind CSS", "API"}),
        ("FinTech Microservices", "Engineered transaction microservices with Python, FastAPI, and PostgreSQL handling 5k TPS.", {"Python", "FastAPI", "PostgreSQL"}),
        ("Cloud Infrastructure", "Provisioned AWS infrastructure using Terraform and deployed containerized services on Docker.", {"AWS", "Terraform", "Docker"}),
        ("Realtime Analytics", "Built streaming pipeline using Kafka and Spark; stored aggregated time-series in Redis.", {"Kafka", "Spark", "Redis"}),
        ("Mobile Backend", "Designed GraphQL API using Node.js, Express, and MongoDB for iOS/Android apps.", {"GraphQL", "Node.js", "Express", "MongoDB", "API"}),
        ("ML Recommendation", "Trained collaborative filtering models with PyTorch and Scikit-learn; deployed on Docker.", {"PyTorch", "Scikit-learn", "Docker"}),
        ("DevOps Pipeline", "Automated multi-stage CI/CD pipelines with Git, Docker, and Kubernetes.", {"CI/CD", "Git", "Docker", "Kubernetes"}),
        ("Enterprise ERP", "Migrated legacy monolith to Java, Spring Boot, and PostgreSQL on AWS EC2.", {"Java", "Spring Boot", "PostgreSQL", "AWS"}),
        ("Data Warehouse", "Constructed ETL workflows using Python, Pandas, and BigQuery loading 10TB daily.", {"Python", "Pandas", "BigQuery"}),
        ("Security Gateway", "Implemented OAuth2 reverse proxy in Go with Redis rate-limiting and TLS encryption.", {"Go", "Redis"}),
    ]
    for idx, (title, text, exp_matched) in enumerate(project_data, 1):
        cases.append(KeywordBenchmarkCase(
            case_id=f"KW-PROJ-{idx:02d}",
            category="Project Context",
            scenario="Deep Project Bullet",
            resume_text=text,
            job_description=f"Required competencies: {', '.join(sorted(exp_matched))}.",
            target_role=None,
            expected_matched=exp_matched,
            expected_missing=set(),
            description=f"Deep project bullet matching: {title}"
        ))

    return cases


def run_keyword_benchmark() -> Dict[str, Any]:
    """
    Executes keyword matching benchmark across all 104 combinations.
    Computes Precision, Recall, F1, FPR, FNR, exact and alias accuracy.
    """
    cases = build_keyword_benchmark_dataset()
    results = []

    total_tp = 0
    total_fp = 0
    total_fn = 0
    total_tn = 0

    exact_correct = 0
    exact_total = 0
    alias_correct = 0
    alias_total = 0

    for case in cases:
        report = match_keywords(
            resume_text=case.resume_text,
            job_description=case.job_description,
            target_role=case.target_role,
        )

        matched_canonicals = {m.name for m in report.matched}
        missing_all = {m.name for m in report.missing}

        # True Positives: In expected_matched and found in matched_canonicals
        tp_set = case.expected_matched.intersection(matched_canonicals)
        tp = len(tp_set)

        # False Negatives: In expected_matched but missing from matched_canonicals
        fn_set = case.expected_matched - matched_canonicals
        fn = len(fn_set)

        # False Positives: In expected_negated but wrongly matched in matched_canonicals
        fp_set = case.expected_negated.intersection(matched_canonicals)
        fp = len(fp_set)

        # Check missing accuracy
        missing_verified = True
        for m_exp in case.expected_missing:
            if m_exp not in missing_all and m_exp in matched_canonicals:
                missing_verified = False
                fp += 1

        total_tp += tp
        total_fp += fp
        total_fn += fn

        # Track Exact vs Alias accuracy
        if case.scenario == "Exact Match":
            exact_total += len(case.expected_matched)
            for m in report.matched:
                if m.name in case.expected_matched and m.match_type == "exact":
                    exact_correct += 1
        elif case.scenario == "Alias Match":
            alias_total += len(case.expected_matched)
            for m in report.matched:
                if m.name in case.expected_matched and m.match_type == "alias":
                    alias_correct += 1

        passed = (fp == 0 and fn == 0 and missing_verified)
        results.append({
            "case_id": case.case_id,
            "category": case.category,
            "scenario": case.scenario,
            "expected_matched": sorted(list(case.expected_matched)),
            "actual_matched": sorted(list(matched_canonicals)),
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "status": "PASS" if passed else "FAIL",
            "description": case.description
        })

    precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 1.0
    recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 1.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = total_fp / (total_fp + total_tp) if (total_fp + total_tp) > 0 else 0.0
    fnr = total_fn / (total_fn + total_tp) if (total_fn + total_tp) > 0 else 0.0

    exact_acc = exact_correct / exact_total if exact_total > 0 else 1.0
    alias_acc = alias_correct / alias_total if alias_total > 0 else 1.0

    return {
        "total_cases": len(cases),
        "total_tp": total_tp,
        "total_fp": total_fp,
        "total_fn": total_fn,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "false_positive_rate": fpr,
        "false_negative_rate": fnr,
        "exact_match_accuracy": exact_acc,
        "alias_match_accuracy": alias_acc,
        "per_case_results": results,
    }


if __name__ == "__main__":
    data = run_keyword_benchmark()
    print(f"Keyword Benchmark Completed: {data['total_cases']} cases.")
    print(f"Precision: {data['precision'] * 100:.2f}%")
    print(f"Recall: {data['recall'] * 100:.2f}%")
    print(f"F1: {data['f1'] * 100:.2f}%")
    print(f"False Positive Rate: {data['false_positive_rate'] * 100:.2f}%")
    print(f"False Negative Rate: {data['false_negative_rate'] * 100:.2f}%")
    print(f"Exact Match Accuracy: {data['exact_match_accuracy'] * 100:.2f}%")
    print(f"Alias Match Accuracy: {data['alias_match_accuracy'] * 100:.2f}%")
    fails = [r for r in data['per_case_results'] if r['status'] == 'FAIL']
    print(f"Failures: {len(fails)}")
    for f in fails:
        print(f"  FAILED {f['case_id']}: {f['scenario']} | exp={f['expected_matched']} act={f['actual_matched']}")
