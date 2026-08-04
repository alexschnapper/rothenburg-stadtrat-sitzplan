import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_TIME_ZONE = "Europe/Berlin";

export function formatBuildDate(
  date,
  timeZone = DEFAULT_TIME_ZONE
) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone
  }).format(date);
}

export function createBuildInfo({
  version,
  buildNumber,
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE
}) {
  if (typeof version !== "string" || !version.trim()) {
    throw new Error("Eine Versionsnummer ist erforderlich.");
  }

  const normalizedBuildNumber = String(buildNumber ?? "").trim();

  if (!/^\d+$/.test(normalizedBuildNumber)) {
    throw new Error("Die Buildnummer muss numerisch sein.");
  }

  return {
    version: version.trim(),
    buildNumber: normalizedBuildNumber,
    buildDate: formatBuildDate(date, timeZone)
  };
}

function optionValue(args, optionName) {
  const index = args.indexOf(optionName);

  return index === -1 ? null : args[index + 1] ?? null;
}

async function generateBuildInfoFile(args = process.argv.slice(2)) {
  const projectRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
  );

  const packagePath = resolve(projectRoot, "package.json");
  const outputPath = resolve(
    projectRoot,
    optionValue(args, "--output") ?? "data/build-info.json"
  );

  const packageMetadata = JSON.parse(
    await readFile(packagePath, "utf8")
  );

  const buildInfo = createBuildInfo({
    version: packageMetadata.version,
    buildNumber:
      optionValue(args, "--build-number") ??
      process.env.GITHUB_RUN_NUMBER
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(buildInfo, null, 2)}\n`,
    "utf8"
  );

  console.log(`Buildinformationen erzeugt: ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateBuildInfoFile();
}
