// Build the static site and publish ./out to the gh-pages branch.
// Cross-platform (PowerShell, cmd, Git Bash, macOS/Linux). Needs Node and git on PATH.
// Used while GitHub Actions is unavailable on the account; Pages serves the gh-pages branch.
import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
const read = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();

const remote = read("git remote get-url origin");
const sha = read("git rev-parse --short HEAD");

console.log("Building static site...");
run("npm run build");

const tmp = mkdtempSync(join(tmpdir(), "gh-pages-"));
try {
  cpSync(join(root, "out"), tmp, { recursive: true });
  writeFileSync(join(tmp, ".nojekyll"), "");
  run("git init -q -b gh-pages", tmp);
  run("git add -A", tmp);
  run(`git -c core.autocrlf=false commit -q -m "Deploy ${sha}"`, tmp);
  console.log("Pushing to gh-pages...");
  run(`git push -q -f "${remote}" gh-pages`, tmp);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log("Deployed. GitHub Pages rebuilds in about a minute.");
