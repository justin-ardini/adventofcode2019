/** Logs the millis taken by the given fn. */
export default function time<T>(label: string, fn: () => T): T {
  const startMillis: number = Date.now();
  const solution = fn();
  console.log(`${label}: ${Date.now() - startMillis}`);
  return solution;
}