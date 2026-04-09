/*
  Statistical helper utilities used by survey analytics.

  Used by:
    components/admin/survey-analytics-charts.tsx (LikertChart)
*/

export function mean(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const avg = mean(nums);
  const diffs = nums.map((n) => (n - avg) ** 2);
  return Math.sqrt(diffs.reduce((a, b) => a + b, 0) / nums.length);
}
