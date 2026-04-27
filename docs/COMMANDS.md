# UE Conduit -- Complete Command Reference

**Version:** 1.0.0
**Total Tools:** 79 (76 individual + 3 orchestration)
**Author:** Jag Journey, LLC

---

## Table of Contents

1. [Actor / Level Tools (8)](#actor--level-tools)
2. [Blueprint Tools (6)](#blueprint-tools)
3. [Asset / Import Tools (7)](#asset--import-tools)
4. [Compile / Build Tools (4)](#compile--build-tools)
5. [Play-In-Editor (PIE) Tools (6)](#play-in-editor-pie-tools)
6. [Editor Tools (8)](#editor-tools)
7. [Landscape Tools (6)](#landscape-tools)
8. [Water Tools (3)](#water-tools)
9. [Foliage Tools (5)](#foliage-tools)
10. [Fab / Marketplace Tools (4)](#fab--marketplace-tools)
11. [Screenshot / Viewport Tools (3)](#screenshot--viewport-tools)
12. [Widget / UMG Tools (5)](#widget--umg-tools)
13. [Animation Tools (4)](#animation-tools)
14. [Input Tools (4)](#input-tools)
15. [AI / Navigation Tools (5)](#ai--navigation-tools)
16. [Niagara / VFX Tools (4)](#niagara--vfx-tools)
17. [Data Asset Tools (4)](#data-asset-tools)
18. [Orchestration Tools (3)](#orchestration-tools)

---

## Actor / Level Tools

### ue5_spawn_actor

Spawn an actor in the UE5 editor level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `class_path` | string | Yes | -- | Blueprint or C++ class path (e.g., `/Game/Blueprints/BP_Enemy`, `/Script/Engine.PointLight`) |
| `location` | `{x, y, z}` | No | `{0, 0, 0}` | World location |
| `rotation` | `{pitch, yaw, roll}` | No | `{0, 0, 0}` | Rotation in degrees |
| `scale` | `{x, y, z}` | No | `{1, 1, 1}` | Scale multiplier |
| `label` | string | No | Auto-generated | Actor label in the outliner |
| `properties` | object | No | `{}` | Properties to set after spawning |

**Category/Command:** `level` / `spawn_actor`

**Example Request:**
```json
{
  "command_id": "spawn_1",
  "category": "level",
  "command": "spawn_actor",
  "params": {
    "class_path": "/Script/Engine.PointLight",
    "location": {"x": 0, "y": 0, "z": 500},
    "rotation": {"pitch": 0, "yaw": 0, "roll": 0},
    "scale": {"x": 1, "y": 1, "z": 1},
    "actor_label": "MyLight",
    "properties": {"Intensity": 5000}
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Actor spawned: MyLight",
  "execution_time_ms": 15.2,
  "output": {
    "actor_label": "MyLight",
    "actor_class": "PointLight",
    "location": {"x": 0, "y": 0, "z": 500}
  }
}
```

**Notes:** If an actor with the same label already exists, a numeric suffix is appended automatically.

---

### ue5_delete_actor

Delete an actor from the level by its label or path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actor_label` | string | Yes | -- | The actor label or path to delete |

**Category/Command:** `level` / `delete_actor`

**Example Request:**
```json
{
  "command_id": "del_1",
  "category": "level",
  "command": "delete_actor",
  "params": {"actor_label": "MyLight"}
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Actor deleted: MyLight",
  "execution_time_ms": 8.1
}
```

**Notes:** This action is undoable via `ue5_undo`. Returns an error if the actor is not found.

---

### ue5_move_actor

Set an actor's transform (location, rotation, scale). Any combination of parameters can be provided.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actor_label` | string | Yes | -- | The actor to move |
| `location` | `{x, y, z}` | No | Unchanged | New world location |
| `rotation` | `{pitch, yaw, roll}` | No | Unchanged | New rotation |
| `scale` | `{x, y, z}` | No | Unchanged | New scale |

**Category/Command:** `level` / `set_actor_transform`

**Example Request:**
```json
{
  "command_id": "move_1",
  "category": "level",
  "command": "set_actor_transform",
  "params": {
    "actor_label": "MyLight",
    "location": {"x": 1000, "y": 500, "z": 800}
  }
}
```

---

### ue5_list_actors

List all actors in the current level with optional filters.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `class_filter` | string | No | `""` | Filter by class name (e.g., `StaticMeshActor`) |
| `tag_filter` | string | No | `""` | Filter by actor tag |
| `name_filter` | string | No | `""` | Filter by name substring |
| `limit` | number | No | `100` | Maximum results to return |

**Category/Command:** `level` / `list_actors`

**Example Response:**
```json
{
  "success": true,
  "output": {
    "actors": [
      {"label": "PointLight_0", "class": "PointLight", "location": {"x": 0, "y": 0, "z": 500}},
      {"label": "Floor", "class": "StaticMeshActor", "location": {"x": 0, "y": 0, "z": 0}}
    ],
    "total_count": 2,
    "filtered": false
  }
}
```

---

### ue5_query_actor

Get detailed information about a specific actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actor_label` | string | Yes | -- | The actor label to query |

**Category/Command:** `level` / `query_actor`

**Notes:** Returns all properties via UPROPERTY reflection, component list, transform, tags, and bounds.

---

### ue5_set_actor_property

Set any property on an actor using dot notation for nested access.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actor_label` | string | Yes | -- | The actor to modify |
| `property_path` | string | Yes | -- | Property path (e.g., `MaxHealth`, `LightComponent.Intensity`) |
| `value` | any | Yes | -- | The value to set |

**Category/Command:** `level` / `set_property`

**Notes:** Supports dot notation for nested properties. The property must be a UPROPERTY exposed to the editor.

---

### ue5_batch_spawn

Spawn multiple actors in a single call. Significantly faster than individual spawns for placing many actors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actors` | array | Yes | -- | Array of actor definitions |

Each actor in the array:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `class_path` | string | Yes | -- | Blueprint or C++ class path |
| `location` | `{x, y, z}` | No | `{0, 0, 0}` | World location |
| `rotation` | `{pitch, yaw, roll}` | No | `{0, 0, 0}` | Rotation |
| `scale` | `{x, y, z}` | No | `{1, 1, 1}` | Scale |
| `label` | string | No | Auto | Actor label |
| `properties` | object | No | `{}` | Properties to set |

**Example Request:**
```json
{
  "actors": [
    {"class_path": "/Game/BP_Enemy", "location": {"x": 0, "y": 0, "z": 0}, "label": "Enemy_01"},
    {"class_path": "/Game/BP_Enemy", "location": {"x": 500, "y": 0, "z": 0}, "label": "Enemy_02"},
    {"class_path": "/Game/BP_Enemy", "location": {"x": 1000, "y": 0, "z": 0}, "label": "Enemy_03"}
  ]
}
```

---

### ue5_select_actor

Select an actor in the editor (highlights in viewport and outliner).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `actor_label` | string | Yes | -- | The actor to select |

**Category/Command:** `editor` / `select_actor`

---

## Blueprint Tools

### ue5_create_blueprint

Create a new Blueprint class.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Blueprint name (e.g., `BP_Enemy_Crab`) |
| `parent_class` | string | Yes | -- | Parent class path (e.g., `/Script/Engine.Actor`) |
| `path` | string | No | `/Game/Blueprints/` | Content browser folder path |
| `components` | array | No | `[]` | Components to add |

Each component:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Component class (e.g., `StaticMeshComponent`) |
| `name` | string | Yes | Component name |
| `properties` | object | No | Component properties |

---

### ue5_add_component

Add a component to an existing Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `blueprint` | string | Yes | -- | Blueprint path |
| `component_type` | string | Yes | -- | Component class name |
| `component_name` | string | Yes | -- | Name for the new component |
| `properties` | object | No | `{}` | Properties to set on the component |

---

### ue5_add_variable

Add a variable to a Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `blueprint` | string | Yes | -- | Blueprint path |
| `name` | string | Yes | -- | Variable name (e.g., `MaxHealth`) |
| `type` | string | Yes | -- | Variable type (`bool`, `int`, `float`, `string`, `FVector`, `FRotator`, `UObject*`) |
| `default_value` | any | No | Type default | Default value |
| `expose_to_editor` | boolean | No | `true` | Show in Details panel when placed |
| `category` | string | No | `""` | Category in Details panel |

---

### ue5_compile_blueprint

Compile a Blueprint and return any errors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `blueprint` | string | Yes | -- | Blueprint path to compile |

---

### ue5_list_blueprints

List all Blueprints in a content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game/Blueprints/` | Content browser path to search |
| `recursive` | boolean | No | `true` | Include subdirectories |

---

### ue5_get_blueprint_info

Get detailed info about a Blueprint (variables, components, functions, parent class).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `blueprint` | string | Yes | -- | Blueprint path |

---

## Asset / Import Tools

### ue5_import_texture

Import an image file as a UE5 texture asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source_path` | string | Yes | -- | Absolute path to image file (PNG, JPG, TGA, BMP) |
| `dest_path` | string | Yes | -- | Content browser destination |
| `name` | string | No | Filename | Asset name |
| `compression` | enum | No | `TC_Default` | `TC_Default`, `TC_Normalmap`, `TC_Masks`, `TC_Grayscale`, `TC_HDR`, `TC_UserInterface2D` |
| `srgb` | boolean | No | `true` | sRGB color space (`true` for diffuse, `false` for normal/mask) |

---

### ue5_import_mesh

Import a 3D model as a static or skeletal mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source_path` | string | Yes | -- | Absolute path to mesh file (FBX, OBJ, glTF) |
| `dest_path` | string | Yes | -- | Content browser destination |
| `name` | string | No | Filename | Asset name |
| `skeletal` | boolean | No | `false` | Import as skeletal mesh (for characters with bones) |

---

### ue5_create_material

Create a new material asset with texture inputs.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Material name |
| `path` | string | No | `/Game/Materials/` | Content browser path |
| `domain` | enum | No | `Surface` | `Surface`, `DeferredDecal`, `LightFunction`, `PostProcess`, `UI` |
| `blend_mode` | enum | No | `Opaque` | `Opaque`, `Masked`, `Translucent`, `Additive`, `Modulate` |
| `two_sided` | boolean | No | `false` | Enable two-sided rendering |
| `base_color_texture` | string | No | -- | Texture path for base color |
| `normal_texture` | string | No | -- | Texture path for normal map |
| `roughness_value` | number | No | -- | Constant roughness (0-1) |
| `metallic_value` | number | No | -- | Constant metallic (0-1) |
| `emissive_texture` | string | No | -- | Texture path for emissive |
| `emissive_strength` | number | No | -- | Emissive multiplier |

---

### ue5_create_material_instance

Create a material instance from a parent material with parameter overrides.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Material instance name |
| `parent_material` | string | Yes | -- | Parent material path |
| `path` | string | No | `/Game/Materials/Instances/` | Content browser path |
| `texture_params` | `{name: path}` | No | `{}` | Texture parameter overrides |
| `scalar_params` | `{name: value}` | No | `{}` | Scalar parameter overrides |
| `vector_params` | `{name: {r,g,b,a}}` | No | `{}` | Vector parameter overrides |

---

### ue5_batch_import

Import all files from a directory into UE5.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source_dir` | string | Yes | -- | Absolute path to directory |
| `dest_path` | string | Yes | -- | Content browser destination |
| `file_filter` | string | No | `*.*` | File extension filter |
| `recursive` | boolean | No | `true` | Include subdirectories |

---

### ue5_list_assets

List assets in a content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game/` | Content browser path |
| `type_filter` | string | No | `""` | Asset type filter (`Texture2D`, `StaticMesh`, `Blueprint`, etc.) |
| `recursive` | boolean | No | `false` | Include subdirectories |
| `limit` | number | No | `100` | Maximum results |

---

### ue5_search_assets

Search for assets by name across the entire project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | -- | Search query (name substring) |
| `type_filter` | string | No | `""` | Asset type filter |
| `limit` | number | No | `50` | Maximum results |

---

## Compile / Build Tools

### ue5_compile_cpp

Trigger C++ compilation (equivalent to Ctrl+Alt+F11).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `clean` | boolean | No | `false` | Clean build (delete intermediates first) |

**Category/Command:** `build` / `compile` (or `full_rebuild` if clean)

---

### ue5_hot_reload

Trigger hot reload of C++ modules without full recompile.

No parameters.

**Category/Command:** `build` / `hot_reload`

---

### ue5_get_build_errors

Get the latest compilation errors and warnings.

No parameters.

**Category/Command:** `build` / `get_errors`

---

### ue5_build_lighting

Build lighting for the current level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `quality` | enum | No | `Medium` | `Preview`, `Medium`, `High`, `Production` |

---

## Play-In-Editor (PIE) Tools

### ue5_play

Start Play-In-Editor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mode` | enum | No | `PIE` | `PIE`, `SIE` (Simulate), `standalone` |

**Category/Command:** `console` / `start_pie`

---

### ue5_stop

Stop Play-In-Editor.

No parameters.

**Category/Command:** `console` / `stop_pie`

---

### ue5_restart_pie

Stop and immediately restart PIE. Useful after code changes.

No parameters.

**Notes:** Internally calls stop_pie, waits 500ms, then start_pie.

---

### ue5_screenshot

Take a screenshot of the current viewport.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filename` | string | No | `screenshot_{timestamp}.png` | Output filename |

**Category/Command:** `viewport` / `screenshot`

---

### ue5_get_game_log

Get recent game output log lines from PIE.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `last_n_lines` | number | No | `50` | Number of recent log lines |
| `filter` | string | No | `""` | Filter by category or keyword |

**Category/Command:** `console` / `get_log`

---

### ue5_execute_console_command

Execute a console command in the editor or PIE session.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `command` | string | Yes | -- | Console command (e.g., `stat fps`, `show collision`) |

**Category/Command:** `console` / `execute`

---

## Editor Tools

### ue5_get_editor_state

Get the current state of the UE5 editor.

No parameters.

**Response output fields:** `level_name`, `actor_count`, `pie_state`, `build_status`, `selected_actors`, `engine_version`, `project_name`

---

### ue5_save_level

Save the currently open level.

No parameters.

---

### ue5_save_all

Save all unsaved assets and levels.

No parameters.

---

### ue5_load_level

Load a level by its content browser path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `level_path` | string | Yes | -- | Level path (e.g., `/Game/Maps/L_ShatteredCoast`) |

---

### ue5_undo

Undo the last editor action.

No parameters.

---

### ue5_redo

Redo the last undone editor action.

No parameters.

---

### ue5_focus_viewport

Move the editor viewport camera to a specific location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | Yes | -- | Camera position |
| `rotation` | `{pitch, yaw, roll}` | No | `{-30, 0, 0}` | Camera rotation |

---

### ue5_notify

Show a toast notification in the UE5 editor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | -- | Notification message |
| `type` | enum | No | `info` | `info`, `success`, `warning`, `error` |

---

## Landscape Tools

### ue5_create_landscape

Create a new landscape actor in the level.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | No | `{0, 0, 0}` | Landscape origin |
| `num_quads_x` | number | No | `63` | Quads per section X (63, 127, 255) |
| `num_quads_y` | number | No | `63` | Quads per section Y |
| `sections_x` | number | No | `1` | Number of sections X |
| `sections_y` | number | No | `1` | Number of sections Y |
| `scale` | `{x, y, z}` | No | `{100, 100, 100}` | Scale (z controls height range) |
| `material` | string | No | -- | Material path to assign |
| `label` | string | No | Auto | Actor label |

---

### ue5_sculpt_landscape

Raise or lower terrain at a specific world location.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | Yes | -- | World location to sculpt |
| `radius` | number | No | `2048` | Brush radius in world units |
| `strength` | number | No | `0.5` | Sculpt strength (-1 to 1) |
| `falloff` | number | No | `0.5` | Brush falloff (0=hard, 1=smooth) |
| `tool_type` | enum | No | `raise_lower` | `raise_lower`, `flatten`, `smooth`, `erosion`, `noise` |
| `target_height` | number | No | -- | Target height for flatten tool |

---

### ue5_paint_landscape_layer

Paint a material weight layer on the landscape.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | Yes | -- | World location to paint |
| `layer_name` | string | Yes | -- | Layer name (must match landscape material, e.g., `Grass`, `Rock`, `Sand`) |
| `radius` | number | No | `2048` | Brush radius |
| `strength` | number | No | `1.0` | Paint strength (0-1) |
| `falloff` | number | No | `0.5` | Brush falloff |

**Notes:** The landscape material must have Landscape Layer Blend nodes with matching layer names.

---

### ue5_add_foliage (Legacy)

Place foliage instances at specified locations or scattered within an area.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mesh_path` | string | Yes | -- | Static mesh path |
| `locations` | array of `{x,y,z}` | No | `[]` | Explicit placement locations |
| `scatter_origin` | `{x, y, z}` | No | -- | Center point for random scatter |
| `scatter_radius` | number | No | -- | Scatter radius |
| `scatter_count` | number | No | -- | Number of instances to scatter |
| `scale_min` | number | No | `0.8` | Minimum random scale |
| `scale_max` | number | No | `1.2` | Maximum random scale |
| `random_yaw` | boolean | No | `true` | Randomize yaw |
| `align_to_surface` | boolean | No | `true` | Align to landscape normal |

**Notes:** This is a legacy tool in the landscape category. For more control, use the dedicated foliage tools below.

---

### ue5_get_landscape_info

Get detailed information about all landscapes in the level.

No parameters.

**Response:** Bounds, size, layers, material, component count for each landscape.

---

### ue5_set_landscape_material

Set the material on a landscape actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `material_path` | string | Yes | -- | Material asset path |
| `label` | string | No | First landscape | Specific landscape actor label |

---

## Water Tools

### ue5_create_water_body

Create an ocean, lake, or river water body actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | enum | Yes | -- | `ocean`, `lake`, `river` |
| `location` | `{x, y, z}` | No | `{0, 0, 0}` | Water body origin |
| `label` | string | No | Auto | Actor label |
| `spline_points` | array of `{x,y,z}` | No | `[]` | Shape points (river path or lake shore) |
| `width` | number | No | `1000` | River width |
| `wave_amplitude` | number | No | -- | Wave height |
| `wave_speed` | number | No | -- | Wave animation speed |

**Notes:** Requires the Water plugin to be enabled. Rivers need at least 2 spline points.

---

### ue5_set_water_properties

Set visual properties on an existing water body.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `label` | string | Yes | -- | Actor label of the water body |
| `wave_height` | number | No | -- | Maximum wave height offset |
| `transparency` | number | No | -- | Water transparency |
| `color` | `{r, g, b, a}` | No | -- | Water color (0-1 range) |
| `foam_amount` | number | No | -- | Foam amount on the surface |

---

### ue5_list_water_bodies

List all water body actors in the current level.

No parameters.

---

## Foliage Tools

### ue5_add_foliage_type

Register a static mesh as a foliage type. Must be done before painting with that mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mesh_path` | string | Yes | -- | Static mesh asset path |
| `density` | number | No | `100` | Instances per 1000x1000 area |
| `scale_min` | number | No | `0.8` | Minimum random scale |
| `scale_max` | number | No | `1.2` | Maximum random scale |
| `align_to_normal` | boolean | No | `true` | Align to surface normal |
| `random_yaw` | boolean | No | `true` | Randomize yaw |
| `ground_slope_angle` | number | No | -- | Max slope angle for placement (degrees) |

---

### ue5_paint_foliage

Paint foliage instances in a circular area.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mesh_path` | string | Yes | -- | Static mesh path |
| `center` | `{x, y, z}` | Yes | -- | Center point for placement |
| `radius` | number | No | `1000` | Paint area radius |
| `count` | number | No | `50` | Number of instances to place |
| `scale_min` | number | No | `0.8` | Minimum random scale |
| `scale_max` | number | No | `1.2` | Maximum random scale |
| `random_scale` | boolean | No | `true` | Apply random scale variation |
| `random_yaw` | boolean | No | `true` | Randomize yaw |
| `align_to_surface` | boolean | No | `true` | Align to ground via raycasting |
| `seed` | number | No | Random | Seed for reproducible placement |

---

### ue5_scatter_foliage

Scatter foliage across a rectangular region based on density.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mesh_path` | string | Yes | -- | Static mesh path |
| `min_x` | number | Yes | -- | Minimum X bound |
| `min_y` | number | Yes | -- | Minimum Y bound |
| `max_x` | number | Yes | -- | Maximum X bound |
| `max_y` | number | Yes | -- | Maximum Y bound |
| `base_z` | number | No | `0` | Base Z height for ray tracing |
| `density` | number | No | `0.001` | Instances per square unit |
| `scale_min` | number | No | `0.8` | Minimum random scale |
| `scale_max` | number | No | `1.2` | Maximum random scale |
| `align_to_surface` | boolean | No | `true` | Align to ground |
| `random_yaw` | boolean | No | `true` | Randomize yaw |
| `seed` | number | No | Random | Random seed |
| `max_instances` | number | No | `10000` | Safety cap on instance count |

---

### ue5_remove_foliage

Remove foliage instances within a circular area.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `center` | `{x, y, z}` | Yes | -- | Center point |
| `radius` | number | No | `1000` | Removal radius |
| `mesh_path` | string | No | All types | Only remove this specific mesh type |

---

### ue5_list_foliage_types

List all registered foliage types in the current level.

No parameters.

**Response:** Mesh paths, instance counts, density, and scale settings for each type.

---

## Fab / Marketplace Tools

### ue5_fab_list_local

List assets in the UE5 project content browser.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game` | Content browser path |
| `class_filter` | enum | No | `""` | `StaticMesh`, `Material`, `Texture`, or `""` for all |
| `name_filter` | string | No | -- | Name substring filter |
| `max_results` | number | No | `100` | Maximum results |

---

### ue5_fab_import_local

Import a file or directory of assets into the project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source_path` | string | Yes | -- | Absolute path to file or directory |
| `dest_path` | string | No | `/Game/Fab/Imported` | Content browser destination |

---

### ue5_fab_search_content

Search the project's content browser by keyword.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | -- | Search query (e.g., `grass`, `rock mesh`) |
| `class_filter` | enum | No | `""` | `StaticMesh`, `Material`, `Texture`, or `""` |
| `max_results` | number | No | `50` | Maximum results |

---

### ue5_fab_list_vault

List assets in the Epic Games Launcher vault cache.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `vault_path` | string | No | Auto-detected | Custom vault cache path |
| `max_results` | number | No | `100` | Maximum results |

---

## Screenshot / Viewport Tools

### ue5_take_screenshot

Capture a screenshot of the editor viewport with optional camera positioning.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filename` | string | No | Auto timestamp | Output filename |
| `resolution_x` | number | No | `1920` | Width in pixels |
| `resolution_y` | number | No | `1080` | Height in pixels |
| `camera_location` | `{x, y, z}` | No | Current | Move camera before capture |
| `camera_rotation` | `{pitch, yaw, roll}` | No | Current | Set rotation before capture |
| `look_at` | `{x, y, z}` | No | -- | Point camera at this location |

---

### ue5_set_viewport_camera

Move the editor viewport camera with look-at targeting.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | No | Current | Camera position |
| `rotation` | `{pitch, yaw, roll}` | No | Current | Camera rotation (ignored if `look_at` provided) |
| `look_at` | `{x, y, z}` | No | -- | Point camera at this location |
| `fov` | number | No | Current | Field of view in degrees |
| `speed` | number | No | Current | Camera movement speed |

---

### ue5_get_viewport_camera

Get the current editor viewport camera position, rotation, and FOV.

No parameters.

---

## Widget / UMG Tools

### ue5_create_widget

Create a new UMG Widget Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Widget name (e.g., `WBP_HUD_Main`) |
| `path` | string | No | `/Game/UI/` | Content browser folder |
| `parent_class` | string | No | `UserWidget` | Parent widget class |
| `root_widget` | enum | No | `CanvasPanel` | `CanvasPanel`, `Overlay`, `VerticalBox`, `HorizontalBox`, `GridPanel`, `SizeBox` |

---

### ue5_add_widget_child

Add a child widget to an existing Widget Blueprint.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `widget_blueprint` | string | Yes | -- | Widget Blueprint path |
| `parent_slot` | string | No | `Root` | Parent widget name to add into |
| `widget_type` | enum | Yes | -- | `TextBlock`, `Image`, `Button`, `ProgressBar`, `Slider`, `CheckBox`, `EditableText`, `RichTextBlock`, `Border`, `CanvasPanel`, `VerticalBox`, `HorizontalBox`, `GridPanel`, `ScrollBox`, `SizeBox`, `Overlay`, `Spacer`, `CircularThrobber` |
| `name` | string | Yes | -- | Name for the new widget |
| `properties` | object | No | `{}` | Properties (text, color, size, etc.) |

---

### ue5_set_widget_property

Set any property on a widget element.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `widget_blueprint` | string | Yes | -- | Widget Blueprint path |
| `widget_name` | string | Yes | -- | Widget element name |
| `property_path` | string | Yes | -- | Property path (e.g., `Text`, `ColorAndOpacity`, `Visibility`) |
| `value` | any | Yes | -- | Value to set |

---

### ue5_set_widget_binding

Bind a widget property to a Blueprint variable or function.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `widget_blueprint` | string | Yes | -- | Widget Blueprint path |
| `widget_name` | string | Yes | -- | Widget element name |
| `property_name` | string | Yes | -- | Property to bind (e.g., `Text`, `Percent`, `Visibility`) |
| `binding_type` | enum | Yes | -- | `variable` or `function` |
| `binding_name` | string | Yes | -- | Variable or function name |

---

### ue5_list_widgets

List all Widget Blueprints in the project.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game/` | Content browser path |
| `recursive` | boolean | No | `true` | Include subdirectories |
| `limit` | number | No | `100` | Maximum results |

---

## Animation Tools

### ue5_create_anim_blueprint

Create a new Animation Blueprint for a skeletal mesh.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Anim Blueprint name (e.g., `ABP_Player`) |
| `path` | string | No | `/Game/Animations/` | Content browser folder |
| `skeleton` | string | Yes | -- | Skeleton asset path |
| `parent_class` | string | No | `AnimInstance` | Parent anim class |

---

### ue5_create_montage

Create an animation montage from animation sequences.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Montage name (e.g., `AM_Slash_01`) |
| `path` | string | No | `/Game/Animations/Montages/` | Content browser folder |
| `skeleton` | string | Yes | -- | Skeleton asset path |
| `animations` | string[] | Yes | -- | Animation sequence paths to include |
| `slot_name` | string | No | `DefaultSlot` | Montage slot name |
| `blend_in_time` | number | No | `0.25` | Blend in duration (seconds) |
| `blend_out_time` | number | No | `0.25` | Blend out duration (seconds) |

---

### ue5_create_blend_space

Create a 1D or 2D blend space.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Blend space name |
| `path` | string | No | `/Game/Animations/BlendSpaces/` | Content browser folder |
| `skeleton` | string | Yes | -- | Skeleton asset path |
| `dimensions` | enum | No | `2D` | `1D` or `2D` |
| `axis_x_name` | string | No | `Speed` | X axis parameter name |
| `axis_x_min` | number | No | `0` | X axis minimum |
| `axis_x_max` | number | No | `600` | X axis maximum |
| `axis_y_name` | string | No | `Direction` | Y axis parameter name (2D only) |
| `axis_y_min` | number | No | `-180` | Y axis minimum (2D only) |
| `axis_y_max` | number | No | `180` | Y axis maximum (2D only) |
| `samples` | array | No | `[]` | Animation samples with x,y positions |

---

### ue5_play_animation_preview

Preview an animation sequence or montage on an actor.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `animation` | string | Yes | -- | Animation asset path |
| `actor_label` | string | No | Selected actor | Skeletal mesh actor to preview on |
| `playback_rate` | number | No | `1.0` | Playback speed |
| `looping` | boolean | No | `false` | Loop the animation |

---

## Input Tools

### ue5_create_input_action

Create an Enhanced Input Action asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Input action name (e.g., `IA_Jump`) |
| `path` | string | No | `/Game/Input/Actions/` | Content browser folder |
| `value_type` | enum | No | `Digital` | `Digital` (bool), `Axis1D` (float), `Axis2D` (FVector2D), `Axis3D` (FVector) |
| `triggers` | enum[] | No | `[]` | `Pressed`, `Released`, `Down`, `Tap`, `Hold`, `HoldAndRelease`, `Pulse` |
| `consume_input` | boolean | No | `true` | Whether this action consumes input |

---

### ue5_create_mapping_context

Create an Input Mapping Context asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Context name (e.g., `IMC_Default`) |
| `path` | string | No | `/Game/Input/` | Content browser folder |
| `description` | string | No | `""` | Human-readable description |

---

### ue5_add_key_mapping

Add a key binding to a Mapping Context.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mapping_context` | string | Yes | -- | Mapping Context asset path |
| `input_action` | string | Yes | -- | Input Action asset path |
| `key` | string | Yes | -- | Key name (e.g., `SpaceBar`, `LeftMouseButton`, `W`, `Gamepad_FaceButton_Bottom`) |
| `modifiers` | enum[] | No | `[]` | `Negate`, `Swizzle`, `DeadZone`, `Scalar`, `FOVScaling`, `ResponseCurve`, `Smooth` |
| `modifier_params` | object | No | `{}` | Modifier parameters |

---

### ue5_list_input_actions

List all Input Actions and Mapping Contexts.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game/` | Content browser path |
| `recursive` | boolean | No | `true` | Include subdirectories |
| `type` | enum | No | `all` | `all`, `actions`, `contexts` |

---

## AI / Navigation Tools

### ue5_create_behavior_tree

Create a Behavior Tree asset for AI decision-making.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Behavior tree name (e.g., `BT_Enemy_Melee`) |
| `path` | string | No | `/Game/AI/BehaviorTrees/` | Content browser folder |
| `blackboard` | string | No | `""` | Blackboard asset path to associate |

---

### ue5_create_blackboard

Create a Blackboard Data asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Blackboard name (e.g., `BB_Enemy`) |
| `path` | string | No | `/Game/AI/Blackboards/` | Content browser folder |
| `parent_blackboard` | string | No | `""` | Parent blackboard to inherit keys |
| `keys` | array | No | `[]` | Initial keys to add |

Each key:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Key name |
| `type` | enum | Yes | `Bool`, `Int`, `Float`, `String`, `Name`, `Vector`, `Rotator`, `Object`, `Class`, `Enum` |
| `instance_synced` | boolean | No | Sync across behavior tree instances |

---

### ue5_add_blackboard_key

Add a key to an existing Blackboard.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `blackboard` | string | Yes | -- | Blackboard asset path |
| `name` | string | Yes | -- | Key name |
| `type` | enum | Yes | -- | `Bool`, `Int`, `Float`, `String`, `Name`, `Vector`, `Rotator`, `Object`, `Class`, `Enum` |
| `base_class` | string | No | `""` | Base class for Object/Class types |
| `enum_name` | string | No | `""` | Enum type for Enum key type |
| `instance_synced` | boolean | No | `false` | Sync across instances |

---

### ue5_build_navmesh

Build or rebuild the navigation mesh for AI pathfinding.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `agent_radius` | number | No | Project default | Navigation agent radius |
| `agent_height` | number | No | Project default | Navigation agent height |
| `cell_size` | number | No | Project default | NavMesh cell size |
| `cell_height` | number | No | Project default | NavMesh cell height |

---

### ue5_query_navmesh

Test if a world location is navigable.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | `{x, y, z}` | Yes | -- | World location to test |
| `query_radius` | number | No | `100` | Search radius |
| `find_nearest` | boolean | No | `true` | Find nearest navigable point if off-mesh |

---

## Niagara / VFX Tools

### ue5_create_niagara_system

Create a Niagara particle system asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | System name (e.g., `NS_FireBall`) |
| `path` | string | No | `/Game/Effects/` | Content browser folder |
| `template` | enum | No | `Empty` | `Empty`, `Fountain`, `Sprite`, `Mesh`, `Ribbon`, `Audio`, `Component` |
| `auto_activate` | boolean | No | `true` | Auto-activate when spawned |

---

### ue5_set_niagara_parameter

Set a parameter on a Niagara system or emitter.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `system` | string | Yes | -- | System asset path |
| `emitter_name` | string | No | System-level | Emitter name |
| `module_name` | string | Yes | -- | Module name (e.g., `SpawnRate`, `Color`) |
| `parameter_name` | string | Yes | -- | Parameter name (e.g., `SpawnRate`, `StartColor`) |
| `value` | any | Yes | -- | Parameter value |

---

### ue5_create_niagara_emitter

Create a standalone Niagara emitter asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Emitter name (e.g., `NE_Sparks`) |
| `path` | string | No | `/Game/Effects/Emitters/` | Content browser folder |
| `sim_target` | enum | No | `CPUSim` | `CPUSim` or `GPUComputeSim` |
| `renderer` | enum | No | `Sprite` | `Sprite`, `Mesh`, `Ribbon`, `Light`, `Component` |
| `spawn_rate` | number | No | -- | Particles per second |
| `lifetime_min` | number | No | -- | Minimum particle lifetime (seconds) |
| `lifetime_max` | number | No | -- | Maximum particle lifetime (seconds) |

---

### ue5_list_niagara_systems

List all Niagara system and emitter assets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | No | `/Game/` | Content browser path |
| `recursive` | boolean | No | `true` | Include subdirectories |
| `type` | enum | No | `all` | `all`, `systems`, `emitters` |
| `limit` | number | No | `100` | Maximum results |

---

## Data Asset Tools

### ue5_create_datatable

Create a DataTable asset from a row struct.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | DataTable name (e.g., `DT_ItemDatabase`) |
| `path` | string | No | `/Game/Data/` | Content browser folder |
| `row_struct` | string | Yes | -- | Row struct name or path (e.g., `FItemData`) |

---

### ue5_import_json_to_datatable

Import a JSON file as rows into an existing DataTable.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `datatable` | string | Yes | -- | DataTable asset path |
| `json_path` | string | Yes | -- | Absolute path to JSON file |
| `overwrite` | boolean | No | `false` | Overwrite existing rows or append |

---

### ue5_create_curve

Create a float, color, or vector curve asset.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Curve name (e.g., `C_DamageFalloff`) |
| `path` | string | No | `/Game/Data/Curves/` | Content browser folder |
| `curve_type` | enum | No | `Float` | `Float`, `LinearColor`, `Vector` |
| `keys` | array | No | `[]` | Initial curve keys |

Each key:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `time` | number | Yes | Key time/input value |
| `value` | any | Yes | Output value (number, `{r,g,b,a}`, or `{x,y,z}`) |
| `interp` | enum | No | `Linear`, `Cubic`, `Constant`, `Auto` |

---

### ue5_create_data_asset

Create a Primary Data Asset instance.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | -- | Data asset name (e.g., `DA_GameConfig`) |
| `path` | string | No | `/Game/Data/` | Content browser folder |
| `data_class` | string | Yes | -- | Data asset class path |
| `properties` | object | No | `{}` | Properties to set |

---

## Orchestration Tools

### ue5_build_test_fix

Run an autonomous compile-test cycle. Compiles C++, starts PIE if clean, checks for runtime errors, takes a screenshot on success.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `task_description` | string | Yes | -- | What was changed (for logging and screenshots) |
| `max_iterations` | number | No | `10` | Maximum compile attempts before aborting |

**Response:**
```json
{
  "success": true,
  "iterations": 2,
  "phase": "screenshot",
  "errors": [],
  "warnings": ["Warning: unused variable"],
  "screenshot_path": "btf_1711234567890_iter2.png",
  "duration_ms": 15200
}
```

**Phases:** `compile` -> `pie_launch` -> `runtime_check` -> `screenshot` (or `aborted`)

---

### ue5_import_directory

Batch import an entire directory with auto-categorization.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source_path` | string | Yes | -- | Absolute path to directory |
| `dest_path` | string | Yes | -- | Content browser destination |
| `batch_size` | number | No | `50` | Files per batch |
| `recursive` | boolean | No | `true` | Include subdirectories |
| `organize_by_type` | boolean | No | `true` | Create Textures/, Meshes/, Audio/ subfolders |
| `auto_detect_normals` | boolean | No | `true` | Auto-detect normal maps from filename patterns |

**Response:**
```json
{
  "total_files": 150,
  "imported": 148,
  "failed": 2,
  "skipped": 0,
  "by_category": {"textures": 95, "meshes": 40, "audio": 13},
  "failures": [
    {"file": "corrupt.png", "error": "Invalid image format"}
  ],
  "duration_ms": 12500
}
```

---

### ue5_populate_zone

Build a zone from a game-data JSON file.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `zone_data_path` | string | Yes | -- | Path to zone JSON file |

**Response:**
```json
{
  "zone_name": "Shattered Coast",
  "npcs_placed": 15,
  "enemies_placed": 25,
  "gathering_nodes_placed": 8,
  "spawn_points_placed": 3,
  "ambient_sounds_placed": 5,
  "lighting_configured": true,
  "total_actors": 56,
  "failures": [],
  "duration_ms": 3200
}
```

See [TUTORIALS.md](TUTORIALS.md#tutorial-4-complete-game-zone-from-json) for the zone JSON schema and a complete example.

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
