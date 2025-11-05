#!/usr/bin/env tsx
/**
 * Script to measure the MCP context size (token count) for all tools.
 * Run with: tsx measure-context.ts [--detailed] [--json]
 */

import { createServer } from "./src/server.js";
import { Tiktoken } from "tiktoken/lite";
import cl100k_base from "tiktoken/encoders/cl100k_base.json" assert { type: "json" };
import * as fs from "node:fs";
import * as path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

// Create tokenizer
const tokenizer = new Tiktoken(
  cl100k_base.bpe_ranks,
  cl100k_base.special_tokens,
  cl100k_base.pat_str,
);

interface ToolAnalysis {
  name: string;
  descriptionTokens: number;
  schemaTokens: number;
  totalTokens: number;
  descriptionLength: number;
  schemaLength: number;
}

function countTokens(text: string): number {
  const tokens = tokenizer.encode(text);
  return tokens.length;
}

async function main() {
  const args = process.argv.slice(2);
  const detailed = args.includes("--detailed");
  const json = args.includes("--json");
  const saveBaseline = args.includes("--save-baseline");
  const compare = args.includes("--compare");

  try {
    // Create server instance
    const { server } = createServer();

    // Get tools from the registered tools list
    // @ts-ignore - accessing internal property
    const registeredToolsMap = server._registeredTools || {};
    const registeredTools = Object.entries(registeredToolsMap).map(([name, tool]: [string, any]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    if (registeredTools.length === 0) {
      console.error("❌ No tools found");
      process.exit(1);
    }
    // Analyze each tool
    const analyses: ToolAnalysis[] = registeredTools.map((tool: any) => {
      // Convert Zod schema to JSON Schema (this is what the MCP client actually receives)
      const jsonSchema = zodToJsonSchema(tool.inputSchema, { $refStrategy: "none" });
      const schemaJson = JSON.stringify(jsonSchema, null, 2);

      return {
        name: tool.name,
        descriptionTokens: countTokens(tool.description || ""),
        schemaTokens: countTokens(schemaJson),
        totalTokens: countTokens((tool.description || "") + schemaJson),
        descriptionLength: (tool.description || "").length,
        schemaLength: schemaJson.length,
      };
    });

    const totalTokens = analyses.reduce((sum, t) => sum + t.totalTokens, 0);
    const totalChars = analyses.reduce((sum, t) => sum + t.descriptionLength + t.schemaLength, 0);
    const sortedTools = [...analyses].sort((a, b) => b.totalTokens - a.totalTokens);

    if (json) {
      console.log(JSON.stringify({
        totalTokens,
        toolCount: registeredTools.length,
        averageTokensPerTool: Math.round(totalTokens / registeredTools.length),
        estimatedCharacters: totalChars,
        tools: analyses,
        largestTools: sortedTools.slice(0, 10),
      }, null, 2));
      tokenizer.free();
      return;
    }

    // Display results
    console.log("\n" + "═".repeat(80));
    console.log("📊 MCP CONTEXT SIZE ANALYSIS");
    console.log("═".repeat(80) + "\n");

    console.log("📈 Summary Statistics:");
    console.log(`   Total Tokens:              ${totalTokens.toLocaleString()}`);
    console.log(`   Total Characters:          ${totalChars.toLocaleString()}`);
    console.log(`   Number of Tools:           ${registeredTools.length}`);
    console.log(`   Average Tokens per Tool:   ${Math.round(totalTokens / registeredTools.length)}`);
    console.log(`   Token/Character Ratio:     ${(totalTokens / totalChars).toFixed(2)}`);

    console.log("\n🔝 Top 10 Largest Tools by Token Count:");
    console.log("─".repeat(80));
    console.log("   #  │ Tool Name                          │ Tokens │ Desc │ Schema");
    console.log("─".repeat(80));

    sortedTools.slice(0, 10).forEach((tool, index) => {
      const rank = (index + 1).toString().padStart(3);
      const name = tool.name.padEnd(35);
      const total = tool.totalTokens.toString().padStart(6);
      const desc = tool.descriptionTokens.toString().padStart(4);
      const schema = tool.schemaTokens.toString().padStart(6);
      console.log(`   ${rank} │ ${name} │ ${total} │ ${desc} │ ${schema}`);
    });

    if (detailed) {
      console.log("\n📋 All Tools (sorted by token count):");
      console.log("─".repeat(80));

      for (const tool of sortedTools) {
        console.log(`\n   ${tool.name}`);
        console.log(`   ${"─".repeat(tool.name.length)}`);
        console.log(`   Description: ${tool.descriptionLength} chars, ${tool.descriptionTokens} tokens`);
        console.log(`   Schema:      ${tool.schemaLength} chars, ${tool.schemaTokens} tokens`);
        console.log(`   TOTAL:       ${tool.totalTokens} tokens`);
      }
    }

    if (saveBaseline) {
      const baseline = {
        timestamp: new Date().toISOString(),
        totalTokens,
        toolCount: registeredTools.length,
        averageTokensPerTool: Math.round(totalTokens / registeredTools.length),
        tools: analyses.map(t => ({ name: t.name, totalTokens: t.totalTokens })),
      };

      const baselineDir = path.join(process.cwd(), ".context-baseline");
      const baselinePath = path.join(baselineDir, "baseline.json");

      if (!fs.existsSync(baselineDir)) {
        fs.mkdirSync(baselineDir, { recursive: true });
      }

      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
      console.log(`\n✅ Baseline saved to ${baselinePath}`);
    }

    if (compare) {
      const baselinePath = path.join(process.cwd(), ".context-baseline", "baseline.json");

      if (!fs.existsSync(baselinePath)) {
        console.log("\n⚠️  No baseline found. Run with --save-baseline to create one.");
      } else {
        const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
        const diff = totalTokens - baseline.totalTokens;
        const percentChange = ((diff / baseline.totalTokens) * 100).toFixed(2);

        console.log("\n📊 Comparison with Baseline:");
        console.log("─".repeat(80));
        console.log(`   Baseline (${new Date(baseline.timestamp).toLocaleString()}):`);
        console.log(`      Total Tokens: ${baseline.totalTokens.toLocaleString()}`);
        console.log(`      Tool Count:   ${baseline.toolCount}`);
        console.log(`\n   Current:`);
        console.log(`      Total Tokens: ${totalTokens.toLocaleString()}`);
        console.log(`      Tool Count:   ${registeredTools.length}`);
        console.log(`\n   Change:`);

        if (diff > 0) {
          console.log(`      +${diff.toLocaleString()} tokens (+${percentChange}%) ⚠️`);
        } else if (diff < 0) {
          console.log(`      ${diff.toLocaleString()} tokens (${percentChange}%) ✅`);
        } else {
          console.log(`      No change`);
        }

        console.log("─".repeat(80));
      }
    }

    console.log("\n" + "═".repeat(80));
    console.log("💡 Optimization Tips:");
    console.log("   • Focus on tools with high description token counts");
    console.log("   • Remove unnecessary words if context is clear");
    console.log("   • Simplify schema descriptions (.describe() text)");
    console.log("   • Use abbreviations where appropriate");
    console.log("   • Target: < 30,000 tokens for optimal performance");
    console.log("═".repeat(80) + "\n");

    if (totalTokens > 35000) {
      console.error(`⚠️  WARNING: Context size (${totalTokens}) exceeds 35,000 tokens!`);
      if (process.env.CI) {
        process.exit(1);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    tokenizer.free();
  }
}

main();
