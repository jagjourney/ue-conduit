/**
 * UE Conduit — Level Builder Orchestration
 *
 * Populates a zone from game-data JSON, spawning NPCs, enemies,
 * gathering nodes, and setting up lighting.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

/** Zone data schema (loaded from game-data JSON files) */
export interface ZoneData {
  zone_name: string;
  level_path: string;
  description?: string;
  lighting?: {
    directional_light?: {
      rotation: { pitch: number; yaw: number; roll: number };
      intensity: number;
      color: { r: number; g: number; b: number };
    };
    sky_light?: {
      intensity: number;
      color: { r: number; g: number; b: number };
    };
    fog?: {
      density: number;
      color: { r: number; g: number; b: number };
      start_distance: number;
    };
    time_of_day?: string;
  };
  npcs?: Array<{
    class_path: string;
    label: string;
    location: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
    properties?: Record<string, unknown>;
  }>;
  enemies?: Array<{
    class_path: string;
    label: string;
    location: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
    patrol_path?: Array<{ x: number; y: number; z: number }>;
    level_range?: { min: number; max: number };
    properties?: Record<string, unknown>;
  }>;
  gathering_nodes?: Array<{
    class_path: string;
    label: string;
    location: { x: number; y: number; z: number };
    resource_type: string;
    respawn_time_seconds?: number;
    properties?: Record<string, unknown>;
  }>;
  spawn_points?: Array<{
    location: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
    type: "player" | "graveyard" | "flight_point";
  }>;
  ambient_sounds?: Array<{
    class_path: string;
    location: { x: number; y: number; z: number };
    radius: number;
    properties?: Record<string, unknown>;
  }>;
}

export interface ZonePopulationSummary {
  zone_name: string;
  npcs_placed: number;
  enemies_placed: number;
  gathering_nodes_placed: number;
  spawn_points_placed: number;
  ambient_sounds_placed: number;
  lighting_configured: boolean;
  total_actors: number;
  failures: Array<{ actor: string; error: string }>;
  duration_ms: number;
}

export class LevelBuilder {
  private ue5: UE5Client;
  private logger: Logger;

  constructor(ue5: UE5Client, logger: Logger) {
    this.ue5 = ue5;
    this.logger = logger;
  }

  /**
   * Populate a zone from a game-data JSON definition.
   *
   * Reads the zone JSON, then spawns all defined actors:
   * NPCs, enemies, gathering nodes, spawn points, ambient sounds.
   * Also configures lighting based on zone config.
   */
  async populateZone(zoneDataPath: string): Promise<ZonePopulationSummary> {
    const startTime = Date.now();

    // Step 1: Read zone data JSON
    const zoneData = await this.loadZoneData(zoneDataPath);
    this.logger.info(`Populating zone: ${zoneData.zone_name}`);

    const summary: ZonePopulationSummary = {
      zone_name: zoneData.zone_name,
      npcs_placed: 0,
      enemies_placed: 0,
      gathering_nodes_placed: 0,
      spawn_points_placed: 0,
      ambient_sounds_placed: 0,
      lighting_configured: false,
      total_actors: 0,
      failures: [],
      duration_ms: 0,
    };

    // Step 2: Load the target level if specified
    if (zoneData.level_path) {
      try {
        await this.ue5.executeCommand("editor", "load_level", {
          level_path: zoneData.level_path,
        });
        this.logger.info(`Loaded level: ${zoneData.level_path}`);
      } catch (error) {
        this.logger.warn(`Could not load level ${zoneData.level_path} — using current level`);
      }
    }

    // Step 3: Configure lighting
    if (zoneData.lighting) {
      summary.lighting_configured = await this.configureLighting(zoneData.lighting);
    }

    // Step 4: Spawn NPCs
    if (zoneData.npcs) {
      for (const npc of zoneData.npcs) {
        try {
          await this.ue5.executeCommand("level", "spawn_actor", {
            class_path: npc.class_path,
            location: npc.location,
            rotation: npc.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
            scale: { x: 1, y: 1, z: 1 },
            actor_label: npc.label,
            properties: {
              ...npc.properties,
              _zone_role: "npc",
            },
          });
          summary.npcs_placed++;
        } catch (error) {
          summary.failures.push({
            actor: npc.label,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      this.logger.info(`NPCs placed: ${summary.npcs_placed}/${zoneData.npcs.length}`);
    }

    // Step 5: Spawn enemies
    if (zoneData.enemies) {
      for (const enemy of zoneData.enemies) {
        try {
          const properties: Record<string, unknown> = {
            ...enemy.properties,
            _zone_role: "enemy",
          };

          if (enemy.level_range) {
            properties._level_min = enemy.level_range.min;
            properties._level_max = enemy.level_range.max;
          }

          if (enemy.patrol_path && enemy.patrol_path.length > 0) {
            properties._patrol_path = enemy.patrol_path;
          }

          await this.ue5.executeCommand("level", "spawn_actor", {
            class_path: enemy.class_path,
            location: enemy.location,
            rotation: enemy.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
            scale: { x: 1, y: 1, z: 1 },
            actor_label: enemy.label,
            properties,
          });
          summary.enemies_placed++;
        } catch (error) {
          summary.failures.push({
            actor: enemy.label,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      this.logger.info(`Enemies placed: ${summary.enemies_placed}/${zoneData.enemies.length}`);
    }

    // Step 6: Place gathering nodes
    if (zoneData.gathering_nodes) {
      for (const node of zoneData.gathering_nodes) {
        try {
          await this.ue5.executeCommand("level", "spawn_actor", {
            class_path: node.class_path,
            location: node.location,
            rotation: { pitch: 0, yaw: 0, roll: 0 },
            scale: { x: 1, y: 1, z: 1 },
            actor_label: node.label,
            properties: {
              ...node.properties,
              _zone_role: "gathering_node",
              _resource_type: node.resource_type,
              _respawn_time: node.respawn_time_seconds ?? 300,
            },
          });
          summary.gathering_nodes_placed++;
        } catch (error) {
          summary.failures.push({
            actor: node.label,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      this.logger.info(
        `Gathering nodes placed: ${summary.gathering_nodes_placed}/${zoneData.gathering_nodes.length}`
      );
    }

    // Step 7: Place spawn points
    if (zoneData.spawn_points) {
      for (let i = 0; i < zoneData.spawn_points.length; i++) {
        const sp = zoneData.spawn_points[i];
        const label = `SpawnPoint_${sp.type}_${i}`;
        try {
          await this.ue5.executeCommand("level", "spawn_actor", {
            class_path: "/Script/Engine.PlayerStart",
            location: sp.location,
            rotation: sp.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
            scale: { x: 1, y: 1, z: 1 },
            actor_label: label,
            properties: {
              _spawn_type: sp.type,
            },
          });
          summary.spawn_points_placed++;
        } catch (error) {
          summary.failures.push({
            actor: label,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      this.logger.info(
        `Spawn points placed: ${summary.spawn_points_placed}/${zoneData.spawn_points.length}`
      );
    }

    // Step 8: Place ambient sounds
    if (zoneData.ambient_sounds) {
      for (let i = 0; i < zoneData.ambient_sounds.length; i++) {
        const sound = zoneData.ambient_sounds[i];
        const label = `AmbientSound_${i}`;
        try {
          await this.ue5.executeCommand("level", "spawn_actor", {
            class_path: sound.class_path,
            location: sound.location,
            rotation: { pitch: 0, yaw: 0, roll: 0 },
            scale: { x: 1, y: 1, z: 1 },
            actor_label: label,
            properties: {
              ...sound.properties,
              _attenuation_radius: sound.radius,
            },
          });
          summary.ambient_sounds_placed++;
        } catch (error) {
          summary.failures.push({
            actor: label,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      this.logger.info(
        `Ambient sounds placed: ${summary.ambient_sounds_placed}/${zoneData.ambient_sounds.length}`
      );
    }

    summary.total_actors =
      summary.npcs_placed +
      summary.enemies_placed +
      summary.gathering_nodes_placed +
      summary.spawn_points_placed +
      summary.ambient_sounds_placed;

    summary.duration_ms = Date.now() - startTime;

    this.logger.info(
      `Zone "${zoneData.zone_name}" populated: ${summary.total_actors} actors placed, ${summary.failures.length} failures`
    );

    return summary;
  }

  /**
   * Load and parse zone data JSON from the file system via UE5.
   */
  private async loadZoneData(zoneDataPath: string): Promise<ZoneData> {
    try {
      const response = await this.ue5.executeCommand("filesystem", "read_file", {
        path: zoneDataPath,
      });

      if (!response.success || !response.output?.content) {
        throw new Error(`Failed to read zone data: ${response.message}`);
      }

      const content = response.output.content as string;
      return JSON.parse(content) as ZoneData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in zone data file: ${zoneDataPath}`);
      }
      throw error;
    }
  }

  /**
   * Configure level lighting from zone config.
   */
  private async configureLighting(
    lighting: NonNullable<ZoneData["lighting"]>
  ): Promise<boolean> {
    let configured = false;

    try {
      if (lighting.directional_light) {
        const dl = lighting.directional_light;
        // Try to find existing directional light, or spawn one
        await this.ue5.executeCommand("level", "spawn_actor", {
          class_path: "/Script/Engine.DirectionalLight",
          location: { x: 0, y: 0, z: 10000 },
          rotation: dl.rotation,
          scale: { x: 1, y: 1, z: 1 },
          actor_label: "Zone_DirectionalLight",
          properties: {
            Intensity: dl.intensity,
            LightColor: dl.color,
          },
        });
        configured = true;
      }

      if (lighting.sky_light) {
        const sl = lighting.sky_light;
        await this.ue5.executeCommand("level", "spawn_actor", {
          class_path: "/Script/Engine.SkyLight",
          location: { x: 0, y: 0, z: 10000 },
          rotation: { pitch: 0, yaw: 0, roll: 0 },
          scale: { x: 1, y: 1, z: 1 },
          actor_label: "Zone_SkyLight",
          properties: {
            Intensity: sl.intensity,
            LightColor: sl.color,
          },
        });
        configured = true;
      }

      if (lighting.fog) {
        const fog = lighting.fog;
        await this.ue5.executeCommand("level", "spawn_actor", {
          class_path: "/Script/Engine.ExponentialHeightFog",
          location: { x: 0, y: 0, z: 0 },
          rotation: { pitch: 0, yaw: 0, roll: 0 },
          scale: { x: 1, y: 1, z: 1 },
          actor_label: "Zone_Fog",
          properties: {
            FogDensity: fog.density,
            FogInscatteringColor: fog.color,
            StartDistance: fog.start_distance,
          },
        });
        configured = true;
      }

      this.logger.info("Zone lighting configured");
    } catch (error) {
      this.logger.warn(
        `Lighting configuration partially failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return configured;
  }
}
