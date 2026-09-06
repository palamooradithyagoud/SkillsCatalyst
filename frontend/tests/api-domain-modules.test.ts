import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as ClientAPI from "@/lib/api/client";
import * as LearningAPI from "@/lib/api/learning";
import * as PlaylistsAPI from "@/lib/api/playlists";
import * as ProgressAPI from "@/lib/api/progress";
import * as RoadmapsAPI from "@/lib/api/roadmaps";
import * as DashboardAPI from "@/lib/api/dashboard";
import * as PracticeAPI from "@/lib/api/practice";
import * as CareerAPI from "@/lib/api/career";
import * as ProfileAPI from "@/lib/api/profile";

describe("API Domain Modules & Facade Verification", () => {
  it("preserves identical export references between facade and domain modules", () => {
    // Client
    assert.strictEqual(FacadeAPI.getApiBaseUrl, ClientAPI.getApiBaseUrl);
    assert.strictEqual(FacadeAPI.API_BASE, ClientAPI.API_BASE);
    assert.strictEqual(FacadeAPI.getGuestSessionId, ClientAPI.getGuestSessionId);
    assert.strictEqual(FacadeAPI.getRawGuestSessionId, ClientAPI.getRawGuestSessionId);
    assert.strictEqual(FacadeAPI.storeGuestSessionToken, ClientAPI.storeGuestSessionToken);
    assert.strictEqual(FacadeAPI.handleGuestTokenFromResponse, ClientAPI.handleGuestTokenFromResponse);
    assert.strictEqual(FacadeAPI.apiFetch, ClientAPI.apiFetch);
    assert.strictEqual(FacadeAPI.getAuthHeaders, ClientAPI.getAuthHeaders);

    // Learning
    assert.strictEqual(FacadeAPI.searchSkill, LearningAPI.searchSkill);
    assert.strictEqual(FacadeAPI.cleanPlaylistId, LearningAPI.cleanPlaylistId);

    // Playlists
    assert.strictEqual(FacadeAPI.savePlaylist, PlaylistsAPI.savePlaylist);
    assert.strictEqual(FacadeAPI.syncSavedPlaylists, PlaylistsAPI.syncSavedPlaylists);
    assert.strictEqual(FacadeAPI.unsavePlaylist, PlaylistsAPI.unsavePlaylist);
    assert.strictEqual(FacadeAPI.fetchSavedPlaylists, PlaylistsAPI.fetchSavedPlaylists);
    assert.strictEqual(FacadeAPI.fetchPlaylistVideos, PlaylistsAPI.fetchPlaylistVideos);

    // Progress
    assert.strictEqual(FacadeAPI.markVideoWatched, ProgressAPI.markVideoWatched);
    assert.strictEqual(FacadeAPI.saveVideoProgress, ProgressAPI.saveVideoProgress);
    assert.strictEqual(FacadeAPI.completeVideo, ProgressAPI.completeVideo);
    assert.strictEqual(FacadeAPI.markAllVideosWatched, ProgressAPI.markAllVideosWatched);

    // Roadmaps
    assert.strictEqual(FacadeAPI.generateRoadmap, RoadmapsAPI.generateRoadmap);
    assert.strictEqual(FacadeAPI.fetchActiveRoadmap, RoadmapsAPI.fetchActiveRoadmap);
    assert.strictEqual(FacadeAPI.removeEnrolledRoadmap, RoadmapsAPI.removeEnrolledRoadmap);
    assert.strictEqual(FacadeAPI.normalizeRoadmapId, RoadmapsAPI.normalizeRoadmapId);
    assert.strictEqual(FacadeAPI.getFallbackActiveRoadmapData, RoadmapsAPI.getFallbackActiveRoadmapData);
    assert.strictEqual(FacadeAPI.saveActivePlaylistTotal, RoadmapsAPI.saveActivePlaylistTotal);
    assert.strictEqual(FacadeAPI.getRoadmapMeta, RoadmapsAPI.getRoadmapMeta);

    // Dashboard
    assert.strictEqual(FacadeAPI.fetchDashboardData, DashboardAPI.fetchDashboardData);

    // Practice
    assert.strictEqual(FacadeAPI.fetchPracticeCompanies, PracticeAPI.fetchPracticeCompanies);
    assert.strictEqual(FacadeAPI.fetchCompanyQuestions, PracticeAPI.fetchCompanyQuestions);

    // Career
    assert.strictEqual(FacadeAPI.sendMentorMessage, CareerAPI.sendMentorMessage);
    assert.strictEqual(FacadeAPI.extractResume, CareerAPI.extractResume);
    assert.strictEqual(FacadeAPI.reviewResume, CareerAPI.reviewResume);

    // Profile
    assert.strictEqual(FacadeAPI.fetchProfileData, ProfileAPI.fetchProfileData);
    assert.strictEqual(FacadeAPI.saveAcademicProfile, ProfileAPI.saveAcademicProfile);
    assert.strictEqual(FacadeAPI.saveCodingProfiles, ProfileAPI.saveCodingProfiles);
    assert.strictEqual(FacadeAPI.sendWelcomeEmail, ProfileAPI.sendWelcomeEmail);
    assert.strictEqual(FacadeAPI.getLocalCalendarDateStr, ProfileAPI.getLocalCalendarDateStr);
    assert.strictEqual(FacadeAPI.syncDailyLoginStreak, ProfileAPI.syncDailyLoginStreak);
    assert.strictEqual(FacadeAPI.fetchUserProgressStats, ProfileAPI.fetchUserProgressStats);
  });

  it("learning search fast-fails cleanly on empty or single-character query", async () => {
    const resEmpty = await FacadeAPI.searchSkill("");
    assert.deepStrictEqual(resEmpty, { query: "", level: "all", language: "all", source: "csv", count: 0, results: [] });

    const resSingle = await FacadeAPI.searchSkill("a");
    assert.deepStrictEqual(resSingle, { query: "a", level: "all", language: "all", source: "csv", count: 0, results: [] });
  });

  it("roadmap id normalization correctly maps aliases", () => {
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("2. c++"), "cpp-programming");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("C Programming"), "c-programming");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("Learn Python 3"), "python-mastery");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("Spring Boot Framework"), "java-spring-boot");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("React Web"), "react-development");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("Machine Learning & AI"), "ai-engineer");
    assert.strictEqual(FacadeAPI.normalizeRoadmapId("Cloud DevOps"), "devops-engineer");
  });

  it("getRoadmapMeta returns valid node metadata for known roadmap", () => {
    const meta = FacadeAPI.getRoadmapMeta("c-programming", ["1. Introduction"]);
    assert.strictEqual(meta.name, "C Programming Mastery");
    assert.strictEqual(meta.nextTopic, "2. Setting Up");
    assert.strictEqual(meta.total, 22);
  });

  it("getLocalCalendarDateStr produces ISO date YYYY-MM-DD", () => {
    const date = new Date(2026, 8, 6); // September 6, 2026
    const str = FacadeAPI.getLocalCalendarDateStr(date);
    assert.strictEqual(str, "2026-09-06");
  });

  it("fetchUserProgressStats returns zero-baseline defaults for empty userId", async () => {
    const stats = await FacadeAPI.fetchUserProgressStats("");
    assert.strictEqual(stats.streakDays, 0);
    assert.strictEqual(stats.badgesCount, 0);
    assert.strictEqual(stats.questionsSolved, 0);
    assert.strictEqual(stats.completedVideos, 0);
    assert.strictEqual(stats.totalXP, 0);
    assert.strictEqual(stats.level, 0);
  });
});
