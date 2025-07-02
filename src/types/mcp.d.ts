// Type definitions for MCP (Model Context Protocol) integration

interface SupabaseMCP {
  execute_postgresql: (params: { query: string }) => Promise<any>;
  get_tables: (params: { schema_name: string }) => Promise<any>;
  get_schemas: () => Promise<any>;
  get_table_schema: (params: { schema_name: string, table: string }) => Promise<any>;
  live_dangerously: (params: { service: 'api' | 'database', enable_unsafe_mode: boolean }) => Promise<any>;
}

interface MCP {
  supabase: SupabaseMCP;
}

declare global {
  interface Window {
    mcp?: MCP;
  }
}
