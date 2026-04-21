// Minimal eval runner. Expand per feature.
// Usage: `pnpm ai:evals`

interface EvalCase<In, Out> {
  id: string;
  input: In;
  expected?: Partial<Out>;
  grader: (actual: Out, expected?: Partial<Out>) => { pass: boolean; score: number; notes?: string };
}

async function main() {
  console.log("[ai-evals] placeholder runner — plug in feature eval sets");
  // Each feature contributes an index.ts exporting `cases: EvalCase[]` + `invoke(input)`.
  // CI threshold: regression >10% fails the build.
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export type { EvalCase };
