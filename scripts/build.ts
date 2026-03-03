import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const srcDir = path.resolve(__dirname, "../src");
const buildDir = path.resolve(__dirname, "../build");

// Clean build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir, { recursive: true });

// Build TypeScript files
const tsFiles = ["main.ts", "lang.ts"];

for (const file of tsFiles) {
  const entryPoint = path.join(srcDir, file);
  const outfile = path.join(buildDir, file.replace(".ts", ".js"));

  esbuild.buildSync({
    entryPoints: [entryPoint],
    outfile,
    format: "cjs",
    platform: "neutral",
    target: "es2020",
    bundle: false,
  });

  console.log(`Built: ${file} -> ${outfile}`);
}

// Copy non-TS files
const copyFiles = ["info.json", "icon.png"];
for (const file of copyFiles) {
  const src = path.join(srcDir, file);
  const dest = path.join(buildDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  }
}

console.log("Build complete!");
