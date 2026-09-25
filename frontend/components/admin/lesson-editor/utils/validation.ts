/**
 * frontend/components/admin/lesson-editor/utils/validation.ts
 * Client-side validation matching Phase 2A backend constraints.
 */

import type { LessonBlock } from "@/types/lesson-content";
import { extractYouTubeVideoId } from "./youtube";

const HTML_TAG_REGEX = /<\s*(script|iframe|embed|object|applet|form|input|button)[\s>]/i;

export const ALLOWED_HEADING_LEVELS = new Set([2, 3, 4]);

export const ALLOWED_CALLOUT_VARIANTS = new Set(["info", "tip", "warning", "important"]);

export const ALLOWED_CODE_LANGUAGES = new Set([
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
]);

export function containsUnsafeHtml(text: string): boolean {
  return HTML_TAG_REGEX.test(text);
}

export function isValidHttpUrl(urlStr: string): boolean {
  const clean = (urlStr || "").trim();
  if (!clean) return false;
  try {
    const parsed = new URL(clean);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>; // blockId -> list of error messages
}

export function validateSingleBlock(block: LessonBlock): string[] {
  const errors: string[] = [];

  switch (block.type) {
    case "heading": {
      const { level, text } = block.content;
      if (!ALLOWED_HEADING_LEVELS.has(level)) {
        errors.push("Heading level must be H2, H3, or H4. H1 is not permitted.");
      }
      const trimmed = (text || "").trim();
      if (!trimmed) {
        errors.push("Heading text is required.");
      } else if (trimmed.length > 500) {
        errors.push("Heading text must be 500 characters or fewer.");
      }
      if (containsUnsafeHtml(text || "")) {
        errors.push("Heading text cannot contain unsafe HTML tags.");
      }
      break;
    }

    case "paragraph": {
      const { text } = block.content;
      const trimmed = (text || "").trim();
      if (!trimmed) {
        errors.push("Paragraph text cannot be empty.");
      } else if (trimmed.length > 20000) {
        errors.push("Paragraph text must be 20,000 characters or fewer.");
      }
      if (containsUnsafeHtml(text || "")) {
        errors.push("Paragraph text cannot contain unsafe HTML tags.");
      }
      break;
    }

    case "image": {
      const { url, alt, caption } = block.content;
      if (!isValidHttpUrl(url || "")) {
        errors.push("Image URL must be a valid HTTP or HTTPS web address.");
      }
      const trimmedAlt = (alt || "").trim();
      if (!trimmedAlt) {
        errors.push("Image accessibility alt text is required.");
      } else if (trimmedAlt.length > 500) {
        errors.push("Alt text must be 500 characters or fewer.");
      }
      if (containsUnsafeHtml(alt || "")) {
        errors.push("Alt text cannot contain unsafe HTML tags.");
      }
      if (caption && caption.length > 500) {
        errors.push("Image caption must be 500 characters or fewer.");
      }
      if (caption && containsUnsafeHtml(caption)) {
        errors.push("Image caption cannot contain unsafe HTML tags.");
      }
      break;
    }

    case "code": {
      const { language, code } = block.content;
      const langLower = (language || "").trim().toLowerCase();
      if (!ALLOWED_CODE_LANGUAGES.has(langLower)) {
        errors.push(`Language '${language}' is not supported. Please select from the supported languages list.`);
      }
      const trimmedCode = (code || "").trim();
      if (!trimmedCode) {
        errors.push("Code content cannot be empty.");
      } else if (code.length > 100000) {
        errors.push("Code snippet must be 100,000 characters or fewer.");
      }
      break;
    }

    case "output": {
      const { text } = block.content;
      const trimmed = (text || "").trim();
      if (!trimmed) {
        errors.push("Execution output text cannot be empty.");
      } else if (text.length > 50000) {
        errors.push("Output text must be 50,000 characters or fewer.");
      }
      break;
    }

    case "list": {
      const { items } = block.content;
      if (!Array.isArray(items) || items.length === 0) {
        errors.push("List must contain at least one item.");
      } else {
        if (items.length > 100) {
          errors.push("List cannot exceed 100 items.");
        }
        items.forEach((item, idx) => {
          const itemTrimmed = (item || "").trim();
          if (!itemTrimmed) {
            errors.push(`List item #${idx + 1} cannot be empty.`);
          }
          if (containsUnsafeHtml(item || "")) {
            errors.push(`List item #${idx + 1} cannot contain unsafe HTML tags.`);
          }
        });
      }
      break;
    }

    case "table": {
      const { headers, rows } = block.content;
      if (!Array.isArray(headers) || headers.length === 0) {
        errors.push("Table must have at least one column header.");
      } else {
        if (headers.length > 20) {
          errors.push("Table cannot exceed 20 columns.");
        }
        headers.forEach((h, idx) => {
          if (!(h || "").trim()) {
            errors.push(`Table column header #${idx + 1} cannot be empty.`);
          }
          if (containsUnsafeHtml(h || "")) {
            errors.push(`Table column header #${idx + 1} cannot contain unsafe HTML tags.`);
          }
        });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        errors.push("Table must have at least one data row.");
      } else {
        if (rows.length > 200) {
          errors.push("Table cannot exceed 200 rows.");
        }
        const colCount = headers?.length || 0;
        rows.forEach((row, rIdx) => {
          if (!Array.isArray(row) || row.length !== colCount) {
            errors.push(
              `Table row #${rIdx + 1} has ${row?.length || 0} cells, but table has ${colCount} headers.`
            );
          } else {
            row.forEach((cell, cIdx) => {
              if (containsUnsafeHtml(cell || "")) {
                errors.push(`Table cell at row ${rIdx + 1}, column ${cIdx + 1} cannot contain unsafe HTML tags.`);
              }
            });
          }
        });
      }
      break;
    }

    case "callout": {
      const { variant, title, text } = block.content;
      if (!ALLOWED_CALLOUT_VARIANTS.has(variant)) {
        errors.push("Callout variant must be 'info', 'tip', 'warning', or 'important'.");
      }
      const trimmedText = (text || "").trim();
      if (!trimmedText) {
        errors.push("Callout text is required.");
      } else if (trimmedText.length > 10000) {
        errors.push("Callout text must be 10,000 characters or fewer.");
      }
      if (containsUnsafeHtml(text || "")) {
        errors.push("Callout text cannot contain unsafe HTML tags.");
      }
      if (title && title.length > 200) {
        errors.push("Callout title must be 200 characters or fewer.");
      }
      if (title && containsUnsafeHtml(title)) {
        errors.push("Callout title cannot contain unsafe HTML tags.");
      }
      break;
    }

    case "quote": {
      const { text, author } = block.content;
      const trimmedText = (text || "").trim();
      if (!trimmedText) {
        errors.push("Quote text cannot be empty.");
      } else if (trimmedText.length > 5000) {
        errors.push("Quote text must be 5,000 characters or fewer.");
      }
      if (containsUnsafeHtml(text || "")) {
        errors.push("Quote text cannot contain unsafe HTML tags.");
      }
      if (author && author.length > 200) {
        errors.push("Quote author must be 200 characters or fewer.");
      }
      if (author && containsUnsafeHtml(author)) {
        errors.push("Quote author cannot contain unsafe HTML tags.");
      }
      break;
    }

    case "youtube": {
      const { url, video_id, title } = block.content;
      const parsedId = extractYouTubeVideoId(video_id || url || "");
      if (!parsedId) {
        errors.push("Please provide a valid YouTube watch URL, share URL (youtu.be), shorts URL, or 11-character video ID.");
      }
      if (title && title.length > 300) {
        errors.push("YouTube title must be 300 characters or fewer.");
      }
      break;
    }

    case "link": {
      const { text, url } = block.content;
      const trimmedText = (text || "").trim();
      if (!trimmedText) {
        errors.push("Link display text is required.");
      } else if (trimmedText.length > 300) {
        errors.push("Link text must be 300 characters or fewer.");
      }
      if (containsUnsafeHtml(text || "")) {
        errors.push("Link text cannot contain unsafe HTML tags.");
      }
      if (!isValidHttpUrl(url || "")) {
        errors.push("Link URL must be a valid HTTP or HTTPS address.");
      }
      break;
    }

    case "key_takeaways": {
      const { items } = block.content;
      if (!Array.isArray(items) || items.length === 0) {
        errors.push("Key takeaways must have at least one item.");
      } else {
        if (items.length > 30) {
          errors.push("Key takeaways cannot exceed 30 items.");
        }
        items.forEach((item, idx) => {
          const itemTrimmed = (item || "").trim();
          if (!itemTrimmed) {
            errors.push(`Takeaway item #${idx + 1} cannot be empty.`);
          }
          if (containsUnsafeHtml(item || "")) {
            errors.push(`Takeaway item #${idx + 1} cannot contain unsafe HTML tags.`);
          }
        });
      }
      break;
    }

    default:
      errors.push(`Unrecognized block type: ${(block as { type?: string }).type || "unknown"}`);
  }

  return errors;
}

export function validateAllBlocks(blocks: LessonBlock[]): ValidationResult {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  const seenIds = new Set<string>();

  blocks.forEach((block, idx) => {
    const blockErrors = validateSingleBlock(block);

    if (!block.id || !block.id.trim()) {
      blockErrors.push("Block must have a valid non-empty identifier.");
    } else if (seenIds.has(block.id)) {
      blockErrors.push(`Duplicate block identifier '${block.id}' detected at block index ${idx}.`);
    } else {
      seenIds.add(block.id);
    }

    if (blockErrors.length > 0) {
      errors[block.id] = blockErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}
