import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as ScholarshipsAPI from "@/lib/api/scholarships";
import type {
  ScholarshipItem,
  CreateScholarshipPayload,
  UpdateScholarshipPayload,
  ScholarshipStatus,
} from "@/types/scholarships";

describe("Scholarships Module API & Types Integrity", () => {
  it("preserves identical export references between facade and scholarships domain module", () => {
    assert.strictEqual(FacadeAPI.fetchStudentScholarships, ScholarshipsAPI.fetchStudentScholarships);
    assert.strictEqual(FacadeAPI.fetchStudentScholarshipById, ScholarshipsAPI.fetchStudentScholarshipById);
    assert.strictEqual(FacadeAPI.fetchAdminScholarships, ScholarshipsAPI.fetchAdminScholarships);
    assert.strictEqual(FacadeAPI.fetchAdminScholarshipById, ScholarshipsAPI.fetchAdminScholarshipById);
    assert.strictEqual(FacadeAPI.createAdminScholarship, ScholarshipsAPI.createAdminScholarship);
    assert.strictEqual(FacadeAPI.updateAdminScholarship, ScholarshipsAPI.updateAdminScholarship);
    assert.strictEqual(FacadeAPI.publishAdminScholarship, ScholarshipsAPI.publishAdminScholarship);
    assert.strictEqual(FacadeAPI.archiveAdminScholarship, ScholarshipsAPI.archiveAdminScholarship);
    assert.strictEqual(FacadeAPI.deleteAdminScholarship, ScholarshipsAPI.deleteAdminScholarship);
    assert.strictEqual(FacadeAPI.uploadScholarshipImage, ScholarshipsAPI.uploadScholarshipImage);
  });

  it("validates scholarship payload structure with the 7 exact content fields", () => {
    const mockPayload: CreateScholarshipPayload = {
      name: "Google Generation Scholarship 2026",
      provided_by: "Google & AnitaB.org",
      qualification_required: "B.Tech Computer Science (2nd/3rd Year)",
      eligibility: "Enrolled in undergraduate degree with strong academic record in computer science.",
      requirements: "Resume, official transcripts, Statement of Purpose (SOP), GitHub links.",
      application_url: "https://buildyourfuture.withgoogle.com/scholarships/generation-scholarship-apac",
      image_url: "https://supabase.co/storage/v1/object/public/scholarship-banners/sch-test.png",
      status: "published",
      visible_from: "2026-09-21T00:00:00Z",
      visible_until: "2026-10-31T23:59:59Z",
    };

    assert.strictEqual(mockPayload.name, "Google Generation Scholarship 2026");
    assert.strictEqual(mockPayload.provided_by, "Google & AnitaB.org");
    assert.strictEqual(mockPayload.qualification_required, "B.Tech Computer Science (2nd/3rd Year)");
    assert.ok(mockPayload.eligibility.length > 10);
    assert.ok(mockPayload.requirements.length > 10);
    assert.ok(mockPayload.application_url.startsWith("https://"));
    assert.strictEqual(mockPayload.status, "published");
    assert.ok(mockPayload.image_url?.includes("scholarship-banners"));
  });

  it("supports draft status with optional image and optional expiration", () => {
    const draftPayload: CreateScholarshipPayload = {
      name: "Microsoft Research Fellowship",
      provided_by: "Microsoft India",
      qualification_required: "Final Year B.Tech / M.Tech",
      eligibility: "Researchers in AI and Computer Systems.",
      requirements: "Research proposal and letters of recommendation.",
      application_url: "https://www.microsoft.com/en-us/research/academic-programs/",
      image_url: null,
      status: "draft",
    };

    assert.strictEqual(draftPayload.status, "draft");
    assert.strictEqual(draftPayload.image_url, null);
    assert.strictEqual(draftPayload.visible_until, undefined);
  });

  it("validates partial updates and status mutations", () => {
    const patchPayload: UpdateScholarshipPayload = {
      status: "archived",
      qualification_required: "All engineering branches eligible",
    };

    assert.strictEqual(patchPayload.status, "archived");
    assert.strictEqual(patchPayload.qualification_required, "All engineering branches eligible");
    assert.strictEqual(patchPayload.name, undefined);
  });

  it("validates ScholarshipItem representation from database", () => {
    const liveRecord: ScholarshipItem = {
      id: "b218f28d-1941-4712-9c17-f5dcfa2f8ef2",
      name: "Adobe India Women-in-Tech Scholarship",
      provided_by: "Adobe India",
      qualification_required: "B.Tech / BE Female Students",
      eligibility: "Must be a female student enrolled in a computing course.",
      requirements: "Curriculum Vitae, academic transcripts, essay questions.",
      application_url: "https://www.adobe.com/in/careers/university/women-in-technology.html",
      image_url: "https://zzjxprhapptjoziwdcro.supabase.co/storage/v1/object/public/scholarship-banners/adobe.png",
      status: "published",
      visible_from: "2026-09-01T00:00:00Z",
      visible_until: "2026-11-30T23:59:59Z",
      created_by: "4113d832-6ac1-402a-bd00-1fd7f2b7ab26",
      created_at: "2026-09-21T18:00:00Z",
      updated_at: "2026-09-21T18:00:00Z",
    };

    assert.strictEqual(liveRecord.id, "b218f28d-1941-4712-9c17-f5dcfa2f8ef2");
    assert.strictEqual(liveRecord.status, "published");
    assert.strictEqual(liveRecord.created_by, "4113d832-6ac1-402a-bd00-1fd7f2b7ab26");
  });
});
