import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getFileExt,
  formatBytes,
  validateFile,
  computeStageNum,
} from '@/lib/career/helpers';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_MB,
  COMMON_ROLES,
  COMPANY_TYPES,
  EXP_LEVELS,
  FILE_TYPE_COLORS,
} from '@/data/career/constants';
import { UploadStage } from '@/types/career';

describe('Career Module Characterization Suite', () => {
  describe('File Extension Extraction (getFileExt)', () => {
    it('extracts lowercased extension from standard filename', () => {
      assert.strictEqual(getFileExt('resume.pdf'), 'pdf');
      assert.strictEqual(getFileExt('CV_2026.DOCX'), 'docx');
      assert.strictEqual(getFileExt('portfolio.txt'), 'txt');
      assert.strictEqual(getFileExt('readme.MD'), 'md');
    });

    it('extracts final extension from multi-dot filenames', () => {
      assert.strictEqual(getFileExt('john.doe.v2.final.pdf'), 'pdf');
      assert.strictEqual(getFileExt('archive.tar.gz'), 'gz');
    });

    it('handles files without extension or empty names', () => {
      assert.strictEqual(getFileExt('README'), 'readme');
      assert.strictEqual(getFileExt(''), '');
    });
  });

  describe('Byte Formatting (formatBytes)', () => {
    it('formats values under 1 KB as bytes', () => {
      assert.strictEqual(formatBytes(0), '0 B');
      assert.strictEqual(formatBytes(512), '512 B');
      assert.strictEqual(formatBytes(1023), '1023 B');
    });

    it('formats values between 1 KB and 1 MB with 1 decimal precision', () => {
      assert.strictEqual(formatBytes(1024), '1.0 KB');
      assert.strictEqual(formatBytes(1536), '1.5 KB');
      assert.strictEqual(formatBytes(1024 * 500), '500.0 KB');
    });

    it('formats values of 1 MB and above with 1 decimal precision', () => {
      assert.strictEqual(formatBytes(1024 * 1024), '1.0 MB');
      assert.strictEqual(formatBytes(1024 * 1024 * 4.5), '4.5 MB');
      assert.strictEqual(formatBytes(1024 * 1024 * 10), '10.0 MB');
    });
  });

  describe('File Validation (validateFile)', () => {
    it('rejects unsupported extensions', () => {
      const err = validateFile({ name: 'malicious.exe', size: 1024 });
      assert.strictEqual(
        err,
        'Unsupported file type ".exe". Please upload a PDF, DOCX, TXT, or MD file.'
      );
    });

    it('rejects unsupported legacy .doc files per existing ALLOWED_EXTENSIONS', () => {
      const err = validateFile({ name: 'resume.doc', size: 2048 });
      assert.strictEqual(
        err,
        'Unsupported file type ".doc". Please upload a PDF, DOCX, TXT, or MD file.'
      );
    });

    it('rejects empty files (0 bytes)', () => {
      const err = validateFile({ name: 'empty_resume.pdf', size: 0 });
      assert.strictEqual(err, 'The selected file is empty (0 bytes).');
    });

    it('rejects files larger than MAX_FILE_MB (10 MB)', () => {
      const size11MB = 11 * 1024 * 1024;
      const err = validateFile({ name: 'huge_resume.pdf', size: size11MB });
      assert.strictEqual(
        err,
        'File is too large (11.0 MB). Maximum allowed size is 10 MB.'
      );
    });

    it('accepts valid PDF, DOCX, TXT, and MD files under 10 MB', () => {
      assert.strictEqual(validateFile({ name: 'resume.pdf', size: 1024 * 100 }), null);
      assert.strictEqual(validateFile({ name: 'resume.docx', size: 1024 * 500 }), null);
      assert.strictEqual(validateFile({ name: 'resume.txt', size: 2048 }), null);
      assert.strictEqual(validateFile({ name: 'resume.md', size: 4096 }), null);
    });
  });

  describe('Upload Stage Calculation (computeStageNum)', () => {
    it('returns stage 2 for idle and upload_error states', () => {
      assert.strictEqual(computeStageNum('idle'), 2);
      assert.strictEqual(computeStageNum('upload_error'), 2);
    });

    it('returns stage 3 for uploading, extracting, and extracted states', () => {
      assert.strictEqual(computeStageNum('uploading'), 3);
      assert.strictEqual(computeStageNum('extracting'), 3);
      assert.strictEqual(computeStageNum('extracted'), 3);
    });

    it('returns stage 4 for reviewing, done, and review_error states', () => {
      assert.strictEqual(computeStageNum('reviewing'), 4);
      assert.strictEqual(computeStageNum('done'), 4);
      assert.strictEqual(computeStageNum('review_error'), 4);
    });

    it('returns fallback stage 1 for unrecognized stage', () => {
      assert.strictEqual(computeStageNum('unknown' as UploadStage), 1);
    });
  });

  describe('Static Career Constants Integrity', () => {
    it('verifies ALLOWED_EXTENSIONS contains the 4 supported document formats', () => {
      assert.deepStrictEqual(ALLOWED_EXTENSIONS, ['.pdf', '.docx', '.txt', '.md']);
    });

    it('verifies MAX_FILE_MB is set to 10', () => {
      assert.strictEqual(MAX_FILE_MB, 10);
    });

    it('verifies COMMON_ROLES contains the 6 default career paths', () => {
      assert.strictEqual(COMMON_ROLES.length, 6);
      assert.ok(COMMON_ROLES.includes('Fullstack Software Engineer'));
      assert.ok(COMMON_ROLES.includes('Backend Engineer'));
      assert.ok(COMMON_ROLES.includes('Frontend Engineer'));
      assert.ok(COMMON_ROLES.includes('Data Engineer / AI'));
      assert.ok(COMMON_ROLES.includes('DevOps / Cloud Engineer'));
      assert.ok(COMMON_ROLES.includes('Mobile Developer'));
    });

    it('verifies COMPANY_TYPES contains all 4 company categories with titles and badges', () => {
      assert.strictEqual(COMPANY_TYPES.length, 4);
      const ids = COMPANY_TYPES.map((c) => c.id);
      assert.deepStrictEqual(ids, [
        'Product-Based',
        'Service-Based',
        'Startup',
        'FAANG / Tier-1',
      ]);
      for (const ct of COMPANY_TYPES) {
        assert.ok(ct.title.length > 0);
        assert.ok(ct.badge.length > 0);
        assert.ok(ct.desc.length > 0);
      }
    });

    it('verifies EXP_LEVELS contains 4 experience brackets', () => {
      assert.strictEqual(EXP_LEVELS.length, 4);
      const ids = EXP_LEVELS.map((e) => e.id);
      assert.deepStrictEqual(ids, [
        '0-2 years',
        '3-5 years',
        '5-8 years',
        '8+ years',
      ]);
    });

    it('verifies FILE_TYPE_COLORS covers all recognized file extensions', () => {
      assert.ok(FILE_TYPE_COLORS.pdf);
      assert.ok(FILE_TYPE_COLORS.docx);
      assert.ok(FILE_TYPE_COLORS.doc);
      assert.ok(FILE_TYPE_COLORS.txt);
      assert.ok(FILE_TYPE_COLORS.md);
    });
  });
});
