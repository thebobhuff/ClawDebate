import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * File Context Extension
 * 
 * 1. Shows the current open file in the footer.
 * 2. Detects dropped file paths in input and adds them as file references.
 */
export default function (pi: ExtensionAPI) {
    let currentFile: string | undefined;

    // Helper to expand tilde
    const expandTilde = (filePath: string) => {
        if (filePath.startsWith("~")) {
            return path.join(os.homedir(), filePath.slice(1));
        }
        return filePath;
    };

    // Helper to update the footer status
    const updateFooter = (ctx: any) => {
        const theme = ctx.ui.theme;
        if (currentFile) {
            const shortPath = path.basename(currentFile);
            ctx.ui.setStatus("current-file", theme.fg("dim", " File: ") + theme.fg("accent", shortPath));
        } else {
            ctx.ui.setStatus("current-file", undefined);
        }
    };

    // Track file operations to update "current" file
    pi.on("tool_call", async (event, ctx) => {
        if (event.toolName === "read" || event.toolName === "write" || event.toolName === "edit") {
            const filePath = (event.input as any).path;
            if (filePath) {
                // Normalize path
                const normalizedPath = filePath.startsWith("@") ? filePath.slice(1) : filePath;
                currentFile = path.resolve(ctx.cwd, normalizedPath);
                updateFooter(ctx);
            }
        }
    });

    // Initialize footer on start
    pi.on("session_start", async (_event, ctx) => {
        updateFooter(ctx);
    });

    // Register /deploy command to help with production pushes
    pi.registerCommand("deploy", {
        description: "Guide for pushing migrations to Supabase production",
        handler: async (args, ctx) => {
            ctx.ui.notify("Starting deployment guide...", "info");
            const ok = await ctx.ui.confirm("Production Push", "This will push local migrations to your LINKED production database. Continue?");
            if (!ok) return;

            ctx.ui.notify("Step 1: Ensure you are logged in (npx supabase login)", "info");
            ctx.ui.notify("Step 2: Ensure project is linked (npx supabase link)", "info");
            
            const proceed = await ctx.ui.confirm("Execute Push", "Run 'npx supabase db push' now?");
            if (proceed) {
                ctx.ui.setStatus("deploy", "Pushing migrations...");
                const result = await pi.exec("npx", ["supabase", "db", "push"]);
                ctx.ui.setStatus("deploy", undefined);
                
                if (result.code === 0) {
                    ctx.ui.notify("Deployment successful!", "success");
                } else {
                    ctx.ui.notify("Deployment failed. Check terminal for errors.", "error");
                }
            }
        }
    });

    // Handle drag and drop (detected as pasted paths in input)
    pi.on("input", async (event, ctx) => {
        if (event.source === "extension") return { action: "continue" };

        const trimmedText = event.text.trim();
        if (!trimmedText) return { action: "continue" };

        const parts = trimmedText.split(/\s+/);
        let transformed = false;
        let newText = "";
        let addedFiles: string[] = [];

        for (const part of parts) {
            let cleanPart = part;
            // Remove quotes if present
            if ((cleanPart.startsWith('"') && cleanPart.endsWith('"')) || (cleanPart.startsWith("'") && cleanPart.endsWith("'"))) {
                cleanPart = cleanPart.slice(1, -1);
            }

            try {
                const expandedPart = expandTilde(cleanPart);
                const absolutePath = path.resolve(ctx.cwd, expandedPart);
                const isPathLike = path.isAbsolute(expandedPart) || cleanPart.startsWith("./") || cleanPart.startsWith("../") || cleanPart.startsWith("~");
                
                // Only transform if it's explicitly path-like or the only part of the message
                if ((isPathLike || parts.length === 1) && fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
                    const content = fs.readFileSync(absolutePath, "utf-8");
                    newText += `<file name="${absolutePath}">\n${content}\n</file>\n`;
                    addedFiles.push(path.basename(absolutePath));
                    transformed = true;
                } else {
                    newText += part + " ";
                }
            } catch (e) {
                newText += part + " ";
            }
        }

        if (transformed) {
            ctx.ui.notify(`Added file reference(s): ${addedFiles.join(", ")}`, "info");
            return { action: "transform", text: newText.trim() };
        }

        return { action: "continue" };
    });
}
