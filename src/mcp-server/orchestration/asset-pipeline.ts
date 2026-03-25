/**
 * UE Conduit — Asset Pipeline Orchestration
 *
 * Batch import entire directories with auto-categorization,
 * and auto-generate materials from texture sets.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

/** File type categories for import routing */
const ASSET_CATEGORIES: Record<string, { extensions: string[]; destSubfolder: string; type: string }> = {
  textures: {
    extensions: [".png", ".jpg", ".jpeg", ".tga", ".bmp", ".tiff", ".exr", ".hdr"],
    destSubfolder: "Textures",
    type: "texture",
  },
  meshes: {
    extensions: [".fbx", ".obj", ".gltf", ".glb"],
    destSubfolder: "Meshes",
    type: "mesh",
  },
  audio: {
    extensions: [".wav", ".ogg", ".mp3", ".flac"],
    destSubfolder: "Audio",
    type: "audio",
  },
  animations: {
    extensions: [".fbx"],
    destSubfolder: "Animations",
    type: "animation",
  },
};

/** Patterns indicating a normal map texture */
const NORMAL_MAP_PATTERNS = [
  "_normal",
  "_nm",
  "_nrm",
  "_nor",
  "_n.",
  "_normalmap",
  "_normal_map",
];

/** Patterns indicating texture slots */
const TEXTURE_SLOT_PATTERNS: Record<string, string[]> = {
  base_color: ["_diffuse", "_diff", "_albedo", "_basecolor", "_base_color", "_color", "_d.", "_bc."],
  normal: ["_normal", "_nm", "_nrm", "_nor", "_n.", "_normalmap"],
  roughness: ["_roughness", "_rough", "_r.", "_rgh"],
  metallic: ["_metallic", "_metal", "_met", "_m."],
  occlusion: ["_ao", "_occlusion", "_ambient_occlusion", "_occ"],
  emissive: ["_emissive", "_emit", "_glow", "_e."],
  height: ["_height", "_disp", "_displacement", "_h."],
  opacity: ["_opacity", "_alpha", "_mask"],
};

export interface ImportOptions {
  batchSize?: number;
  recursive?: boolean;
  organizeByType?: boolean;
  autoDetectNormalMaps?: boolean;
}

export interface ImportSummary {
  total_files: number;
  imported: number;
  failed: number;
  skipped: number;
  by_category: Record<string, number>;
  failures: Array<{ file: string; error: string }>;
  duration_ms: number;
}

export interface MaterialGenerationSummary {
  texture_groups_found: number;
  materials_created: number;
  failed: number;
  materials: Array<{
    name: string;
    textures: Record<string, string>;
  }>;
  failures: Array<{ group: string; error: string }>;
}

export class AssetPipeline {
  private ue5: UE5Client;
  private logger: Logger;
  private defaultBatchSize: number;

  constructor(ue5: UE5Client, logger: Logger, defaultBatchSize = 50) {
    this.ue5 = ue5;
    this.logger = logger;
    this.defaultBatchSize = defaultBatchSize;
  }

  /**
   * Import an entire directory of assets into UE5.
   *
   * - Scans source directory for importable files
   * - Categorizes by type (texture, mesh, audio)
   * - Imports in batches
   * - Auto-detects normal maps and sets compression accordingly
   */
  async importDirectory(
    sourcePath: string,
    destPath: string,
    options?: ImportOptions
  ): Promise<ImportSummary> {
    const startTime = Date.now();
    const batchSize = options?.batchSize ?? this.defaultBatchSize;
    const autoDetectNormals = options?.autoDetectNormalMaps ?? true;
    const organizeByType = options?.organizeByType ?? true;

    this.logger.info(`Asset import started: ${sourcePath} → ${destPath}`);

    // Step 1: Scan source directory
    const files = await this.scanDirectory(sourcePath, options?.recursive ?? true);
    this.logger.info(`Found ${files.length} files to import`);

    if (files.length === 0) {
      return {
        total_files: 0,
        imported: 0,
        failed: 0,
        skipped: 0,
        by_category: {},
        failures: [],
        duration_ms: Date.now() - startTime,
      };
    }

    // Step 2: Categorize files
    const categorized = this.categorizeFiles(files);

    // Step 3: Import in batches by category
    const summary: ImportSummary = {
      total_files: files.length,
      imported: 0,
      failed: 0,
      skipped: 0,
      by_category: {},
      failures: [],
      duration_ms: 0,
    };

    for (const [category, categoryFiles] of Object.entries(categorized)) {
      const categoryConfig = ASSET_CATEGORIES[category];
      if (!categoryConfig) continue;

      const categoryDest = organizeByType
        ? `${destPath}/${categoryConfig.destSubfolder}/`
        : destPath;

      summary.by_category[category] = 0;

      // Process in batches
      for (let i = 0; i < categoryFiles.length; i += batchSize) {
        const batch = categoryFiles.slice(i, i + batchSize);
        this.logger.info(
          `Importing ${category} batch ${Math.floor(i / batchSize) + 1}: ${batch.length} files`
        );

        for (const file of batch) {
          try {
            const importSettings = this.getImportSettings(file, categoryConfig.type, autoDetectNormals);
            await this.ue5.executeCommand("asset", "import", {
              source_path: file,
              destination: categoryDest,
              asset_name: "",
              import_settings: importSettings,
            });

            summary.imported++;
            summary.by_category[category]!++;
          } catch (error) {
            summary.failed++;
            summary.failures.push({
              file,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    }

    summary.skipped = files.length - summary.imported - summary.failed;
    summary.duration_ms = Date.now() - startTime;

    this.logger.info(
      `Asset import complete: ${summary.imported}/${summary.total_files} imported, ${summary.failed} failed`
    );

    return summary;
  }

  /**
   * Create material instances for texture sets in a content path.
   *
   * Groups textures by base name (e.g., sword_01_diffuse, sword_01_normal → sword_01)
   * and creates a material instance per group with textures assigned to correct slots.
   */
  async createMaterialsForTextures(
    texturePath: string,
    parentMaterial: string
  ): Promise<MaterialGenerationSummary> {
    this.logger.info(`Auto-material generation: ${texturePath} using parent ${parentMaterial}`);

    // Step 1: List all textures in the path
    const textureList = await this.listTexturesInPath(texturePath);
    this.logger.info(`Found ${textureList.length} textures`);

    // Step 2: Group by base name
    const groups = this.groupTexturesByBaseName(textureList);
    this.logger.info(`Detected ${Object.keys(groups).length} texture groups`);

    const summary: MaterialGenerationSummary = {
      texture_groups_found: Object.keys(groups).length,
      materials_created: 0,
      failed: 0,
      materials: [],
      failures: [],
    };

    // Step 3: Create a material instance for each group
    for (const [baseName, textures] of Object.entries(groups)) {
      try {
        const materialName = `MI_${baseName}`;
        const textureParams: Record<string, string> = {};

        for (const [slot, textureName] of Object.entries(textures)) {
          textureParams[slot] = `${texturePath}/${textureName}`;
        }

        await this.ue5.executeCommand("asset", "create_material_instance", {
          name: materialName,
          parent: parentMaterial,
          path: `${texturePath}/Materials/`,
          texture_params: textureParams,
          scalar_params: {},
          vector_params: {},
        });

        summary.materials_created++;
        summary.materials.push({
          name: materialName,
          textures: textureParams,
        });

        this.logger.debug(`Created material instance: ${materialName}`);
      } catch (error) {
        summary.failed++;
        summary.failures.push({
          group: baseName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info(
      `Material generation complete: ${summary.materials_created}/${summary.texture_groups_found} created`
    );

    return summary;
  }

  /**
   * Scan a directory for importable files via UE5.
   */
  private async scanDirectory(sourcePath: string, recursive: boolean): Promise<string[]> {
    try {
      const response = await this.ue5.executeCommand("filesystem", "scan_directory", {
        path: sourcePath,
        recursive,
        extensions: Object.values(ASSET_CATEGORIES)
          .flatMap((c) => c.extensions),
      });

      return (response.output?.files as string[]) ?? [];
    } catch {
      this.logger.warn("Directory scan via UE5 failed — returning empty file list");
      return [];
    }
  }

  /**
   * Categorize files by their extension into asset type groups.
   */
  private categorizeFiles(files: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const file of files) {
      const ext = this.getExtension(file).toLowerCase();

      for (const [category, config] of Object.entries(ASSET_CATEGORIES)) {
        if (config.extensions.includes(ext)) {
          if (!result[category]) {
            result[category] = [];
          }
          result[category].push(file);
          break;
        }
      }
    }

    return result;
  }

  /**
   * Determine import settings based on file type and name.
   */
  private getImportSettings(
    filePath: string,
    type: string,
    autoDetectNormals: boolean
  ): Record<string, unknown> {
    const fileName = this.getFileName(filePath).toLowerCase();

    if (type === "texture") {
      const isNormalMap =
        autoDetectNormals && NORMAL_MAP_PATTERNS.some((p) => fileName.includes(p));

      return {
        compression: isNormalMap ? "TC_Normalmap" : "TC_Default",
        srgb: !isNormalMap,
      };
    }

    if (type === "mesh") {
      return {
        import_as_skeletal: false,
      };
    }

    return {};
  }

  /**
   * List all texture assets in a content browser path.
   */
  private async listTexturesInPath(path: string): Promise<string[]> {
    try {
      const response = await this.ue5.executeCommand("asset", "search", {
        path,
        type_filter: "Texture2D",
        recursive: true,
        limit: 1000,
      });

      return (response.output?.assets as string[]) ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Group textures by their base name, detecting which slot each belongs to.
   *
   * Example: ["sword_01_diffuse", "sword_01_normal", "sword_01_roughness"]
   *   → { "sword_01": { base_color: "sword_01_diffuse", normal: "sword_01_normal", ... } }
   */
  private groupTexturesByBaseName(
    textures: string[]
  ): Record<string, Record<string, string>> {
    const groups: Record<string, Record<string, string>> = {};

    for (const texture of textures) {
      const name = this.getFileName(texture).toLowerCase();

      // Try to identify the slot and extract the base name
      let baseName: string | null = null;
      let slot: string | null = null;

      for (const [slotName, patterns] of Object.entries(TEXTURE_SLOT_PATTERNS)) {
        for (const pattern of patterns) {
          const patternIndex = name.indexOf(pattern);
          if (patternIndex !== -1) {
            baseName = name.substring(0, patternIndex);
            slot = slotName;
            break;
          }
        }
        if (baseName) break;
      }

      if (baseName && slot) {
        if (!groups[baseName]) {
          groups[baseName] = {};
        }
        groups[baseName][slot] = texture;
      }
    }

    return groups;
  }

  private getExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf(".");
    return lastDot >= 0 ? filePath.substring(lastDot) : "";
  }

  private getFileName(filePath: string): string {
    const lastSlash = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
    const withExt = filePath.substring(lastSlash + 1);
    const lastDot = withExt.lastIndexOf(".");
    return lastDot >= 0 ? withExt.substring(0, lastDot) : withExt;
  }
}
