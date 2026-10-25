/**
 * frontend/tests/sys16-accessibility.test.ts
 *
 * Automated regression test suite for SYS-16: Accessibility Labels and Keyboard Navigation.
 * Verifies:
 *  1. Accessible names and ARIA dialog semantics across modals and widgets.
 *  2. Form label-to-input association (htmlFor <-> id) across settings and modal forms.
 *  3. Interactive keyboard navigation patterns (role="button", tabIndex=0, Enter/Space activation).
 *  4. Icon-only controls have explicit, descriptive accessible names.
 *  5. Radio groups and selection widgets expose valid ARIA states (role="radiogroup", role="radio", aria-checked).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_ROOT = path.resolve(__dirname, '..');

function readSource(relPath: string): string {
  const fullPath = path.join(FRONTEND_ROOT, relPath);
  return fs.readFileSync(fullPath, 'utf-8');
}

describe('SYS-16 — Accessibility Labels & Keyboard Navigation Verification', () => {

  // =========================================================================
  // 1. FORM LABEL-TO-INPUT ASSOCIATIONS (htmlFor <-> id)
  // =========================================================================
  describe('1. Form Label-to-Input Association in Settings & Edit Profile', () => {
    const editPageSource = readSource('app/settings/edit/page.tsx');

    it('associates all personal profile fields with unique id and htmlFor pairings', () => {
      const expectedFieldIds = [
        'personal-full-name',
        'personal-college',
        'personal-headline',
        'personal-country',
        'personal-state',
        'personal-city',
        'personal-phone',
        'personal-gender',
        'personal-about',
      ];

      for (const fieldId of expectedFieldIds) {
        assert.ok(
          editPageSource.includes(`htmlFor="${fieldId}"`),
          `Expected label with htmlFor="${fieldId}" in app/settings/edit/page.tsx`
        );
        assert.ok(
          editPageSource.includes(`id="${fieldId}"`),
          `Expected control with id="${fieldId}" in app/settings/edit/page.tsx`
        );
      }
    });

    it('associates experience modal fields with unique id and htmlFor pairings', () => {
      const expectedExpIds = [
        'exp-role',
        'exp-company',
        'exp-location',
        'exp-work-type',
        'exp-arrangement',
        'exp-start-date',
        'exp-end-date',
        'exp-currently-working',
        'exp-desc',
      ];

      for (const fieldId of expectedExpIds) {
        assert.ok(
          editPageSource.includes(`htmlFor="${fieldId}"`),
          `Expected label with htmlFor="${fieldId}" in experience modal`
        );
        assert.ok(
          editPageSource.includes(`id="${fieldId}"`),
          `Expected input with id="${fieldId}" in experience modal`
        );
      }
    });

    it('associates project modal fields with unique id and htmlFor pairings', () => {
      const expectedProjIds = [
        'proj-name',
        'proj-desc',
        'proj-tech',
        'proj-start-date',
        'proj-end-date',
        'proj-currently-working',
        'proj-github',
        'proj-demo',
      ];

      for (const fieldId of expectedProjIds) {
        assert.ok(
          editPageSource.includes(`htmlFor="${fieldId}"`),
          `Expected label with htmlFor="${fieldId}" in project modal`
        );
        assert.ok(
          editPageSource.includes(`id="${fieldId}"`),
          `Expected input with id="${fieldId}" in project modal`
        );
      }
    });

    it('associates education modal fields with unique id and htmlFor pairings', () => {
      const expectedEduIds = [
        'edu-college',
        'edu-degree',
        'edu-field',
        'edu-start-date',
        'edu-end-date',
        'edu-gpa',
        'edu-currently-studying',
      ];

      for (const fieldId of expectedEduIds) {
        assert.ok(
          editPageSource.includes(`htmlFor="${fieldId}"`),
          `Expected label with htmlFor="${fieldId}" in education modal`
        );
        assert.ok(
          editPageSource.includes(`id="${fieldId}"`),
          `Expected input with id="${fieldId}" in education modal`
        );
      }
    });
  });

  // =========================================================================
  // 2. MODAL & DIALOG ARIA SEMANTICS
  // =========================================================================
  describe('2. Modal Dialog Semantics & Accessible Names', () => {
    it('ResumeReviewModal exposes dialog semantics, aria-modal, and labelledby', () => {
      const src = readSource('components/career/ResumeReviewModal.tsx');
      assert.ok(src.includes('role="dialog"'), 'ResumeReviewModal must declare role="dialog"');
      assert.ok(src.includes('aria-modal="true"'), 'ResumeReviewModal must declare aria-modal="true"');
      assert.ok(
        src.includes('aria-labelledby="resume-review-modal-title"'),
        'ResumeReviewModal must link title via aria-labelledby'
      );
      assert.ok(
        src.includes('id="resume-review-modal-title"'),
        'ResumeReviewModal header must have id="resume-review-modal-title"'
      );
    });

    it('TemplateSelectModal exposes dialog semantics, aria-modal, and close label', () => {
      const src = readSource('components/career/TemplateSelectModal.tsx');
      assert.ok(src.includes('role="dialog"'), 'TemplateSelectModal must declare role="dialog"');
      assert.ok(src.includes('aria-modal="true"'), 'TemplateSelectModal must declare aria-modal="true"');
      assert.ok(
        src.includes('aria-labelledby="template-select-modal-title"'),
        'TemplateSelectModal must link title via aria-labelledby'
      );
      assert.ok(
        src.includes('aria-label="Close template selection"'),
        'TemplateSelectModal close button must have aria-label'
      );
    });

    it('PlacementPrepModal exposes dialog semantics, aria-modal, and accessible name', () => {
      const src = readSource('components/PlacementPrepModal.tsx');
      assert.ok(src.includes('role="dialog"'), 'PlacementPrepModal must declare role="dialog"');
      assert.ok(src.includes('aria-modal="true"'), 'PlacementPrepModal must declare aria-modal="true"');
      assert.ok(
        src.includes('aria-label={selectedTopic ? `${selectedTopic} Practice Quiz` : "Placement Prep Quiz Catalog"}'),
        'PlacementPrepModal must set aria-label'
      );
    });

    it('Profile edit modals expose dialog semantics and close button label', () => {
      const src = readSource('app/profile/page.tsx');
      assert.ok(src.includes('role="dialog"'), 'Profile edit modal must declare role="dialog"');
      assert.ok(src.includes('aria-modal="true"'), 'Profile edit modal must declare aria-modal="true"');
      assert.ok(src.includes('aria-label="Close dialog"'), 'Profile modal close button must have aria-label');
    });

    it('Sidebar Quick Search modal exposes dialog semantics and search accessible name', () => {
      const src = readSource('components/Sidebar.tsx');
      assert.ok(src.includes('role="dialog"'), 'Quick Search modal must declare role="dialog"');
      assert.ok(src.includes('aria-modal="true"'), 'Quick Search modal must declare aria-modal="true"');
      assert.ok(src.includes('aria-label="Quick Search"'), 'Quick Search modal must declare aria-label');
      assert.ok(
        src.includes('id="sidebar-quick-search-input"'),
        'Quick Search input must have id'
      );
      assert.ok(
        src.includes('aria-label="Search SkillsCatalyst roadmaps, practice, resume builder"'),
        'Quick Search input must have descriptive aria-label'
      );
      assert.ok(
        src.includes('aria-label="Close search"'),
        'Quick Search close button must have aria-label'
      );
    });
  });

  // =========================================================================
  // 3. KEYBOARD INTERACTION & CUSTOM WIDGETS
  // =========================================================================
  describe('3. Keyboard Interaction for Custom Interactive Widgets', () => {
    it('ResumeReviewModal dropzone supports keyboard focus and activation', () => {
      const src = readSource('components/career/ResumeReviewModal.tsx');
      assert.ok(src.includes('role="button"'), 'Dropzone must declare role="button"');
      assert.ok(src.includes('tabIndex={0}'), 'Dropzone must declare tabIndex={0}');
      assert.ok(
        src.includes('aria-label="Upload resume file (Supports PDF, DOCX, TXT, MD up to 10 MB)"'),
        'Dropzone must have descriptive aria-label'
      );
      assert.ok(
        src.includes('e.key === "Enter" || e.key === " "'),
        'Dropzone must handle Enter and Space key activation'
      );
      assert.ok(
        src.includes('e.preventDefault()'),
        'Dropzone must prevent default scroll on Space activation'
      );
    });

    it('ResumeReviewModal company rubric cards use native button and radiogroup semantics', () => {
      const src = readSource('components/career/ResumeReviewModal.tsx');
      assert.ok(
        src.includes('role="radiogroup"'),
        'Company types container must declare role="radiogroup"'
      );
      assert.ok(
        src.includes('aria-label="Target Company Type"'),
        'Radiogroup must have aria-label="Target Company Type"'
      );
      assert.ok(
        src.includes('role="radio"'),
        'Rubric card buttons must declare role="radio"'
      );
      assert.ok(
        src.includes('aria-checked={isSelected}'),
        'Rubric cards must bind aria-checked to selected state'
      );
    });

    it('Career resume-review page saved resumes list items support keyboard focus and activation', () => {
      const src = readSource('app/career/resume-review/page.tsx');
      assert.ok(
        src.includes('role="button"'),
        'Saved resume item must declare role="button"'
      );
      assert.ok(
        src.includes('tabIndex={0}'),
        'Saved resume item must declare tabIndex={0}'
      );
      assert.ok(
        src.includes('e.key === "Enter" || e.key === " "'),
        'Saved resume item must handle Enter and Space activation'
      );
      assert.ok(
        src.includes('aria-label={resume.starred ? "Unstar resume" : "Star resume"}'),
        'Star button must have dynamic aria-label'
      );
      assert.ok(
        src.includes('aria-label="Delete resume"'),
        'Delete button must have aria-label'
      );
    });

    it('Profile page resume card, avatar, and update action are keyboard accessible', () => {
      const src = readSource('app/profile/page.tsx');
      assert.ok(
        src.includes('aria-label="Resume card. Click or press Enter to preview or upload resume."') || src.includes('aria-label="Resume"'),
        'Resume bento card must have accessible name'
      );
      assert.ok(
        src.includes('aria-label="Upload replacement resume"') || src.includes('title="Resume (Preview / Upload)"'),
        'Resume update button must have accessible name'
      );
      assert.ok(
        src.includes('aria-label="Change photo or avatar"'),
        'Avatar monogram button must have accessible name'
      );
    });

    it('TemplateSelectModal template cards support keyboard navigation and selection', () => {
      const src = readSource('components/career/TemplateSelectModal.tsx');
      assert.ok(
        src.includes('role="button"'),
        'Template card must declare role="button"'
      );
      assert.ok(
        src.includes('tabIndex={0}'),
        'Template card must declare tabIndex={0}'
      );
      assert.ok(
        src.includes('e.key === "Enter" || e.key === " "'),
        'Template card must handle Enter and Space activation'
      );
      assert.ok(
        src.includes('aria-label={`Select ${tmpl.name} template`}'),
        'Template card must have descriptive accessible name'
      );
      assert.ok(
        src.includes('aria-label={isSelected ? `${tmpl.name} template selected` : `Use ${tmpl.name} template`}'),
        'Template card select button must have descriptive accessible name'
      );
    });

    it('Sterling kinetic navigation toggle label supports keyboard navigation', () => {
      const src = readSource('components/ui/sterling-gate-kinetic-navigation.tsx');
      assert.ok(
        src.includes('role="button"'),
        'Nav toggle label must declare role="button"'
      );
      assert.ok(
        src.includes('tabIndex={0}'),
        'Nav toggle label must declare tabIndex={0}'
      );
      assert.ok(
        src.includes('aria-label="Explore Menu"'),
        'Nav toggle label must declare aria-label'
      );
      assert.ok(
        src.includes('aria-expanded={isMenuOpen}'),
        'Nav toggle label must expose aria-expanded state'
      );
      assert.ok(
        src.includes('e.key === "Enter" || e.key === " "'),
        'Nav toggle label must handle Enter and Space activation'
      );
    });
  });

  // =========================================================================
  // 4. ACCESSIBLE NAMES FOR ICON-ONLY CONTROLS & SEARCH INPUTS
  // =========================================================================
  describe('4. Accessible Names for Controls and Search Fields', () => {
    it('ScholarshipsWidget search input has id and descriptive aria-label', () => {
      const src = readSource('components/explore/ScholarshipsWidget.tsx');
      assert.ok(
        src.includes('id="scholarships-search-input"'),
        'ScholarshipsWidget search input must have id'
      );
      assert.ok(
        src.includes('aria-label="Search scholarships by name, provider, or qualification"'),
        'ScholarshipsWidget search input must have descriptive aria-label'
      );
    });

    it('AdminScholarshipsCMS search input has id and descriptive aria-label', () => {
      const src = readSource('components/admin/AdminScholarshipsCMS.tsx');
      assert.ok(
        src.includes('id="admin-scholarships-search-input"'),
        'AdminScholarshipsCMS search input must have id'
      );
      assert.ok(
        src.includes('aria-label="Search scholarships by name or provider"'),
        'AdminScholarshipsCMS search input must have descriptive aria-label'
      );
    });

    it('AdminSkillBitsCMS controls and buttons have accessible names', () => {
      const src = readSource('components/admin/AdminSkillBitsCMS.tsx');
      assert.ok(src.includes('aria-label="Search SkillBits"'), 'Search input must have aria-label');
      assert.ok(src.includes('aria-label="Filter by topic"'), 'Topic input must have aria-label');
      assert.ok(src.includes('aria-label="Filter by difficulty"'), 'Difficulty select must have aria-label');
      assert.ok(src.includes('aria-label="Filter by status"'), 'Status select must have aria-label');
      assert.ok(src.includes('aria-label="Sort skill bits"'), 'Sort select must have aria-label');
      assert.ok(src.includes('aria-label="Refresh list"'), 'Refresh button must have aria-label');
    });

    it('TopNavbar icon-only controls have aria-labels and expanded state', () => {
      const src = readSource('components/TopNavbar.tsx');
      assert.ok(
        src.includes('aria-label="Search platform (⌘K)"'),
        'Search button must have aria-label'
      );
      assert.ok(
        src.includes('aria-label="Open notifications"'),
        'Notification button must have aria-label'
      );
      assert.ok(
        src.includes('aria-expanded={isNotificationOpen}'),
        'Notification button must expose aria-expanded'
      );
      assert.ok(
        src.includes('aria-label={`Account (${userDisplayName})`}'),
        'User initials button must have dynamic aria-label'
      );
      assert.ok(
        src.includes('aria-expanded={isUserMenuOpen}'),
        'User initials button must expose aria-expanded'
      );
    });

    it('ThemeSwitch checkbox input has explicit aria-label for assistive tech', () => {
      const src = readSource('components/ThemeSwitch.tsx');
      assert.ok(
        src.includes('aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}'),
        'ThemeSwitch checkbox must have dynamic aria-label'
      );
    });

    it('Tech news refresh controls have accessible names', () => {
      const widgetSrc = readSource('components/explore/TechNewsWidget.tsx');
      assert.ok(
        widgetSrc.includes('aria-label="Refresh stories feed"'),
        'TechNewsWidget refresh button must have aria-label'
      );

      const emptySrc = readSource('components/tech-news/TechNewsEmptyState.tsx');
      assert.ok(
        emptySrc.includes('aria-label="Refresh feed"'),
        'TechNewsEmptyState refresh button must have aria-label'
      );
    });

    it('Admin page telemetry and logout buttons have accessible names', () => {
      const src = readSource('app/admin/page.tsx');
      assert.ok(src.includes('aria-label="Refresh Telemetry"'), 'Telemetry button must have aria-label');
      assert.ok(src.includes('aria-label="Log out"'), 'Logout button must have aria-label');
    });

    it('PlacementPrepModal bookmark button has dynamic accessible name', () => {
      const src = readSource('components/PlacementPrepModal.tsx');
      assert.ok(
        src.includes('aria-label={item.isBookmarked ? `Remove ${item.name} from bookmarks` : `Bookmark ${item.name}`}'),
        'Bookmark button must have dynamic aria-label'
      );
    });
  });

  // =========================================================================
  // 5. REGRESSION & INTEGRITY VERIFICATION
  // =========================================================================
  describe('5. Preservation of Core Contracts & Constraints', () => {
    it('maintains certification intentionally disabled (SYS-02 invariant)', () => {
      const certPage = readSource('app/certificates/page.tsx');
      assert.ok(
        certPage.includes('Verified certifications are issued upon completing certified curricula.'),
        'Certificates page preserves empty / unearned state'
      );
    });

    it('does not contain any positive tabIndex values across modified components', () => {
      const checkedFiles = [
        'components/career/ResumeReviewModal.tsx',
        'components/career/TemplateSelectModal.tsx',
        'components/PlacementPrepModal.tsx',
        'components/Sidebar.tsx',
        'components/TopNavbar.tsx',
        'components/explore/ScholarshipsWidget.tsx',
        'components/admin/AdminScholarshipsCMS.tsx',
        'components/admin/AdminSkillBitsCMS.tsx',
        'app/settings/edit/page.tsx',
        'app/profile/page.tsx',
        'app/career/resume-review/page.tsx',
        'app/admin/page.tsx',
      ];

      const positiveTabIndexRegex = /tabIndex\s*=\s*[{'"]([1-9]\d*)[}'"]/;
      for (const relPath of checkedFiles) {
        const src = readSource(relPath);
        const match = positiveTabIndexRegex.exec(src);
        assert.strictEqual(
          match,
          null,
          `Found anti-pattern positive tabIndex=${match?.[1]} in ${relPath}`
        );
      }
    });
  });
});
