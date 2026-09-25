/**
 * frontend/types/lesson-content.ts
 * Strict TypeScript types for SkillsCatalyst Lesson Content Architecture (Phase 2A).
 * Supports 12 typed structured block schemas with zero `any`.
 */

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "code"
  | "output"
  | "list"
  | "table"
  | "callout"
  | "quote"
  | "youtube"
  | "link"
  | "key_takeaways";

export type HeadingLevel = 2 | 3 | 4;

export type CalloutVariant = "info" | "tip" | "warning" | "important";

export type SupportedCodeLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "css"
  | "sql"
  | "json"
  | "bash"
  | "shell"
  | "go"
  | "rust"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "php"
  | "ruby"
  | "yaml"
  | "markdown"
  | "plaintext"
  | string;

// ── 12 Specific Content Payloads ──────────────────────────────────────────────

export interface HeadingBlockContent {
  level: HeadingLevel;
  text: string;
}

export interface ParagraphBlockContent {
  text: string;
}

export interface ImageBlockContent {
  url: string;
  alt: string;
  caption?: string | null;
  media_id?: string | null;
}


export interface CodeBlockContent {
  language: SupportedCodeLanguage;
  code: string;
}

export interface OutputBlockContent {
  text: string;
}

export interface ListBlockContent {
  ordered: boolean;
  items: string[];
}

export interface TableBlockContent {
  headers: string[];
  rows: string[][];
}

export interface CalloutBlockContent {
  variant: CalloutVariant;
  title?: string | null;
  text: string;
}

export interface QuoteBlockContent {
  text: string;
  author?: string | null;
}

export interface YouTubeBlockContent {
  video_id: string;
  url: string;
  title?: string | null;
}

export interface LinkBlockContent {
  text: string;
  url: string;
}

export interface KeyTakeawaysBlockContent {
  items: string[];
}

// ── Discriminated Block Types ─────────────────────────────────────────────────

export interface BaseLessonBlock<T extends BlockType, C> {
  id: string;
  type: T;
  order: number;
  content: C;
}

export type HeadingLessonBlock = BaseLessonBlock<"heading", HeadingBlockContent>;
export type ParagraphLessonBlock = BaseLessonBlock<"paragraph", ParagraphBlockContent>;
export type ImageLessonBlock = BaseLessonBlock<"image", ImageBlockContent>;
export type CodeLessonBlock = BaseLessonBlock<"code", CodeBlockContent>;
export type OutputLessonBlock = BaseLessonBlock<"output", OutputBlockContent>;
export type ListLessonBlock = BaseLessonBlock<"list", ListBlockContent>;
export type TableLessonBlock = BaseLessonBlock<"table", TableBlockContent>;
export type CalloutLessonBlock = BaseLessonBlock<"callout", CalloutBlockContent>;
export type QuoteLessonBlock = BaseLessonBlock<"quote", QuoteBlockContent>;
export type YouTubeLessonBlock = BaseLessonBlock<"youtube", YouTubeBlockContent>;
export type LinkLessonBlock = BaseLessonBlock<"link", LinkBlockContent>;
export type KeyTakeawaysLessonBlock = BaseLessonBlock<"key_takeaways", KeyTakeawaysBlockContent>;

export type LessonBlock =
  | HeadingLessonBlock
  | ParagraphLessonBlock
  | ImageLessonBlock
  | CodeLessonBlock
  | OutputLessonBlock
  | ListLessonBlock
  | TableLessonBlock
  | CalloutLessonBlock
  | QuoteLessonBlock
  | YouTubeLessonBlock
  | LinkLessonBlock
  | KeyTakeawaysLessonBlock;

export interface LessonContentPayload {
  blocks: LessonBlock[];
}

export type SaveLessonContentPayload = LessonContentPayload;

export interface LessonContentResponse {
  id?: string | null;
  lesson_id: string;
  schema_version: number;
  blocks: LessonBlock[];
  created_at?: string | null;
  updated_at?: string | null;
}

// Aliases for convenience
export type HeadingBlock = HeadingLessonBlock;
export type ParagraphBlock = ParagraphLessonBlock;
export type ImageBlock = ImageLessonBlock;
export type CodeBlock = CodeLessonBlock;
export type OutputBlock = OutputLessonBlock;
export type ListBlock = ListLessonBlock;
export type TableBlock = TableLessonBlock;
export type CalloutBlock = CalloutLessonBlock;
export type QuoteBlock = QuoteLessonBlock;
export type YouTubeBlock = YouTubeLessonBlock;
export type LinkBlock = LinkLessonBlock;
export type KeyTakeawaysBlock = KeyTakeawaysLessonBlock;

