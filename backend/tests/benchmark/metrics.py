"""
NLP and Quality Metrics Utility for Resume Analyzer Benchmarking.

Provides mathematically rigorous, normalized metric implementations:
- Character-level similarity (Normalized Levenshtein Ratio)
- Word-level Precision, Recall, and F1 Score (Multiset Token Overlap)
- Section Detection Accuracy
- Reading-Order Accuracy (Relative Pair Order Inversion / Kendall Tau-like metric)
- Levenshtein Distance
"""

import re
from typing import List, Set, Dict, Tuple, Any
from collections import Counter


def normalize_text_for_metrics(text: str) -> str:
    """Normalizes whitespace, casing, and harmless formatting differences."""
    if not text:
        return ""
    # Replace non-breaking spaces and unusual whitespace
    t = re.sub(r'[\r\t\f\v]', ' ', text)
    t = re.sub(r'\s+', ' ', t)
    return t.strip().lower()


def tokenize_words(text: str) -> List[str]:
    """Tokenizes alphanumeric words ignoring pure punctuation."""
    norm = normalize_text_for_metrics(text)
    return re.findall(r'\b[a-zA-Z0-9_\+#\.\-]{2,}\b', norm)


def calculate_levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates standard Levenshtein edit distance with memory-efficient DP."""
    if len(s1) < len(s2):
        return calculate_levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1] + [0] * len(s2)
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row[j + 1] = min(insertions, deletions, substitutions)
        previous_row = current_row

    return previous_row[-1]


def calculate_character_similarity(s1: str, s2: str) -> float:
    """
    Calculates normalized character similarity in range [0.0, 1.0].
    Formula: 1.0 - (LevenshteinDistance / max(len(s1), len(s2)))
    """
    n1 = normalize_text_for_metrics(s1)
    n2 = normalize_text_for_metrics(s2)
    max_len = max(len(n1), len(n2))
    if max_len == 0:
        return 1.0
    dist = calculate_levenshtein_distance(n1, n2)
    return max(0.0, 1.0 - (dist / max_len))


def calculate_word_precision_recall_f1(expected_text: str, actual_text: str) -> Tuple[float, float, float]:
    """
    Calculates token-level precision, recall, and F1 score using bag-of-words multiset intersection.
    """
    expected_words = tokenize_words(expected_text)
    actual_words = tokenize_words(actual_text)

    if not expected_words and not actual_words:
        return 1.0, 1.0, 1.0
    if not expected_words or not actual_words:
        return 0.0, 0.0, 0.0

    exp_counter = Counter(expected_words)
    act_counter = Counter(actual_words)

    overlap = sum((exp_counter & act_counter).values())

    precision = overlap / len(actual_words) if actual_words else 0.0
    recall = overlap / len(expected_words) if expected_words else 0.0

    if precision + recall > 0:
        f1 = (2 * precision * recall) / (precision + recall)
    else:
        f1 = 0.0

    return precision, recall, f1


def calculate_reading_order_accuracy(expected_section_order: List[str], actual_detected_order: List[str]) -> float:
    """
    Measures reading order preservation based on concordant pairs ratio.
    If expected sections are [A, B, C, D] and actual detected order is [A, B, D, C],
    measures percentage of preserved relative orderings.
    """
    if not expected_section_order or len(expected_section_order) <= 1:
        return 1.0

    # Filter actual to only sections present in expected
    filtered_actual = [s for s in actual_detected_order if s in expected_section_order]
    if len(filtered_actual) <= 1:
        return 1.0 if set(filtered_actual).issubset(set(expected_section_order)) else 0.0

    total_pairs = 0
    concordant_pairs = 0

    expected_indices = {s: i for i, s in enumerate(expected_section_order)}

    for i in range(len(filtered_actual)):
        for j in range(i + 1, len(filtered_actual)):
            s1 = filtered_actual[i]
            s2 = filtered_actual[j]
            if s1 in expected_indices and s2 in expected_indices:
                total_pairs += 1
                if expected_indices[s1] < expected_indices[s2]:
                    concordant_pairs += 1

    return concordant_pairs / total_pairs if total_pairs > 0 else 1.0


def calculate_section_detection_accuracy(expected_sections: Set[str], detected_sections: Set[str]) -> Tuple[float, float, float]:
    """
    Calculates precision, recall, and F1 for detected resume section headers.
    """
    if not expected_sections and not detected_sections:
        return 1.0, 1.0, 1.0
    if not expected_sections or not detected_sections:
        return 0.0, 0.0, 0.0

    intersection = expected_sections.intersection(detected_sections)
    precision = len(intersection) / len(detected_sections)
    recall = len(intersection) / len(expected_sections)

    if precision + recall > 0:
        f1 = (2 * precision * recall) / (precision + recall)
    else:
        f1 = 0.0

    return precision, recall, f1

