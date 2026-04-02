import { describe, expect, it } from "vitest";
import { generateDigestHtml } from "./digestEmail";

describe("digest email", () => {
  it("generates valid HTML for a day with no bookmarks", () => {
    const html = generateDigestHtml("Monday, April 6", []);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("AZ TECH WEEK");
    expect(html).toContain("Monday, April 6");
    expect(html).toContain("Your Schedule");
    expect(html).toContain("No events bookmarked");
    expect(html).toContain("Trending Today");
  });

  it("generates HTML with bookmarked events included", () => {
    // Use event ID 1 which should exist in the data
    const html = generateDigestHtml("Monday, April 6", [1, 2, 3]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Your Schedule");
    // Should have weather data for Monday
    expect(html).toContain("89");
    expect(html).toContain("64");
    expect(html).toContain("Sunny");
  });

  it("includes weather data for each day", () => {
    const days = [
      "Monday, April 6",
      "Tuesday, April 7",
      "Wednesday, April 8",
      "Thursday, April 9",
      "Friday, April 10",
      "Saturday, April 11",
      "Sunday, April 12",
    ];
    for (const day of days) {
      const html = generateDigestHtml(day, []);
      expect(html).toContain(day);
      // Should contain temperature numbers
      expect(html).toMatch(/\d+°F/);
    }
  });

  it("includes trending events section", () => {
    const html = generateDigestHtml("Tuesday, April 7", []);
    expect(html).toContain("Trending Today");
    // Should have RSVP links
    expect(html).toContain("RSVP");
  });

  it("includes footer with correct branding", () => {
    const html = generateDigestHtml("Monday, April 6", []);
    expect(html).toContain("Trevor Legwinski");
    expect(html).toContain("Manus AI");
    expect(html).toContain("Unsubscribe");
  });

  it("includes day stats section", () => {
    const html = generateDigestHtml("Monday, April 6", []);
    expect(html).toContain("Events");
    expect(html).toContain("Cities");
    expect(html).toContain("Open");
  });
});
