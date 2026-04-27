/**
 * UE Conduit — Build-Test-Fix Orchestration
 *
 * Autonomous compile-test cycle:
 *   1. Compile C++
 *   2. If errors → return errors to caller (Claude fixes code, retries)
 *   3. If clean → start PIE
 *   4. Wait 3 seconds, check game log
 *   5. If crash/errors → return errors to caller
 *   6. If clean → take screenshot, return success
 *
 * Tracks iteration count and aborts if max reached.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import type { BuildStatusResource } from "../resources/build-status.js";
import type { GameLogResource } from "../resources/game-log.js";
import { Logger } from "../utils/logger.js";

export interface BuildTestFixResult {
  success: boolean;
  iterations: number;
  phase: "compile" | "pie_launch" | "runtime_check" | "screenshot" | "aborted";
  errors: string[];
  warnings: string[];
  screenshot_path: string;
  duration_ms: number;
}

export class BuildTestFixLoop {
  private ue5: UE5Client;
  private buildStatus: BuildStatusResource;
  private gameLog: GameLogResource;
  private logger: Logger;

  constructor(
    ue5: UE5Client,
    buildStatus: BuildStatusResource,
    gameLog: GameLogResource,
    logger: Logger
  ) {
    this.ue5 = ue5;
    this.buildStatus = buildStatus;
    this.gameLog = gameLog;
    this.logger = logger;
  }

  /**
   * Run the build-test-fix cycle.
   *
   * @param taskDescription - Human-readable description of what was changed
   * @param maxIterations - Maximum compile attempts before aborting
   * @returns Structured result with success/failure info
   */
  async run(taskDescription: string, maxIterations = 10): Promise<BuildTestFixResult> {
    const startTime = Date.now();
    this.logger.info(`BuildTestFix started: "${taskDescription}" (max ${maxIterations} iterations)`);

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      this.logger.info(`BuildTestFix iteration ${iteration}/${maxIterations}`);

      // Phase 1: Compile C++
      const compileResult = await this.compile();
      if (!compileResult.success) {
        // Record build result
        this.buildStatus.recordBuild({
          status: "errors",
          errors: compileResult.errors,
          warnings: compileResult.warnings,
          duration_ms: compileResult.duration_ms,
          timestamp: new Date().toISOString(),
          module: "",
        });

        return {
          success: false,
          iterations: iteration,
          phase: "compile",
          errors: compileResult.errors,
          warnings: compileResult.warnings,
          screenshot_path: "",
          duration_ms: Date.now() - startTime,
        };
      }

      // Record successful build
      this.buildStatus.recordBuild({
        status: "clean",
        errors: [],
        warnings: compileResult.warnings,
        duration_ms: compileResult.duration_ms,
        timestamp: new Date().toISOString(),
        module: "",
      });

      // Phase 2: Start PIE
      const pieResult = await this.startPIE();
      if (!pieResult.success) {
        return {
          success: false,
          iterations: iteration,
          phase: "pie_launch",
          errors: pieResult.errors,
          warnings: compileResult.warnings,
          screenshot_path: "",
          duration_ms: Date.now() - startTime,
        };
      }

      // Phase 3: Wait and check for runtime errors
      await this.sleep(3000);
      const runtimeResult = await this.checkRuntime();
      if (!runtimeResult.success) {
        // Stop PIE before returning
        await this.stopPIE();
        return {
          success: false,
          iterations: iteration,
          phase: "runtime_check",
          errors: runtimeResult.errors,
          warnings: compileResult.warnings,
          screenshot_path: "",
          duration_ms: Date.now() - startTime,
        };
      }

      // Phase 4: Take screenshot as proof of success
      const screenshotPath = await this.takeScreenshot(taskDescription, iteration);

      // Stop PIE
      await this.stopPIE();

      this.logger.info(`BuildTestFix succeeded in ${iteration} iteration(s)`);

      return {
        success: true,
        iterations: iteration,
        phase: "screenshot",
        errors: [],
        warnings: compileResult.warnings,
        screenshot_path: screenshotPath,
        duration_ms: Date.now() - startTime,
      };
    }

    // Max iterations reached
    this.logger.error(`BuildTestFix aborted after ${maxIterations} iterations`);
    return {
      success: false,
      iterations: maxIterations,
      phase: "aborted",
      errors: [`Aborted after ${maxIterations} iterations without success`],
      warnings: [],
      screenshot_path: "",
      duration_ms: Date.now() - startTime,
    };
  }

  private async compile(): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    duration_ms: number;
  }> {
    try {
      const response = await this.ue5.executeCommand("build", "compile", {});
      const errors = (response.output?.errors as string[]) ?? [];
      const warnings = (response.output?.warnings as string[]) ?? [];
      const errorCount = (response.output?.error_count as number) ?? errors.length;

      return {
        success: response.success && errorCount === 0,
        errors,
        warnings,
        duration_ms: response.execution_time_ms,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        duration_ms: 0,
      };
    }
  }

  private async startPIE(): Promise<{ success: boolean; errors: string[] }> {
    try {
      const response = await this.ue5.executeCommand("console", "start_pie", {
        mode: "PIE",
      });
      return {
        success: response.success,
        errors: response.success ? [] : [response.message],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async stopPIE(): Promise<void> {
    try {
      await this.ue5.executeCommand("console", "stop_pie", {});
    } catch {
      this.logger.warn("Failed to stop PIE — may already be stopped");
    }
  }

  private async checkRuntime(): Promise<{ success: boolean; errors: string[] }> {
    try {
      // Refresh the game log from UE5
      await this.gameLog.refresh();

      const logErrors = this.gameLog.getErrors();
      if (logErrors.length > 0) {
        const errorMessages = logErrors.map((e) => e.message);
        this.logger.warn(`Runtime errors detected: ${errorMessages.length} error(s)`);
        return {
          success: false,
          errors: errorMessages,
        };
      }

      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async takeScreenshot(taskDescription: string, iteration: number): Promise<string> {
    try {
      const filename = `btf_${Date.now()}_iter${iteration}.png`;
      const response = await this.ue5.executeCommand("viewport", "screenshot", {
        filename,
      });
      return (response.output?.file_path as string) ?? filename;
    } catch {
      this.logger.warn("Failed to take screenshot — non-fatal");
      return "";
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
