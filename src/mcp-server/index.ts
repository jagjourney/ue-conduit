#!/usr/bin/env node

/**
 * UE Conduit with Claude — MCP Server
 *
 * Gives Claude Code and Claude Desktop direct control over Unreal Engine 5.
 * Connects to a UE5 editor plugin (Claudius or UEConduit) via HTTP
 * and exposes editor operations as MCP tools.
 *
 * Usage:
 *   npx ue-conduit
 *
 * Environment variables:
 *   UE5_HOST          — UE5 plugin host (default: localhost)
 *   UE5_PORT          — UE5 plugin HTTP port (default: 8080)
 *   UE5_API_KEY       — Authentication key (optional)
 *   UE5_PROJECT_PATH  — Path to .uproject file (optional, for context)
 *   UE5_LOG_LEVEL     — Logging verbosity: debug|info|warn|error (default: info)
 *
 *   LLM_PROVIDER      — AI provider: claude|openai|xai|gemini|ollama|custom (default: claude)
 *   LLM_API_KEY       — API key for the LLM provider (falls back to ANTHROPIC_API_KEY)
 *   LLM_MODEL         — Model ID (default: claude-sonnet-4-6)
 *   LLM_BASE_URL      — Custom endpoint URL (required for 'custom' provider)
 *   LLM_TEMPERATURE   — Sampling temperature 0.0-1.0 (default: 0.7)
 *   LLM_MAX_TOKENS    — Max response tokens (default: 4096)
 *
 * @author Jag Journey, LLC
 * @license MIT
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { UE5Client } from "./connection/ue5-client.js";
import { WebSocketClient } from "./connection/websocket-client.js";
import { Logger } from "./utils/logger.js";

// Tools
import { registerActorTools } from "./tools/actor-tools.js";
import { registerBlueprintTools } from "./tools/blueprint-tools.js";
import { registerAssetTools } from "./tools/asset-tools.js";
import { registerCompileTools } from "./tools/compile-tools.js";
import { registerPIETools } from "./tools/pie-tools.js";
import { registerEditorTools } from "./tools/editor-tools.js";
import { registerLandscapeTools } from "./tools/landscape-tools.js";
import { registerWidgetTools } from "./tools/widget-tools.js";
import { registerAnimationTools } from "./tools/animation-tools.js";
import { registerInputTools } from "./tools/input-tools.js";
import { registerAITools } from "./tools/ai-tools.js";
import { registerNiagaraTools } from "./tools/niagara-tools.js";
import { registerDataTools } from "./tools/data-tools.js";
import { registerWaterTools } from "./tools/water-tools.js";
import { registerFoliageTools } from "./tools/foliage-tools.js";
import { registerFabTools } from "./tools/fab-tools.js";
import { registerScreenshotTools } from "./tools/screenshot-tools.js";
import { registerLevelStreamingTools } from "./tools/level-streaming-tools.js";
import { registerPostProcessTools } from "./tools/postprocess-tools.js";
import { registerAudioTools } from "./tools/audio-tools.js";
import { registerPhysicsTools } from "./tools/physics-tools.js";
import { registerSourceControlTools } from "./tools/source-control-tools.js";
import { registerProjectSettingsTools } from "./tools/project-settings-tools.js";
import { registerScriptingTools } from "./tools/scripting-tools.js";
import { registerSequencerTools } from "./tools/sequencer-tools.js";
import { registerMetaHumanTools } from "./tools/metahuman-tools.js";
import { registerPCGTools } from "./tools/pcg-tools.js";
import { registerWorldPartitionTools } from "./tools/world-partition-tools.js";
import { registerModelingTools } from "./tools/modeling-tools.js";
import { registerTextureTools } from "./tools/texture-tools.js";
import { registerGameplayTools } from "./tools/gameplay-tools.js";
import { registerNavigationTools } from "./tools/navigation-tools.js";
import { registerDialogueTools } from "./tools/dialogue-tools.js";
import { registerSaveGameTools } from "./tools/savegame-tools.js";
import { registerMultiplayerTools } from "./tools/multiplayer-tools.js";
import { registerWidgetAdvancedTools } from "./tools/widget-advanced-tools.js";
import { registerBuildAdvancedTools } from "./tools/build-advanced-tools.js";
import { registerGitTools } from "./tools/git-tools.js";
import { registerMarketplaceTools } from "./tools/marketplace-tools.js";
import { registerLLMTools } from "./tools/llm-tools.js";

// LLM Provider
import { LLMProviderManager } from "./llm/provider-factory.js";

// Resources
import { EditorStateResource } from "./resources/editor-state.js";
import { BuildStatusResource } from "./resources/build-status.js";
import { ProjectStructureResource } from "./resources/project-structure.js";
import { GameLogResource } from "./resources/game-log.js";

// Orchestration
import { BuildTestFixLoop } from "./orchestration/build-test-fix.js";
import { AssetPipeline } from "./orchestration/asset-pipeline.js";
import { LevelBuilder } from "./orchestration/level-builder.js";

async function main() {
  const config = loadConfig();
  const logger = new Logger(config.logLevel);

  logger.info("UE Conduit v1.0.0 starting...");
  logger.info(`UE5 target: ${config.ue5Host}:${config.ue5Port}`);

  // Initialize UE5 HTTP client
  const ue5 = new UE5Client(config);

  // Initialize WebSocket client for real-time event streams
  const wsClient = new WebSocketClient(config, logger);

  // Initialize MCP resources
  const editorStateResource = new EditorStateResource(ue5, logger, config.healthCheckIntervalMs);
  const buildStatusResource = new BuildStatusResource(ue5, logger);
  const projectStructureResource = new ProjectStructureResource(ue5, logger);
  const gameLogResource = new GameLogResource(ue5, logger);

  // Wire WebSocket log stream into the game log resource
  wsClient.on("log", (event) => {
    const line = (event.data.line as string) ?? (event.data.message as string) ?? "";
    if (line) {
      gameLogResource.appendRawLines([line]);
    }
  });

  // Wire WebSocket compile stream into the build status resource
  wsClient.on("compile", (event) => {
    if (event.data.complete) {
      buildStatusResource.recordBuild({
        status: ((event.data.error_count as number) ?? 0) > 0 ? "errors" : "clean",
        errors: (event.data.errors as string[]) ?? [],
        warnings: (event.data.warnings as string[]) ?? [],
        duration_ms: (event.data.duration_ms as number) ?? 0,
        timestamp: event.timestamp,
        module: (event.data.module as string) ?? "",
      });
    }
  });

  // Initialize LLM provider manager
  const llmManager = new LLMProviderManager({
    provider: config.llmProvider,
    apiKey: config.llmApiKey,
    model: config.llmModel,
    baseUrl: config.llmBaseUrl || undefined,
    temperature: config.llmTemperature,
    maxTokens: config.llmMaxTokens,
  });
  logger.info(`LLM provider: ${llmManager.getProvider().name} (model: ${config.llmModel})`);

  // Initialize orchestration engines
  const buildTestFix = new BuildTestFixLoop(ue5, buildStatusResource, gameLogResource, logger);
  const assetPipeline = new AssetPipeline(ue5, logger, config.batchSize);
  const levelBuilder = new LevelBuilder(ue5, logger);

  // Create MCP server
  const server = new McpServer({
    name: "ue-conduit",
    version: "1.0.0",
  });

  // ─── Register all tool categories ───────────────────────────────────
  registerActorTools(server, ue5);
  registerBlueprintTools(server, ue5);
  registerAssetTools(server, ue5);
  registerCompileTools(server, ue5);
  registerPIETools(server, ue5);
  registerEditorTools(server, ue5);
  registerLandscapeTools(server, ue5);
  registerWidgetTools(server, ue5);
  registerAnimationTools(server, ue5);
  registerInputTools(server, ue5);
  registerAITools(server, ue5);
  registerNiagaraTools(server, ue5);
  registerDataTools(server, ue5);
  registerWaterTools(server, ue5);
  registerFoliageTools(server, ue5);
  registerFabTools(server, ue5);
  registerScreenshotTools(server, ue5);
  registerLevelStreamingTools(server, ue5);
  registerPostProcessTools(server, ue5);
  registerAudioTools(server, ue5);
  registerPhysicsTools(server, ue5);
  registerSourceControlTools(server, ue5);
  registerProjectSettingsTools(server, ue5);
  registerScriptingTools(server, ue5);

  // ─── Phase 2: Expanded tool categories (100+ new commands) ─────────
  registerSequencerTools(server, ue5);
  registerMetaHumanTools(server, ue5);
  registerPCGTools(server, ue5);
  registerWorldPartitionTools(server, ue5);
  registerModelingTools(server, ue5);
  registerTextureTools(server, ue5);
  registerGameplayTools(server, ue5);
  registerNavigationTools(server, ue5);
  registerDialogueTools(server, ue5);
  registerSaveGameTools(server, ue5);
  registerMultiplayerTools(server, ue5);
  registerWidgetAdvancedTools(server, ue5);
  registerBuildAdvancedTools(server, ue5);
  registerGitTools(server, ue5);
  registerMarketplaceTools(server, ue5);

  // ─── LLM-powered tools (multi-provider AI) ─────────────────────────
  registerLLMTools(server, ue5, llmManager);

  // ─── Register MCP resources ─────────────────────────────────────────

  server.resource(
    "editor-state",
    "editor://state",
    async () => editorStateResource.getResourceContents()
  );

  server.resource(
    "build-status",
    "editor://build",
    async () => buildStatusResource.getResourceContents()
  );

  server.resource(
    "project-structure",
    "editor://project",
    async () => projectStructureResource.getResourceContents()
  );

  server.resource(
    "game-log",
    "editor://log",
    async () => gameLogResource.getResourceContents()
  );

  // ─── Register orchestration tools ───────────────────────────────────

  server.tool(
    "ue5_build_test_fix",
    "Run an autonomous compile-test cycle. Compiles C++, starts PIE if clean, checks for runtime errors, takes a screenshot on success. Returns structured results with errors for Claude to fix and retry.",
    {
      task_description: z.string().describe("What was changed — used for logging and screenshot naming"),
      max_iterations: z.number().default(10).describe("Maximum compile attempts before aborting"),
    },
    async (params: any) => {
      const result = await buildTestFix.run(params.task_description, params.max_iterations);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_import_directory",
    "Batch import an entire directory of assets into UE5. Auto-categorizes files by type (textures, meshes, audio), detects normal maps, and imports in configurable batches.",
    {
      source_path: z.string().describe("Absolute path to directory with files to import"),
      dest_path: z.string().describe("Content browser destination base path (e.g., /Game/Assets/ShatteredCoast/)"),
      batch_size: z.number().optional().describe("Files per batch (default: 50)"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
      organize_by_type: z.boolean().default(true).describe("Create Textures/, Meshes/, Audio/ subfolders"),
      auto_detect_normals: z.boolean().default(true).describe("Auto-detect normal maps from filename patterns"),
    },
    async (params: any) => {
      const result = await assetPipeline.importDirectory(
        params.source_path,
        params.dest_path,
        {
          batchSize: params.batch_size,
          recursive: params.recursive,
          organizeByType: params.organize_by_type,
          autoDetectNormalMaps: params.auto_detect_normals,
        }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_populate_zone",
    "Build a zone from a game-data JSON file. Spawns NPCs, enemies, gathering nodes, spawn points, and ambient sounds. Configures lighting from zone definition.",
    {
      zone_data_path: z.string().describe("Path to zone JSON file (e.g., game-data/zones/shattered_coast.json)"),
    },
    async (params: any) => {
      const result = await levelBuilder.populateZone(params.zone_data_path);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Start connections ──────────────────────────────────────────────

  // Attempt initial HTTP connection (non-blocking — tools will retry if UE5 isn't ready)
  const connected = await ue5.connect();
  if (connected) {
    logger.info("UE5 editor connected and ready");

    // Start polling resources and WebSocket only if initial connection succeeds
    editorStateResource.start();
    wsClient.connect();

    // Pre-cache project structure
    projectStructureResource.refresh().catch(() => {
      logger.debug("Initial project structure refresh failed — will retry on demand");
    });
  } else {
    logger.warn("UE5 editor not available — tools will connect on first use");
  }

  // Start MCP server on stdio transport (for Claude Code / Claude Desktop)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("MCP server running — waiting for Claude Code commands");

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down...");
    editorStateResource.stop();
    wsClient.disconnect();
    await ue5.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
