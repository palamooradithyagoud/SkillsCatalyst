"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Compass,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Trash2,
  Plus,
  BookOpen,
  ArrowRight,
  ListPlus,
  Save,
  Check,
} from "lucide-react";
import {
  StudentLearningProfile,
  UpdateLearningProfileRequest,
  StudentLearningRoadmap,
  SkillGapAnalysisResult,
  WeeklyProgressReviewResult,
  ExperienceLevel,
} from "@/types/ai-mentor-personalization";
import { TaskActionProposal } from "@/types/ai-mentor-tasks";
import {
  getStudentLearningProfile,
  updateStudentLearningProfile,
  resetStudentLearningProfile,
  listStudentRoadmaps,
  generateStudentRoadmap,
  deleteStudentRoadmap,
  convertRoadmapMilestonesToTasks,
  getSkillGapAnalysis,
  getWeeklyProgressReview,
} from "@/lib/api/ai-mentor-personalization";

export type PersonalizationTab = "profile" | "roadmaps" | "skill-gaps" | "weekly-review";

interface PersonalizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: PersonalizationTab;
  onTabChange: (tab: PersonalizationTab) => void;
  onProposeTasks: (proposal: TaskActionProposal, contextMessage: string) => void;
  onSendMessage: (text: string) => void;
}

export function PersonalizationDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onProposeTasks,
  onSendMessage,
}: PersonalizationDrawerProps) {
  // State: Profile
  const [profile, setProfile] = useState<StudentLearningProfile | null>(null);
  const [profileForm, setProfileForm] = useState<UpdateLearningProfileRequest>({});
  const [newExistingSkill, setNewExistingSkill] = useState("");
  const [newTargetSkill, setNewTargetSkill] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // State: Roadmaps
  const [roadmaps, setRoadmaps] = useState<StudentLearningRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>([]);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isConvertingMilestones, setIsConvertingMilestones] = useState(false);
  const [newRoadmapGoal, setNewRoadmapGoal] = useState("");
  const [newRoadmapLevel, setNewRoadmapLevel] = useState<ExperienceLevel>("Beginner");

  // State: Skill Gap Analysis
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysisResult | null>(null);

  // State: Weekly Review
  const [weeklyReviewData, setWeeklyReviewData] = useState<WeeklyProgressReviewResult | null>(null);

  // General Loading & Error State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Data on Tab Switch
  const loadTabData = useCallback(async (tab: PersonalizationTab) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (tab === "profile") {
        const p = await getStudentLearningProfile();
        setProfile(p);
        setProfileForm({
          career_goal: p.career_goal,
          experience_level: p.experience_level,
          existing_skills: [...p.existing_skills],
          target_skills: [...p.target_skills],
          preferred_daily_minutes: p.preferred_daily_minutes,
          learning_preferences: [...p.learning_preferences],
          short_term_objective: p.short_term_objective,
          long_term_objective: p.long_term_objective,
          target_date: p.target_date,
        });
      } else if (tab === "roadmaps") {
        const rms = await listStudentRoadmaps();
        setRoadmaps(rms);
        if (rms.length > 0 && !selectedRoadmapId) {
          setSelectedRoadmapId(rms[0].id);
        }
      } else if (tab === "skill-gaps") {
        const sg = await getSkillGapAnalysis();
        setSkillGapData(sg);
      } else if (tab === "weekly-review") {
        const wr = await getWeeklyProgressReview();
        setWeeklyReviewData(wr);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoadmapId]);

  useEffect(() => {
    if (isOpen) {
      loadTabData(activeTab);
    }
  }, [isOpen, activeTab, loadTabData]);

  if (!isOpen) return null;

  // Profile Handlers
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setErrorMsg(null);
    try {
      const updated = await updateStudentLearningProfile(profileForm);
      setProfile(updated);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetProfile = async () => {
    if (!confirm("Are you sure you want to reset your learning profile to default settings?")) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await resetStudentLearningProfile();
      await loadTabData("profile");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to reset profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const addExistingSkill = () => {
    const s = newExistingSkill.trim();
    if (!s) return;
    const current = profileForm.existing_skills || [];
    if (!current.includes(s)) {
      setProfileForm({ ...profileForm, existing_skills: [...current, s] });
    }
    setNewExistingSkill("");
  };

  const removeExistingSkill = (skill: string) => {
    const current = profileForm.existing_skills || [];
    setProfileForm({ ...profileForm, existing_skills: current.filter((x) => x !== skill) });
  };

  const addTargetSkill = () => {
    const s = newTargetSkill.trim();
    if (!s) return;
    const current = profileForm.target_skills || [];
    if (!current.includes(s)) {
      setProfileForm({ ...profileForm, target_skills: [...current, s] });
    }
    setNewTargetSkill("");
  };

  const removeTargetSkill = (skill: string) => {
    const current = profileForm.target_skills || [];
    setProfileForm({ ...profileForm, target_skills: current.filter((x) => x !== skill) });
  };

  // Roadmap Handlers
  const handleGenerateRoadmap = async () => {
    const goal = (newRoadmapGoal || profile?.career_goal || "").trim();
    if (!goal) {
      setErrorMsg("Please specify a target career goal for the roadmap.");
      return;
    }
    setIsGeneratingRoadmap(true);
    setErrorMsg(null);
    try {
      const newRm = await generateStudentRoadmap({
        career_goal: goal,
        starting_level: newRoadmapLevel,
      });
      setRoadmaps((prev) => [newRm, ...prev]);
      setSelectedRoadmapId(newRm.id);
      setNewRoadmapGoal("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to generate roadmap.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await deleteStudentRoadmap(roadmapId);
      setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
      if (selectedRoadmapId === roadmapId) {
        setSelectedRoadmapId(roadmaps.find((r) => r.id !== roadmapId)?.id || null);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to delete roadmap.");
    }
  };

  const toggleMilestoneSelection = (milestoneId: string) => {
    setSelectedMilestoneIds((prev) =>
      prev.includes(milestoneId) ? prev.filter((id) => id !== milestoneId) : [...prev, milestoneId]
    );
  };

  const handleConvertMilestones = async () => {
    if (!selectedRoadmapId || selectedMilestoneIds.length === 0) return;
    setIsConvertingMilestones(true);
    setErrorMsg(null);
    try {
      const res = await convertRoadmapMilestonesToTasks(selectedRoadmapId, selectedMilestoneIds);
      if (res.success && res.proposal) {
        onProposeTasks(
          res.proposal,
          `I have proposed ${selectedMilestoneIds.length} task(s) from your learning roadmap. Review the proposed tasks below and confirm approval to add them to your To-Do List.`
        );
        setSelectedMilestoneIds([]);
        onClose();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to convert milestones into tasks.");
    } finally {
      setIsConvertingMilestones(false);
    }
  };

  const currentRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111216] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col h-full z-10 overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Personalization Studio
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Tailored AI mentorship, roadmaps, and progress tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 px-6 shrink-0 gap-1 overflow-x-auto">
          {[
            { id: "profile", label: "Learning Profile", icon: User },
            { id: "roadmaps", label: "Roadmaps", icon: Layers },
            { id: "skill-gaps", label: "Skill Gaps", icon: BookOpen },
            { id: "weekly-review", label: "Weekly Review", icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id as PersonalizationTab)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 font-semibold"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span className="flex-1">{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-400 dark:text-neutral-500 text-xs">
              <RotateCw className="h-5 w-5 animate-spin text-purple-600" />
              <span>Loading details...</span>
            </div>
          ) : activeTab === "profile" ? (
            /* TAB 1: LEARNING PROFILE */
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Career Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Target Role or Career Goal
                  </label>
                  <input
                    type="text"
                    value={profileForm.career_goal || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, career_goal: e.target.value })}
                    placeholder="e.g. Full Stack Developer, AI Engineer"
                    className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Current Experience Level
                  </label>
                  <select
                    value={profileForm.experience_level || "Beginner"}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        experience_level: e.target.value as ExperienceLevel,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Beginner">Beginner (Foundations & Syntax)</option>
                    <option value="Intermediate">Intermediate (Projects & Frameworks)</option>
                    <option value="Advanced">Advanced (System Design & Scale)</option>
                    <option value="Student">Student (Academic Focus)</option>
                  </select>
                </div>

                {/* Daily Availability */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Daily Study Availability (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    value={profileForm.preferred_daily_minutes ?? 60}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        preferred_daily_minutes: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Short-term Objective */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Short-Term Objective
                  </label>
                  <input
                    type="text"
                    value={profileForm.short_term_objective || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, short_term_objective: e.target.value })
                    }
                    placeholder="e.g. Master React hooks, solve 20 DSA problems"
                    className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Long-term Objective */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Long-Term Career Objective
                </label>
                <input
                  type="text"
                  value={profileForm.long_term_objective || ""}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, long_term_objective: e.target.value })
                  }
                  placeholder="e.g. Secure full-stack engineer role at high-growth startup"
                  className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Existing Skills Tag Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Existing Skills (Self-reported)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExistingSkill}
                    onChange={(e) => setNewExistingSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addExistingSkill();
                      }
                    }}
                    placeholder="Add a skill you know (e.g. Python, SQL)"
                    className="flex-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addExistingSkill}
                    className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(profileForm.existing_skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingSkill(skill)}
                        className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {(profileForm.existing_skills || []).length === 0 && (
                    <span className="text-[11px] text-neutral-400">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Target Skills Tag Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Target Skills (Want to learn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTargetSkill}
                    onChange={(e) => setNewTargetSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTargetSkill();
                      }
                    }}
                    placeholder="Add a skill to learn (e.g. Next.js, Docker)"
                    className="flex-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addTargetSkill}
                    className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(profileForm.target_skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeTargetSkill(skill)}
                        className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {(profileForm.target_skills || []).length === 0 && (
                    <span className="text-[11px] text-neutral-400">No target skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors"
                >
                  Reset Profile
                </button>
                <div className="flex items-center gap-2">
                  {profileSaveSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-4 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSavingProfile ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "roadmaps" ? (
            /* TAB 2: LEARNING ROADMAPS */
            <div className="space-y-6">
              {/* Generate Roadmap Card */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-purple-600" />
                    Generate New Roadmap
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newRoadmapGoal}
                    onChange={(e) => setNewRoadmapGoal(e.target.value)}
                    placeholder={profile?.career_goal || "Career Goal (e.g. AI Engineer)"}
                    className="text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newRoadmapLevel}
                      onChange={(e) => setNewRoadmapLevel(e.target.value as ExperienceLevel)}
                      className="flex-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Student">Student</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleGenerateRoadmap}
                      disabled={isGeneratingRoadmap}
                      className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isGeneratingRoadmap ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Roadmap Selector */}
              {roadmaps.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Active Roadmaps ({roadmaps.length})
                    </label>
                    {currentRoadmap && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRoadmap(currentRoadmap.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete this roadmap</span>
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {roadmaps.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoadmapId(r.id);
                          setSelectedMilestoneIds([]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                          selectedRoadmapId === r.id
                            ? "bg-purple-600 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {r.title}
                      </button>
                    ))}
                  </div>

                  {/* Roadmap Stages & Milestones */}
                  {currentRoadmap && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Starting Level: {currentRoadmap.starting_level}</span>
                        <span>
                          {selectedMilestoneIds.length} milestone(s) selected
                        </span>
                      </div>

                      {currentRoadmap.stages.map((stage) => (
                        <div
                          key={stage.stage_index}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                        >
                          <div className="p-3 bg-neutral-100/70 dark:bg-neutral-850/50 border-b border-neutral-200 dark:border-neutral-800">
                            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {stage.title}
                            </h4>
                            {stage.description && (
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {stage.description}
                              </p>
                            )}
                          </div>
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-855">
                            {stage.milestones.map((milestone) => {
                              const isChecked = selectedMilestoneIds.includes(milestone.id);
                              return (
                                <div
                                  key={milestone.id}
                                  className={`p-3 flex items-start gap-3 transition-colors ${
                                    isChecked
                                      ? "bg-purple-50/50 dark:bg-purple-950/20"
                                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleMilestoneSelection(milestone.id)}
                                    className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                        {milestone.title}
                                      </h5>
                                      <span className="text-[10px] text-neutral-400 flex items-center gap-1 shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {milestone.suggested_duration_minutes} min
                                      </span>
                                    </div>
                                    {milestone.description && (
                                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {milestone.description}
                                      </p>
                                    )}
                                    {milestone.prerequisites && milestone.prerequisites.length > 0 && (
                                      <div className="text-[10px] text-neutral-400 mt-1">
                                        Prerequisite: {milestone.prerequisites.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Convert Selected Milestones to Tasks */}
                      <div className="pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleConvertMilestones}
                          disabled={selectedMilestoneIds.length === 0 || isConvertingMilestones}
                          className="px-4 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                          <span>
                            {isConvertingMilestones
                              ? "Proposing tasks..."
                              : `Convert Selected (${selectedMilestoneIds.length}) to Tasks`}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  No learning roadmaps generated yet. Generate your first roadmap above!
                </div>
              )}
            </div>
          ) : activeTab === "skill-gaps" ? (
            /* TAB 3: SKILL GAP ANALYSIS */
            <div className="space-y-6">
              {skillGapData ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                        Analysis For Role
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {skillGapData.target_role}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(
                          `Which skill gap should I prioritize first for ${skillGapData.target_role}?`
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      <span>Prioritize in chat</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {skillGapData.confirmed_skills.length}
                      </div>
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">
                        Confirmed Skills
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {skillGapData.missing_critical_skills.length}
                      </div>
                      <div className="text-[10px] text-red-800 dark:text-red-300 font-medium mt-0.5">
                        Missing Critical Gaps
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {skillGapData.skills_in_progress.length}
                      </div>
                      <div className="text-[10px] text-indigo-800 dark:text-indigo-300 font-medium mt-0.5">
                        Skills In Progress
                      </div>
                    </div>
                  </div>

                  {/* Recommended Next Steps */}
                  {skillGapData.recommended_next_steps.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-1.5">
                      <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                        Actionable Next Steps
                      </h4>
                      <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1 list-disc list-inside">
                        {skillGapData.recommended_next_steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Skill Items */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Detailed Skill Breakdown
                    </h4>
                    <div className="space-y-2">
                      {skillGapData.gaps.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                                {item.skill_name}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  item.status === "verified"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                    : item.status === "confirmed_gap"
                                    ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                                    : item.status === "target_desired"
                                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                }`}
                              >
                                {item.status.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-neutral-400 uppercase">
                                {item.importance}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                              {item.recommended_action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  No skill gap analysis available. Ensure you have set a career goal in your profile.
                </div>
              )}
            </div>
          ) : (
            /* TAB 4: WEEKLY REVIEW */
            <div className="space-y-6">
              {weeklyReviewData ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                        Weekly Review Period
                      </span>
                      <h3 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {weeklyReviewData.start_date} to {weeklyReviewData.end_date} ({weeklyReviewData.timezone})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage("Review my progress this week and suggest next priorities.")
                      }
                      className="px-3 py-1.5 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      <span>Ask AI in chat</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Activity Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {weeklyReviewData.tasks_completed_count}
                      </div>
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">
                        Tasks Completed
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                      <div className="text-xl font-bold text-neutral-700 dark:text-neutral-300">
                        {weeklyReviewData.pending_tasks_count}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                        Tasks Remaining
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">
                        {weeklyReviewData.overdue_tasks_count}
                      </div>
                      <div className="text-[10px] text-red-800 dark:text-red-300 font-medium mt-0.5">
                        Overdue Tasks
                      </div>
                    </div>
                  </div>

                  {/* Completed Tasks List */}
                  {weeklyReviewData.completed_tasks.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Completed Tasks This Week
                      </h4>
                      <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {weeklyReviewData.completed_tasks.map((task, i) => (
                          <li key={i}>{task.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Bottlenecks */}
                  {weeklyReviewData.bottlenecks.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Identified Bottlenecks
                      </h4>
                      <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                        {weeklyReviewData.bottlenecks.map((bn, i) => (
                          <li key={i}>{bn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Week Priorities */}
                  {weeklyReviewData.suggested_priorities_next_week.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-purple-600" />
                        Suggested Priorities for Next Week
                      </h4>
                      <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1 list-disc list-inside bg-purple-50/40 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200/80 dark:border-purple-900/60">
                        {weeklyReviewData.suggested_priorities_next_week.map((pr, i) => (
                          <li key={i}>{pr}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  No weekly review records found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
