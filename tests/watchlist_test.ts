/**
 * Tests for watchlist helpers (src/lib/watchlist.ts)
 * These functions depend on localStorage so we mock it with a simple in-memory store.
 * Covers: getWatchlist, saveWatchlist, isInWatchlist, toggleWatchlistItem,
 *         removeFromWatchlist, old-format migration
 */
import { assertEquals } from "jsr:@std/assert";

// ── Minimal localStorage mock ─────────────────────────────────────────────────
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value); },
  removeItem: (key: string) => { store.delete(key); },
  clear: () => { store.clear(); },
};
// Inject into globalThis so the module picks it up
(globalThis as unknown as Record<string, unknown>).window = globalThis;
(globalThis as unknown as Record<string, unknown>).localStorage = localStorageMock;
// ─────────────────────────────────────────────────────────────────────────────

// Import AFTER injecting the mock so module-level `typeof window` resolves correctly
import {
  getWatchlist,
  saveWatchlist,
  isInWatchlist,
  toggleWatchlistItem,
  removeFromWatchlist,
} from "../src/lib/watchlist.ts";

function reset() {
  store.clear();
}

Deno.test("watchlist - getWatchlist returns empty array when nothing stored", () => {
  reset();
  assertEquals(getWatchlist(), []);
});

Deno.test("watchlist - saveWatchlist and getWatchlist round-trips correctly", () => {
  reset();
  saveWatchlist([{ id: "1", type: "movie" }, { id: "2", type: "tv" }]);
  const list = getWatchlist();
  assertEquals(list.length, 2);
  assertEquals(list[0], { id: "1", type: "movie" });
  assertEquals(list[1], { id: "2", type: "tv" });
});

Deno.test("watchlist - isInWatchlist returns false when empty", () => {
  reset();
  assertEquals(isInWatchlist("99"), false);
});

Deno.test("watchlist - isInWatchlist returns true after adding an item", () => {
  reset();
  saveWatchlist([{ id: "42", type: "movie" }]);
  assertEquals(isInWatchlist("42"), true);
  assertEquals(isInWatchlist(42), true); // numeric id should also work
});

Deno.test("watchlist - toggleWatchlistItem adds item when not present", () => {
  reset();
  const added = toggleWatchlistItem("10", "movie");
  assertEquals(added, true);
  assertEquals(isInWatchlist("10"), true);
});

Deno.test("watchlist - toggleWatchlistItem removes item when already present", () => {
  reset();
  saveWatchlist([{ id: "10", type: "movie" }]);
  const removed = toggleWatchlistItem("10", "movie");
  assertEquals(removed, false);
  assertEquals(isInWatchlist("10"), false);
});

Deno.test("watchlist - toggleWatchlistItem preserves other items on removal", () => {
  reset();
  saveWatchlist([
    { id: "1", type: "movie" },
    { id: "2", type: "tv" },
    { id: "3", type: "movie" },
  ]);
  toggleWatchlistItem("2", "tv");
  const list = getWatchlist();
  assertEquals(list.length, 2);
  assertEquals(list.find((i) => i.id === "2"), undefined);
});

Deno.test("watchlist - removeFromWatchlist removes the specified item", () => {
  reset();
  saveWatchlist([{ id: "5", type: "tv" }, { id: "6", type: "movie" }]);
  removeFromWatchlist("5");
  const list = getWatchlist();
  assertEquals(list.length, 1);
  assertEquals(list[0].id, "6");
});

Deno.test("watchlist - removeFromWatchlist is a no-op for non-existent id", () => {
  reset();
  saveWatchlist([{ id: "7", type: "movie" }]);
  removeFromWatchlist("999");
  assertEquals(getWatchlist().length, 1);
});

Deno.test("watchlist - migrates old format (plain string IDs) to WatchlistItem", () => {
  reset();
  // Simulate the old storage format: array of plain strings
  store.set(
    "watchers-heaven-watchlist",
    JSON.stringify(["101", "202"]),
  );
  const list = getWatchlist();
  assertEquals(list.length, 2);
  assertEquals(list[0], { id: "101", type: "movie" });
  assertEquals(list[1], { id: "202", type: "movie" });
});

Deno.test("watchlist - getWatchlist returns empty on corrupt JSON", () => {
  reset();
  store.set("watchers-heaven-watchlist", "not-valid-json{{{");
  assertEquals(getWatchlist(), []);
});
