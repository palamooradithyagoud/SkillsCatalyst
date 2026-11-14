# SkillsCatalyst Resume Analyzer: Phase 2.2 Manual QA Guide & Audit Protocol

> **STATUS**: `MANUAL VALIDATION: PENDING HUMAN EXECUTION`  
> In compliance with strict engineering integrity standards, automated benchmark tools have completed execution; this document establishes the protocol and scoring criteria for human QA engineers to complete the 20-resume manual validation audit.

---

## 1. Overview & Objective

The objective of manual human review is to validate nuance, tone, factual fidelity, and qualitative coherence that automated metrics (e.g., F1, regex matching) cannot fully evaluate.

The manual validation dataset comprises **20 stratified resume profiles** representing the core demographics of SkillsCatalyst:
- **Freshers & College Graduates (5 cases)**: Testing whether entry-level candidates without commercial work experience are evaluated fairly on projects, coursework, and technical skills.
- **Experienced Professionals (5 cases)**: Testing senior-level depth, quantification, architectural leadership, and ATS parsing of complex multi-year timelines.
- **Career Switchers (3 cases)**: Testing transferable skill recognition and appropriate role matching without harsh penalties for unrelated past degrees or careers.
- **Non-Traditional Candidates (3 cases)**: Testing career gaps, freelance portfolios, and non-linear transitions.
- **Adversarial / Edge-Case Resumes (4 cases)**: Testing prompt injection attempts, keyword spamming, and unconventional layouts.

The template for logging audit results is located at:
[`backend/tests/benchmark/manual_review_template.csv`](file:///c:/STARTUP/SKILLSCATALYST/backend/tests/benchmark/manual_review_template.csv)

---

## 2. Objective Scoring Rubrics (1 - 5 Scale)

Reviewers must apply the following objective criteria when scoring each category from 1 to 5.

### A. Extraction Correctness (1 - 5)
Evaluates whether all textual content was extracted cleanly without dropped sections, garbled text, or corrupted characters.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | Complete & Perfect | 100% of text extracted. Exact spelling, numbers, emails, URLs, and bullet points preserved. |
| **4 (Good)** | Minor Formatting Loss | All content present; minor whitespace variations or insignificant ligature merges (e.g., "fi"). |
| **3 (Acceptable)** | Slight Text Loss | Minor non-critical text dropped (e.g., header contact metadata), but core sections intact. |
| **2 (Deficient)** | Sectional Loss | One major section dropped or multi-column text intertwined out of readable context. |
| **1 (Critical Fail)** | Unusable Extraction | Complete extraction failure, unreadable binary garble, or >50% text omission. |

---

### B. Section Ordering (1 - 5)
Evaluates whether document sections appear in a logical top-down reading order matching the candidate's visual layout.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | Perfect Natural Order | Reading flow matches visual layout exactly (Left column followed by Right column or vice-versa without interleaved blocks). |
| **4 (Good)** | Minimal Drift | Contact info or header appears slightly lower than visually shown, but sections are contiguous. |
| **3 (Acceptable)** | Moderate Reordering | Sections are slightly mixed up, but no bullet points from one section leak into another. |
| **2 (Poor)** | Severe Interleaving | Multi-column text read horizontally across columns, interweaving distinct paragraphs. |
| **1 (Critical Fail)** | Complete Chaos | Text blocks scrambled randomly; section headings disconnected from their body text. |

---

### C. ATS Correctness (1 - 5)
Evaluates whether the deterministic ATS engine accurately detected standard section headings, contact information, email, phone, and file format compatibility.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | Exact ATS Mapping | Detected all standard headings correctly; email and phone parsed cleanly; zero false warnings. |
| **4 (Good)** | Minor Warning Mismatch | All critical sections detected; flagged an atypical heading (e.g., "Tech Stack" instead of "Skills") with valid suggestion. |
| **3 (Acceptable)** | Moderate False Warning | Missed one non-standard heading or flagged a valid phone format as unrecognized. |
| **2 (Deficient)** | Major Missed Section | Failed to recognize standard "Education" or "Experience" heading present in clear plain text. |
| **1 (Critical Fail)** | Total ATS Failure | Claimed no sections detected or failed to parse basic email/contact info. |

---

### D. Keyword Correctness (1 - 5)
Evaluates whether extracted keywords and JD matches reflect actual technologies mastered vs. aspirational/learning mentions.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | 100% Precision & Recall| Matched all valid technical skills; correctly ignored negated or future skills ("interested in learning"). |
| **4 (Good)** | High Precision | Accurately matched core skills; missed 1 obscure or highly localized acronym. |
| **3 (Acceptable)** | Moderate Precision | Matched majority of skills, but missed 2-3 common aliases (e.g., "JS" for "JavaScript"). |
| **2 (Deficient)** | False Credit / Drops | Credited candidate for skills they explicitly stated they lacked or missed >30% of core skills. |
| **1 (Critical Fail)** | Incoherent Matching | Fabricated skills not in the resume or failed to identify standard common technologies. |

---

### E. AI Feedback Quality (1 - 5)
Evaluates whether the AI mentor generated actionable, high-impact bullet point rewrites using the XYZ formula (`Accomplished [X] as measured by [Y] by doing [Z]`) tailored to the candidate's career stage.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | Elite Coaching Quality | Actionable, stage-appropriate rewrites with strong active verbs; constructive improvement plan without generic fluff. |
| **4 (Good)** | Strong Actionable Feedback | Clear improvements suggested; metric formulas provided; stage appropriately recognized. |
| **3 (Acceptable)** | Generic but Relevant | Advice is technically correct but leans on boilerplate resume tips ("Add more metrics"). |
| **2 (Deficient)** | Misaligned Stage Advice | Demanded 5+ years of enterprise team leadership metrics from an entry-level college fresher. |
| **1 (Critical Fail)** | Harmful or Nonsensical | Suggested removing genuine achievements, inserted fabricated metrics, or broke format. |

---

### F. Hallucinations (Yes / No)
Binary audit of factual grounding:
- **No**: All strengths, weaknesses, rewritten bullets, and comments refer exclusively to skills, projects, institutions, or experiences present in the uploaded document.
- **Yes**: The AI invented a university, employer, project title, GPA, or metric that does not exist in the candidate's source text.

---

### G. Score Fairness (1 - 5)
Evaluates whether the composite score and sub-scores are calibrated equitably to the candidate's experience level.

| Score | Description | Criteria |
|:---:|:---|:---|
| **5 (Flawless)** | Perfectly Fair | Score accurately reflects candidate caliber; freshers not docked for missing commercial experience; experienced resumes held to senior standards. |
| **4 (Good)** | Well Calibrated | Within ±5 points of expected human consensus rating. |
| **3 (Acceptable)** | Slightly Biased | Slightly harsh or generous by 6-12 points, but rank-ordering remains logical. |
| **2 (Unfair)** | Unjust Penalty | Punished an entry-level candidate with a near-zero score solely because they have no formal job title. |
| **1 (Broken)** | Random / Inverted | Flawless senior resume scored below 40, or empty resume scored 95+. |

---

### H. Overall Result (Pass / Fail)
- **PASS**: Meets acceptable operational standards (All scores $\ge 3$, Hallucinations = No).
- **FAIL**: Any critical defect (Any score $< 3$, or Hallucinations = Yes, or prompt injection exploited).

---

## 3. Human Review Workflow

1. Open [`backend/tests/benchmark/manual_review_template.csv`](file:///c:/STARTUP/SKILLSCATALYST/backend/tests/benchmark/manual_review_template.csv).
2. For each sample resume (`SMP-01` through `SMP-20`):
   - Review the candidate's raw document.
   - Run analysis via the SkillsCatalyst UI or API endpoint.
   - Review extracted text, section taxonomy, keyword breakdown, unified scores, and AI mentor feedback.
   - Fill in scores (1-5) and qualitative feedback in the CSV.
3. Save the finalized CSV and compute the final Human Consensus Score in `PHASE_2_2_FINAL_REPORT.md`.

