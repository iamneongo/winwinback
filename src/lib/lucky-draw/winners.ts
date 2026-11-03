export function selectWinningTickets<T extends { number: string }>(tickets: T[], winningNumber: string): {
  exactMatch: boolean | null;
  winnerTickets: T[];
} {
  if (tickets.length === 0) return { exactMatch: null, winnerTickets: [] };

  const exact = tickets.filter((ticket) => ticket.number === winningNumber);
  if (exact.length > 0) return { exactMatch: true, winnerTickets: exact };

  const winningValue = Number(winningNumber);
  let nearestDistance = Infinity;
  for (const ticket of tickets) {
    nearestDistance = Math.min(nearestDistance, Math.abs(Number(ticket.number) - winningValue));
  }
  return {
    exactMatch: false,
    winnerTickets: tickets.filter((ticket) => Math.abs(Number(ticket.number) - winningValue) === nearestDistance),
  };
}
