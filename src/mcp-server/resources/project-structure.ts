/**
 * UE Conduit — Project Structure Resource
 *
 * MCP resource for editor://project
 * Returns project name, engine version, C++ modules, plugin list,
 * and content browser top-level folders.
 * Cached — refreshes on demand.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

export interface ProjectStructure {
  project_name: string;
  engine_version: string;
  cpp_modules: string[];
  plugins: Array<{ name: string; enabled: boolean; category: string }>;
  content_folders: string[];
  last_refreshed: string;
}

export class ProjectStructureResource {
  private ue5: UE5Client;
  private logger: Logger;
  private cache: ProjectStructure | null = null;

  constructor(ue5: UE5Client, logger: Logger) {
    this.ue5 = ue5;
    this.logger = logger;
  }

  /**
   * Refresh project structure from UE5.
   */
  async refresh(): Promise<ProjectStructure> {
    try {
      // Fetch project info
      const projectResponse = await this.ue5.executeCommand("editor", "get_project_info", {});

      // Fetch module list
      const modulesResponse = await this.ue5.executeCommand("editor", "list_modules", {});

      // Fetch plugin list
      const pluginsResponse = await this.ue5.executeCommand("editor", "list_plugins", {});

      // Fetch content browser top-level folders
      const contentResponse = await this.ue5.executeCommand("asset", "search", {
        path: "/Game/",
        recursive: false,
        type_filter: "",
        limit: 200,
      });

      const structure: ProjectStructure = {
        project_name: (projectResponse.output?.project_name as string) ?? "Unknown",
        engine_version: (projectResponse.output?.engine_version as string) ?? "5.7",
        cpp_modules: (modulesResponse.output?.modules as string[]) ?? [],
        plugins: (pluginsResponse.output?.plugins as ProjectStructure["plugins"]) ?? [],
        content_folders: (contentResponse.output?.folders as string[]) ?? [],
        last_refreshed: new Date().toISOString(),
      };

      this.cache = structure;
      this.logger.info(`Project structure refreshed: ${structure.project_name} (${structure.engine_version})`);
      return structure;
    } catch (error) {
      this.logger.warn("Failed to refresh project structure from UE5");
      return this.getStructure();
    }
  }

  /**
   * Get the cached project structure.
   */
  getStructure(): ProjectStructure {
    if (this.cache) {
      return this.cache;
    }
    return {
      project_name: "",
      engine_version: "",
      cpp_modules: [],
      plugins: [],
      content_folders: [],
      last_refreshed: "",
    };
  }

  /**
   * Get project structure as MCP resource contents.
   */
  async getResourceContents(): Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }> {
    // Refresh if no cache exists
    if (!this.cache) {
      await this.refresh();
    }

    return {
      contents: [
        {
          uri: "editor://project",
          mimeType: "application/json",
          text: JSON.stringify(this.getStructure(), null, 2),
        },
      ],
    };
  }
}
