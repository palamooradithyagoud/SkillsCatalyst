/**
 * frontend/components/admin/lesson-editor/types.ts
 * Internal state and UI types for the Admin Lesson Block Editor (Phase 2B).
 */

import type {
  LessonBlock,
  BlockType,
  HeadingLessonBlock,
  ParagraphLessonBlock,
  ImageLessonBlock,
  CodeLessonBlock,
  OutputLessonBlock,
  ListLessonBlock,
  TableLessonBlock,
  CalloutLessonBlock,
  QuoteLessonBlock,
  YouTubeLessonBlock,
  LinkLessonBlock,
  KeyTakeawaysLessonBlock,
  SupportedCodeLanguage,
} from "@/types/lesson-content";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

export interface BlockValidationError {
  blockId: string;
  field?: string;
  message: string;
}

export interface LessonEditorHierarchy {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
}

export interface BlockTypeDescriptor {
  type: BlockType;
  label: string;
  description: string;
  category: "text" | "media" | "code" | "structured" | "callout";
  badge?: string;
}

export const SUPPORTED_LANGUAGES: { value: SupportedCodeLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain Text" },
];

export const BLOCK_TYPE_DESCRIPTORS: BlockTypeDescriptor[] = [
  {
    type: "heading",
    label: "Heading",
    description: "Section or subsection title (H2, H3, or H4)",
    category: "text",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    description: "Standard body text with multiple lines and spacing",
    category: "text",
  },
  {
    type: "code",
    label: "Code Snippet",
    description: "Syntax-highlighted code block in 20 supported languages",
    category: "code",
  },
  {
    type: "output",
    label: "Execution Output",
    description: "Expected terminal output or program result",
    category: "code",
  },
  {
    type: "callout",
    label: "Callout Box",
    description: "Highlighted note, tip, warning, or important insight",
    category: "callout",
  },
  {
    type: "key_takeaways",
    label: "Key Takeaways",
    description: "Summary bullet list of essential concepts learned",
    category: "structured",
  },
  {
    type: "list",
    label: "List",
    description: "Numbered or bulleted collection of items",
    category: "text",
  },
  {
    type: "table",
    label: "Table",
    description: "Structured rows and columns of textual information",
    category: "structured",
  },
  {
    type: "quote",
    label: "Quote",
    description: "Highlighted quotation with optional author attribution",
    category: "text",
  },
  {
    type: "youtube",
    label: "YouTube Video",
    description: "Embedded educational video player via canonical URL or ID",
    category: "media",
  },
  {
    type: "image",
    label: "Image",
    description: "Responsive image with accessibility alt text and caption",
    category: "media",
  },
  {
    type: "link",
    label: "External Link",
    description: "Clickable reference link to documentation or external resource",
    category: "media",
  },
];

export type {
  LessonBlock,
  BlockType,
  HeadingLessonBlock,
  ParagraphLessonBlock,
  ImageLessonBlock,
  CodeLessonBlock,
  OutputLessonBlock,
  ListLessonBlock,
  TableLessonBlock,
  CalloutLessonBlock,
  QuoteLessonBlock,
  YouTubeLessonBlock,
  LinkLessonBlock,
  KeyTakeawaysLessonBlock,
};
