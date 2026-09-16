# Verification & Testing Policy

- **No Automated Browser Testing**: Do NOT launch browser subagents (`browser_subagent`) or perform automated browser interactions after code changes unless the user explicitly requests browser verification in their prompt.
- **Standard Verification**: Verify implementations using TypeScript compilation and build checks (`bun run build` / `tsc -b`) instead.
