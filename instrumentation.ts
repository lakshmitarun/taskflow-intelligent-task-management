/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts, before any requests are handled.
 * Used here to configure Node.js DNS to use public resolvers,
 * which fixes the `querySrv ECONNREFUSED` error for MongoDB Atlas
 * connections on Windows with Node.js 22+.
 */
export function register() {
  // Only apply in the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== "edge") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("node:dns");
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log(
        "[instrumentation] DNS servers set to public resolvers:",
        dns.getServers()
      );
    } catch (err) {
      console.warn("[instrumentation] Failed to set DNS servers:", err);
    }
  }
}
