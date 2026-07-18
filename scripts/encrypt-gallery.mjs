import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const projectDir = resolve(import.meta.dirname, "..");
const sourceDir = join(projectDir, "private-gallery");
const outputFile = join(projectDir, "data", "gallery.enc.json");
const iterations = 600_000;

const mimeTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

const files = {};
for (const filePath of await listFiles(sourceDir)) {
  const key = relative(sourceDir, filePath).split(sep).join("/");
  const bytes = await readFile(filePath);
  files[key] = {
    mime: mimeTypes[extname(filePath).toLowerCase()] || "text/plain;charset=utf-8",
    data: bytes.toString("base64")
  };
}

if (!files["index.json"]) throw new Error("private-gallery/index.json is required.");

const payloadText = JSON.stringify({ version: 1, files });
const sourceDigest = createHash("sha256").update(payloadText).digest("hex");

if (process.argv.includes("--check")) {
  try {
    const bundle = JSON.parse(await readFile(outputFile, "utf8"));
    if (bundle.sourceDigest !== sourceDigest) {
      console.error("Encrypted Gallery is out of date.");
      process.exit(2);
    }
    console.log("Encrypted Gallery is current.");
    process.exit(0);
  } catch {
    console.error("Encrypted Gallery bundle is missing or invalid.");
    process.exit(2);
  }
}

const password = process.env.GALLERY_ENCRYPTION_PASSWORD;
if (!password || !/^\d{4}$/.test(password)) {
  throw new Error("Gallery PIN must contain exactly 4 digits.");
}

const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const plaintext = Buffer.from(payloadText, "utf8");
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const ciphertext = Buffer.concat([encrypted, cipher.getAuthTag()]);

const bundle = {
  version: 1,
  kdf: "PBKDF2-SHA256",
  iterations,
  cipher: "AES-256-GCM",
  sourceDigest,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: ciphertext.toString("base64")
};

await writeFile(outputFile, `${JSON.stringify(bundle)}\n`, { mode: 0o644 });
console.log(`Encrypted Gallery written to ${relative(projectDir, outputFile)}.`);
