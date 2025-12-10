#!/usr/bin/env node
import process from 'node:process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LEVELS = ['major', 'minor', 'patch']
const DEFAULT_LEVEL = 'patch'

function resolvePaths() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const rootDir = path.join(__dirname, '..')
  return {
    rootDir,
    packageJsonPath: path.join(rootDir, 'package.json'),
    versionFilePath: path.join(rootDir, 'src', 'config', 'version.ts')
  }
}

function parseArgs(argv) {
  if (!argv.length) return DEFAULT_LEVEL
  const direct = argv.find(arg => LEVELS.includes(arg))
  if (direct) return direct
  const levelFlagIndex = argv.findIndex(arg => arg === '--level')
  if (levelFlagIndex !== -1 && LEVELS.includes(argv[levelFlagIndex + 1])) {
    return argv[levelFlagIndex + 1]
  }
  return DEFAULT_LEVEL
}

function bumpVersion(version, level) {
  const [major, minor, patch] = version.split('.').map(Number)
  if ([major, minor, patch].some(Number.isNaN)) {
    throw new Error(`Version invalide: ${version}`)
  }
  const next = { major, minor, patch }
  if (level === 'major') {
    next.major += 1
    next.minor = 0
    next.patch = 0
  } else if (level === 'minor') {
    next.minor += 1
    next.patch = 0
  } else {
    next.patch += 1
  }
  return `${next.major}.${next.minor}.${next.patch}`
}

function formatAppVersion(semver) {
  const [major, minor, patch] = semver.split('.')
  const pad = (value) => value.toString().padStart(2, '0')
  return `V${pad(major)}.${pad(minor)}.${pad(patch)}`
}

async function updatePackageJson(packageJsonPath, newVersion) {
  const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const oldVersion = pkg.version
  pkg.version = newVersion
  await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  return oldVersion
}

async function updateVersionFile(versionFilePath, newAppVersion, isoDate) {
  let content = await readFile(versionFilePath, 'utf8')

  content = content.replace(
    /(export const APP_VERSION = ')V?[^']+(' as const)/,
    `$1${newAppVersion}$2`
  )

  content = content.replace(
    /(updatedAt:\s*')[^']+(')/,
    `$1${isoDate}$2`
  )

  await writeFile(versionFilePath, content, 'utf8')
}

async function main() {
  const level = parseArgs(process.argv.slice(2))
  if (!LEVELS.includes(level)) {
    console.error(`Niveau inconnu: ${level}. Utilise ${LEVELS.join(', ')}`)
    process.exit(1)
  }

  const { packageJsonPath, versionFilePath } = resolvePaths()

  const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const previousVersion = pkg.version
  const nextVersion = bumpVersion(previousVersion, level)
  const nextAppVersion = formatAppVersion(nextVersion)
  const isoDate = new Date().toISOString()

  await updatePackageJson(packageJsonPath, nextVersion)
  await updateVersionFile(versionFilePath, nextAppVersion, isoDate)

  console.log(`✅ Version bump (${level}) : ${previousVersion} -> ${nextVersion}`)
  console.log(`   APP_VERSION : ${formatAppVersion(previousVersion)} -> ${nextAppVersion}`)
  console.log(`   Timestamp   : ${isoDate}`)
}

main().catch((err) => {
  console.error('❌ Bump version échoué:', err)
  process.exit(1)
})
