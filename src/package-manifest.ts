import { readFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export interface PackageManifest {
  name?: string;
  version?: string;
  homepage?: string;
  bugs?: string | { url?: string };
  repository?: string | { url?: string; directory?: string };
  engines?: Record<string, string>;
  dependencies?: Record<string, string>;
}

async function readManifest(path: string): Promise<PackageManifest | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as PackageManifest;
  } catch {
    return undefined;
  }
}

export async function resolvePackageManifest(
  packageName: string,
): Promise<{ path: string; manifest: PackageManifest }> {
  try {
    const path = require.resolve(`${packageName}/package.json`);
    const manifest = await readManifest(path);
    if (manifest?.name === packageName) return { path, manifest };
  } catch {
    // Packages commonly hide package.json behind exports; walk up from the entrypoint.
  }

  let current: string;
  try {
    current = dirname(require.resolve(packageName));
  } catch {
    current = process.cwd();
  }
  const root = parse(current).root;
  while (current !== root) {
    const installedPath = join(current, "node_modules", packageName, "package.json");
    const installedManifest = await readManifest(installedPath);
    if (installedManifest?.name === packageName) {
      return { path: installedPath, manifest: installedManifest };
    }

    const path = join(current, "package.json");
    const manifest = await readManifest(path);
    if (manifest?.name === packageName) return { path, manifest };
    current = dirname(current);
  }

  throw new Error(`Could not locate package manifest for ${packageName}`);
}

export async function resolveDependencyManifest(
  parentManifestPath: string,
  dependencyName: string,
): Promise<{ path: string; manifest: PackageManifest }> {
  let current = dirname(parentManifestPath);
  const root = parse(current).root;
  while (current !== root) {
    const dependencyPath = join(current, "node_modules", dependencyName, "package.json");
    const dependencyManifest = await readManifest(dependencyPath);
    if (dependencyManifest?.name === dependencyName) {
      return { path: dependencyPath, manifest: dependencyManifest };
    }
    current = dirname(current);
  }
  return resolvePackageManifest(dependencyName);
}
