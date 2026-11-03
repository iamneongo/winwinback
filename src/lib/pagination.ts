/** Keep large result sets navigable without rendering every page number. */
export function visiblePages(current: number, total: number): (number | "ellipsis")[] {
  const nearby = new Set([1, total, current - 1, current, current + 1].filter((number) => number >= 1 && number <= total));
  const numbers = [...nearby].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (const number of numbers) {
    const previous = result.at(-1);
    if (typeof previous === "number" && number - previous === 2) result.push(previous + 1);
    else if (typeof previous === "number" && number - previous > 2) result.push("ellipsis");
    result.push(number);
  }
  return result;
}
