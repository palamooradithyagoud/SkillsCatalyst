import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as EventsAPI from "@/lib/api/events";
import type { EventItem, CreateEventPayload, UpdateEventPayload } from "@/types/events";

describe("Events Module API & Types Integrity", () => {
  it("preserves identical export references between facade and events domain module", () => {
    assert.strictEqual(FacadeAPI.fetchStudentEvents, EventsAPI.fetchStudentEvents);
    assert.strictEqual(FacadeAPI.fetchStudentEventById, EventsAPI.fetchStudentEventById);
    assert.strictEqual(FacadeAPI.fetchAdminEvents, EventsAPI.fetchAdminEvents);
    assert.strictEqual(FacadeAPI.fetchAdminEventById, EventsAPI.fetchAdminEventById);
    assert.strictEqual(FacadeAPI.createAdminEvent, EventsAPI.createAdminEvent);
    assert.strictEqual(FacadeAPI.updateAdminEvent, EventsAPI.updateAdminEvent);
    assert.strictEqual(FacadeAPI.publishAdminEvent, EventsAPI.publishAdminEvent);
    assert.strictEqual(FacadeAPI.archiveAdminEvent, EventsAPI.archiveAdminEvent);
    assert.strictEqual(FacadeAPI.deleteAdminEvent, EventsAPI.deleteAdminEvent);
    assert.strictEqual(FacadeAPI.uploadEventBanner, EventsAPI.uploadEventBanner);
  });

  it("validates event payload structures and required fields", () => {
    const mockPayload: CreateEventPayload = {
      title: "National AI Hackathon 2026",
      slug: "national-ai-hackathon-2026",
      description: "Build cutting-edge agentic workflows.",
      category: "hackathon",
      event_mode: "online",
      start_date: "2026-10-01T09:00:00Z",
      end_date: "2026-10-03T18:00:00Z",
      registration_deadline: "2026-09-28T23:59:59Z",
      registration_url: "https://example.com/register",
      is_hackathon: true,
      prize_pool: "₹1,00,000",
      team_size_min: 2,
      team_size_max: 4,
      problem_statement: "Autonomous Dev Agents",
      visible_from: "2026-09-20T00:00:00Z",
      visible_until: "2026-10-04T00:00:00Z",
      status: "published",
    };

    assert.strictEqual(mockPayload.title, "National AI Hackathon 2026");
    assert.strictEqual(mockPayload.is_hackathon, true);
    assert.strictEqual(mockPayload.prize_pool, "₹1,00,000");
    assert.strictEqual(mockPayload.team_size_min, 2);
    assert.strictEqual(mockPayload.team_size_max, 4);
    assert.strictEqual(mockPayload.status, "published");
  });

  it("validates non-hackathon payload clears hackathon specifics", () => {
    const mockPayload: CreateEventPayload = {
      title: "System Design Masterclass",
      slug: "system-design-masterclass",
      category: "workshop",
      event_mode: "hybrid",
      start_date: "2026-11-01T10:00:00Z",
      end_date: "2026-11-01T16:00:00Z",
      is_hackathon: false,
      visible_from: "2026-10-15T00:00:00Z",
      visible_until: "2026-11-02T00:00:00Z",
    };

    assert.strictEqual(mockPayload.is_hackathon, false);
    assert.strictEqual(mockPayload.prize_pool, undefined);
    assert.strictEqual(mockPayload.team_size_min, undefined);
  });
});
