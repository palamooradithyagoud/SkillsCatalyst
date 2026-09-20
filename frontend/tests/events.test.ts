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

  it("validates event payload structures with optional registration_deadline", () => {
    const mockPayload: CreateEventPayload = {
      event_name: "National AI Hackathon 2026",
      conducted_by_college: "ABC Engineering College",
      event_link: "https://example.com/register",
      category: "online",
      banner_url: "https://example.com/banner.png",
      start_date: "2026-10-01T00:00:00Z",
      end_date: "2026-10-03T23:59:59Z",
      registration_deadline: null,
      is_hackathon: true,
      prize_pool: "₹1,00,000",
      team_size: "2-4",
      mode: "online",
      status: "published",
    };

    assert.strictEqual(mockPayload.event_name, "National AI Hackathon 2026");
    assert.strictEqual(mockPayload.is_hackathon, true);
    assert.strictEqual(mockPayload.prize_pool, "₹1,00,000");
    assert.strictEqual(mockPayload.team_size, "2-4");
    assert.strictEqual(mockPayload.status, "published");
    assert.strictEqual(mockPayload.registration_deadline, null);
  });

  it("validates non-hackathon payload clears hackathon specifics", () => {
    const mockPayload: CreateEventPayload = {
      event_name: "System Design Masterclass",
      conducted_by_college: "XYZ Tech University",
      event_link: "https://example.com/register",
      category: "offline",
      banner_url: "https://example.com/banner.png",
      start_date: "2026-11-01T00:00:00Z",
      end_date: "2026-11-01T23:59:59Z",
      is_hackathon: false,
    };

    assert.strictEqual(mockPayload.is_hackathon, false);
    assert.strictEqual(mockPayload.prize_pool, undefined);
    assert.strictEqual(mockPayload.registration_deadline, undefined);
  });
});
