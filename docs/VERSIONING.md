# UE Conduit — Versioning Standard

## Semantic Versioning: MAJOR.MINOR.PATCH

UE Conduit follows **Semantic Versioning 2.0.0** (semver.org) with game-dev-specific definitions.

---

## Version Format: X.Y.Z

### MAJOR (X.0.0) — Breaking Changes
**Increment when:** The update breaks backward compatibility.

Examples:
- API endpoint format changes (old requests stop working)
- MCP tool names renamed (Claude Code configs break)
- C++ command signatures changed (existing scripts break)
- Minimum UE5 version bumped (e.g., dropping UE5 5.4 support)
- LLM provider interface changed (custom providers break)
- HTTP port default changed

**User impact:** Must update their configuration, scripts, or code.
**Release cadence:** Rare. Maximum 1-2 per year.

### MINOR (1.X.0) — New Features, Backward Compatible
**Increment when:** New functionality added that doesn't break existing usage.

Examples:
- New tool category added (e.g., "Terrain Sculpting Tools")
- New LLM provider added (e.g., "Mistral support")
- New C++ command handler added
- New MCP tools added to existing categories
- In-editor panel gets new UI features
- New orchestration engine (e.g., "Auto-Level-Builder")
- Support for new UE5 version added
- New documentation section

**User impact:** Can update without changing anything. New features available immediately.
**Release cadence:** Monthly or bi-monthly.

### PATCH (1.0.X) — Bug Fixes, Performance, Polish
**Increment when:** Fixing bugs or improving existing functionality without adding new features.

Examples:
- Fix crash on actor spawn with duplicate names
- Fix FHttpPath validation error
- Fix asset import threading crash
- Performance optimization (faster command execution)
- Better error messages
- Documentation typo fixes
- Compiler warning fixes
- Compatibility fix for specific UE5 sub-version

**User impact:** Should always update. No risk of breakage.
**Release cadence:** As needed. Weekly during active development.

---

## Version History

| Version | Date | Type | Summary |
|---------|------|------|---------|
| **1.0.0** | 2026-03-24 | MAJOR | Initial release. 220+ tools, 6 LLM providers, in-editor panel, full docs |
| 0.2.0 | 2026-03-23 | MINOR | Visual world builder: landscape, water, foliage, Fab, screenshots |
| 0.1.3 | 2026-03-23 | PATCH | Fix duplicate actor name crash |
| 0.1.2 | 2026-03-23 | PATCH | Fix asset import threading crash |
| 0.1.1 | 2026-03-23 | PATCH | Fix FHttpPath crash, port change to 9377 |
| 0.1.0 | 2026-03-23 | MINOR | Initial MVP: basic actor/blueprint/asset/compile/PIE |

---

## Release Process

### 1. Decide Version Number
- Bug fix only? → PATCH (1.0.X)
- New feature? → MINOR (1.X.0)
- Breaking change? → MAJOR (X.0.0)

### 2. Update Version References
Files to update:
- `package.json` → `"version": "X.Y.Z"`
- `src/mcp-server/index.ts` → `version: "X.Y.Z"` in McpServer config
- `src/ue5-plugin/UEConduit/UEConduit.uplugin` → `"VersionName": "X.Y.Z"`
- `docs/CHANGELOG.md` → Add release entry
- `README.md` → Update tool counts if changed

### 3. Build the Release
```bash
# From project root
./scripts/build-release.sh X.Y.Z
```
This creates `versions/vX.Y.Z/` with the shippable package.

### 4. Test the Release
- Install fresh in a clean UE5 project
- Verify health check: http://localhost:9377/health
- Run 5 basic commands (spawn, compile, screenshot, list, save)
- Verify MCP connection from Claude Code

### 5. Ship
- Push to GitLab with version tag: `git tag vX.Y.Z && git push --tags`
- Upload `versions/vX.Y.Z/UEConduit_vX.Y.Z.zip` to Fab marketplace
- Update npm: `npm publish` (MCP server only)
- Post changelog to Discord/social

---

## Shipped Package Structure

```
versions/
  v1.0.0/
    UEConduit_v1.0.0.zip          # The shippable product
    RELEASE_NOTES.md              # What's in this version
    checksums.sha256              # File integrity verification

    # Inside the zip:
    UEConduit/
      UEConduit.uplugin           # Plugin descriptor
      Source/                     # C++ source (included per Fab policy)
        UEConduit/
          Public/                 # Headers
          Private/                # Implementation
      Resources/                  # Icons, branding
      Config/                     # Default settings

    MCP-Server/
      package.json               # npm installable
      dist/                      # Compiled JavaScript
      src/                       # TypeScript source

    Documentation/
      README.md
      INSTALLATION.md
      SETUP_GUIDE.md
      TOOL_REFERENCE.md
      COMMANDS.md
      LLM_PROVIDERS.md
      FAQ.md
```

---

## Branch Strategy

- `main` — Stable, shippable code. Every commit on main should be releasable.
- `develop` — Active development. Features merge here first.
- `feature/xxx` — Individual features. Branch from develop, merge back.
- `hotfix/xxx` — Critical bug fixes. Branch from main, merge to both main and develop.
- `release/vX.Y.Z` — Release preparation. Branch from develop, merge to main when ready.

---

## Pre-Release Checklist

- [ ] All tests pass
- [ ] No compiler warnings in C++
- [ ] TypeScript compiles clean (tsc --noEmit)
- [ ] Documentation updated for new features
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated in all files
- [ ] Fresh install tested on clean UE5 project
- [ ] MCP connection verified with Claude Code
- [ ] At least 3 screenshots updated for marketplace listing
- [ ] Release zip created in versions/ directory
- [ ] SHA256 checksums generated

---

*UE Conduit — Jag Journey, LLC*
*Versioning standard effective from v1.0.0 (March 24, 2026)*
