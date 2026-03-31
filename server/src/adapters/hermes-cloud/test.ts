import type { AdapterEnvironmentTestResult, AdapterEnvironmentTestContext } from "../types.js";

/**
 * Tests that the Hermes Cloud worker environment is properly configured.
 * Checks: HERMES_CLOUD_WORKER_URL set + worker /v1/health responds.
 */
export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentTestResult["checks"] = [];
  const workerUrl = ctx.config?.workerUrl as string | undefined
    ?? process.env.HERMES_CLOUD_WORKER_URL
    ?? "";

  // Check 1: Worker URL configured
  if (!workerUrl) {
    checks.push({
      code: "WORKER_URL_MISSING",
      level: "error",
      message: "HERMES_CLOUD_WORKER_URL not set and no workerUrl in adapter config",
    });
    return { adapterType: "hermes_cloud", status: "fail", checks, testedAt: new Date().toISOString() };
  }

  checks.push({
    code: "WORKER_URL_OK",
    level: "info",
    message: `Worker URL: ${workerUrl}`,
  });

  // Check 2: Health endpoint responds
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${workerUrl}/v1/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      checks.push({
        code: "WORKER_HEALTH_OK",
        level: "info",
        message: "Worker is healthy",
      });
    } else {
      checks.push({
        code: "WORKER_HEALTH_WARN",
        level: "warn",
        message: `Worker returned ${res.status}`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown error";
    checks.push({
      code: "WORKER_HEALTH_UNREACHABLE",
      level: "warn",
      message: `Could not reach worker: ${msg}`,
    });
  }

  const hasError = checks.some((c) => c.level === "error");
  const hasWarn = checks.some((c) => c.level === "warn");
  const status = hasError ? "fail" : hasWarn ? "warn" : "pass";

  return {
    adapterType: "hermes_cloud",
    status,
    checks,
    testedAt: new Date().toISOString(),
  };
}
