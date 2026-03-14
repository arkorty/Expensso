#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, 'version.config.json');
const packagePath = path.join(rootDir, 'package.json');
const appJsonPath = path.join(rootDir, 'app.json');
const androidGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
const iosPbxprojPath = path.join(rootDir, 'ios', 'Expensso.xcodeproj', 'project.pbxproj');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function readVersionConfig() {
  const config = readJson(configPath);

  if (!isValidVersion(config.version)) {
    throw new Error(`Invalid version in version.config.json: ${config.version}`);
  }

  if (!Number.isInteger(config.buildNumber) || config.buildNumber < 1) {
    throw new Error(`Invalid buildNumber in version.config.json: ${config.buildNumber}`);
  }

  return config;
}

function isValidVersion(version) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version);
}

function bumpVersion(version, type) {
  const base = version.split('-')[0].split('+')[0];
  const [major, minor, patch] = base.split('.').map(Number);

  if (![major, minor, patch].every(Number.isInteger)) {
    throw new Error(`Cannot bump invalid version: ${version}`);
  }

  if (type === 'major') {
    return `${major + 1}.0.0`;
  }

  if (type === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  if (type === 'patch') {
    return `${major}.${minor}.${patch + 1}`;
  }

  throw new Error(`Unsupported bump type: ${type}`);
}

function replaceOrThrow(content, regex, replacement, targetName) {
  if (!regex.test(content)) {
    throw new Error(`Could not update ${targetName}. Expected pattern not found.`);
  }

  const updated = content.replace(regex, replacement);

  return updated;
}

function syncToTargets({version, buildNumber}) {
  const packageJson = readJson(packagePath);
  packageJson.version = version;
  writeJson(packagePath, packageJson);

  const appJson = readJson(appJsonPath);
  appJson.version = version;
  appJson.android = {...(appJson.android || {}), versionCode: buildNumber};
  appJson.ios = {...(appJson.ios || {}), buildNumber: String(buildNumber)};
  writeJson(appJsonPath, appJson);

  let gradle = fs.readFileSync(androidGradlePath, 'utf8');
  gradle = replaceOrThrow(
    gradle,
    /versionCode\s+\d+/,
    `versionCode ${buildNumber}`,
    'android versionCode',
  );
  gradle = replaceOrThrow(
    gradle,
    /versionName\s+"[^"]+"/,
    `versionName "${version}"`,
    'android versionName',
  );
  fs.writeFileSync(androidGradlePath, gradle, 'utf8');

  let pbxproj = fs.readFileSync(iosPbxprojPath, 'utf8');
  pbxproj = replaceOrThrow(
    pbxproj,
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${version};`,
    'iOS MARKETING_VERSION',
  );
  pbxproj = replaceOrThrow(
    pbxproj,
    /CURRENT_PROJECT_VERSION = [^;]+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    'iOS CURRENT_PROJECT_VERSION',
  );
  fs.writeFileSync(iosPbxprojPath, pbxproj, 'utf8');
}

function saveConfig(config) {
  writeJson(configPath, config);
}

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/version.js sync');
  console.log('  node scripts/version.js set <version> [buildNumber]');
  console.log('  node scripts/version.js bump <major|minor|patch|build>');
}

function main() {
  const [, , command, arg1, arg2] = process.argv;

  if (!command) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (command === 'sync') {
    const config = readVersionConfig();
    syncToTargets(config);
    console.log(`Synced version ${config.version} (${config.buildNumber})`);
    return;
  }

  if (command === 'set') {
    if (!arg1 || !isValidVersion(arg1)) {
      throw new Error('set requires a valid semver, e.g. 1.2.3');
    }

    const config = readVersionConfig();
    const nextBuildNumber = arg2 ? Number(arg2) : config.buildNumber;

    if (!Number.isInteger(nextBuildNumber) || nextBuildNumber < 1) {
      throw new Error('buildNumber must be a positive integer');
    }

    const next = {version: arg1, buildNumber: nextBuildNumber};
    saveConfig(next);
    syncToTargets(next);
    console.log(`Set version to ${next.version} (${next.buildNumber})`);
    return;
  }

  if (command === 'bump') {
    if (!arg1 || !['major', 'minor', 'patch', 'build'].includes(arg1)) {
      throw new Error('bump requires one of: major, minor, patch, build');
    }

    const config = readVersionConfig();
    const next = {
      version: arg1 === 'build' ? config.version : bumpVersion(config.version, arg1),
      buildNumber: config.buildNumber + 1,
    };

    saveConfig(next);
    syncToTargets(next);
    console.log(`Bumped to ${next.version} (${next.buildNumber})`);
    return;
  }

  printUsage();
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
