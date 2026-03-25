# UE Conduit -- Complete Tool Reference

**Version:** 1.0.0
**Total Tools:** 217
**Author:** Jag Journey, LLC

This is the master reference for every MCP tool in UE Conduit. Each tool is callable by Claude Code, Claude Desktop, or any MCP-compatible client.

---

## Table of Contents

| # | Category | Tools | File |
|---|----------|-------|------|
| 1 | [Actors](#1-actors) | 8 | actor-tools.ts |
| 2 | [Blueprints](#2-blueprints) | 6 | blueprint-tools.ts |
| 3 | [Assets](#3-assets) | 7 | asset-tools.ts |
| 4 | [Compile & Build](#4-compile--build) | 4 | compile-tools.ts |
| 5 | [Play-In-Editor (PIE)](#5-play-in-editor-pie) | 6 | pie-tools.ts |
| 6 | [Editor](#6-editor) | 8 | editor-tools.ts |
| 7 | [Landscape](#7-landscape) | 6 | landscape-tools.ts |
| 8 | [Water](#8-water) | 3 | water-tools.ts |
| 9 | [Foliage](#9-foliage) | 5 | foliage-tools.ts |
| 10 | [Fab Marketplace](#10-fab-marketplace) | 4 | fab-tools.ts |
| 11 | [Screenshot & Viewport](#11-screenshot--viewport) | 3 | screenshot-tools.ts |
| 12 | [Widgets (UMG)](#12-widgets-umg) | 5 | widget-tools.ts |
| 13 | [Animation](#13-animation) | 4 | animation-tools.ts |
| 14 | [Input](#14-input) | 4 | input-tools.ts |
| 15 | [AI / Behavior Trees](#15-ai--behavior-trees) | 5 | ai-tools.ts |
| 16 | [Niagara VFX](#16-niagara-vfx) | 6 | niagara-tools.ts |
| 17 | [Data Assets](#17-data-assets) | 7 | data-tools.ts |
| 18 | [LLM / AI Providers](#18-llm--ai-providers) | 6 | llm-tools.ts |
| 19 | [Level Streaming](#19-level-streaming) | 5 | level-streaming-tools.ts |
| 20 | [Post-Processing](#20-post-processing) | 4 | postprocess-tools.ts |
| 21 | [Audio](#21-audio) | 4 | audio-tools.ts |
| 22 | [Physics & Collision](#22-physics--collision) | 4 | physics-tools.ts |
| 23 | [Source Control](#23-source-control) | 3 | source-control-tools.ts |
| 24 | [Project Settings](#24-project-settings) | 5 | project-settings-tools.ts |
| 25 | [Scripting](#25-scripting) | 2 | scripting-tools.ts |
| 26 | [Sequencer / Cinematics](#26-sequencer--cinematics) | 8 | sequencer-tools.ts |
| 27 | [MetaHuman / Characters](#27-metahuman--characters) | 6 | metahuman-tools.ts |
| 28 | [PCG (Procedural Content Generation)](#28-pcg-procedural-content-generation) | 6 | pcg-tools.ts |
| 29 | [World Partition](#29-world-partition) | 5 | world-partition-tools.ts |
| 30 | [Modeling / Geometry](#30-modeling--geometry) | 7 | modeling-tools.ts |
| 31 | [Textures & Materials (Advanced)](#31-textures--materials-advanced) | 8 | texture-tools.ts |
| 32 | [Gameplay Framework](#32-gameplay-framework) | 8 | gameplay-tools.ts |
| 33 | [Navigation (Advanced)](#33-navigation-advanced) | 7 | navigation-tools.ts |
| 34 | [Dialogue / Story](#34-dialogue--story) | 5 | dialogue-tools.ts |
| 35 | [Save Game](#35-save-game) | 5 | savegame-tools.ts |
| 36 | [Multiplayer](#36-multiplayer) | 5 | multiplayer-tools.ts |
| 37 | [Widgets (Advanced)](#37-widgets-advanced) | 6 | widget-advanced-tools.ts |
| 38 | [Build (Advanced)](#38-build-advanced) | 5 | build-advanced-tools.ts |
| 39 | [Git](#39-git) | 5 | git-tools.ts |
| 40 | [Marketplace / Distribution](#40-marketplace--distribution) | 4 | marketplace-tools.ts |
| 41 | [Orchestration](#41-orchestration) | 3 | index.ts |

**Total: 217 tools**

---

## 1. Actors

Tools for spawning, moving, deleting, and querying actors in UE5 levels.

### ue5_spawn_actor
**Description:** Spawn an actor in the UE5 editor level. Use a Blueprint path (e.g., /Game/Blueprints/BP_Enemy) or a C++ class path (e.g., /Script/Engine.PointLight).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| class_path | string | Yes | -- | Blueprint or C++ class path to spawn |
| location | {x, y, z} | No | {0,0,0} | World location |
| rotation | {pitch, yaw, roll} | No | {0,0,0} | Rotation |
| scale | {x, y, z} | No | {1,1,1} | Scale |
| label | string | No | -- | Actor label in the outliner |
| properties | object | No | {} | Properties to set after spawning |

**Returns:** Actor label, class, location, and success status.

---

### ue5_delete_actor
**Description:** Delete an actor from the level by its label or path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_label | string | Yes | -- | The actor label or path to delete |

**Returns:** Confirmation of deletion.

---

### ue5_move_actor
**Description:** Set an actor's transform (location, rotation, scale).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_label | string | Yes | -- | The actor to move |
| location | {x, y, z} | No | -- | New world location |
| rotation | {pitch, yaw, roll} | No | -- | New rotation |
| scale | {x, y, z} | No | -- | New scale |

**Returns:** Updated transform values.

---

### ue5_list_actors
**Description:** List all actors in the current level. Optionally filter by class, tag, or name pattern.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| class_filter | string | No | -- | Filter by class name (e.g., StaticMeshActor) |
| tag_filter | string | No | -- | Filter by actor tag |
| name_filter | string | No | -- | Filter by name substring |
| limit | number | No | 100 | Max results to return |

**Returns:** Array of actor labels, classes, and locations.

---

### ue5_query_actor
**Description:** Get detailed information about a specific actor (all properties, components, transform).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_label | string | Yes | -- | The actor label to query |

**Returns:** Full actor details including all properties, components, and transform.

---

### ue5_set_actor_property
**Description:** Set any property on an actor. Use dot notation for nested properties (e.g., LightComponent.Intensity).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_label | string | Yes | -- | The actor to modify |
| property_path | string | Yes | -- | Property path (e.g., MaxHealth, LightComponent.Intensity) |
| value | any | Yes | -- | The value to set |

**Returns:** Confirmation with old and new values.

---

### ue5_batch_spawn
**Description:** Spawn multiple actors in one call. Much faster than individual spawns for placing many actors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actors | array | Yes | -- | Array of actor definitions, each with class_path, location, rotation, scale, label, properties |

**Returns:** Count of successfully spawned actors and individual results.

---

### ue5_select_actor
**Description:** Select an actor in the editor (highlights it in viewport and outliner).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_label | string | Yes | -- | The actor to select |

**Returns:** Confirmation of selection.

---

## 2. Blueprints

Tools for creating and modifying Blueprints in UE5.

### ue5_create_blueprint
**Description:** Create a new Blueprint class in UE5. Specify parent class and optional components.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Blueprint name (e.g., BP_Enemy_Crab) |
| parent_class | string | Yes | -- | Parent class path (e.g., /Script/Engine.Actor) |
| path | string | No | /Game/Blueprints/ | Content browser folder path |
| components | array | No | [] | Components to add, each with type, name, properties |

**Returns:** Blueprint asset path and compilation status.

---

### ue5_add_component
**Description:** Add a component to an existing Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blueprint | string | Yes | -- | Blueprint path |
| component_type | string | Yes | -- | Component class name (e.g., StaticMeshComponent) |
| component_name | string | Yes | -- | Name for the new component |
| properties | object | No | {} | Properties to set on the component |

**Returns:** Component creation confirmation.

---

### ue5_add_variable
**Description:** Add a variable to a Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blueprint | string | Yes | -- | Blueprint path |
| name | string | Yes | -- | Variable name (e.g., MaxHealth) |
| type | string | Yes | -- | Variable type (bool, int, float, string, FVector, FRotator, UObject*) |
| default_value | any | No | -- | Default value |
| expose_to_editor | boolean | No | true | Show in Details panel when placed |
| category | string | No | -- | Category in Details panel |

**Returns:** Variable creation confirmation.

---

### ue5_compile_blueprint
**Description:** Compile a Blueprint and return any errors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blueprint | string | Yes | -- | Blueprint path to compile |

**Returns:** Compilation result with errors/warnings if any.

---

### ue5_list_blueprints
**Description:** List all Blueprints in a content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/Blueprints/ | Content browser path to search |
| recursive | boolean | No | true | Include subdirectories |

**Returns:** Array of Blueprint asset paths.

---

### ue5_get_blueprint_info
**Description:** Get detailed info about a Blueprint (variables, components, functions, parent class).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blueprint | string | Yes | -- | Blueprint path |

**Returns:** Full Blueprint details including variables, components, functions, and parent class.

---

## 3. Assets

Tools for importing assets, creating materials, and managing content.

### ue5_import_texture
**Description:** Import an image file (PNG, JPG, TGA, BMP) as a UE5 texture asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| source_path | string | Yes | -- | Absolute path to image file on disk |
| dest_path | string | Yes | -- | Content browser destination |
| name | string | No | -- | Asset name (defaults to filename) |
| compression | enum | No | TC_Default | TC_Default, TC_Normalmap, TC_Masks, TC_Grayscale, TC_HDR, TC_UserInterface2D |
| srgb | boolean | No | true | sRGB color space (true for diffuse, false for normal/mask) |

**Returns:** Imported texture asset path.

---

### ue5_import_mesh
**Description:** Import a 3D model (FBX, OBJ, glTF) as a static or skeletal mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| source_path | string | Yes | -- | Absolute path to mesh file |
| dest_path | string | Yes | -- | Content browser destination |
| name | string | No | -- | Asset name |
| skeletal | boolean | No | false | Import as skeletal mesh (for characters) |

**Returns:** Imported mesh asset path.

---

### ue5_create_material
**Description:** Create a new material asset with texture inputs.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Material name |
| path | string | No | /Game/Materials/ | Content browser path |
| domain | enum | No | Surface | Surface, DeferredDecal, LightFunction, PostProcess, UI |
| blend_mode | enum | No | Opaque | Opaque, Masked, Translucent, Additive, Modulate |
| two_sided | boolean | No | false | Two-sided material |
| base_color_texture | string | No | -- | Texture path for base color |
| normal_texture | string | No | -- | Texture path for normal map |
| roughness_value | number | No | -- | Constant roughness (0-1) |
| metallic_value | number | No | -- | Constant metallic (0-1) |
| emissive_texture | string | No | -- | Texture path for emissive |
| emissive_strength | number | No | -- | Emissive multiplier |

**Returns:** Created material asset path.

---

### ue5_create_material_instance
**Description:** Create a material instance from a parent material with parameter overrides.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Material instance name |
| parent_material | string | Yes | -- | Parent material path |
| path | string | No | /Game/Materials/Instances/ | Content browser path |
| texture_params | object | No | {} | Texture parameter overrides {name: texture_path} |
| scalar_params | object | No | {} | Scalar parameter overrides {name: value} |
| vector_params | object | No | {} | Vector parameter overrides {name: {r,g,b,a}} |

**Returns:** Created material instance path.

---

### ue5_batch_import
**Description:** Import all files from a directory into UE5. Automatically categorizes by file type.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| source_dir | string | Yes | -- | Absolute path to directory with files to import |
| dest_path | string | Yes | -- | Content browser destination base path |
| file_filter | string | No | *.* | File extension filter (e.g., *.png, *.fbx) |
| recursive | boolean | No | true | Include subdirectories |

**Returns:** Import counts by file type, success/failure totals.

---

### ue5_list_assets
**Description:** List assets in a content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/ | Content browser path |
| type_filter | string | No | -- | Asset type filter (Texture2D, StaticMesh, Blueprint, etc.) |
| recursive | boolean | No | false | Include subdirectories |
| limit | number | No | 100 | Max results |

**Returns:** Array of asset paths and types.

---

### ue5_search_assets
**Description:** Search for assets by name across the entire project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | -- | Search query (asset name substring) |
| type_filter | string | No | -- | Asset type filter |
| limit | number | No | 50 | Max results |

**Returns:** Array of matching asset paths and types.

---

## 4. Compile & Build

Tools for C++ compilation, hot reload, and lighting builds.

### ue5_compile_cpp
**Description:** Trigger C++ compilation in UE5 (equivalent to Ctrl+Alt+F11). Returns build result with any errors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| clean | boolean | No | false | Clean build (delete intermediates first) |

**Returns:** Build result: success/failure, error messages, warning count, duration.

---

### ue5_hot_reload
**Description:** Trigger hot reload of C++ modules without full recompile.

No parameters.

**Returns:** Hot reload success/failure status.

---

### ue5_get_build_errors
**Description:** Get the latest compilation errors and warnings.

No parameters.

**Returns:** Array of error/warning messages from the last build.

---

### ue5_build_lighting
**Description:** Build lighting for the current level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| quality | enum | No | Medium | Preview, Medium, High, Production |

**Returns:** Lighting build result and duration.

---

## 5. Play-In-Editor (PIE)

Tools for starting, stopping, and interacting with Play-In-Editor sessions.

### ue5_play
**Description:** Start Play-In-Editor (press the Play button). Returns immediately.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mode | enum | No | PIE | PIE, SIE, standalone |

**Returns:** PIE start confirmation.

---

### ue5_stop
**Description:** Stop Play-In-Editor.

No parameters.

**Returns:** PIE stop confirmation.

---

### ue5_restart_pie
**Description:** Stop and immediately restart PIE. Useful after code changes.

No parameters.

**Returns:** PIE restart confirmation.

---

### ue5_screenshot
**Description:** Take a screenshot of the current viewport and save to disk.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | No | auto-generated | Output filename (saved to project Screenshots folder) |

**Returns:** Absolute path to saved screenshot file.

---

### ue5_get_game_log
**Description:** Get recent game output log lines from PIE. Useful for debugging runtime issues.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| last_n_lines | number | No | 50 | Number of recent log lines to return |
| filter | string | No | -- | Filter log by category or keyword |

**Returns:** Array of log lines.

---

### ue5_execute_console_command
**Description:** Execute a console command in the UE5 editor or PIE session.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| command | string | Yes | -- | Console command (e.g., "stat fps", "show collision") |

**Returns:** Command execution result.

---

## 6. Editor

General editor operations: state, viewport, undo/redo, save.

### ue5_get_editor_state
**Description:** Get the current state of the UE5 editor: open level, selected actors, build status, PIE state, engine version.

No parameters.

**Returns:** Level name, actor count, selected actors, PIE state, build status, engine version, project name.

---

### ue5_save_level
**Description:** Save the currently open level.

No parameters.

**Returns:** Save confirmation.

---

### ue5_save_all
**Description:** Save all unsaved assets and levels.

No parameters.

**Returns:** Save confirmation with count of saved assets.

---

### ue5_load_level
**Description:** Load a level by its content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| level_path | string | Yes | -- | Level path (e.g., /Game/Maps/L_ShatteredCoast) |

**Returns:** Level load confirmation.

---

### ue5_undo
**Description:** Undo the last editor action.

No parameters.

**Returns:** Undo confirmation.

---

### ue5_redo
**Description:** Redo the last undone editor action.

No parameters.

**Returns:** Redo confirmation.

---

### ue5_focus_viewport
**Description:** Move the editor viewport camera to a specific location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | Yes | -- | Camera position |
| rotation | {pitch, yaw, roll} | No | {-30,0,0} | Camera rotation |

**Returns:** New camera position confirmation.

---

### ue5_notify
**Description:** Show a toast notification in the UE5 editor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| message | string | Yes | -- | Notification message |
| type | enum | No | info | info, success, warning, error |

**Returns:** Notification sent confirmation.

---

## 7. Landscape

Tools for creating landscapes, sculpting terrain, painting layers, and managing foliage.

### ue5_create_landscape
**Description:** Create a new landscape actor in the level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location for the landscape origin |
| num_quads_x | number | No | 63 | Quads per section on X axis (63, 127, 255) |
| num_quads_y | number | No | 63 | Quads per section on Y axis |
| sections_x | number | No | 1 | Number of sections on X axis |
| sections_y | number | No | 1 | Number of sections on Y axis |
| scale | {x, y, z} | No | {100,100,100} | Landscape scale (z controls height range) |
| material | string | No | -- | Material path to assign |
| label | string | No | -- | Actor label in the outliner |

**Returns:** Created landscape actor details.

---

### ue5_sculpt_landscape
**Description:** Raise or lower terrain at a specific world location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | Yes | -- | World location to sculpt at |
| radius | number | No | 2048 | Brush radius in world units |
| strength | number | No | 0.5 | Sculpt strength (-1 to 1, positive raises, negative lowers) |
| falloff | number | No | 0.5 | Brush falloff (0 = hard edge, 1 = smooth) |
| tool_type | enum | No | raise_lower | raise_lower, flatten, smooth, erosion, noise |
| target_height | number | No | -- | Target height for flatten tool |

**Returns:** Sculpt operation result.

---

### ue5_paint_landscape_layer
**Description:** Paint a material weight layer on the landscape at a world location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | Yes | -- | World location to paint at |
| layer_name | string | Yes | -- | Layer name (e.g., Grass, Rock, Sand) |
| radius | number | No | 2048 | Brush radius in world units |
| strength | number | No | 1.0 | Paint strength (0 to 1) |
| falloff | number | No | 0.5 | Brush falloff |

**Returns:** Paint operation result.

---

### ue5_add_foliage
**Description:** Place foliage instances (grass, rocks, trees) at specified locations or scattered within an area.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mesh_path | string | Yes | -- | Static mesh path for the foliage |
| locations | array | No | [] | Explicit world locations to place instances |
| scatter_origin | {x, y, z} | No | -- | Center point for random scatter |
| scatter_radius | number | No | -- | Radius for random scatter |
| scatter_count | number | No | -- | Number of instances to scatter |
| scale_min | number | No | 0.8 | Minimum random scale |
| scale_max | number | No | 1.2 | Maximum random scale |
| random_yaw | boolean | No | true | Randomize yaw rotation |
| align_to_surface | boolean | No | true | Align foliage to landscape normal |

**Returns:** Number of foliage instances placed.

---

### ue5_get_landscape_info
**Description:** Get detailed information about all landscapes in the level.

No parameters.

**Returns:** Bounds, size, layers, material, component count for each landscape.

---

### ue5_set_landscape_material
**Description:** Set the material on a landscape actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| material_path | string | Yes | -- | Material asset path |
| label | string | No | -- | Specific landscape actor label (uses first if omitted) |

**Returns:** Material assignment confirmation.

---

## 8. Water

Tools for creating and configuring water bodies. Requires the Water plugin.

### ue5_create_water_body
**Description:** Create an ocean, lake, or river water body actor in the level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| type | enum | Yes | -- | ocean, lake, river |
| location | {x, y, z} | No | {0,0,0} | World location for origin |
| label | string | No | -- | Actor label |
| spline_points | array | No | [] | Spline points defining shape (river path or lake shore) |
| width | number | No | 1000 | River width in world units |
| wave_amplitude | number | No | -- | Wave height amplitude |
| wave_speed | number | No | -- | Wave animation speed |

**Returns:** Created water body details.

---

### ue5_set_water_properties
**Description:** Set visual properties on an existing water body actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label of the water body |
| wave_height | number | No | -- | Maximum wave height offset |
| transparency | number | No | -- | Water transparency |
| color | {r, g, b, a} | No | -- | Water color (0-1 range) |
| foam_amount | number | No | -- | Amount of foam on the surface |

**Returns:** Updated water properties.

---

### ue5_list_water_bodies
**Description:** List all water body actors in the current level.

No parameters.

**Returns:** Array of water bodies with type, location, and bounds.

---

## 9. Foliage

Tools for painting instanced foliage (grass, bushes, rocks, trees).

### ue5_add_foliage_type
**Description:** Register a static mesh as a foliage type. Must be done before painting with that mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mesh_path | string | Yes | -- | Static mesh asset path |
| density | number | No | 100 | Instances per 1000x1000 area |
| scale_min | number | No | 0.8 | Minimum random scale |
| scale_max | number | No | 1.2 | Maximum random scale |
| align_to_normal | boolean | No | true | Align instances to surface normal |
| random_yaw | boolean | No | true | Randomize yaw rotation |
| ground_slope_angle | number | No | -- | Maximum ground slope angle in degrees |

**Returns:** Foliage type registration confirmation.

---

### ue5_paint_foliage
**Description:** Paint foliage instances in a circular area around a center point.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mesh_path | string | Yes | -- | Static mesh path |
| center | {x, y, z} | Yes | -- | Center point for placement |
| radius | number | No | 1000 | Radius of paint area |
| count | number | No | 50 | Number of instances to place |
| scale_min | number | No | 0.8 | Minimum random scale |
| scale_max | number | No | 1.2 | Maximum random scale |
| random_scale | boolean | No | true | Apply random scale variation |
| random_yaw | boolean | No | true | Randomize yaw rotation |
| align_to_surface | boolean | No | true | Align to ground via raycasting |
| seed | number | No | -- | Random seed for reproducible placement |

**Returns:** Number of foliage instances placed.

---

### ue5_scatter_foliage
**Description:** Scatter foliage across a rectangular region procedurally.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mesh_path | string | Yes | -- | Static mesh path |
| min_x | number | Yes | -- | Minimum X bound |
| min_y | number | Yes | -- | Minimum Y bound |
| max_x | number | Yes | -- | Maximum X bound |
| max_y | number | Yes | -- | Maximum Y bound |
| base_z | number | No | 0 | Base Z height for ray tracing |
| density | number | No | 0.001 | Instances per square unit |
| scale_min | number | No | 0.8 | Minimum random scale |
| scale_max | number | No | 1.2 | Maximum random scale |
| align_to_surface | boolean | No | true | Align to ground surface |
| random_yaw | boolean | No | true | Randomize yaw rotation |
| seed | number | No | -- | Random seed |
| max_instances | number | No | 10000 | Safety cap on instance count |

**Returns:** Number of foliage instances scattered.

---

### ue5_remove_foliage
**Description:** Remove foliage instances within a circular area.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| center | {x, y, z} | Yes | -- | Center point for removal |
| radius | number | No | 1000 | Radius of removal area |
| mesh_path | string | No | -- | Only remove instances of this specific mesh |

**Returns:** Number of instances removed.

---

### ue5_list_foliage_types
**Description:** List all registered foliage types in the current level.

No parameters.

**Returns:** Mesh paths, instance counts, density, and scale settings for each type.

---

## 10. Fab Marketplace

Tools for working with Fab (Epic's asset marketplace) content.

### ue5_fab_list_local
**Description:** List assets in the UE5 project content browser. Find Fab-imported meshes, textures, and materials.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game | Content browser path to search |
| class_filter | enum | No | -- | StaticMesh, Material, Texture, or empty |
| name_filter | string | No | -- | Filter by name substring |
| max_results | number | No | 100 | Maximum results |

**Returns:** Array of asset paths and types.

---

### ue5_fab_import_local
**Description:** Import a file or directory of assets into the UE5 project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| source_path | string | Yes | -- | Absolute path to file or directory |
| dest_path | string | No | /Game/Fab/Imported | Content browser destination |

**Returns:** Import results with count and paths.

---

### ue5_fab_search_content
**Description:** Search the project's content browser by keyword.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | -- | Search query (e.g., "grass", "rock mesh") |
| class_filter | enum | No | -- | StaticMesh, Material, Texture, or empty |
| max_results | number | No | 50 | Maximum results |

**Returns:** Matching asset paths and types.

---

### ue5_fab_list_vault
**Description:** List assets in the Epic Games Launcher vault cache.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| vault_path | string | No | auto-detected | Custom vault cache path |
| max_results | number | No | 100 | Maximum results |

**Returns:** Array of cached assets.

---

## 11. Screenshot & Viewport

Tools for capturing screenshots and controlling the editor viewport camera.

### ue5_take_screenshot
**Description:** Capture a screenshot of the editor viewport. Optionally move the camera first.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | No | auto-generated | Output filename |
| resolution_x | number | No | 1920 | Screenshot width |
| resolution_y | number | No | 1080 | Screenshot height |
| camera_location | {x, y, z} | No | -- | Move camera before capturing |
| camera_rotation | {pitch, yaw, roll} | No | -- | Set rotation before capturing |
| look_at | {x, y, z} | No | -- | Point camera at this location before capturing |

**Returns:** Absolute file path to saved PNG.

---

### ue5_set_viewport_camera
**Description:** Move the editor viewport camera to a location and optionally point it at a target.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | -- | Camera world position |
| rotation | {pitch, yaw, roll} | No | -- | Camera rotation (ignored if look_at provided) |
| look_at | {x, y, z} | No | -- | Point camera at this world location |
| fov | number | No | -- | Field of view in degrees |
| speed | number | No | -- | Camera movement speed setting |

**Returns:** New camera position and rotation.

---

### ue5_get_viewport_camera
**Description:** Get the current editor viewport camera position, rotation, and field of view.

No parameters.

**Returns:** Camera location, rotation, and FOV.

---

## 12. Widgets (UMG)

Tools for creating and editing UMG Widget Blueprints.

### ue5_create_widget
**Description:** Create a new UMG Widget Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Widget name (e.g., WBP_HUD_Main) |
| path | string | No | /Game/UI/ | Content browser folder |
| parent_class | string | No | UserWidget | Parent widget class |
| root_widget | enum | No | CanvasPanel | CanvasPanel, Overlay, VerticalBox, HorizontalBox, GridPanel, SizeBox |

**Returns:** Created widget blueprint path.

---

### ue5_add_widget_child
**Description:** Add a child widget to an existing Widget Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_blueprint | string | Yes | -- | Widget Blueprint path |
| parent_slot | string | No | Root | Parent slot/widget to add into |
| widget_type | enum | Yes | -- | TextBlock, Image, Button, ProgressBar, Slider, CheckBox, EditableText, RichTextBlock, Border, CanvasPanel, VerticalBox, HorizontalBox, GridPanel, ScrollBox, SizeBox, Overlay, Spacer, CircularThrobber |
| name | string | Yes | -- | Name for the new widget element |
| properties | object | No | {} | Properties (text, color, size, etc.) |

**Returns:** Added widget element confirmation.

---

### ue5_set_widget_property
**Description:** Set any property on a widget element.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_blueprint | string | Yes | -- | Widget Blueprint path |
| widget_name | string | Yes | -- | Name of the widget element |
| property_path | string | Yes | -- | Property to set (e.g., Text, Visibility) |
| value | any | Yes | -- | The value to set |

**Returns:** Updated property confirmation.

---

### ue5_set_widget_binding
**Description:** Bind a widget property to a Blueprint variable or function.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_blueprint | string | Yes | -- | Widget Blueprint path |
| widget_name | string | Yes | -- | Name of the widget element |
| property_name | string | Yes | -- | Property to bind (e.g., Text, Percent) |
| binding_type | enum | Yes | -- | variable or function |
| binding_name | string | Yes | -- | Variable or function name to bind to |

**Returns:** Binding confirmation.

---

### ue5_list_widgets
**Description:** List all Widget Blueprints in the project or a specific folder.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/ | Content browser path |
| recursive | boolean | No | true | Include subdirectories |
| limit | number | No | 100 | Max results |

**Returns:** Array of Widget Blueprint paths.

---

## 13. Animation

Tools for creating Animation Blueprints, montages, and blend spaces.

### ue5_create_anim_blueprint
**Description:** Create a new Animation Blueprint for a skeletal mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Anim Blueprint name (e.g., ABP_Player) |
| path | string | No | /Game/Animations/ | Content browser path |
| skeleton | string | Yes | -- | Skeleton asset path |
| parent_class | string | No | AnimInstance | Parent anim class |

**Returns:** Created Animation Blueprint path.

---

### ue5_create_montage
**Description:** Create an animation montage from animation sequences.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Montage name (e.g., AM_Slash_01) |
| path | string | No | /Game/Animations/Montages/ | Content browser path |
| skeleton | string | Yes | -- | Skeleton asset path |
| animations | array | Yes | -- | Animation sequence paths to include |
| slot_name | string | No | DefaultSlot | Montage slot name |
| blend_in_time | number | No | 0.25 | Blend in duration (seconds) |
| blend_out_time | number | No | 0.25 | Blend out duration (seconds) |

**Returns:** Created montage asset path.

---

### ue5_create_blend_space
**Description:** Create a 1D or 2D blend space.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Blend space name |
| path | string | No | /Game/Animations/BlendSpaces/ | Content browser path |
| skeleton | string | Yes | -- | Skeleton asset path |
| dimensions | enum | No | 2D | 1D or 2D |
| axis_x_name | string | No | Speed | Horizontal axis name |
| axis_x_min | number | No | 0 | Horizontal minimum |
| axis_x_max | number | No | 600 | Horizontal maximum |
| axis_y_name | string | No | -- | Vertical axis name (2D only) |
| axis_y_min | number | No | -- | Vertical minimum (2D only) |
| axis_y_max | number | No | -- | Vertical maximum (2D only) |
| samples | array | No | [] | Animation samples with x, y values |

**Returns:** Created blend space asset path.

---

### ue5_play_animation_preview
**Description:** Preview an animation on a skeletal mesh in the editor viewport.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| animation | string | Yes | -- | Animation sequence or montage path |
| actor_label | string | No | -- | Skeletal mesh actor to preview on |
| playback_rate | number | No | 1.0 | Playback speed multiplier |
| looping | boolean | No | false | Loop the animation |

**Returns:** Preview started confirmation.

---

## 14. Input

Tools for creating Enhanced Input Actions and Mapping Contexts.

### ue5_create_input_action
**Description:** Create an Enhanced Input Action asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Input action name (e.g., IA_Jump) |
| path | string | No | /Game/Input/Actions/ | Content browser path |
| value_type | enum | No | Digital | Digital, Axis1D, Axis2D, Axis3D |
| triggers | array | No | [] | Pressed, Released, Down, Tap, Hold, HoldAndRelease, Pulse |
| consume_input | boolean | No | true | Whether this action consumes the input |

**Returns:** Created input action path.

---

### ue5_create_mapping_context
**Description:** Create an Input Mapping Context asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Mapping context name (e.g., IMC_Default) |
| path | string | No | /Game/Input/ | Content browser path |
| description | string | No | -- | Human-readable description |

**Returns:** Created mapping context path.

---

### ue5_add_key_mapping
**Description:** Add a key binding to a Mapping Context.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mapping_context | string | Yes | -- | Mapping Context asset path |
| input_action | string | Yes | -- | Input Action asset path |
| key | string | Yes | -- | Key name (SpaceBar, LeftMouseButton, W, etc.) |
| modifiers | array | No | [] | Negate, Swizzle, DeadZone, Scalar, FOVScaling, ResponseCurve, Smooth |
| modifier_params | object | No | {} | Parameters for modifiers |

**Returns:** Key mapping addition confirmation.

---

### ue5_list_input_actions
**Description:** List all Enhanced Input Action and Mapping Context assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/ | Content browser path |
| recursive | boolean | No | true | Include subdirectories |
| type | enum | No | all | all, actions, contexts |

**Returns:** Array of input asset paths.

---

## 15. AI / Behavior Trees

Tools for creating Behavior Trees, Blackboards, and working with navigation mesh.

### ue5_create_behavior_tree
**Description:** Create a Behavior Tree asset for AI decision-making.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Behavior Tree name (e.g., BT_Enemy_Melee) |
| path | string | No | /Game/AI/BehaviorTrees/ | Content browser path |
| blackboard | string | No | -- | Blackboard asset path to associate |

**Returns:** Created behavior tree path.

---

### ue5_create_blackboard
**Description:** Create a Blackboard Data asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Blackboard name (e.g., BB_Enemy) |
| path | string | No | /Game/AI/Blackboards/ | Content browser path |
| parent_blackboard | string | No | -- | Parent blackboard to inherit keys from |
| keys | array | No | [] | Initial keys, each with name, type (Bool/Int/Float/String/Name/Vector/Rotator/Object/Class/Enum), instance_synced |

**Returns:** Created blackboard path.

---

### ue5_add_blackboard_key
**Description:** Add a key to an existing Blackboard Data asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blackboard | string | Yes | -- | Blackboard asset path |
| name | string | Yes | -- | Key name |
| type | enum | Yes | -- | Bool, Int, Float, String, Name, Vector, Rotator, Object, Class, Enum |
| base_class | string | No | -- | Base class filter for Object/Class types |
| enum_name | string | No | -- | Enum type name for Enum key type |
| instance_synced | boolean | No | false | Sync across all BT instances |

**Returns:** Key addition confirmation.

---

### ue5_build_navmesh
**Description:** Build or rebuild the navigation mesh for the current level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| agent_radius | number | No | -- | Navigation agent radius |
| agent_height | number | No | -- | Navigation agent height |
| cell_size | number | No | -- | NavMesh cell size |
| cell_height | number | No | -- | NavMesh cell height |

**Returns:** NavMesh build result and timing.

---

### ue5_query_navmesh
**Description:** Test if a world location is navigable (on the NavMesh).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | Yes | -- | World location to test |
| query_radius | number | No | 100 | Search radius |
| find_nearest | boolean | No | true | Find nearest navigable point if off-mesh |

**Returns:** Whether the point is navigable and nearest valid point.

---

## 16. Niagara VFX

Tools for creating and configuring Niagara particle systems.

### ue5_create_niagara_system
**Description:** Create a Niagara particle system asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | System name (e.g., NS_FireBall) |
| path | string | No | /Game/Effects/ | Content browser path |
| template | enum | No | Empty | Empty, Fountain, Sprite, Mesh, Ribbon, Audio, Component |
| auto_activate | boolean | No | true | Auto-activate when spawned |

**Returns:** Created Niagara system path.

---

### ue5_set_niagara_parameter
**Description:** Set a parameter on a Niagara system or emitter.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| system | string | Yes | -- | Niagara system asset path |
| emitter_name | string | No | -- | Emitter name (omit for system-level) |
| module_name | string | Yes | -- | Module name (SpawnRate, Color, etc.) |
| parameter_name | string | Yes | -- | Parameter name within the module |
| value | any | Yes | -- | Parameter value |

**Returns:** Parameter update confirmation.

---

### ue5_create_niagara_emitter
**Description:** Create a standalone Niagara emitter asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Emitter name (e.g., NE_Sparks) |
| path | string | No | /Game/Effects/Emitters/ | Content browser path |
| sim_target | enum | No | CPUSim | CPUSim, GPUComputeSim |
| renderer | enum | No | Sprite | Sprite, Mesh, Ribbon, Light, Component |
| spawn_rate | number | No | -- | Particles per second |
| lifetime_min | number | No | -- | Minimum particle lifetime |
| lifetime_max | number | No | -- | Maximum particle lifetime |

**Returns:** Created emitter path.

---

### ue5_spawn_niagara_actor
**Description:** Spawn a Niagara system as an actor in the world.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| system_path | string | Yes | -- | Niagara system asset path |
| location | {x, y, z} | No | {0,0,0} | World location |
| rotation | {pitch, yaw, roll} | No | {0,0,0} | Rotation |
| scale | {x, y, z} | No | {1,1,1} | Scale |
| label | string | No | -- | Actor label |
| auto_activate | boolean | No | true | Auto-activate the system |

**Returns:** Spawned Niagara actor details.

---

### ue5_set_niagara_variable
**Description:** Set a user variable on a Niagara component at runtime.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label of the Niagara actor |
| variable_name | string | Yes | -- | Variable name (e.g., User.Color) |
| type | enum | No | float | float, int, bool, vector, color, vec2, vec4 |
| value | any | Yes | -- | Variable value |

**Returns:** Variable update confirmation.

---

### ue5_list_niagara_systems
**Description:** List all Niagara system and emitter assets in the project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/ | Content browser path |
| recursive | boolean | No | true | Include subdirectories |
| type | enum | No | all | all, systems, emitters |
| limit | number | No | 100 | Max results |

**Returns:** Array of Niagara asset paths and types.

---

## 17. Data Assets

Tools for creating DataTables, curves, enums, structs, and data assets.

### ue5_create_datatable
**Description:** Create a DataTable asset from a row struct.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | DataTable name (e.g., DT_ItemDatabase) |
| path | string | No | /Game/Data/ | Content browser path |
| row_struct | string | Yes | -- | Row struct name or path |

**Returns:** Created DataTable path.

---

### ue5_import_json_to_datatable
**Description:** Import a JSON file as rows into an existing DataTable.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| datatable | string | Yes | -- | DataTable asset path |
| json_path | string | Yes | -- | Absolute path to JSON file |
| overwrite | boolean | No | false | Overwrite existing rows (true) or append (false) |

**Returns:** Import result with row count.

---

### ue5_create_curve
**Description:** Create a float curve or color curve asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Curve name |
| path | string | No | /Game/Data/Curves/ | Content browser path |
| curve_type | enum | No | Float | Float, LinearColor, Vector |
| keys | array | No | [] | Curve keys, each with time, value, interp (Linear/Cubic/Constant/Auto) |

**Returns:** Created curve asset path.

---

### ue5_create_data_asset
**Description:** Create a Primary Data Asset instance.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Data asset name |
| path | string | No | /Game/Data/ | Content browser path |
| data_class | string | Yes | -- | Data asset class path |
| properties | object | No | {} | Properties to set |

**Returns:** Created data asset path.

---

### ue5_load_json_config
**Description:** Load a JSON file from disk and return its parsed content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| json_path | string | Yes | -- | Absolute path to JSON file |
| config_name | string | No | -- | Name for this config (defaults to filename) |

**Returns:** Parsed JSON content.

---

### ue5_create_enum
**Description:** Create a Blueprint Enum (UserDefinedEnum) asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Enum name (e.g., E_ItemRarity) |
| path | string | No | /Game/Data/Enums/ | Content browser path |
| values | array | Yes | -- | List of enum entry names |

**Returns:** Created enum asset path.

---

### ue5_create_struct
**Description:** Create a Blueprint Struct (UserDefinedStruct) asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Struct name (e.g., S_ItemData) |
| path | string | No | /Game/Data/Structs/ | Content browser path |
| fields | array | Yes | -- | Struct fields, each with name and type (bool/int/float/double/string/name/text) |

**Returns:** Created struct asset path.

---

## 18. LLM / AI Providers

Tools for interacting with the configured LLM provider (Claude, GPT, Gemini, xAI, Ollama).

### ue5_llm_chat
**Description:** Send a message to the configured LLM and get a response.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| message | string | Yes | -- | The message/prompt to send |
| context | string | No | -- | Additional context to prepend |
| include_editor_state | boolean | No | false | Append current level info as context |

**Returns:** Provider name, model, and response text.

---

### ue5_llm_analyze_screenshot
**Description:** Take a viewport screenshot and send it to a vision-capable LLM for analysis.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | -- | What to analyze (e.g., "What is wrong with this scene?") |

**Returns:** Provider name, model, screenshot path, and analysis text.

---

### ue5_llm_generate_code
**Description:** Ask the LLM to generate UE5 C++, Blueprint logic, or Python script.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| description | string | Yes | -- | What the code should do |
| language | enum | No | cpp | cpp, blueprint, python |

**Returns:** Generated code and provider info.

---

### ue5_llm_set_provider
**Description:** Switch the active LLM provider at runtime.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| provider | enum | Yes | -- | claude, openai, xai, gemini, ollama, custom |
| api_key | string | No | -- | API key (not needed for Ollama) |
| model | string | No | -- | Model ID (e.g., gpt-4o) |
| base_url | string | No | -- | Custom base URL |
| temperature | number | No | -- | Sampling temperature (0.0-1.0) |
| max_tokens | number | No | -- | Max tokens per response |

**Returns:** New provider name, model, and capabilities.

---

### ue5_llm_list_providers
**Description:** List all available LLM providers with metadata and active status.

No parameters.

**Returns:** Array of providers with active flag.

---

### ue5_llm_list_models
**Description:** List available models for the currently active LLM provider.

No parameters.

**Returns:** Array of models with IDs, context windows, and capabilities.

---

## 19. Level Streaming

Tools for managing streaming sublevels.

### ue5_create_sublevel
**Description:** Create a new streaming sublevel in the current persistent level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Sublevel name |
| always_loaded | boolean | No | false | Always loaded (no streaming) |

**Returns:** Created sublevel details.

---

### ue5_load_sublevel
**Description:** Load a streaming sublevel, making it visible in the editor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Sublevel name to load |

**Returns:** Load confirmation.

---

### ue5_unload_sublevel
**Description:** Unload a streaming sublevel from the editor view.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Sublevel name to unload |

**Returns:** Unload confirmation.

---

### ue5_list_sublevels
**Description:** List all streaming sublevels with load state, visibility, and transform.

No parameters.

**Returns:** Array of sublevels with their states.

---

### ue5_set_sublevel_transform
**Description:** Move a sublevel's origin to a new location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Sublevel name |
| location | {x, y, z} | Yes | -- | New world location |
| rotation | {pitch, yaw, roll} | No | -- | Optional rotation offset |

**Returns:** Updated transform confirmation.

---

## 20. Post-Processing

Tools for creating and configuring post-process volumes and color grading.

### ue5_create_post_process_volume
**Description:** Spawn a PostProcessVolume actor in the level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | No | -- | Actor label |
| location | {x, y, z} | No | -- | World location |
| extent | {x, y, z} | No | -- | Volume extent/size |
| infinite | boolean | No | false | Affects entire level if true |
| priority | number | No | 0 | Volume priority |
| blend_radius | number | No | 100 | Blend radius at edges |
| blend_weight | number | No | 1 | Blend weight (0-1) |

**Returns:** Created post-process volume details.

---

### ue5_set_post_process_settings
**Description:** Configure bloom, exposure, AO, vignette, and depth of field on a PostProcessVolume.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PostProcessVolume actor label |
| bloom_intensity | number | No | -- | Bloom intensity |
| bloom_threshold | number | No | -- | Bloom threshold |
| auto_exposure_min | number | No | -- | Auto exposure min brightness |
| auto_exposure_max | number | No | -- | Auto exposure max brightness |
| exposure_compensation | number | No | -- | Exposure bias (EV) |
| ao_intensity | number | No | -- | Ambient occlusion intensity (0-1) |
| ao_radius | number | No | -- | AO radius in world units |
| vignette_intensity | number | No | -- | Vignette intensity (0-1) |
| dof_focal_distance | number | No | -- | DOF focal distance (cm) |
| dof_depth_blur_radius | number | No | -- | DOF blur radius |
| dof_depth_blur_amount | number | No | -- | DOF blur amount |

**Returns:** Updated settings confirmation.

---

### ue5_create_post_process_material
**Description:** Apply a post-process material to a PostProcessVolume.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PostProcessVolume actor label |
| material_path | string | Yes | -- | Post-process domain material path |
| weight | number | No | 1 | Blendable weight (0-1) |

**Returns:** Material application confirmation.

---

### ue5_set_color_grading
**Description:** Set color grading on a PostProcessVolume: LUT, tints, saturation, contrast, white balance.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PostProcessVolume actor label |
| saturation | number | No | -- | Global saturation (1=normal) |
| contrast | number | No | -- | Global contrast (1=normal) |
| gamma | number | No | -- | Global gamma (1=normal) |
| gain | number | No | -- | Global gain (1=normal) |
| shadows_tint | {r, g, b} | No | -- | Shadows color tint |
| midtones_tint | {r, g, b} | No | -- | Midtones color tint |
| highlights_tint | {r, g, b} | No | -- | Highlights color tint |
| lut_path | string | No | -- | Color LUT texture path |
| temperature | number | No | -- | White balance temperature |
| tint | number | No | -- | White balance tint |

**Returns:** Updated color grading confirmation.

---

## 21. Audio

Tools for spawning ambient sounds, configuring audio, and managing reverb volumes.

### ue5_spawn_ambient_sound
**Description:** Spawn an AmbientSound actor with a SoundCue or SoundWave.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sound_path | string | Yes | -- | SoundCue or SoundWave asset path |
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| volume | number | No | 1 | Volume multiplier (0-2) |
| pitch | number | No | 1 | Pitch multiplier (0.5-2) |
| auto_activate | boolean | No | true | Auto-play when level loads |
| attenuation_path | string | No | -- | Sound attenuation settings asset |

**Returns:** Spawned sound actor details.

---

### ue5_set_sound_properties
**Description:** Set audio properties on an actor with an AudioComponent.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| volume | number | No | -- | Volume multiplier |
| pitch | number | No | -- | Pitch multiplier |
| auto_activate | boolean | No | -- | Auto-play |
| sound_path | string | No | -- | New sound asset path |
| attenuation_path | string | No | -- | Attenuation settings path |
| inner_radius | number | No | -- | Inner attenuation radius (cm) |
| outer_radius | number | No | -- | Outer attenuation radius (cm) |
| is_ui_sound | boolean | No | -- | Play without spatialization |

**Returns:** Updated sound properties confirmation.

---

### ue5_spawn_audio_volume
**Description:** Create an AudioVolume actor for reverb effects and audio zones.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | No | -- | Actor label |
| location | {x, y, z} | No | {0,0,0} | World location |
| extent | {x, y, z} | No | -- | Volume extent |
| priority | number | No | 0 | Volume priority |
| reverb_path | string | No | -- | ReverbEffect asset path |
| reverb_volume | number | No | 1 | Reverb volume (0-1) |
| reverb_fade_time | number | No | 0.5 | Fade time entering/exiting |

**Returns:** Created audio volume details.

---

### ue5_list_sound_assets
**Description:** List available SoundCue and SoundWave assets in the project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/ | Content browser path |
| type | enum | No | all | all, cue, wave |
| max_results | number | No | 200 | Maximum results |

**Returns:** Array of sound asset paths and types.

---

## 22. Physics & Collision

Tools for setting collision presets, adding collision volumes, physics simulation, and raycasting.

### ue5_set_collision
**Description:** Set the collision preset on an actor's component.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| preset | string | Yes | -- | Collision preset (BlockAll, OverlapAll, NoCollision, etc.) |
| component | string | No | -- | Specific component name (defaults to root) |
| enabled | boolean | No | -- | Enable/disable collision |
| generate_overlap_events | boolean | No | -- | Generate overlap events |

**Returns:** Collision update confirmation.

---

### ue5_add_collision_box
**Description:** Add a box collision component to an actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| extent | {x, y, z} | No | -- | Box half-extents in cm |
| offset | {x, y, z} | No | -- | Offset from actor origin |
| component_name | string | No | -- | Name for the collision component |
| preset | string | No | -- | Collision preset |
| generate_overlap_events | boolean | No | false | Generate overlap events |

**Returns:** Collision component creation confirmation.

---

### ue5_set_physics_simulation
**Description:** Enable or disable physics simulation on an actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| enabled | boolean | No | true | Enable/disable physics |
| component | string | No | -- | Specific component name |
| mass | number | No | -- | Mass override in kg |
| enable_gravity | boolean | No | -- | Enable/disable gravity |
| linear_damping | number | No | -- | Linear damping |
| angular_damping | number | No | -- | Angular damping |

**Returns:** Physics simulation update confirmation.

---

### ue5_raycast
**Description:** Cast a ray in the world and return what it hits.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| start | {x, y, z} | Yes | -- | Ray start point |
| end | {x, y, z} | No | -- | Ray end point (use this OR direction+distance) |
| direction | {x, y, z} | No | -- | Ray direction (normalized automatically) |
| distance | number | No | 10000 | Ray distance in cm |
| multi | boolean | No | false | Return all hits (true) or first only |
| complex | boolean | No | false | Per-poly collision (slower, more accurate) |
| ignore_label | string | No | -- | Actor label to ignore |

**Returns:** Hit results with actor labels, locations, normals, and distances.

---

## 23. Source Control

Tools for source control integration within UE5.

### ue5_save_and_checkout
**Description:** Save all dirty packages and check out files from source control.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | array | No | -- | Specific files to check out (default: current level) |

**Returns:** Save and checkout confirmation.

---

### ue5_submit_changes
**Description:** Submit changed files to source control with a description.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | array | Yes | -- | Files to submit |
| description | string | No | Submitted from UE Conduit | Submit description |

**Returns:** Submit confirmation.

---

### ue5_get_modified_files
**Description:** List all files modified, checked out, or added since last submit.

No parameters.

**Returns:** Array of modified file paths and their states.

---

## 24. Project Settings

Tools for reading/writing project settings, game mode, maps, and plugins.

### ue5_get_project_settings
**Description:** Read project settings by section and optional key.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| section | string | Yes | -- | Config section |
| key | string | No | -- | Specific key (omit for all keys in section) |
| config_file | enum | No | Game | Game, Engine, Input, Editor |

**Returns:** Setting value(s).

---

### ue5_set_project_settings
**Description:** Write a project setting to the appropriate .ini file.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| section | string | Yes | -- | Config section |
| key | string | Yes | -- | Setting key |
| value | string | Yes | -- | Setting value |
| config_file | enum | No | Game | Game, Engine, Input, Editor |

**Returns:** Setting write confirmation.

---

### ue5_set_game_mode
**Description:** Set the project's default game mode class.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| game_mode | string | Yes | -- | Game mode class path |

**Returns:** Game mode set confirmation.

---

### ue5_set_default_map
**Description:** Set the default editor startup map, game start map, or server default map.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| map_path | string | Yes | -- | Map asset path |
| type | enum | No | game | editor, game, server |

**Returns:** Default map set confirmation.

---

### ue5_enable_plugin
**Description:** Enable or disable a UE5 plugin. Requires editor restart.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| plugin_name | string | Yes | -- | Plugin name (e.g., Water, Niagara) |
| enabled | boolean | No | true | Enable or disable |

**Returns:** Plugin state change confirmation.

---

## 25. Scripting

Tools for executing command scripts and Python scripts in UE5.

### ue5_execute_script
**Description:** Execute a list of UE Conduit commands in sequence, like a macro.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| commands | array | Yes | -- | Array of commands, each with category, command, params |
| stop_on_error | boolean | No | true | Stop execution if a command fails |

**Returns:** Results for each step.

---

### ue5_execute_python
**Description:** Execute Python in UE5's built-in Python environment. Requires Python Editor Script Plugin.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| script | string | No | -- | Inline Python code to execute |
| script_path | string | No | -- | Absolute path to a .py file |

**Returns:** Python execution output.

---

## 26. Sequencer / Cinematics

Tools for creating Level Sequences, tracks, keyframes, and rendering to video.

### ue5_create_level_sequence
**Description:** Create a new LevelSequence asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Sequence name |
| path | string | No | /Game/Cinematics | Content browser path |
| frame_rate | number | No | 30 | Display frame rate |

---

### ue5_add_track
**Description:** Add a track to a LevelSequence.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |
| track_type | enum | Yes | -- | transform, animation, audio, camera_cut, event |

---

### ue5_add_keyframe
**Description:** Add a keyframe at a specific frame in a sequence track.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |
| frame | number | Yes | -- | Frame number |
| track_index | number | No | 0 | Track index |
| value | number | No | 0 | Value at this keyframe |

---

### ue5_set_sequence_length
**Description:** Set the playback range of a LevelSequence.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |
| start_frame | number | No | 0 | Start frame |
| end_frame | number | Yes | -- | End frame |

---

### ue5_play_sequence
**Description:** Play a LevelSequence in the editor viewport.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |

---

### ue5_stop_sequence
**Description:** Stop all playing sequences.

No parameters.

---

### ue5_render_sequence
**Description:** Render a LevelSequence to video via Movie Render Queue.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |
| output_directory | string | No | -- | Output directory |
| output_format | enum | No | avi | avi, mp4, png_sequence |
| resolution_x | number | No | 1920 | Horizontal resolution |
| resolution_y | number | No | 1080 | Vertical resolution |

---

### ue5_add_camera_cut
**Description:** Add a camera cut track entry to switch cameras during a sequence.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sequence_path | string | Yes | -- | LevelSequence asset path |
| camera_label | string | Yes | -- | Camera actor label |

---

## 27. MetaHuman / Characters

Tools for listing, spawning, and customizing MetaHuman characters.

### ue5_list_metahumans
**Description:** List all MetaHuman assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game/MetaHumans | Content browser path |

---

### ue5_spawn_metahuman
**Description:** Spawn a MetaHuman actor from a Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blueprint_path | string | Yes | -- | MetaHuman Blueprint path |
| location | {x, y, z} | No | {0,0,0} | World location |
| rotation | {pitch, yaw, roll} | No | {0,0,0} | Initial rotation |
| label | string | No | -- | Actor label |

---

### ue5_customize_metahuman
**Description:** Customize a MetaHuman actor's body, face, hair, and clothing.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | MetaHuman actor label |
| body_type | string | No | -- | Body type preset |
| face_preset | string | No | -- | Face preset name |
| hair_style | string | No | -- | Hair style name |
| clothing | string | No | -- | Clothing preset name |

---

### ue5_set_metahuman_animation
**Description:** Assign an Animation Blueprint to a MetaHuman or character actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| anim_blueprint | string | Yes | -- | Animation Blueprint path |

---

### ue5_create_character_from_mesh
**Description:** Create a Character Blueprint from any skeletal mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| skeletal_mesh | string | Yes | -- | SkeletalMesh asset path |
| name | string | Yes | -- | Blueprint name |
| path | string | No | /Game/Blueprints/Characters | Content browser path |

---

### ue5_set_character_mesh
**Description:** Swap the skeletal mesh on an existing character actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Character actor label |
| skeletal_mesh | string | Yes | -- | New SkeletalMesh path |

---

## 28. PCG (Procedural Content Generation)

Tools for PCG graphs, volumes, and procedural generation.

### ue5_create_pcg_graph
**Description:** Create a new PCG graph asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | PCG graph name |
| path | string | No | /Game/PCG | Content browser path |

---

### ue5_spawn_pcg_actor
**Description:** Spawn a PCG volume actor and optionally assign a graph.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| graph_path | string | No | -- | PCG graph to assign |

---

### ue5_execute_pcg_graph
**Description:** Execute a PCG graph on a PCG actor to generate content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PCG volume actor label |

---

### ue5_set_pcg_parameter
**Description:** Set a parameter value on a PCG actor's graph.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PCG volume actor label |
| parameter_name | string | Yes | -- | Parameter name |
| value | number | Yes | -- | Parameter value |

---

### ue5_list_pcg_graphs
**Description:** List all PCG graph assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game | Content browser path |

---

### ue5_clear_pcg_output
**Description:** Clear all generated content from a PCG actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | PCG volume actor label |

---

## 29. World Partition

Tools for managing World Partition regions, data layers, and streaming.

### ue5_get_world_partition_info
**Description:** Get World Partition grid info and streaming status.

No parameters.

---

### ue5_load_region
**Description:** Load a World Partition region by bounding box.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| min | {x, y, z} | Yes | -- | Minimum corner |
| max | {x, y, z} | Yes | -- | Maximum corner |

---

### ue5_unload_region
**Description:** Unload a World Partition region to free memory.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| min | {x, y, z} | No | {0,0,0} | Minimum corner |
| max | {x, y, z} | No | {0,0,0} | Maximum corner |

---

### ue5_create_data_layer
**Description:** Create a new data layer for organizing actors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Data layer name |

---

### ue5_set_actor_data_layer
**Description:** Assign an actor to a specific data layer.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| data_layer | string | Yes | -- | Data layer name |

---

## 30. Modeling / Geometry

Tools for creating procedural meshes and boolean operations.

### ue5_create_box_mesh
**Description:** Create a procedural box mesh actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| dimensions | {width, height, depth} | No | {100,100,100} | Box dimensions |

---

### ue5_create_cylinder_mesh
**Description:** Create a procedural cylinder mesh actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| radius | number | No | 50 | Cylinder radius |
| height | number | No | 100 | Cylinder height |

---

### ue5_create_sphere_mesh
**Description:** Create a procedural sphere mesh actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| radius | number | No | 50 | Sphere radius |

---

### ue5_create_plane_mesh
**Description:** Create a procedural plane mesh actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| size_x | number | No | 100 | Plane width |
| size_y | number | No | 100 | Plane height |

---

### ue5_boolean_union
**Description:** Boolean union (combine) two mesh actors into one.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_a | string | Yes | -- | First actor label |
| actor_b | string | Yes | -- | Second actor label |

---

### ue5_boolean_subtract
**Description:** Boolean subtraction: subtract actor_b from actor_a.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| actor_a | string | Yes | -- | Base actor label |
| actor_b | string | Yes | -- | Actor to subtract |

---

### ue5_convert_to_static_mesh
**Description:** Convert a dynamic/procedural mesh to a saved StaticMesh asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label of mesh to convert |
| asset_name | string | No | -- | Name for the new StaticMesh |
| path | string | No | /Game/Meshes | Content browser path |

---

## 31. Textures & Materials (Advanced)

Tools for render targets, procedural textures, decals, and material parameter management.

### ue5_create_render_target
**Description:** Create a render target texture asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Render target name |
| path | string | No | /Game/Textures/RenderTargets | Content browser path |
| width | number | No | 1024 | Texture width |
| height | number | No | 1024 | Texture height |
| format | enum | No | RGBA8 | RGBA8, HDR |

---

### ue5_create_texture_from_color
**Description:** Generate a solid color texture asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Texture name |
| path | string | No | /Game/Textures | Content browser path |
| width | number | No | 64 | Texture width |
| height | number | No | 64 | Texture height |
| color | {r, g, b, a} | No | {1,1,1,1} | Fill color (0-1) |

---

### ue5_create_texture_from_noise
**Description:** Generate a procedural noise texture.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Texture name |
| path | string | No | /Game/Textures | Content browser path |
| width | number | No | 256 | Texture width |
| height | number | No | 256 | Texture height |
| noise_type | enum | No | perlin | perlin, worley, simplex, value |
| scale | number | No | 1.0 | Noise scale |
| seed | number | No | 0 | Random seed |

---

### ue5_apply_material_to_actors
**Description:** Batch apply a material to multiple actors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| material_path | string | Yes | -- | Material asset path |
| actor_labels | array | Yes | -- | Array of actor labels |

---

### ue5_create_decal
**Description:** Spawn a decal actor with a material.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| material_path | string | Yes | -- | Decal material path |
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |
| size_x | number | No | 128 | Decal width |
| size_y | number | No | 128 | Decal height |
| size_z | number | No | 256 | Decal projection depth |

---

### ue5_create_landscape_layer_info
**Description:** Create a landscape layer info asset for landscape painting.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Layer info asset name |
| path | string | No | /Game/Landscape/LayerInfo | Content browser path |
| layer_name | string | Yes | -- | Landscape layer name (Grass, Rock, Sand) |
| weight_blended | boolean | No | true | Use weight-blended layer |

---

### ue5_get_material_parameters
**Description:** List all parameters of a material.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| material_path | string | Yes | -- | Material or material instance path |

---

### ue5_set_material_parameter
**Description:** Set a parameter on a MaterialInstanceConstant.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| material_path | string | Yes | -- | MaterialInstanceConstant path |
| parameter_name | string | Yes | -- | Parameter name |
| parameter_type | enum | Yes | -- | scalar, vector, texture |
| value | any | No | -- | Scalar number or vector {r,g,b,a} |
| texture_path | string | No | -- | Texture path (for texture params) |

---

## 32. Gameplay Framework

Tools for creating game mode, player controller, game state, and gameplay volumes.

### ue5_create_game_mode
**Description:** Create a GameMode Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | No | BP_GameMode | Blueprint name |
| path | string | No | /Game/Blueprints/Framework | Content browser path |

---

### ue5_create_player_controller
**Description:** Create a PlayerController Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | No | BP_PlayerController | Blueprint name |
| path | string | No | /Game/Blueprints/Framework | Content browser path |

---

### ue5_create_game_state
**Description:** Create a GameState Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | No | BP_GameState | Blueprint name |
| path | string | No | /Game/Blueprints/Framework | Content browser path |

---

### ue5_set_world_settings
**Description:** Set world settings: game mode, kill Z, gravity.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| game_mode | string | No | -- | GameMode class path |
| kill_z | number | No | -- | Kill Z height |
| gravity_z | number | No | -- | World gravity Z (default: -980) |

---

### ue5_create_player_start
**Description:** Spawn a PlayerStart actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,100} | World location |
| rotation | {yaw} | No | {0} | Facing direction |
| label | string | No | -- | Actor label |
| player_start_tag | string | No | -- | Tag for team/role spawns |

---

### ue5_create_trigger_volume
**Description:** Create a trigger volume for gameplay events.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| shape | enum | No | box | box, sphere |
| extent | {x, y, z} | No | {200,200,200} | Volume extent |
| label | string | No | -- | Actor label |

---

### ue5_create_blocking_volume
**Description:** Create an invisible blocking wall.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| extent | {x, y, z} | No | {500,500,500} | Volume extent |
| label | string | No | -- | Actor label |

---

### ue5_set_level_bounds
**Description:** Configure level streaming distances and bounds.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| streaming_distance | number | No | -- | Streaming distance in world units |

---

## 33. Navigation (Advanced)

Tools for NavMesh bounds, NavLinks, NavModifiers, EQS, and path testing.

### ue5_create_nav_mesh_bounds
**Description:** Create a NavMeshBoundsVolume.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| extent | {x, y, z} | No | {5000,5000,1000} | Volume extent |
| label | string | No | -- | Actor label |

---

### ue5_rebuild_navigation
**Description:** Rebuild all navigation data for the current level.

No parameters.

---

### ue5_create_nav_link
**Description:** Create a NavLink proxy for AI jump/teleport connections.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| label | string | No | -- | Actor label |

---

### ue5_create_nav_modifier
**Description:** Create a NavModifier volume for AI pathfinding cost/restriction.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| location | {x, y, z} | No | {0,0,0} | World location |
| extent | {x, y, z} | No | {500,500,200} | Volume extent |
| label | string | No | -- | Actor label |

---

### ue5_create_eqs_query
**Description:** Create an Environment Query System (EQS) query asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | EQS query name |
| path | string | No | /Game/AI/EQS | Content browser path |

---

### ue5_test_path
**Description:** Test if a navigation path exists between two points.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| start | {x, y, z} | Yes | -- | Start location |
| end | {x, y, z} | Yes | -- | End location |

---

### ue5_get_random_reachable_point
**Description:** Get a random navigable point within a radius.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| origin | {x, y, z} | No | {0,0,0} | Search origin |
| radius | number | No | 5000 | Search radius |

---

## 34. Dialogue / Story

Tools for creating dialogue waves, voices, and subtitles.

### ue5_create_dialogue_wave
**Description:** Create a DialogueWave asset with spoken text and optional audio.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Dialogue wave name |
| path | string | No | /Game/Audio/Dialogue | Content browser path |
| spoken_text | string | No | -- | The spoken dialogue text |
| subtitle_override | string | No | -- | Custom subtitle text |
| mature | boolean | No | false | Flag as mature content |

---

### ue5_create_dialogue_voice
**Description:** Create a DialogueVoice asset representing a speaker.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Voice name |
| path | string | No | /Game/Audio/Dialogue/Voices | Content browser path |
| gender | enum | No | male | male, female, neuter |
| plurality | enum | No | singular | singular, plural |

---

### ue5_play_dialogue
**Description:** Play a DialogueWave in the editor for preview.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| dialogue_path | string | Yes | -- | DialogueWave asset path |

---

### ue5_create_subtitle
**Description:** Set subtitle text on an existing DialogueWave.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| dialogue_path | string | Yes | -- | DialogueWave asset path |
| subtitle_text | string | Yes | -- | Subtitle text to display |

---

### ue5_list_dialogue_assets
**Description:** List all DialogueWave and DialogueVoice assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game | Content browser path |

---

## 35. Save Game

Tools for creating SaveGame Blueprints, saving, loading, and managing save slots.

### ue5_create_save_game_bp
**Description:** Create a SaveGame Blueprint for persistent game data.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | No | BP_SaveGame | Blueprint name |
| path | string | No | /Game/Blueprints/SaveGame | Content browser path |

---

### ue5_save_game
**Description:** Save the current game state to a named slot.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| slot_name | string | No | SaveSlot_0 | Save slot name |
| user_index | number | No | 0 | User/controller index |

---

### ue5_load_game
**Description:** Load game state from a named save slot.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| slot_name | string | Yes | -- | Save slot name |
| user_index | number | No | 0 | User/controller index |

---

### ue5_delete_save
**Description:** Delete a save slot.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| slot_name | string | Yes | -- | Save slot name |
| user_index | number | No | 0 | User/controller index |

---

### ue5_list_save_slots
**Description:** List all available save slots with sizes and dates.

No parameters.

---

## 36. Multiplayer

Tools for configuring replication, network roles, sessions, and multiplayer testing.

### ue5_set_replication
**Description:** Set replication settings on an actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| replicate | boolean | No | true | Enable replication |
| replicate_movement | boolean | No | -- | Replicate movement to clients |

---

### ue5_set_net_role
**Description:** Get/set the network authority role of an actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| label | string | Yes | -- | Actor label |
| role | enum | No | -- | Authority, AutonomousProxy, SimulatedProxy |

---

### ue5_create_game_session
**Description:** Create a game session configuration.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| session_name | string | No | DefaultSession | Session name |
| max_players | number | No | 16 | Maximum player count |
| is_lan | boolean | No | false | LAN-only session |

---

### ue5_set_max_players
**Description:** Set the maximum player count.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| max_players | number | Yes | -- | Maximum number of players |

---

### ue5_test_multiplayer
**Description:** Launch a multiplayer PIE test.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| num_players | number | No | 2 | Number of players to simulate |
| dedicated_server | boolean | No | false | Use a dedicated server instance |

---

## 37. Widgets (Advanced)

Tools for HUD widgets, viewport management, animations, events, and styling.

### ue5_create_hud_widget
**Description:** Create a HUD Widget Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | No | WBP_HUD | Widget Blueprint name |
| path | string | No | /Game/UI/HUD | Content browser path |

---

### ue5_add_widget_to_viewport
**Description:** Add a widget to the game viewport at runtime.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_path | string | Yes | -- | Widget Blueprint path |
| z_order | number | No | 0 | Z-order (higher = on top) |

---

### ue5_remove_widget_from_viewport
**Description:** Remove a widget from the game viewport.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_path | string | Yes | -- | Widget Blueprint path |

---

### ue5_create_widget_animation
**Description:** Create a widget animation (fade, slide, scale).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_path | string | Yes | -- | Widget Blueprint path |
| animation_name | string | Yes | -- | Animation name |
| duration | number | No | 1.0 | Duration in seconds |

---

### ue5_bind_widget_event
**Description:** Bind a widget event to a Blueprint function.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_path | string | Yes | -- | Widget Blueprint path |
| widget_name | string | Yes | -- | Widget element name |
| event_name | enum | No | OnClicked | OnClicked, OnHovered, OnUnhovered, OnPressed, OnReleased |
| function_name | string | Yes | -- | Blueprint function name |

---

### ue5_set_widget_style
**Description:** Set visual style properties on a widget element.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| widget_path | string | Yes | -- | Widget Blueprint path |
| widget_name | string | Yes | -- | Widget element name |
| font_family | string | No | -- | Font family name |
| font_size | number | No | -- | Font size |
| color | {r, g, b, a} | No | -- | Color (RGBA 0-1) |
| alignment | enum | No | -- | Left, Center, Right, Fill |
| padding | number | No | -- | Uniform padding |
| visibility | enum | No | -- | Visible, Hidden, Collapsed |
| opacity | number | No | -- | Render opacity (0-1) |

---

## 38. Build (Advanced)

Tools for cooking content, packaging, validation, and cleanup.

### ue5_cook_project
**Description:** Cook project content for a target platform.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| platform | enum | No | Windows | Windows, Linux, Android, IOS, Mac |
| configuration | enum | No | Development | Development, Shipping, DebugGame |

---

### ue5_package_project
**Description:** Package the game as a standalone executable.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| platform | enum | No | Windows | Windows, Linux, Android, IOS, Mac |
| configuration | enum | No | Shipping | Development, Shipping, DebugGame |
| output_directory | string | No | -- | Output directory |

---

### ue5_get_package_status
**Description:** Check the status of a cooking/packaging operation.

No parameters.

---

### ue5_validate_assets
**Description:** Run asset validation checks.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | /Game | Content browser path to validate |

---

### ue5_clean_project
**Description:** Clean intermediate build files and caches.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| clean_intermediate | boolean | No | true | Clean Intermediate/ folder |
| clean_saved | boolean | No | false | Clean Saved/ folder |
| clean_derived_data | boolean | No | false | Clean DerivedDataCache/ |

---

## 39. Git

Tools for git operations on the UE5 project.

### ue5_git_status
**Description:** Get git status of the UE5 project.

No parameters.

---

### ue5_git_diff
**Description:** Get git diff of changed files.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| file_path | string | No | -- | Specific file to diff |
| staged | boolean | No | false | Show staged changes only |
| max_lines | number | No | 500 | Maximum lines of diff output |

---

### ue5_git_commit
**Description:** Commit staged changes.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| message | string | Yes | -- | Commit message |
| stage_all | boolean | No | false | Stage all changes before committing |

---

### ue5_git_push
**Description:** Push committed changes to the remote.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| remote | string | No | origin | Remote name |
| branch | string | No | -- | Branch to push (defaults to current) |

---

### ue5_git_log
**Description:** Get recent commit history.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| count | number | No | 10 | Number of commits to show |

---

## 40. Marketplace / Distribution

Tools for exporting plugins, creating feature packs, and validating marketplace submissions.

### ue5_export_plugin
**Description:** Export a plugin as a distributable package.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| plugin_name | string | Yes | -- | Plugin name to export |
| output_directory | string | No | -- | Output directory |
| target_platform | string | No | Win64 | Target platform |

---

### ue5_create_feature_pack
**Description:** Create a feature/content pack (.pak).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | -- | Feature pack name |
| content_path | string | No | /Game | Content path to include |
| output_directory | string | No | -- | Output directory |

---

### ue5_validate_marketplace
**Description:** Validate assets against Fab/Epic marketplace submission guidelines.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| content_path | string | No | /Game | Content path to validate |

---

### ue5_generate_thumbnails
**Description:** Auto-generate asset thumbnails for all assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| content_path | string | No | /Game | Content browser path |

---

## 41. Orchestration

High-level tools registered directly in index.ts for autonomous workflows.

### ue5_build_test_fix
**Description:** Run an autonomous compile-test cycle. Compiles C++, starts PIE if clean, checks for runtime errors, takes a screenshot on success.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| task_description | string | Yes | -- | What was changed (for logging/naming) |
| max_iterations | number | No | 10 | Maximum compile attempts before aborting |

**Returns:** Structured results with compile status, errors, PIE output, screenshot path.

---

### ue5_import_directory
**Description:** Batch import an entire directory into UE5. Auto-categorizes by type, detects normal maps.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| source_path | string | Yes | -- | Absolute path to directory |
| dest_path | string | Yes | -- | Content browser destination |
| batch_size | number | No | 50 | Files per batch |
| recursive | boolean | No | true | Include subdirectories |
| organize_by_type | boolean | No | true | Create Textures/, Meshes/, Audio/ subfolders |
| auto_detect_normals | boolean | No | true | Auto-detect normal maps from filename patterns |

**Returns:** Import counts by type, success/failure totals, material creation counts.

---

### ue5_populate_zone
**Description:** Build a zone from a game-data JSON file. Spawns NPCs, enemies, gathering nodes, sounds, and lighting.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zone_data_path | string | Yes | -- | Path to zone JSON file |

**Returns:** Number of actors spawned by type, zone configuration details.

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
