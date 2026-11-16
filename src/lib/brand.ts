// The product name, in one place so a rename is a one-line change.
export const appName = "Linear Lite";
// The live site, shown in the MCP setup command on the landing page.
export const siteUrl = "https://happy-linear.netlify.app";

// The Claude Code command that connects to the MCP server. Settings fills in a real key right after creating one.
export const mcpCommand = (apiKey = "<your-api-key>") =>
  `claude mcp add --transport http linear-lite ${siteUrl}/api/mcp --header "Authorization: Bearer ${apiKey}"`;
