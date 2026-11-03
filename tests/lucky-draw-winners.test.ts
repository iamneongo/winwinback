import assert from "node:assert/strict";
import test from "node:test";
import { selectWinningTickets } from "../src/lib/lucky-draw/winners";

test("exact four-digit matches take precedence over nearby tickets", () => {
  const tickets = [{ number: "1233" }, { number: "1234" }, { number: "1234" }, { number: "1235" }];
  assert.deepEqual(selectWinningTickets(tickets, "1234"), {
    exactMatch: true,
    winnerTickets: [tickets[1], tickets[2]],
  });
});

test("equally close numbers share the nearest-number result", () => {
  const tickets = [{ number: "4999" }, { number: "5001" }, { number: "5002" }];
  assert.deepEqual(selectWinningTickets(tickets, "5000"), {
    exactMatch: false,
    winnerTickets: [tickets[0], tickets[1]],
  });
});

test("leading zeros stay meaningful and an empty period has no winner", () => {
  const tickets = [{ number: "0001" }, { number: "9999" }];
  assert.deepEqual(selectWinningTickets(tickets, "0000"), { exactMatch: false, winnerTickets: [tickets[0]] });
  assert.deepEqual(selectWinningTickets([], "0000"), { exactMatch: null, winnerTickets: [] });
});
