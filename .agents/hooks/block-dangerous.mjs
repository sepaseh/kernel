import fs from "node:fs";
import process from "node:process";

const block = (message) => {
  process.stderr.write(`${message}\n`);
  process.exit(2);
};

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  block("Safety hook received invalid JSON; command blocked.");
}

const toolInput = input.tool_input ?? input;
const command = String(toolInput.command ?? "");
const content = String(toolInput.content ?? "");
const filePath = String(toolInput.file_path ?? "");
const combined = `${command} ${filePath} ${content}`;

const dangerousGit =
  /git (?:push.*(?:--force(?:[^-]|$)|--force-with-lease(?:[=\s]|$)|-[fF](?: |$))|reset --hard|clean -[a-z]*f|branch.*(?:--delete|-D))/;
const directMainPush = /git push.*(?:origin|upstream).*(?:main|master)(?:\s|$)/;
const environmentExposure =
  /\b(?:printenv|export -p)\b|echo.*(?:TOKEN|API_KEY|SECRET|PASSWORD|CREDENTIAL)|(?:^|[;&|\s])env(?:\s*$|\s*\|)/i;
const productionEndpoint = /production|api\.etherscan\.io|mainnet/i;
const sensitiveFile =
  /(?:^|[/\\])\.env(?:\.|$)|\.(?:pem|p12|key)$|credentials\.|secret\.|keystore/i;

if (dangerousGit.test(command))
  block("Dangerous git command blocked. Ask the user first.");
if (directMainPush.test(command))
  block("Direct push to main/master blocked. Ask the user first.");
if (sensitiveFile.test(filePath))
  block("Editing secret or credential files is blocked. Ask the user first.");
if (environmentExposure.test(command))
  block("Environment variable exposure blocked.");
if (productionEndpoint.test(combined))
  block("Production endpoint detected. Ask the user first.");
