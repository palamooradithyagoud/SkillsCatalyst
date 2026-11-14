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
    hyperlinks: List[Dict[str, str]] = Field(default_factory=list, description="Extracted hyperlinks with anchor and URL")
    extraction_confidence: float = Field(default=1.0, description="Confidence of reading order and layout resolution (0.0-1.0)")


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

class LayoutResult(tuple):
    """2-tuple (sorted_texts, detected_columns) with optional confidence attribute for backward compatibility."""
    def __new__(cls, texts: List[str], cols: int, confidence: float = 1.0):
        inst = super().__new__(cls, (texts, cols))
        inst.confidence = confidence
        return inst


def _sort_page_blocks_by_layout(blocks: List[Tuple], page_width: float, page_height: float) -> LayoutResult:
    """
    Sorts PyMuPDF blocks by dynamic vertical band & gutter detection to preserve natural reading order
    across single-column, symmetric 2-column, asymmetric sidebar (30/70 or 70/30),
    3-column layouts, and pages with mid-page full-width spanners (BUG 6 fix).
    Returns (sorted_block_texts, detected_columns).

    Block format in fitz: (x0, y0, x1, y1, text, block_no, block_type)
    where block_type == 0 is text.
    """
    text_blocks = [b for b in blocks if len(b) >= 7 and b[6] == 0 and b[4].strip()]
    if not text_blocks:
        return LayoutResult([], 1, 1.0)

    top_threshold = page_height * 0.35
    bottom_threshold = page_height * 0.82

    headers = []
    footers = []
    mid_spanners = []
    column_candidates = []

    for b in text_blocks:
        x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
        width_ratio = (x1 - x0) / max(page_width, 1.0)
        is_full_width_header = (width_ratio > 0.65 and y1 <= top_threshold)
        is_top_margin_header = (y1 <= min(80.0, page_height * 0.12) and (x1 - x0) > 80)
        is_spanning_element = (width_ratio > 0.70) or (x0 <= page_width * 0.16 and x1 >= page_width * 0.75)

        if is_full_width_header or is_top_margin_header:
            headers.append(b)
        elif width_ratio > 0.65 and y0 >= bottom_threshold:
            footers.append(b)
        elif is_spanning_element:
            # Mid-page full-width spanner (e.g. section title across columns)
            mid_spanners.append(b)
        else:
            column_candidates.append(b)

    if len(column_candidates) < 2:
        text_blocks.sort(key=lambda b: (b[1], b[0]))
        return LayoutResult([b[4].strip() for b in text_blocks if b[4].strip()], 1, 1.0)

    # Project horizontal intervals of column_candidates onto 1pt bins to detect empty vertical gutters
    start_x = int(page_width * 0.18)
    end_x = int(page_width * 0.82)
    bins = [0] * int(page_width + 10)

    for b in column_candidates:
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

    detected_cols = 1
    confidence = 1.0
    if len(gutters) == 1:
        detected_cols = 2
        confidence = 0.95
    elif len(gutters) >= 2:
        detected_cols = 3
        confidence = 0.90

    headers.sort(key=lambda b: (b[1], b[0]))
    footers.sort(key=lambda b: (b[1], b[0]))
    mid_spanners.sort(key=lambda b: (b[1], b[0]))

    # Order blocks by vertical bands to preserve reading order around mid-page spanners
    ordered = []
    ordered.extend(headers)

    def _sort_band(band_blocks: List[Tuple]) -> List[Tuple]:
        if not band_blocks:
            return []
        if detected_cols == 2:
            split_x = gutters[0]
            col1 = sorted([b for b in band_blocks if b[2] <= split_x + 8], key=lambda b: (b[1], b[0]))
            col2 = sorted([b for b in band_blocks if b[0] >= split_x - 8], key=lambda b: (b[1], b[0]))
            spanners = sorted([b for b in band_blocks if b not in col1 and b not in col2], key=lambda b: (b[1], b[0]))
            return col1 + col2 + spanners
        elif detected_cols == 3:
            g1, g2 = gutters[0], gutters[1]
            col1 = sorted([b for b in band_blocks if b[2] <= g1 + 8], key=lambda b: (b[1], b[0]))
            col2 = sorted([b for b in band_blocks if b[0] >= g1 - 8 and b[2] <= g2 + 8], key=lambda b: (b[1], b[0]))
            col3 = sorted([b for b in band_blocks if b[0] >= g2 - 8], key=lambda b: (b[1], b[0]))
            spanners = sorted([b for b in band_blocks if b not in col1 and b not in col2 and b not in col3], key=lambda b: (b[1], b[0]))
            return col1 + col2 + col3 + spanners
        return sorted(band_blocks, key=lambda b: (b[1], b[0]))

    last_y = 0.0 if not headers else max(h[3] for h in headers)

    for spanner in mid_spanners:
        s_top = spanner[1]
        band_blocks = [b for b in column_candidates if b[1] >= last_y - 8 and b[3] <= s_top + 8]
        ordered.extend(_sort_band(band_blocks))
        ordered.append(spanner)
        last_y = spanner[3]

    bottom_y = page_height if not footers else min(f[1] for f in footers)
    trailing_blocks = [b for b in column_candidates if b[1] >= last_y - 8 and b[3] <= bottom_y + 8]
    ordered.extend(_sort_band(trailing_blocks))
    ordered.extend(footers)

    # Safety: include any unassigned blocks
    seen_ids = {id(b) for b in ordered}
    leftovers = [b for b in text_blocks if id(b) not in seen_ids]
    if leftovers:
        ordered.extend(sorted(leftovers, key=lambda b: (b[1], b[0])))

    return LayoutResult([b[4].strip() for b in ordered if b[4].strip()], detected_cols, confidence)


def _extract_pdf_with_layout(content: bytes) -> Tuple[str, int, int, bool, List[str], List[Dict[str, str]], float]:
    """
    Extracts text from PDF bytes via PyMuPDF with column layout detection,
    hyperlink extraction (BUG 5), and scan/OCR detection (Part 9).
    Returns: (text, detected_columns, page_count, is_scanned, warnings, hyperlinks, confidence)
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
    all_hyperlinks: List[Dict[str, str]] = []
    seen_uris: Set[str] = set()
    max_columns_detected = 1
    total_images = 0
    scanned_pages_count = 0
    warnings: List[str] = []
    overall_confidence = 1.0

    for page_num in range(page_count):
        page = doc.load_page(page_num)
        page_width = page.rect.width
        page_height = page.rect.height
        image_list = page.get_images()
        total_images += len(image_list)

        # 1. Hyperlink Extraction (BUG 5 fix)
        try:
            links = page.get_links()
            for l in links:
                uri = l.get("uri", "").strip()
                if uri and (uri.startswith("http://") or uri.startswith("https://") or uri.startswith("mailto:")):
                    if uri not in seen_uris:
                        seen_uris.add(uri)
                        anchor = ""
                        try:
                            anchor_rect = fitz.Rect(l["from"])
                            anchor = page.get_text("text", clip=anchor_rect).strip()
                        except Exception:
                            pass
                        all_hyperlinks.append({"uri": uri, "anchor": anchor or "Link"})
        except Exception as link_err:
            logger.debug(f"Could not extract links from page {page_num}: {link_err}")

        # 2. Block layout sorting (BUG 6 fix)
        raw_blocks = page.get_text("blocks")
        layout_res = _sort_page_blocks_by_layout(raw_blocks, page_width, page_height)
        sorted_texts, col_count = layout_res
        conf = getattr(layout_res, "confidence", 1.0)
        if col_count > max_columns_detected:
            max_columns_detected = col_count
        if conf < overall_confidence:
            overall_confidence = conf

        page_str = "\n\n".join(sorted_texts).strip()

        # 3. Scanned Page Detection & OCR Fallback (Part 9)
        if len(image_list) > 0 and len(page_str) < 50:
            # Try OCR if PyMuPDF OCR / Tesseract is available
            ocr_text = ""
            try:
                textpage_ocr = page.get_textpage_ocr(language='eng')
                if textpage_ocr:
                    ocr_text = textpage_ocr.extractText().strip()
            except Exception:
                ocr_text = ""

            if ocr_text and len(ocr_text) > 50:
                page_str = ocr_text
                warnings.append(f"Page {page_num + 1} was extracted via Optical Character Recognition (OCR).")
            else:
                scanned_pages_count += 1

        if page_str:
            all_page_texts.append(page_str)

    doc.close()

    full_text = "\n\n".join(all_page_texts).strip()
    is_scanned = (
        (scanned_pages_count > 0 and (scanned_pages_count == page_count or len(full_text) < 100))
        or (total_images > 0 and len(full_text) < 100)
    )

    # Append any important extracted hyperlinks not present in plain text (e.g. LinkedIn, GitHub)
    if all_hyperlinks:
        unmentioned_links = [
            h for h in all_hyperlinks
            if h["uri"] not in full_text and any(site in h["uri"].lower() for site in ["linkedin.com", "github.com", "portfolio", "gitlab.com", "http"])
        ]
        if unmentioned_links:
            links_block = "\n\n## Contact Links\n" + "\n".join([f"- {h['anchor']}: {h['uri']}" for h in unmentioned_links])
            full_text = full_text + links_block

    if is_scanned:
        warnings.append("Document appears to be a scanned image. Extracted text may be incomplete or missing.")
    elif max_columns_detected > 1:
        warnings.append(f"Detected {max_columns_detected}-column layout. Text reading order has been normalized with regional band sorting.")

    return full_text, max_columns_detected, page_count, is_scanned, warnings, all_hyperlinks, overall_confidence


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
    hyperlinks: List[Dict[str, str]] = []
    confidence = 1.0

    if filename_lower.endswith(".pdf"):
        file_type = "pdf"
        if HAVE_FITZ:
            raw_text, detected_cols, page_count, is_scanned, warnings, hyperlinks, confidence = _extract_pdf_with_layout(content)
        else:
            raw_text, detected_cols, page_count, is_scanned, warnings = _extract_pdf_pypdf_fallback(content)
            confidence = 0.85
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
        hyperlinks=hyperlinks,
        extraction_confidence=confidence,
    )


def parse_and_clean_document(content: bytes, filename: str) -> str:
    """
    Backwards-compatible wrapper returning cleaned plain text.
    """
    report = extract_document(content, filename)
    return report.extracted_text
