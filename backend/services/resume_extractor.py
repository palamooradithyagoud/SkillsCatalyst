"""
Advanced Resume Extraction Engine.

Features:
- Multi-column layout detection and column-aware block sorting (eliminates cross-column text merging).
- Scanned PDF detection via image presence and text density analysis.
- Structured DOCX extraction (paragraphs, headings, tables, hyperlinks, bullets).
- Robust character cleaning and encoding normalization.
- Extraction quality score (0-100) calculated from measurable indicators.
- Structured ExtractionReport output with detailed warnings and metadata.
"""

import io
import os
import re
import logging
from typing import List, Tuple, Optional, Dict, Any
from pydantic import BaseModel, Field

try:
    import fitz  # PyMuPDF
    HAVE_FITZ = True
except Exception:
    fitz = None
    HAVE_FITZ = False

logger = logging.getLogger(__name__)

# Configurable file size limit — defaults to 5 MB
_MAX_MB = int(os.getenv("MAX_RESUME_MB", "5"))
MAX_FILE_SIZE_BYTES = _MAX_MB * 1024 * 1024


# ---------------------------------------------------------------------------
# Structured Extraction Data Models
# ---------------------------------------------------------------------------

class ExtractionReport(BaseModel):
    """
    Structured metadata report representing the quality and details of resume extraction.
    """
    extracted_text: str = Field(description="Cleaned, layout-normalized plain text")
    filename: str = Field(description="Sanitized document filename")
    file_type: str = Field(description="'pdf' | 'docx' | 'txt' | 'md' | 'unknown'")
    extraction_status: str = Field(default="success", description="'success' | 'warning' | 'failed'")
    is_scanned: bool = Field(default=False, description="True if document appears to be an image-only scan")
    detected_columns: int = Field(default=1, description="Number of visual columns detected (1, 2, or 3+)")
    page_count: int = Field(default=1, description="Total document pages")
    char_count: int = Field(default=0, description="Total extracted non-whitespace characters")
    warnings: List[str] = Field(default_factory=list, description="List of extraction caveats or warnings")
    extraction_quality: float = Field(default=100.0, description="Measurable extraction quality score (0-100)")


# ---------------------------------------------------------------------------
# Text Cleaning & Normalization
# ---------------------------------------------------------------------------

def clean_extracted_text(text: str) -> str:
    """
    Normalizes text extracted from PDF, DOCX, or text files:
    - Removes null bytes and non-printable control characters.
    - Normalizes horizontal spaces while preserving line breaks.
    - Preserves bullet points (•, -, *, etc.), headings, URLs, emails, phones.
    - Collapses excessive blank lines (max 2 consecutive newlines).
    """
    if not text:
        return ""

    # Strip null bytes and non-printable control characters, keep \n \r \t
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

    # Normalize carriage returns
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')

    # Collapse multiple horizontal spaces to a single space (per line)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)

    # Collapse 3+ consecutive newlines to 2 (preserve paragraph spacing)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    return cleaned.strip()


# ---------------------------------------------------------------------------
# Advanced PDF Extraction (Column-Aware Block Sorting)
# ---------------------------------------------------------------------------

def _sort_page_blocks_by_layout(blocks: List[Tuple], page_width: float, page_height: float) -> Tuple[List[str], int]:
    """
    Sorts PyMuPDF blocks by dynamic gutter detection to preserve natural reading order
    across single-column, symmetric 2-column, asymmetric sidebar (30/70 or 70/30),
    and 3-column layouts.
    Returns (sorted_block_texts, detected_columns).

    Block format in fitz: (x0, y0, x1, y1, text, block_no, block_type)
    where block_type == 0 is text.
    """
    text_blocks = [b for b in blocks if len(b) >= 7 and b[6] == 0 and b[4].strip()]
    if not text_blocks:
        return [], 1

    top_threshold = page_height * 0.35
    bottom_threshold = page_height * 0.82

    headers = []
    footers = []
    body_blocks = []

    for b in text_blocks:
        x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
        width_ratio = (x1 - x0) / max(page_width, 1.0)
        # Full-width spanning blocks or blocks restricted to top margin band (y1 <= 80)
        is_full_width_header = (width_ratio > 0.65 and y1 <= top_threshold)
        is_top_margin_header = (y1 <= min(80.0, page_height * 0.12) and (x1 - x0) > 80)

        if is_full_width_header or is_top_margin_header:
            headers.append(b)
        elif width_ratio > 0.65 and y0 >= bottom_threshold:
            footers.append(b)
        else:
            body_blocks.append(b)

    if len(body_blocks) < 3:
        text_blocks.sort(key=lambda b: (b[1], b[0]))
        return [b[4].strip() for b in text_blocks if b[4].strip()], 1

    # Project horizontal intervals of body blocks onto 1pt bins to detect empty vertical gutters
    start_x = int(page_width * 0.18)
    end_x = int(page_width * 0.82)
    bins = [0] * int(page_width + 10)

    for b in body_blocks:
        x0, x1 = int(max(0, b[0])), int(min(page_width - 1, b[2]))
        for i in range(x0, x1 + 1):
            bins[i] += 1

    # Find zero or near-zero density strips of width >= 14pt (gutters between columns)
    gutters = []
    cur_start = None
    min_gutter_width = 14

    for x in range(start_x, end_x):
        if bins[x] == 0:
            if cur_start is None:
                cur_start = x
        else:
            if cur_start is not None:
                if (x - cur_start) >= min_gutter_width:
                    gutters.append((cur_start + x) / 2.0)
                cur_start = None
    if cur_start is not None and (end_x - cur_start) >= min_gutter_width:
        gutters.append((cur_start + end_x) / 2.0)

    headers.sort(key=lambda b: (b[1], b[0]))
    footers.sort(key=lambda b: (b[1], b[0]))

    # Case A: 1 Gutter -> 2 Columns (Symmetric 50/50 OR Asymmetric Sidebar 30/70, 70/30)
    if len(gutters) == 1:
        split_x = gutters[0]
        col1 = [b for b in body_blocks if b[2] <= split_x + 8]
        col2 = [b for b in body_blocks if b[0] >= split_x - 8]
        spanners = [b for b in body_blocks if b not in col1 and b not in col2]

        if len(col1) >= 2 and len(col2) >= 2:
            col1.sort(key=lambda b: (b[1], b[0]))
            col2.sort(key=lambda b: (b[1], b[0]))
            spanners.sort(key=lambda b: (b[1], b[0]))
            ordered = headers + col1 + col2 + spanners + footers
            return [b[4].strip() for b in ordered if b[4].strip()], 2

    # Case B: 2 Gutters -> 3 Columns
    elif len(gutters) >= 2:
        g1, g2 = gutters[0], gutters[1]
        col1 = [b for b in body_blocks if b[2] <= g1 + 8]
        col2 = [b for b in body_blocks if b[0] >= g1 - 8 and b[2] <= g2 + 8]
        col3 = [b for b in body_blocks if b[0] >= g2 - 8]
        spanners = [b for b in body_blocks if b not in col1 and b not in col2 and b not in col3]

        if len(col1) >= 1 and len(col2) >= 1 and len(col3) >= 1:
            col1.sort(key=lambda b: (b[1], b[0]))
            col2.sort(key=lambda b: (b[1], b[0]))
            col3.sort(key=lambda b: (b[1], b[0]))
            spanners.sort(key=lambda b: (b[1], b[0]))
            ordered = headers + col1 + col2 + col3 + spanners + footers
            return [b[4].strip() for b in ordered if b[4].strip()], 3

    # Case C: Standard Single Column reading order
    text_blocks.sort(key=lambda b: (b[1], b[0]))
    return [b[4].strip() for b in text_blocks if b[4].strip()], 1


def _extract_pdf_with_layout(content: bytes) -> Tuple[str, int, int, bool, List[str]]:
    """
    Extracts text from PDF bytes via PyMuPDF with column layout detection and scan detection.
    Returns: (text, detected_columns, page_count, is_scanned, warnings)
    """
    if not HAVE_FITZ or fitz is None:
        raise ValueError("PyMuPDF (fitz) is not installed.")

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to open PDF document: {e}") from e

    if doc.is_encrypted:
        raise ValueError("PDF is encrypted or password-protected. Please upload an unencrypted file.")

    page_count = len(doc)
    if page_count == 0:
        doc.close()
        raise ValueError("PDF document has 0 pages.")

    all_page_texts: List[str] = []
    max_columns_detected = 1
    total_images = 0
    scanned_pages_count = 0
    warnings: List[str] = []

    for page_num in range(page_count):
        page = doc.load_page(page_num)
        page_width = page.rect.width
        page_height = page.rect.height
        image_list = page.get_images()
        total_images += len(image_list)

        raw_blocks = page.get_text("blocks")
        sorted_texts, col_count = _sort_page_blocks_by_layout(raw_blocks, page_width, page_height)
        if col_count > max_columns_detected:
            max_columns_detected = col_count

        page_str = "\n\n".join(sorted_texts).strip()

        # Scanned page detection heuristic:
        # Has images, but extracted fewer than 50 characters of machine text
        if len(image_list) > 0 and len(page_str) < 50:
            scanned_pages_count += 1

        if page_str:
            all_page_texts.append(page_str)

    doc.close()

    full_text = "\n\n".join(all_page_texts).strip()
    is_scanned = (
        (scanned_pages_count > 0 and (scanned_pages_count == page_count or len(full_text) < 100))
        or (total_images > 0 and len(full_text) < 100)
    )
    if is_scanned:
        warnings.append("Document appears to be a scanned image. Extracted text may be incomplete or missing.")
    elif max_columns_detected > 1:
        warnings.append(f"Detected {max_columns_detected}-column layout. Text reading order has been normalized.")

    return full_text, max_columns_detected, page_count, is_scanned, warnings


def _extract_pdf_pypdf_fallback(content: bytes) -> Tuple[str, int, int, bool, List[str]]:
    """Pure-python fallback using pypdf when fitz is unavailable."""
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(content))
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            raise ValueError("PDF is encrypted or password-protected.")

    pages: List[str] = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt and txt.strip():
            pages.append(txt.strip())

    full_text = "\n\n".join(pages)
    return full_text, 1, len(reader.pages), False, []


# ---------------------------------------------------------------------------
# Advanced DOCX Extraction
# ---------------------------------------------------------------------------

def _extract_docx_structured(content: bytes) -> Tuple[str, int, int, bool, List[str]]:
    """
    Extracts text from DOCX bytes including paragraphs, styled headings,
    embedded hyperlinks, and tables.
    Returns: (text, detected_columns, page_count, is_scanned, warnings)
    """
    try:
        import docx
    except ImportError as e:
        raise ValueError("python-docx is not installed. Cannot parse DOCX files.") from e

    try:
        stream = io.BytesIO(content)
        doc = docx.Document(stream)
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document: {e}") from e

    lines: List[str] = []
    warnings: List[str] = []

    # 1. Paragraphs with heading style recognition
    for paragraph in doc.paragraphs:
        txt = paragraph.text.strip()
        if not txt:
            continue
        style_name = getattr(paragraph.style, "name", "") or ""
        if style_name.startswith("Heading"):
            lines.append(f"\n## {txt}")
        else:
            lines.append(txt)

    # 2. Extract table contents preserving row structure
    if doc.tables:
        for t_idx, table in enumerate(doc.tables):
            lines.append(f"\n[Table {t_idx + 1}]")
            for row in table.rows:
                cells = [c.text.strip() for c in row.cells if c.text.strip()]
                # Deduplicate identical adjacent cells caused by merged table cells
                unique_cells = []
                for cell in cells:
                    if not unique_cells or cell != unique_cells[-1]:
                        unique_cells.append(cell)
                if unique_cells:
                    lines.append(" | ".join(unique_cells))

    # 3. Extract hyperlinks from document relationships
    hyperlinks = []
    try:
        for rel in doc.part.rels.values():
            if "hyperlink" in getattr(rel, "reltype", "").lower():
                target = getattr(rel, "target_ref", "")
                if target and ("linkedin.com" in target or "github.com" in target or "http" in target):
                    hyperlinks.append(target)
    except Exception:
        pass

    if hyperlinks:
        lines.append(f"\nLinks: {' | '.join(set(hyperlinks))}")

    # 4. Estimate page count from explicit page breaks or word density
    page_count = 1
    try:
        xml_content = doc._part._element.xml
        page_breaks = xml_content.count('w:type="page"')
        if page_breaks > 0:
            page_count = page_breaks + 1
        elif len(lines) > 0:
            total_words = sum(len(line.split()) for line in lines)
            page_count = max(1, round(total_words / 450))
    except Exception:
        page_count = max(1, len(getattr(doc, "sections", [])))

    full_text = "\n".join(lines)
    return full_text, 1, page_count, False, warnings


# ---------------------------------------------------------------------------
# Extraction Quality Calculation
# ---------------------------------------------------------------------------

def calculate_extraction_quality(text: str, is_scanned: bool, warnings: List[str]) -> float:
    """
    Calculates a deterministic extraction quality score (0-100) based on measurable indicators:
    - Text length and density
    - Non-ASCII / replacement characters (\ufffd) ratio
    - Scanned status
    - Average word length sanity
    """
    if not text or len(text.strip()) == 0:
        return 0.0

    if is_scanned:
        return 20.0

    quality = 100.0
    text_len = len(text)

    # Penalty for extremely short extracted text
    if text_len < 100:
        quality -= 50.0
    elif text_len < 300:
        quality -= 25.0
    elif text_len < 600:
        quality -= 10.0

    # Replacement character ratio (\ufffd or garbled characters)
    replacement_count = text.count('\ufffd')
    if replacement_count > 0:
        penalty = min(30.0, (replacement_count / max(text_len, 1)) * 500)
        quality -= penalty

    # Control character count
    control_chars = len(re.findall(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', text))
    if control_chars > 0:
        quality -= min(15.0, control_chars * 2.0)

    # Check average word length to detect unspaced garbled text
    words = text.split()
    if words:
        avg_word_len = sum(len(w) for w in words) / len(words)
        if avg_word_len > 25.0 or avg_word_len < 2.0:
            quality -= 20.0  # Likely concatenated or fragmented without spaces

    return max(0.0, min(100.0, round(quality, 1)))


# ---------------------------------------------------------------------------
# Master Document Extraction API
# ---------------------------------------------------------------------------

def extract_document(content: bytes, filename: str) -> ExtractionReport:
    """
    Validates, parses, and produces a complete ExtractionReport for an uploaded document.
    Supports: PDF, DOCX, DOC, TXT, MD.
    """
    if not content or len(content) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"File size exceeds the {_MAX_MB} MB limit. Please upload a smaller file."
        )

    filename_lower = filename.lower()
    raw_text = ""
    detected_cols = 1
    page_count = 1
    is_scanned = False
    warnings: List[str] = []
    file_type = "unknown"

    if filename_lower.endswith(".pdf"):
        file_type = "pdf"
        if HAVE_FITZ:
            raw_text, detected_cols, page_count, is_scanned, warnings = _extract_pdf_with_layout(content)
        else:
            raw_text, detected_cols, page_count, is_scanned, warnings = _extract_pdf_pypdf_fallback(content)
    elif filename_lower.endswith((".docx", ".doc")):
        file_type = "docx"
        raw_text, detected_cols, page_count, is_scanned, warnings = _extract_docx_structured(content)
    elif filename_lower.endswith((".txt", ".md")):
        file_type = "txt"
        for enc in ("utf-8", "latin-1", "cp1252"):
            try:
                raw_text = content.decode(enc)
                break
            except (UnicodeDecodeError, LookupError):
                continue
        if not raw_text:
            raise ValueError("Failed to decode text file. Ensure it is saved as UTF-8.")
    else:
        raise ValueError("Unsupported file format. Please upload a PDF, DOCX, TXT, or MD file.")

    cleaned_text = clean_extracted_text(raw_text)

    if not cleaned_text or len(cleaned_text) < 10:
        if is_scanned:
            raise ValueError("The uploaded PDF is a scanned image with no readable text. Please upload a text-based resume.")
        raise ValueError("Extracted text is too short to analyze. The document may be empty or corrupted.")

    quality = calculate_extraction_quality(cleaned_text, is_scanned, warnings)
    status = "failed" if quality < 30.0 else ("warning" if quality < 70.0 or is_scanned else "success")

    return ExtractionReport(
        extracted_text=cleaned_text,
        filename=filename,
        file_type=file_type,
        extraction_status=status,
        is_scanned=is_scanned,
        detected_columns=detected_cols,
        page_count=page_count,
        char_count=len(cleaned_text),
        warnings=warnings,
        extraction_quality=quality,
    )


def parse_and_clean_document(content: bytes, filename: str) -> str:
    """
    Backwards-compatible wrapper returning cleaned plain text.
    """
    report = extract_document(content, filename)
    return report.extracted_text
