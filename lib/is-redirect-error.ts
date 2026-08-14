// A "use server" action that calls redirect() throws a special NEXT_REDIRECT
// error internally to unwind back to Next.js — callers that wrap the action
// call in try/catch (to reset a loading/submitting state on real failures)
// must re-throw this rather than treating it as an error, or the redirect
// silently never happens.
export function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
