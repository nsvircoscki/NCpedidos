---
name: figma-workflow
description: Use when the user wants to inspect Figma designs, implement a Figma design in code, or create and update native Figma content through Figma MCP.
---

# Figma MCP workflow

Use the connected Figma MCP server as the source of truth for design context.

When implementing a design:

1. Ask for or use the Figma file, frame, or node link supplied by the user.
2. Inspect the relevant design context before writing code.
3. Reuse existing project structure, components, tokens, and assets when they match the design.
4. Prefer the project's established framework and styling conventions.
5. Call out any ambiguity, missing asset, or mismatch between the design and the codebase.
6. Verify the result against the design and iterate on spacing, typography, color, responsive behavior, and interaction states.

When writing to Figma, confirm the target file and intended scope first, then make the smallest useful native edit. Preserve existing components, variables, and auto-layout conventions unless the user asks for a redesign.

Do not request, store, or expose Figma credentials. Let the MCP client's OAuth flow handle authentication.
