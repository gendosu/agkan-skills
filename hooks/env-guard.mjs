// agy PreToolUse hook: deny shell commands that dump the whole environment.
// stdin:  {"toolCall":{"name":"run_command","args":{"CommandLine":"..."}}, ...}
// stdout: {"decision":"deny","reason":"..."} or {"decision":"ask"} (defer to agy's normal permission flow).
// agy 1.1.27 treats a response without `decision` (e.g. `{}`) as a deny with an empty reason,
// so the pass-through case must be explicit. "ask" respects allow rules and cached approvals;
// "allow" would bypass the user's permission prompts for every command.

import { basename } from "node:path";

export const DENY_REASON =
  "環境変数の一覧表示は禁止。必要な変数は `printenv NAME` で個別に参照すること";
export const PASS_DECISION = Object.freeze({ decision: "ask" });

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh"]);
const COMMAND_PREFIXES = new Set(["sudo", "command", "builtin", "exec", "time", "nice", "nohup", "xargs"]);
const ENV_OPTIONS_WITH_ARG = new Set(["-u", "--unset", "-C", "--chdir", "-S", "--split-string"]);
const PROC_ENVIRON = /\/proc\/[^/\s]+\/environ/;
// process.env / os.environ not followed by a property access / index → the whole mapping is being used
const WHOLE_PROCESS_ENV = /process\.env(?![.\[\w])/;
const WHOLE_OS_ENVIRON = /os\.environ(?![.\[\w])/;
// $(...) and `...` bodies run as commands even inside double quotes
const COMMAND_SUBSTITUTION = /\$\(([^()]*)\)|`([^`]*)`/g;

export function evaluateCommand(commandLine) {
  if (typeof commandLine !== "string") return PASS_DECISION;
  return dumpsEnv(commandLine) ? { decision: "deny", reason: DENY_REASON } : PASS_DECISION;
}

function dumpsEnv(commandLine) {
  const substitutions = [...commandLine.matchAll(COMMAND_SUBSTITUTION)].map((m) => m[1] ?? m[2]);
  return substitutions.some(dumpsEnv) || splitSegments(commandLine).some(segmentDumpsEnv);
}

function segmentDumpsEnv(segment) {
  const tokens = tokenize(segment);
  if (tokens.length === 0 || tokens[0].startsWith("#")) return false;
  if (tokens.some((t) => PROC_ENVIRON.test(t))) return true;

  let i = 0;
  while (i < tokens.length && (isAssignment(tokens[i]) || COMMAND_PREFIXES.has(tokens[i]))) i++;
  if (i >= tokens.length) return false;

  const cmd = basename(tokens[i]);
  const args = stripRedirections(tokens.slice(i + 1));

  switch (cmd) {
    case "env":
      return !envRunsCommand(args);
    case "printenv":
      return args.every(isFlag);
    case "export":
      return args.every(isFlag);
    case "declare":
    case "typeset":
      return args.every(isFlag) && (args.length === 0 || args.some((f) => /^-[a-zA-Z]*[xp]/.test(f)));
    case "set":
      return args.length === 0;
    case "node":
    case "nodejs":
      return nodeEvalDumpsEnv(args);
    case "python":
    case "python3":
      return args.includes("-c") && WHOLE_OS_ENVIRON.test(args.join(" "));
    case "eval":
      return dumpsEnv(args.join(" "));
    default:
      if (SHELLS.has(cmd)) {
        const c = args.indexOf("-c");
        return c !== -1 && c + 1 < args.length && dumpsEnv(args[c + 1]);
      }
      return false;
  }
}

// `env [OPTION]... [NAME=VALUE]... [COMMAND [ARG]...]` — with no COMMAND, env prints the environment.
function envRunsCommand(args) {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (ENV_OPTIONS_WITH_ARG.has(a)) {
      i++;
      continue;
    }
    if (isFlag(a) || isAssignment(a)) continue;
    return true;
  }
  return false;
}

function nodeEvalDumpsEnv(args) {
  const hasEval = args.some((a) => /^(-e|-p|-pe|-ep|--eval|--print)(=|$)/.test(a));
  return hasEval && WHOLE_PROCESS_ENV.test(args.join(" "));
}

function isFlag(t) {
  return t.startsWith("-") && t.length > 1;
}

function isAssignment(t) {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(t);
}

function stripRedirections(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const m = /^(\d*)(>>|>&|<&|&>|>|<)(.*)$/.exec(a);
    if (!m) {
      out.push(a);
      continue;
    }
    if (m[3] === "") i++; // operator alone: the next token is the target
  }
  return out;
}

// Split on shell control operators and command substitution openers, outside quotes.
function splitSegments(line) {
  const segments = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === "\\" && quote === '"') {
        cur += ch + (line[i + 1] ?? "");
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "\\") {
      cur += ch + (line[i + 1] ?? "");
      i++;
      continue;
    }
    if (ch === "|" || ch === ";" || ch === "&" || ch === "\n" || ch === "(" || ch === ")" || ch === "`") {
      segments.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  segments.push(cur);
  return segments;
}

// Whitespace tokenizer that keeps quoted strings together, drops the quotes, and stops at a `#` comment.
function tokenize(segment) {
  const tokens = [];
  let cur = "";
  let inToken = false;
  let quote = null;
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (quote) {
      if (ch === "\\" && quote === '"') {
        cur += segment[i + 1] ?? "";
        i++;
        continue;
      }
      if (ch === quote) {
        quote = null;
        continue;
      }
      cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      inToken = true;
      continue;
    }
    if (ch === "\\") {
      cur += segment[i + 1] ?? "";
      i++;
      inToken = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (inToken) tokens.push(cur);
      cur = "";
      inToken = false;
      continue;
    }
    if (ch === "#" && !inToken) return tokens;
    cur += ch;
    inToken = true;
  }
  if (inToken) tokens.push(cur);
  return tokens;
}

async function main() {
  let decision = PASS_DECISION;
  try {
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    const payload = JSON.parse(input);
    decision = evaluateCommand(payload?.toolCall?.args?.CommandLine);
  } catch {
    decision = PASS_DECISION;
  }
  process.stdout.write(JSON.stringify(decision));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await main();
}
