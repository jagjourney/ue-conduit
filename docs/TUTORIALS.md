# UE Conduit -- Tutorials

Step-by-step guides for common workflows with UE Conduit and Claude.

---

## Table of Contents

1. [Tutorial 1: Hello World -- Your First UE Conduit Command](#tutorial-1-hello-world----your-first-ue-conduit-command)
2. [Tutorial 2: Building a Beautiful Landscape](#tutorial-2-building-a-beautiful-landscape)
3. [Tutorial 3: Populating a Game World](#tutorial-3-populating-a-game-world)
4. [Tutorial 4: Complete Game Zone from JSON](#tutorial-4-complete-game-zone-from-json)
5. [Tutorial 5: Autonomous Build-Test-Fix](#tutorial-5-autonomous-build-test-fix)
6. [Tutorial 6: Batch Asset Import Pipeline](#tutorial-6-batch-asset-import-pipeline)

---

## Tutorial 1: Hello World -- Your First UE Conduit Command

**Goal:** Verify your installation, spawn an actor, move it, and delete it.

**Time:** 5 minutes

**Prerequisites:** UE5 open with UE Conduit plugin loaded, Claude Code configured.

### Step 1: Check the Connection

In Claude Code, type:

```
What's open in the editor?
```

Claude will call `ue5_get_editor_state` and respond with something like:

```
The editor has L_Default open with 12 actors.
PIE is stopped. Build status is clean.
Engine version: 5.7.0, Project: MyProject.
```

If you get a connection error, see [INSTALLATION.md](INSTALLATION.md#troubleshooting).

### Step 2: Spawn a Point Light

```
Spawn a point light at position (0, 0, 500) and call it "MyTestLight"
```

Claude will call `ue5_spawn_actor` with:
- `class_path`: `/Script/Engine.PointLight`
- `location`: `{x: 0, y: 0, z: 500}`
- `label`: `MyTestLight`

You should see a point light appear in the viewport and outliner.

### Step 3: Move the Light

```
Move MyTestLight to (1000, 500, 800)
```

Claude will call `ue5_move_actor` with the new location. The light moves instantly in the viewport.

### Step 4: Query the Light

```
What are the properties of MyTestLight?
```

Claude will call `ue5_query_actor` and return detailed information: class, transform, component list, properties, and more.

### Step 5: Change a Property

```
Set MyTestLight's intensity to 10000
```

Claude will call `ue5_set_actor_property` with `property_path: "LightComponent.Intensity"` and `value: 10000`.

### Step 6: Delete the Light

```
Delete MyTestLight
```

Claude will call `ue5_delete_actor`. The light disappears from the viewport and outliner.

### Step 7: Undo and Redo

```
Undo that
```

Claude calls `ue5_undo` -- the light reappears. Try `ue5_redo` to delete it again.

**Congratulations!** You have completed the full create-modify-delete cycle with UE Conduit.

---

## Tutorial 2: Building a Beautiful Landscape

**Goal:** Create a terrain with painted materials, sculpted hills, grass, rocks, and water.

**Time:** 15 minutes

**Prerequisites:** A project with landscape materials and foliage meshes (Starter Content or Fab packs work well).

### Step 1: Get Landscape Info

First, check if there is already a landscape in the level:

```
Get info about any landscapes in the current level
```

If there is no landscape, proceed to Step 2. If there is one, skip to Step 3.

### Step 2: Create a Landscape

```
Create a new landscape at the origin with 4x4 sections, 63 quads per section, scale 100,100,100
```

Claude will call `ue5_create_landscape` with:
- `sections_x: 4`, `sections_y: 4`
- `num_quads_x: 63`, `num_quads_y: 63`
- `scale: {x: 100, y: 100, z: 100}`

A flat terrain appears in the viewport.

### Step 3: Apply a Landscape Material

If you have a landscape material with layer blending:

```
Set the landscape material to /Game/Materials/M_Landscape
```

Claude calls `ue5_set_landscape_material`. The terrain now uses your material.

### Step 4: Sculpt Some Hills

```
Create rolling hills on the landscape:
- Raise terrain at (5000, 5000, 0) with radius 4000 and strength 0.6
- Raise terrain at (15000, 8000, 0) with radius 3000 and strength 0.4
- Lower terrain at (10000, 10000, 0) with radius 2000 and strength -0.3 to create a valley
```

Claude makes multiple `ue5_sculpt_landscape` calls. The terrain deforms in real time.

### Step 5: Paint Material Layers

```
Paint the landscape:
- Paint "Rock" layer at (5000, 5000, 0) radius 3000 on the hilltop
- Paint "Sand" layer at (10000, 10000, 0) radius 2000 in the valley
- Paint "Grass" layer at (0, 0, 0) radius 8000 across the flatlands
```

Claude calls `ue5_paint_landscape_layer` for each area. The terrain material blends between layers.

### Step 6: Add a Water Body

```
Create a lake at position (10000, 10000, -100) with shore points forming a rough circle:
(8000, 8000), (12000, 8000), (13000, 10000), (12000, 12000), (8000, 12000), (7000, 10000)
```

Claude calls `ue5_create_water_body` with `type: "lake"` and the spline points. A lake appears in the valley.

### Step 7: Scatter Foliage

```
Add foliage to the landscape:
- Register /Game/Meshes/SM_Grass_Clump as a foliage type with density 200
- Paint 500 grass instances around (0, 0, 0) in a radius of 8000
- Scatter 50 rock instances from /Game/Meshes/SM_Rock_01 across the entire landscape from (-5000,-5000) to (20000,15000)
```

Claude registers foliage types with `ue5_add_foliage_type`, then paints with `ue5_paint_foliage` and `ue5_scatter_foliage`.

### Step 8: Verify with a Screenshot

```
Move the camera above the landscape looking down and take a screenshot
```

Claude calls `ue5_set_viewport_camera` to position the camera at a bird's-eye view, then `ue5_take_screenshot`. You can review the result.

### Step 9: Save

```
Save the level
```

Claude calls `ue5_save_level`.

---

## Tutorial 3: Populating a Game World

**Goal:** Import 3D models, place enemies and NPCs, add lighting and ambient audio.

**Time:** 20 minutes

**Prerequisites:** Some 3D models (FBX or glTF) and a level with basic terrain.

### Step 1: Import 3D Models

```
Import these mesh files into UE5:
- D:/Assets/enemy_crab.fbx to /Game/Meshes/Enemies/
- D:/Assets/npc_merchant.fbx to /Game/Meshes/NPCs/
- D:/Assets/gathering_node_ore.fbx to /Game/Meshes/Props/
```

Claude calls `ue5_import_mesh` for each file. The meshes appear in your Content Browser.

### Step 2: Create Blueprints for the Actors

```
Create these Blueprints:
1. BP_Enemy_Crab at /Game/Blueprints/Enemies/ with parent Actor
   - Add a StaticMeshComponent named "Mesh" using /Game/Meshes/Enemies/enemy_crab
   - Add a variable "MaxHealth" of type float, default 100
   - Add a variable "Level" of type int, default 1

2. BP_NPC_Merchant at /Game/Blueprints/NPCs/ with parent Actor
   - Add a StaticMeshComponent named "Mesh" using /Game/Meshes/NPCs/npc_merchant
   - Add a variable "ShopName" of type string, default "General Store"
```

Claude makes multiple calls to `ue5_create_blueprint`, `ue5_add_component`, and `ue5_add_variable`.

### Step 3: Spawn Enemies Along the Beach

```
Spawn 10 enemy crabs along the beach from x=500 to x=5000, spaced evenly at y=3000, z=50.
Use BP_Enemy_Crab and label them Enemy_Crab_01 through Enemy_Crab_10.
Randomize their yaw rotation.
```

Claude uses `ue5_batch_spawn` with an array of 10 actors at calculated positions. All 10 appear at once.

### Step 4: Place NPCs

```
Spawn these NPCs:
- BP_NPC_Merchant at (2000, 1000, 100) facing south, labeled "Merchant_Dockmaster"
- BP_NPC_Merchant at (3500, 800, 100) facing east, labeled "Merchant_Fisherman"
```

Claude calls `ue5_spawn_actor` for each NPC.

### Step 5: Add Lighting

```
Set up the scene lighting:
- Spawn a DirectionalLight at (0, 0, 10000) with rotation pitch=-45, yaw=30 and intensity 3.14
- Spawn a SkyLight at (0, 0, 5000) with intensity 1.0
- Spawn ExponentialHeightFog at the origin with density 0.02
```

Claude spawns each light actor with the specified properties.

### Step 6: Add Ambient Audio

```
Spawn AmbientSound actors for ocean waves:
- At (1000, 4000, 50) with label "Ambient_Waves_01"
- At (3000, 4000, 50) with label "Ambient_Waves_02"
- At (5000, 4000, 50) with label "Ambient_Waves_03"
```

Claude spawns each ambient sound actor.

### Step 7: Build and Test

```
Compile and test the level
```

Claude calls `ue5_compile_cpp` (if you have C++ code) and then `ue5_play` to start PIE. After a few seconds, it calls `ue5_get_game_log` to check for errors and `ue5_screenshot` to capture the result.

### Step 8: Review and Save

```
Take a screenshot from the beach looking at the merchants, then save everything
```

Claude positions the camera with `ue5_set_viewport_camera`, takes a screenshot, and calls `ue5_save_all`.

---

## Tutorial 4: Complete Game Zone from JSON

**Goal:** Define a game zone in JSON and use UE Conduit's zone builder to populate it automatically.

**Time:** 10 minutes

**Prerequisites:** Blueprint classes for your NPCs, enemies, and props.

### Step 1: Write the Zone Definition JSON

Create a file called `shattered_coast.json`:

```json
{
  "zone_name": "Shattered Coast",
  "level_path": "/Game/Maps/L_ShatteredCoast",
  "description": "A war-torn beachhead with rocky cliffs and tidal pools.",

  "lighting": {
    "directional_light": {
      "rotation": { "pitch": -50, "yaw": 160, "roll": 0 },
      "intensity": 3.14,
      "color": { "r": 255, "g": 240, "b": 220 }
    },
    "sky_light": {
      "intensity": 1.0,
      "color": { "r": 200, "g": 210, "b": 230 }
    },
    "fog": {
      "density": 0.015,
      "color": { "r": 180, "g": 200, "b": 220 },
      "start_distance": 5000
    }
  },

  "npcs": [
    {
      "class_path": "/Game/Blueprints/NPCs/BP_NPC_QuestGiver",
      "label": "NPC_Captain_Aldric",
      "location": { "x": 2000, "y": 1500, "z": 100 },
      "rotation": { "pitch": 0, "yaw": 180, "roll": 0 },
      "properties": {
        "DisplayName": "Captain Aldric",
        "QuestID": "q_shattered_coast_01"
      }
    },
    {
      "class_path": "/Game/Blueprints/NPCs/BP_NPC_Merchant",
      "label": "NPC_Merchant_Supplies",
      "location": { "x": 2500, "y": 1200, "z": 100 },
      "properties": {
        "DisplayName": "Supply Merchant",
        "ShopTable": "DT_Shop_BasicSupplies"
      }
    }
  ],

  "enemies": [
    {
      "class_path": "/Game/Blueprints/Enemies/BP_Enemy_Crab",
      "label": "Enemy_Crab_Beach_01",
      "location": { "x": 3000, "y": 3500, "z": 50 },
      "level_range": { "min": 1, "max": 3 },
      "patrol_path": [
        { "x": 3000, "y": 3500, "z": 50 },
        { "x": 3500, "y": 3800, "z": 50 },
        { "x": 3200, "y": 4000, "z": 50 }
      ]
    },
    {
      "class_path": "/Game/Blueprints/Enemies/BP_Enemy_Crab",
      "label": "Enemy_Crab_Beach_02",
      "location": { "x": 4000, "y": 3200, "z": 50 },
      "level_range": { "min": 1, "max": 3 }
    }
  ],

  "gathering_nodes": [
    {
      "class_path": "/Game/Blueprints/Props/BP_GatheringNode",
      "label": "Node_Driftwood_01",
      "location": { "x": 1500, "y": 3800, "z": 30 },
      "resource_type": "wood",
      "respawn_time_seconds": 120
    },
    {
      "class_path": "/Game/Blueprints/Props/BP_GatheringNode",
      "label": "Node_Shells_01",
      "location": { "x": 3800, "y": 4200, "z": 20 },
      "resource_type": "crafting_material",
      "respawn_time_seconds": 180
    }
  ],

  "spawn_points": [
    {
      "location": { "x": 1000, "y": 1000, "z": 150 },
      "rotation": { "pitch": 0, "yaw": 90, "roll": 0 },
      "type": "player"
    },
    {
      "location": { "x": 1200, "y": 900, "z": 150 },
      "type": "graveyard"
    }
  ],

  "ambient_sounds": [
    {
      "class_path": "/Script/Engine.AmbientSound",
      "location": { "x": 2000, "y": 4000, "z": 50 },
      "radius": 5000,
      "properties": {
        "SoundAsset": "/Game/Audio/Ambient/A_Ocean_Waves"
      }
    },
    {
      "class_path": "/Script/Engine.AmbientSound",
      "location": { "x": 4000, "y": 2000, "z": 200 },
      "radius": 3000,
      "properties": {
        "SoundAsset": "/Game/Audio/Ambient/A_Seagulls"
      }
    }
  ]
}
```

### Step 2: Run the Zone Builder

In Claude Code:

```
Populate the Shattered Coast zone from the file game-data/zones/shattered_coast.json
```

Claude calls `ue5_populate_zone` with the path to your JSON file. The orchestration engine:

1. Reads and parses the JSON
2. Loads the target level (if specified)
3. Configures directional light, sky light, and fog
4. Spawns all NPCs at their defined positions
5. Spawns enemies with level ranges and patrol paths
6. Places gathering nodes with resource types and respawn timers
7. Creates player and graveyard spawn points
8. Adds ambient sound actors

### Step 3: Review the Summary

Claude reports a structured summary:

```
Zone "Shattered Coast" populated:
- 2 NPCs placed
- 2 enemies placed
- 2 gathering nodes placed
- 2 spawn points placed
- 2 ambient sounds placed
- Lighting configured: yes
- Total actors: 10
- Failures: 0
- Duration: 1.2 seconds
```

### Step 4: Polish with Manual Adjustments

```
Move NPC_Captain_Aldric 200 units forward on the Y axis.
Also rotate him to face the beach.
```

Claude calls `ue5_move_actor` and `ue5_set_actor_property` for fine-tuning.

### Step 5: Save

```
Save everything
```

Claude calls `ue5_save_all`.

---

## Tutorial 5: Autonomous Build-Test-Fix

**Goal:** Let Claude write C++ code, compile it, test it, and fix errors automatically.

**Time:** 5-10 minutes

**Prerequisites:** A UE5 C++ project with UE Conduit installed.

### Step 1: Describe What You Want

```
Create a basic health component. Make a C++ ActorComponent called UHealthComponent
with a MaxHealth float (default 100) and a CurrentHealth float. Add a TakeDamage
function that reduces CurrentHealth and calls an OnDeath delegate when it hits zero.
```

Claude writes the `.h` and `.cpp` files directly to your project's Source directory.

### Step 2: Trigger the Build-Test-Fix Loop

```
Compile and test that
```

Claude calls `ue5_build_test_fix` with a description of the change. The orchestration engine:

1. **Compiles C++** -- triggers `build/compile` on the UE5 game thread
2. **Checks for errors** -- reads build output
3. If errors: returns them to Claude, who reads the error messages, fixes the code, and calls again
4. If clean: **starts PIE** to test the game
5. **Waits 3 seconds** and checks the game log for runtime errors
6. If runtime errors: stops PIE, returns errors to Claude for fixing
7. If clean: **takes a screenshot** as proof of success, stops PIE

### Step 3: Watch Claude Fix Errors

If the initial compile has errors, you will see Claude:

1. Read the error messages (e.g., "UHealthComponent.h:15: expected ';' after class member")
2. Open the file and fix the issue
3. Trigger another compile
4. Repeat until clean or max iterations reached

Typical output:

```
Iteration 1: Compile failed (2 errors)
  - UHealthComponent.h:15: expected ';' after member declaration
  - UHealthComponent.cpp:23: 'OnDeath' is not a member of 'UHealthComponent'
Fixing...

Iteration 2: Compile succeeded (clean build)
Starting PIE...
Runtime check: no errors
Screenshot saved: btf_1711234567890_iter2.png

Build-test-fix completed in 2 iterations.
```

### Safety Features

- **Max iterations:** Default 10, configurable. Prevents infinite loops.
- **Human control:** You can interrupt at any time by pressing Ctrl+C in Claude Code.
- **Automatic PIE cleanup:** PIE is always stopped after the test, even on failure.

---

## Tutorial 6: Batch Asset Import Pipeline

**Goal:** Import an entire directory of artwork files into UE5 with automatic categorization.

**Time:** 5-15 minutes depending on the number of files

**Prerequisites:** A directory of image and/or mesh files on disk.

### Step 1: Prepare Your Assets

Organize your source files in a directory. They can be mixed:

```
D:/GameArt/ShatteredCoast/
  beach_sand_diffuse.png
  beach_sand_normal.png
  beach_sand_roughness.png
  cliff_rock_diffuse.png
  cliff_rock_normal.png
  palm_tree.fbx
  driftwood_01.fbx
  driftwood_02.fbx
  ocean_waves.wav
  seagull_ambient.ogg
```

### Step 2: Run the Import Pipeline

```
Import all files from D:/GameArt/ShatteredCoast/ into /Game/Assets/ShatteredCoast/
Organize by type and auto-detect normal maps.
```

Claude calls `ue5_import_directory` with:
- `source_path`: `D:/GameArt/ShatteredCoast/`
- `dest_path`: `/Game/Assets/ShatteredCoast/`
- `organize_by_type`: `true`
- `auto_detect_normals`: `true`

### Step 3: Automatic Categorization

The pipeline scans the directory and categorizes files by extension:

| Extension | Category | Destination Subfolder |
|-----------|----------|-----------------------|
| .png, .jpg, .tga, .bmp | Textures | `/Game/Assets/ShatteredCoast/Textures/` |
| .fbx, .obj, .gltf | Meshes | `/Game/Assets/ShatteredCoast/Meshes/` |
| .wav, .ogg, .mp3 | Audio | `/Game/Assets/ShatteredCoast/Audio/` |

### Step 4: Normal Map Detection

Files with these name patterns are automatically imported with:
- Compression: `TC_Normalmap`
- sRGB: `false`

Detected patterns: `_normal`, `_nm`, `_nrm`, `_nor`, `_normalmap`, `_normal_map`

All other textures use:
- Compression: `TC_Default`
- sRGB: `true`

### Step 5: Review the Summary

Claude reports:

```
Import complete:
- Total files: 10
- Imported: 10
- Failed: 0
- Skipped: 0

By category:
- Textures: 5 (2 normal maps auto-detected)
- Meshes: 3
- Audio: 2

Duration: 4.2 seconds
```

### Step 6: Verify in Content Browser

```
List all assets in /Game/Assets/ShatteredCoast/
```

Claude calls `ue5_list_assets` with `recursive: true` and shows everything that was imported.

### Step 7: Create Materials from Texture Sets (Optional)

The pipeline can group textures by base name and create material instances:

```
Group the textures in /Game/Assets/ShatteredCoast/Textures/ by base name
and create material instances from /Game/Materials/M_MasterMaterial
```

The pipeline detects texture groups:
- `beach_sand` -> diffuse + normal + roughness -> `MI_beach_sand`
- `cliff_rock` -> diffuse + normal -> `MI_cliff_rock`

Each material instance has the textures assigned to the correct parameter slots.

### Handling Failures

If some files fail to import:

```
3 files failed to import:
- corrupt_file.png: "Invalid image format"
- huge_mesh.fbx: "Command timed out"
- bad_path.tga: "File not found"

7/10 files imported successfully.
```

Failed files are reported individually. Successfully imported files are not affected by other failures.

---

## Next Steps

After completing these tutorials, explore:

- **[COMMANDS.md](COMMANDS.md)** -- Complete reference for all 79 tools
- **[API.md](API.md)** -- REST API documentation for custom integrations
- **[ARCHITECTURE.md](ARCHITECTURE.md)** -- How to extend UE Conduit with custom commands
- **[FAQ.md](FAQ.md)** -- Common questions and troubleshooting

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
