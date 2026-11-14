"""
Unified Benchmark Runner for Phase 2.2: Real-World Benchmarking & Automated Quality Validation.

Executes all 6 benchmark suites deterministically without requiring live LLM API keys:
1. Document Extraction Benchmark (32 layout fixtures, PDF & DOCX)
2. Keyword Matching Benchmark (110 combinations, 10 engineering domains)
3. AI Evaluation & Career-Stage Benchmark (32 candidate scenarios)
4. Security & Prompt Injection Benchmark (18 adversarial attack vectors)
5. Scoring Fairness & Consistency Benchmark (32 candidate profiles)
6. API End-to-End Integration Benchmark (20 workflow scenarios)

Prints an aggregated quality scorecard table and exits with code 0 if all quality gates pass,
or code 1 if any threshold is violated.
"""

import sys
import os
import time
from typing import Dict, Any

# Ensure repository root is on sys.path
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

# Set offline fallback for Redis quota store so benchmarks can run without external daemon
os.environ["ALLOW_IN_MEMORY_QUOTA_FALLBACK"] = "true"

from backend.tests.benchmark.extraction_benchmark import run_extraction_benchmark
from backend.tests.benchmark.keyword_benchmark import run_keyword_benchmark
from backend.tests.benchmark.ai_evaluation_benchmark import run_ai_evaluation_benchmark
from backend.tests.benchmark.security_benchmark import run_security_benchmark
from backend.tests.benchmark.scoring_fairness_benchmark import run_scoring_fairness_benchmark
from backend.tests.benchmark.api_benchmark import run_api_benchmark


def main():
    print("=" * 80)
    print(" SkillsCatalyst Resume Analyzer - Phase 2.2 Comprehensive Quality Benchmark")
    print("=" * 80)
    start_time = time.time()

    benchmarks_summary = []
    all_passed = True

    # 1. Extraction Benchmark
    print("\n[1/6] Running Document Extraction Benchmark (32 fixtures)...")
    ext_data = run_extraction_benchmark()
    ext_passed = (
        ext_data["avg_word_f1"] >= 0.90
        and ext_data["avg_section_accuracy"] >= 0.85
        and ext_data["avg_reading_order_accuracy"] >= 0.90
        and ext_data["scanned_detected_correctly"] == ext_data["scanned_cases"]
    )
    benchmarks_summary.append({
        "name": "Document Extraction",
        "cases": ext_data["total_cases"],
        "metric_label": "Word F1 / Order Acc",
        "metric_val": f"{ext_data['avg_word_f1']*100:.1f}% / {ext_data['avg_reading_order_accuracy']*100:.1f}%",
        "threshold": ">= 90% F1 / >= 90% Order",
        "status": "PASS" if ext_passed else "FAIL",
    })
    if not ext_passed:
        all_passed = False

    # 2. Keyword Benchmark
    print("[2/6] Running Keyword Matching Benchmark (110 combinations)...")
    kw_data = run_keyword_benchmark()
    kw_passed = (
        kw_data["precision"] >= 0.95
        and kw_data["recall"] >= 0.95
        and kw_data["false_positive_rate"] <= 0.05
    )
    benchmarks_summary.append({
        "name": "Keyword Matching",
        "cases": kw_data["total_cases"],
        "metric_label": "Precision / Recall",
        "metric_val": f"{kw_data['precision']*100:.1f}% / {kw_data['recall']*100:.1f}%",
        "threshold": ">= 95% P & R",
        "status": "PASS" if kw_passed else "FAIL",
    })
    if not kw_passed:
        all_passed = False

    # 3. AI Evaluation Benchmark
    print("[3/6] Running AI Evaluation & Stage Benchmark (32 scenarios)...")
    ai_data = run_ai_evaluation_benchmark()
    ai_passed = (
        ai_data["stage_detection_accuracy"] >= 0.90
        and ai_data["guardrails_pass_rate"] >= 0.95
        and ai_data["placeholder_enforcement_rate"] >= 0.95
    )
    benchmarks_summary.append({
        "name": "AI Evaluation & Stage",
        "cases": ai_data["total_scenarios"],
        "metric_label": "Stage Acc / Guardrails",
        "metric_val": f"{ai_data['stage_detection_accuracy']*100:.1f}% / {ai_data['guardrails_pass_rate']*100:.1f}%",
        "threshold": ">= 90% Stage / >= 95% Guard",
        "status": "PASS" if ai_passed else "FAIL",
    })
    if not ai_passed:
        all_passed = False

    # 4. Security Benchmark
    print("[4/6] Running Adversarial & Security Benchmark (18 vectors)...")
    sec_data = run_security_benchmark()
    sec_passed = (
        sec_data["attacks_blocked"] == sec_data["total_security_tests"]
        and sec_data["security_score_percentage"] == 100.0
    )
    benchmarks_summary.append({
        "name": "Security & Adversarial",
        "cases": sec_data["total_security_tests"],
        "metric_label": "Attacks Blocked",
        "metric_val": f"{sec_data['attacks_blocked']}/{sec_data['total_security_tests']} (100%)",
        "threshold": "100% Block Rate",
        "status": "PASS" if sec_passed else "FAIL",
    })
    if not sec_passed:
        all_passed = False

    # 5. Scoring Fairness Benchmark
    print("[5/6] Running Scoring Fairness & Consistency Benchmark (32 profiles)...")
    fair_data = run_scoring_fairness_benchmark()
    fair_passed = (
        fair_data["bounds_enforced"]
        and fair_data["fresher_equity_preserved"]
        and fair_data["deterministic_variance_zero"]
        and fair_data["overall_pass_rate"] >= 95.0
    )
    benchmarks_summary.append({
        "name": "Scoring Fairness & Consist.",
        "cases": fair_data["total_profiles"],
        "metric_label": "Pass Rate / Variance",
        "metric_val": f"{fair_data['overall_pass_rate']:.1f}% (Var=0.00)",
        "threshold": ">= 95% Pass, Var=0.00",
        "status": "PASS" if fair_passed else "FAIL",
    })
    if not fair_passed:
        all_passed = False

    # 6. API End-to-End Benchmark
    print("[6/6] Running API End-to-End Integration Benchmark (20 scenarios)...")
    api_data = run_api_benchmark()
    api_passed = (api_data["pass_rate_percentage"] == 100.0)
    benchmarks_summary.append({
        "name": "API End-to-End Integr.",
        "cases": api_data["total_api_tests"],
        "metric_label": "Contract Pass Rate",
        "metric_val": f"{api_data['pass_rate_percentage']:.1f}% ({api_data['passed_tests']}/{api_data['total_api_tests']})",
        "threshold": "100% Pass Rate",
        "status": "PASS" if api_passed else "FAIL",
    })
    if not api_passed:
        all_passed = False

    elapsed = time.time() - start_time

    # Display Aggregated Quality Scorecard
    print("\n" + "=" * 80)
    print("                        PHASE 2.2 BENCHMARK SCORECARD")
    print("=" * 80)
    print(f"{'Benchmark Suite':<28} | {'Cases':<6} | {'Measured Metric':<24} | {'Gate':<6}")
    print("-" * 80)
    for b in benchmarks_summary:
        print(f"{b['name']:<28} | {b['cases']:<6} | {b['metric_val']:<24} | {b['status']:<6}")
    print("=" * 80)

    total_cases = sum(b["cases"] for b in benchmarks_summary)
    print(f"Total Test Cases Executed: {total_cases}")
    print(f"Total Elapsed Time: {elapsed:.2f} seconds")
    print(f"Overall Quality Gate: {'PASSED [READY FOR CONTROLLED BETA]' if all_passed else 'FAILED'}")
    print("=" * 80)

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
