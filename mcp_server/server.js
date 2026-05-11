import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "greeting-server", version: "1.0.0" });

//Let creates our own tools
async function fetchWeatherCity(city) {
  if (city === "patna") {
    return { temp: "32", humidity: "50%" };
  }
  return { temp: null, humidity: null, error: "city not found" };
}

//add an aditional tool
server.tool("fetchWeatherCity", { city: z.string() }, async ({ city }) => {
  const result = await fetchWeatherCity(city);
  return {content: [{ type: "text", text: JSON.stringify(result) }]};
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("MCP Server Running...");
}

main();
