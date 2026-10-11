import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const client = join(root, "client");

if (!existsSync(join(client, "node_modules"))) {
  const install = spawnSync("npm", ["install"], { cwd: client, stdio: "inherit" });
  if (install.status !== 0) process.exit(install.status ?? 1);
}

const build = spawnSync("npm", ["run", "build"], { cwd: client, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn("python3", ["-u", "server/app.py"], { cwd: root, stdio: "inherit" });
server.on("exit", (code) => process.exit(code ?? 0));
