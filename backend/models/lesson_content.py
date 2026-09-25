"""
backend/models/lesson_content.py
Strict Pydantic Models for SkillsCatalyst Lesson Content Architecture (Phase 2A).
Supports 12 typed structured block schemas:
  1. heading (H2, H3, H4)
  2. paragraph (plain structured text)
  3. image (URL, alt, optional caption)
  4. code (controlled programming language list)
  5. output (expected code execution output)
  6. list (ordered/unordered item list)
  7. table (headers + rows with strict column count matching)
  8. callout (info, tip, warning, important)
  9. quote (text, optional author)
  10. youtube (canonical video_id and url normalization)
  11. link (text, URL)
  12. key_takeaways (summary list of items)
"""

import re
from enum import Enum
from typing import List, Optional, Any, Dict, Set
from urllib.parse import urlparse, parse_qs
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator


# ── Canonical Block Types ──────────────────────────────────────────────────────

class BlockType(str, Enum):
    HEADING = "heading"
    PARAGRAPH = "paragraph"
    IMAGE = "image"
    CODE = "code"
    OUTPUT = "output"
    LIST = "list"
    TABLE = "table"
    CALLOUT = "callout"
    QUOTE = "quote"
    YOUTUBE = "youtube"
    LINK = "link"
    KEY_TAKEAWAYS = "key_takeaways"


# ── Allowed Enums and Whitelists ──────────────────────────────────────────────

ALLOWED_HEADING_LEVELS: Set[int] = {2, 3, 4}

ALLOWED_CALLOUT_VARIANTS: Set[str] = {"info", "tip", "warning", "important"}

ALLOWED_CODE_LANGUAGES: Set[str] = {
    "python",
    "javascript",
    "typescript",
    "html",
    "css",
    "sql",
    "json",
    "bash",
    "shell",
    "go",
    "rust",
    "java",
    "cpp",
    "c",
    "csharp",
    "php",
    "ruby",
    "yaml",
    "markdown",
    "plaintext",
}

YOUTUBE_VIDEO_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{11}$")
HTML_TAG_REGEX = re.compile(r"<\s*(script|iframe|embed|object|applet|form|input|button)[\s>]", re.IGNORECASE)


def validate_no_unsafe_html(text: str, field_name: str = "text") -> None:
    if HTML_TAG_REGEX.search(text):
        raise ValueError(f"Raw HTML or dangerous tags are not allowed in {field_name}.")


def validate_http_url(url: str, field_name: str = "url") -> str:
    clean = url.strip()
    if not clean:
        raise ValueError(f"{field_name} cannot be empty.")
    parsed = urlparse(clean)
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"{field_name} must be a valid HTTP or HTTPS URL.")
    return clean


def extract_youtube_video_id(url_or_id: str) -> str:
    """
    Extracts and validates an 11-character YouTube video ID from various YouTube URL formats.
    Supported:
      - Raw 11-char ID: e.g. "dQw4w9WgXcQ"
      - Watch URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      - Short URL: "https://youtu.be/dQw4w9WgXcQ"
      - Embed URL: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      - Shorts URL: "https://www.youtube.com/shorts/dQw4w9WgXcQ"
    """
    raw = url_or_id.strip()
    if not raw:
        raise ValueError("YouTube URL or Video ID cannot be empty.")

    # 1. Direct 11-char Video ID
    if YOUTUBE_VIDEO_ID_REGEX.match(raw):
        return raw

    parsed = urlparse(raw)
    hostname = (parsed.hostname or "").lower()

    # Reject non-YouTube domains
    valid_domains = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}
    if not any(hostname == d or hostname.endswith("." + d) for d in valid_domains):
        raise ValueError(f"Invalid YouTube URL: hostname '{hostname}' is not a recognized YouTube domain.")

    video_id: Optional[str] = None

    if "youtu.be" in hostname:
        # Format: youtu.be/<video_id>
        path_parts = parsed.path.strip("/").split("/")
        if path_parts and path_parts[0]:
            video_id = path_parts[0]
    elif "youtube.com" in hostname:
        if parsed.path == "/watch":
            qs = parse_qs(parsed.query)
            v_list = qs.get("v")
            if v_list and v_list[0]:
                video_id = v_list[0]
        elif parsed.path.startswith("/embed/"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) >= 2:
                video_id = parts[1]
        elif parsed.path.startswith("/shorts/"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) >= 2:
                video_id = parts[1]

    if not video_id or not YOUTUBE_VIDEO_ID_REGEX.match(video_id):
        raise ValueError(f"Could not extract a valid 11-character YouTube video ID from '{url_or_id}'.")

    return video_id


# ── 12 Typed Block Content Models ─────────────────────────────────────────────

# 1. HEADING
class HeadingBlockContent(BaseModel):
    level: int = Field(..., description="Heading level: strictly 2, 3, or 4")
    text: str = Field(..., min_length=1, max_length=500, description="Heading text")

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: int) -> int:
        if v not in ALLOWED_HEADING_LEVELS:
            raise ValueError(f"Invalid heading level {v}. Supported heading levels are strictly 2, 3, and 4 (H2, H3, H4).")
        return v

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Heading text cannot be empty.")
        validate_no_unsafe_html(clean, "heading text")
        return clean


# 2. PARAGRAPH
class ParagraphBlockContent(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000, description="Plain structured text")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Paragraph text cannot be empty.")
        validate_no_unsafe_html(clean, "paragraph text")
        return clean


# 3. IMAGE
class ImageBlockContent(BaseModel):
    url: str = Field(..., description="Image HTTP/HTTPS URL")
    alt: str = Field(..., min_length=1, max_length=500, description="Accessibility alt text")
    caption: Optional[str] = Field(default=None, max_length=500, description="Optional caption")
    media_id: Optional[str] = Field(default=None, description="Optional reference to public.course_lesson_media UUID")


    @field_validator("url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        return validate_http_url(v, "image url")

    @field_validator("alt")
    @classmethod
    def validate_alt(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Image alt text cannot be empty.")
        validate_no_unsafe_html(clean, "image alt text")
        return clean

    @field_validator("caption")
    @classmethod
    def validate_caption(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            validate_no_unsafe_html(clean, "image caption")
            return clean if clean else None
        return None


# 4. CODE
class CodeBlockContent(BaseModel):
    language: str = Field(..., description="Programming language identifier")
    code: str = Field(..., min_length=1, max_length=100000, description="Source code text")

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ALLOWED_CODE_LANGUAGES:
            supported = ", ".join(sorted(ALLOWED_CODE_LANGUAGES))
            raise ValueError(f"Unsupported code language '{v}'. Supported languages: {supported}")
        return clean

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Code block cannot be empty.")
        return v


# 5. OUTPUT
class OutputBlockContent(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Expected execution output text")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Output text cannot be empty.")
        return v


# 6. LIST
class ListBlockContent(BaseModel):
    ordered: bool = Field(default=False, description="Whether the list is ordered (numbered)")
    items: List[str] = Field(..., min_length=1, max_length=100, description="List item texts")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("List block must contain at least one item.")
        cleaned: List[str] = []
        for idx, item in enumerate(v):
            clean_item = item.strip()
            if not clean_item:
                raise ValueError(f"List item at index {idx} cannot be empty.")
            validate_no_unsafe_html(clean_item, f"list item {idx}")
            cleaned.append(clean_item)
        return cleaned


# 7. TABLE
class TableBlockContent(BaseModel):
    headers: List[str] = Field(..., min_length=1, max_length=20, description="Table column header names")
    rows: List[List[str]] = Field(..., min_length=1, max_length=200, description="Table row records")

    @field_validator("headers")
    @classmethod
    def validate_headers(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("Table must contain at least one header column.")
        cleaned = [h.strip() for h in v]
        for idx, h in enumerate(cleaned):
            if not h:
                raise ValueError(f"Table header column at index {idx} cannot be empty.")
            validate_no_unsafe_html(h, f"table header {idx}")
        return cleaned

    @model_validator(mode="after")
    def validate_table_structure(self) -> "TableBlockContent":
        expected_cols = len(self.headers)
        if not self.rows:
            raise ValueError("Table must contain at least one row.")
        for r_idx, row in enumerate(self.rows):
            if len(row) != expected_cols:
                raise ValueError(
                    f"Table row {r_idx} column count ({len(row)}) does not match headers count ({expected_cols})."
                )
            for c_idx, cell in enumerate(row):
                validate_no_unsafe_html(cell, f"table cell ({r_idx}, {c_idx})")
        return self


# 8. CALLOUT
class CalloutBlockContent(BaseModel):
    variant: str = Field(default="info", description="Callout visual type: info, tip, warning, important")
    title: Optional[str] = Field(default=None, max_length=200, description="Optional callout header title")
    text: str = Field(..., min_length=1, max_length=10000, description="Callout body text")

    @field_validator("variant")
    @classmethod
    def validate_variant(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ALLOWED_CALLOUT_VARIANTS:
            raise ValueError(f"Invalid callout variant '{v}'. Allowed variants are: {sorted(ALLOWED_CALLOUT_VARIANTS)}")
        return clean

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            validate_no_unsafe_html(clean, "callout title")
            return clean if clean else None
        return None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Callout text cannot be empty.")
        validate_no_unsafe_html(clean, "callout text")
        return clean


# 9. QUOTE
class QuoteBlockContent(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Quote statement text")
    author: Optional[str] = Field(default=None, max_length=200, description="Optional quotation attribution")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Quote text cannot be empty.")
        validate_no_unsafe_html(clean, "quote text")
        return clean

    @field_validator("author")
    @classmethod
    def validate_author(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            validate_no_unsafe_html(clean, "quote author")
            return clean if clean else None
        return None


# 10. YOUTUBE
class YouTubeBlockContent(BaseModel):
    video_id: str = Field(..., description="Normalized 11-character YouTube video identifier")
    url: str = Field(..., description="Canonical YouTube watch URL")
    title: Optional[str] = Field(default=None, max_length=300, description="Optional video title")

    @model_validator(mode="before")
    @classmethod
    def normalize_youtube(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Accept video_id or url or both
            incoming_url = values.get("url")
            incoming_id = values.get("video_id")

            target_input = incoming_id or incoming_url
            if not target_input:
                raise ValueError("YouTube block requires either 'url' or 'video_id'.")

            canonical_id = extract_youtube_video_id(str(target_input))
            values["video_id"] = canonical_id
            values["url"] = f"https://www.youtube.com/watch?v={canonical_id}"
            if values.get("title"):
                values["title"] = str(values["title"]).strip()
        return values


# 11. LINK
class LinkBlockContent(BaseModel):
    text: str = Field(..., min_length=1, max_length=300, description="Clickable anchor title")
    url: str = Field(..., description="Target HTTP/HTTPS destination")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Link text cannot be empty.")
        validate_no_unsafe_html(clean, "link text")
        return clean

    @field_validator("url")
    @classmethod
    def validate_link_url(cls, v: str) -> str:
        return validate_http_url(v, "link url")


# 12. KEY_TAKEAWAYS
class KeyTakeawaysBlockContent(BaseModel):
    items: List[str] = Field(..., min_length=1, max_length=30, description="Summary takeaway points")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("Key takeaways block must contain at least one point.")
        cleaned: List[str] = []
        for idx, item in enumerate(v):
            clean_item = item.strip()
            if not clean_item:
                raise ValueError(f"Takeaway point at index {idx} cannot be empty.")
            validate_no_unsafe_html(clean_item, f"takeaway point {idx}")
            cleaned.append(clean_item)
        return cleaned


# ── Mapping Table for Block Content Validation ─────────────────────────────────

BLOCK_CONTENT_MODEL_MAP = {
    BlockType.HEADING: HeadingBlockContent,
    BlockType.PARAGRAPH: ParagraphBlockContent,
    BlockType.IMAGE: ImageBlockContent,
    BlockType.CODE: CodeBlockContent,
    BlockType.OUTPUT: OutputBlockContent,
    BlockType.LIST: ListBlockContent,
    BlockType.TABLE: TableBlockContent,
    BlockType.CALLOUT: CalloutBlockContent,
    BlockType.QUOTE: QuoteBlockContent,
    BlockType.YOUTUBE: YouTubeBlockContent,
    BlockType.LINK: LinkBlockContent,
    BlockType.KEY_TAKEAWAYS: KeyTakeawaysBlockContent,
}


# ── Generic Structured Block Model ─────────────────────────────────────────────

class LessonBlock(BaseModel):
    id: str = Field(..., description="Stable block identifier (e.g. blk_... or UUID)")
    type: BlockType = Field(..., description="Discriminator identifying the block schema")
    order: int = Field(..., ge=0, description="Sequence position in lesson")
    content: Dict[str, Any] = Field(..., description="Structured content corresponding to type")

    @field_validator("id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Block ID cannot be empty.")
        return clean

    @model_validator(mode="after")
    def validate_and_normalize_content(self) -> "LessonBlock":
        target_model = BLOCK_CONTENT_MODEL_MAP.get(self.type)
        if not target_model:
            raise ValueError(f"Unrecognized block type '{self.type}'.")

        # Parse and validate using the specific content model
        validated_content = target_model.model_validate(self.content)
        # Store back the normalized dict
        self.content = validated_content.model_dump()
        return self


# ── Lesson Content Top-Level Request & Response Models ─────────────────────────

class LessonContentPayload(BaseModel):
    blocks: List[LessonBlock] = Field(default_factory=list, description="Ordered sequence of structured blocks")

    @field_validator("blocks")
    @classmethod
    def validate_blocks_integrity(cls, v: List[LessonBlock]) -> List[LessonBlock]:
        # 1. Reject duplicate block IDs inside the same lesson content
        seen_ids: Set[str] = set()
        for idx, block in enumerate(v):
            if block.id in seen_ids:
                raise ValueError(f"Duplicate block ID '{block.id}' detected at block index {idx}.")
            seen_ids.add(block.id)

        # 2. Normalize block order to 0, 1, 2, ..., N-1
        normalized_blocks: List[LessonBlock] = []
        for idx, block in enumerate(v):
            block.order = idx
            normalized_blocks.append(block)

        return normalized_blocks


class LessonContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    lesson_id: str
    schema_version: int = 1
    blocks: List[LessonBlock] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
