/**
 * UE Conduit — Version Control / Git Tools
 *
 * MCP tools for git operations on the UE5 project: status, diff,
 * commit, push, and log — all executed from within the editor.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerGitTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_git_status",
    "Get the git status of the UE5 project. Shows modified, added, deleted, and untracked files.",
    {},
    async () => {
      const result = await ue5.executeCommand("git", "git_status", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_git_diff",
    "Get the git diff of changed files in the UE5 project.",
    {
      file_path: z.string().optional().describe("Specific file to diff (omit for all changes)"),
      staged: z.boolean().default(false).describe("Show staged changes only"),
      max_lines: z.number().default(500).describe("Maximum lines of diff output"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        staged: params.staged,
        max_lines: params.max_lines,
      };
      if (params.file_path) cmdParams.file_path = params.file_path;
      const result = await ue5.executeCommand("git", "git_diff", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_git_commit",
    "Commit staged changes in the UE5 project.",
    {
      message: z.string().describe("Commit message"),
      stage_all: z.boolean().default(false).describe("Stage all changes before committing (git add -A)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("git", "git_commit", {
        message: params.message,
        stage_all: params.stage_all,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_git_push",
    "Push committed changes to the remote repository.",
    {
      remote: z.string().default("origin").describe("Remote name"),
      branch: z.string().optional().describe("Branch to push (defaults to current)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("git", "git_push", {
        remote: params.remote,
        branch: params.branch ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_git_log",
    "Get recent commit history of the UE5 project.",
    {
      count: z.number().default(10).describe("Number of commits to show"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("git", "git_log", {
        count: params.count,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
