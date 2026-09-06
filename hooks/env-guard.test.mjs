import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { evaluateCommand, DENY_REASON, PASS_DECISION } from "./env-guard.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "env-guard.mjs");

const denied = [
  "env",
  "  env  ",
  "printenv",
  "env | grep TOKEN",
  "env|sort",
  "env > /tmp/out.txt",
  "env 2>&1 | head",
  "env -0",
  "env -u HOME",
  "printenv -0",
  "/usr/bin/env",
  "sudo env",
  "command env",
  "FOO=1 env",
  "cd /tmp && env",
  "ls; env",
  "echo $(env)",
  "echo `env`",
  "sh -c 'env'",
  "bash -c \"env | grep A\"",
  "export",
  "export -p",
  "declare -x",
  "declare -p",
  "declare -px",
  "declare",
  "typeset -x",
  "set",
  "cat /proc/self/environ",
  "cat /proc/1234/environ | tr '\\0' '\\n'",
  "strings /proc/$$/environ",
  "node -e 'console.log(process.env)'",
  "node -e \"console.log(JSON.stringify(process.env))\"",
  "node -p process.env",
  "node --eval 'Object.entries(process.env).forEach(console.log)'",
];

const allowed = [
  "",
  "ls -la",
  "env FOO=1 cmd",
  "env -i PATH=/bin sh",
  "env node script.js",
  "printenv NAME",
  "printenv BOARD_API_URL",
  "echo $NAME",
  "echo \"$GITHUB_TOKEN\" | wc -c",
  "#!/usr/bin/env node",
  "cat <<'EOF' > run.sh\n#!/usr/bin/env bash\necho hi\nEOF",
  "export FOO=1",
  "export -n FOO",
  "declare -x FOO=1",
  "declare -p FOO",
  "declare -i n=1",
  "declare -f",
  "set -e",
  "set -o pipefail",
  "grep env README.md",
  "echo 'env'",
  "echo \"a; env\"",
  "node -e 'console.log(process.env.FOO)'",
  "node -e 'console.log(process.env[\"FOO\"])'",
  "node script.js",
  "node -e 'console.log(1)'",
  "cat /proc/cpuinfo",
  "sh -c 'printenv HOME'",
  "npm test",
];

for (const cmd of denied) {
  test(`denies: ${JSON.stringify(cmd)}`, () => {
    assert.deepEqual(evaluateCommand(cmd), { decision: "deny", reason: DENY_REASON });
  });
}

for (const cmd of allowed) {
  test(`passes through: ${JSON.stringify(cmd)}`, () => {
    assert.deepEqual(evaluateCommand(cmd), PASS_DECISION);
  });
}

function runHook(stdin) {
  const result = spawnSync(process.execPath, [script], { input: stdin, encoding: "utf8" });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

test("cli: denies env from PreToolUse payload", () => {
  const out = runHook(JSON.stringify({ toolCall: { name: "run_command", args: { CommandLine: "env" } } }));
  assert.equal(out.status, 0);
  assert.equal(out.stderr, "");
  assert.deepEqual(JSON.parse(out.stdout), { decision: "deny", reason: DENY_REASON });
});

// agy 1.1.27 treats a response without `decision` (e.g. `{}`) as a deny with an empty reason,
// so anything we do not block must explicitly defer to the normal permission flow with "ask".
test("pass-through decision is ask, never allow", () => {
  assert.deepEqual(PASS_DECISION, { decision: "ask" });
});

test("cli: passes through an ordinary command", () => {
  const out = runHook(JSON.stringify({ toolCall: { name: "run_command", args: { CommandLine: "ls" } } }));
  assert.equal(out.status, 0);
  assert.deepEqual(JSON.parse(out.stdout), PASS_DECISION);
});

test("cli: passes through on malformed stdin", () => {
  const out = runHook("not json");
  assert.equal(out.status, 0);
  assert.deepEqual(JSON.parse(out.stdout), PASS_DECISION);
});

test("cli: passes through when CommandLine is missing", () => {
  const out = runHook(JSON.stringify({ toolCall: { name: "run_command", args: {} } }));
  assert.equal(out.status, 0);
  assert.deepEqual(JSON.parse(out.stdout), PASS_DECISION);
});
