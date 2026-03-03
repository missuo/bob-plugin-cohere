import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY || API_KEY === "your_key_here") {
  console.error("Error: Please set COHERE_API_KEY in .env file");
  process.exit(1);
}

interface CohereModel {
  name: string;
  endpoints: string[];
}

interface CohereModelsResponse {
  models: CohereModel[];
}

async function fetchModels(): Promise<void> {
  const url =
    "https://api.cohere.com/v1/models?endpoint=chat&page_size=1000";

  const response = await fetch(url, {
    headers: {
      Authorization: `bearer ${API_KEY}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as CohereModelsResponse;
  const chatModels = data.models.filter((m) =>
    m.endpoints?.includes("chat")
  );

  // Words that should be fully uppercased
  const upperWords = new Set(["c4ai", "r7b", "ai"]);
  // Words that should stay lowercased (size suffixes handled by regex)
  const formatTitle = (name: string): string =>
    name
      .split("-")
      .map((w) => {
        if (upperWords.has(w.toLowerCase())) return w.toUpperCase();
        // Size suffixes like 8b, 32b → 8B, 32B
        if (/^\d+[bB]$/.test(w)) return w.toUpperCase();
        // Date segments like 03, 07, 08, 12 — keep as-is
        if (/^\d{2,4}$/.test(w)) return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");

  const menuValues = chatModels.map((m) => ({
    title: formatTitle(m.name),
    value: m.name,
  }));

  // Update info.json
  const infoPath = path.resolve(__dirname, "../src/info.json");
  const info = JSON.parse(fs.readFileSync(infoPath, "utf-8"));

  const modelOption = info.options.find(
    (opt: { identifier: string }) => opt.identifier === "model"
  );
  if (!modelOption) {
    throw new Error("Could not find model option in info.json");
  }

  const oldCount = modelOption.menuValues.length;
  modelOption.menuValues = menuValues;

  // Update defaultValue if it no longer exists in the new list
  const values = menuValues.map((m) => m.value);
  if (!values.includes(modelOption.defaultValue)) {
    // Prefer command-a, then command-r-plus, then first available
    const preferred = values.find((v) => v.startsWith("command-r-plus"))
      ?? values.find((v) => v.startsWith("command-r"))
      ?? values[0];
    console.log(`  Default model "${modelOption.defaultValue}" no longer available, updated to "${preferred}"`);
    modelOption.defaultValue = preferred;
  }

  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2) + "\n");

  console.log(`Updated info.json model list:`);
  console.log(`  Previous: ${oldCount} models`);
  console.log(`  Current:  ${menuValues.length} models`);
  console.log(`\nModels:`);
  menuValues.forEach((m) => console.log(`  - ${m.value}`));
}

fetchModels().catch((err) => {
  console.error("Failed to fetch models:", err);
  process.exit(1);
});
