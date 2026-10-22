import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 2C: Personalized AI Mentor Frontend Contracts', () => {
  it('verifies TypeScript types file exists and exports required types', () => {
    const typesPath = path.join(process.cwd(), 'types/ai-mentor-personalization.ts');
    assert.ok(fs.existsSync(typesPath), 'types/ai-mentor-personalization.ts must exist');

    const content = fs.readFileSync(typesPath, 'utf8');
    assert.ok(content.includes('export interface StudentLearningProfile'));
    assert.ok(content.includes('export interface UpdateLearningProfileRequest'));
    assert.ok(content.includes('export interface StudentLearningRoadmap'));
    assert.ok(content.includes('export interface SkillGapAnalysisResult'));
    assert.ok(content.includes('export interface WeeklyProgressReviewResult'));
    assert.ok(content.includes('export type ExperienceLevel'));
    assert.ok(content.includes('export type SkillStatus'));
  });

  it('verifies API client layer exists and exports required functions', () => {
    const apiPath = path.join(process.cwd(), 'lib/api/ai-mentor-personalization.ts');
    assert.ok(fs.existsSync(apiPath), 'lib/api/ai-mentor-personalization.ts must exist');

    const content = fs.readFileSync(apiPath, 'utf8');
    assert.ok(content.includes('export async function getStudentLearningProfile'));
    assert.ok(content.includes('export async function updateStudentLearningProfile'));
    assert.ok(content.includes('export async function resetStudentLearningProfile'));
    assert.ok(content.includes('export async function listStudentRoadmaps'));
    assert.ok(content.includes('export async function generateStudentRoadmap'));
    assert.ok(content.includes('export async function convertRoadmapMilestonesToTasks'));
    assert.ok(content.includes('export async function getSkillGapAnalysis'));
    assert.ok(content.includes('export async function getWeeklyProgressReview'));
  });

  it('verifies PersonalizationDrawer component exists with zero emojis', () => {
    const drawerPath = path.join(process.cwd(), 'components/ai-mentor/PersonalizationDrawer.tsx');
    assert.ok(fs.existsSync(drawerPath), 'components/ai-mentor/PersonalizationDrawer.tsx must exist');

    const content = fs.readFileSync(drawerPath, 'utf8');
    assert.ok(content.includes('export function PersonalizationDrawer'));
    assert.ok(content.includes('Personalization Studio'));

    // Check strict zero emoji rule
    const emojiRegex =
      /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
    const match = content.match(emojiRegex);
    assert.strictEqual(match, null, `Forbidden emoji detected in PersonalizationDrawer: ${JSON.stringify(match)}`);
  });

  it('verifies AI Mentor page integrates PersonalizationStudio with zero emojis', () => {
    const pagePath = path.join(process.cwd(), 'app/ai-mentor/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'app/ai-mentor/page.tsx must exist');

    const content = fs.readFileSync(pagePath, 'utf8');
    assert.ok(content.includes('PersonalizationDrawer'));
    assert.ok(content.includes('Personalization Studio'));
    assert.ok(content.includes('Generate Learning Roadmap'));

    // Check strict zero emoji rule
    const emojiRegex =
      /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
    const match = content.match(emojiRegex);
    assert.strictEqual(match, null, `Forbidden emoji detected in app/ai-mentor/page.tsx: ${JSON.stringify(match)}`);
  });
});
