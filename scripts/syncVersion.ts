#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Command = "check" | "sync";

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

interface PackageLockJson {
  version: string;
  packages: {
    "": {
      version: string;
    };
  };
  [key: string]: unknown;
}

interface ServerJson {
  version: string;
  packages: Array<{
    version: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

const getProjectRoot = (): string => {
  return process.cwd();
};

const readJsonFile = <T>(filePath: string): T => {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
};

const getVersions = (): {
  packageJson: string;
  packageLockJson: string;
  serverJson: string;
  serverJsonPackage: string;
} => {
  const root = getProjectRoot();

  const packageJson = readJsonFile<PackageJson>(join(root, "package.json"));
  const packageLockJson = readJsonFile<PackageLockJson>(
    join(root, "package-lock.json"),
  );
  const serverJson = readJsonFile<ServerJson>(join(root, "server.json"));

  return {
    packageJson: packageJson.version,
    packageLockJson: packageLockJson.version,
    serverJson: serverJson.version,
    serverJsonPackage: serverJson.packages[0]?.version ?? "missing",
  };
};

const checkVersions = (): void => {
  const versions = getVersions();

  const allVersions = [
    versions.packageJson,
    versions.packageLockJson,
    versions.serverJson,
    versions.serverJsonPackage,
  ];

  const allMatch = allVersions.every((v) => v === versions.packageJson);

  if (!allMatch) {
    console.error("❌ Version mismatch detected:");
    console.error(`  package.json:              ${versions.packageJson}`);
    console.error(`  package-lock.json:         ${versions.packageLockJson}`);
    console.error(`  server.json:               ${versions.serverJson}`);
    console.error(`  server.json (packages[0]): ${versions.serverJsonPackage}`);
    process.exit(1);
  }

  console.log(`✅ All versions match: ${versions.packageJson}`);
};

const syncVersions = (): void => {
  const root = getProjectRoot();
  const serverJsonPath = join(root, "server.json");

  const packageJson = readJsonFile<PackageJson>(join(root, "package.json"));
  const serverJson = readJsonFile<ServerJson>(serverJsonPath);

  const targetVersion = packageJson.version;

  serverJson.version = targetVersion;

  if (serverJson.packages[0]) {
    serverJson.packages[0].version = targetVersion;
  }

  writeFileSync(serverJsonPath, `${JSON.stringify(serverJson, null, 2)}\n`);

  console.log(`✅ Synced server.json to version ${targetVersion}`);
};

const command = process.argv[2] as Command | undefined;

if (!command) {
  console.error("❌ Error: Missing argument. Valid options: 'check' or 'sync'");
  process.exit(1);
}

if (command !== "check" && command !== "sync") {
  console.error(
    `❌ Error: Invalid argument '${command}'. Valid options: 'check' or 'sync'`,
  );
  process.exit(1);
}

try {
  if (command === "check") {
    checkVersions();
  } else {
    syncVersions();
  }
} catch (error) {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
}
