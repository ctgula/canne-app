// Type definitions for MCP (Model Context Protocol) integration

interface PostgreSQLResult {
  rows?: Record<string, unknown>[];
  error?: string;
}

interface TableInfo {
  name: string;
  schema: string;
  columns?: Record<string, unknown>[];
}

interface SchemaInfo {
  name: string;
  tables?: string[];
}

interface SupabaseMCP {
  execute_postgresql: (params: { query: string }) => Promise<PostgreSQLResult>;
  get_tables: (params: { schema_name: string }) => Promise<TableInfo[]>;
  get_schemas: () => Promise<SchemaInfo[]>;
  get_table_schema: (params: { schema_name: string, table: string }) => Promise<TableInfo>;
  live_dangerously: (params: { service: 'api' | 'database', enable_unsafe_mode: boolean }) => Promise<{ success: boolean }>;
}

interface MCP {
  supabase: SupabaseMCP;
}

declare global {
  interface Window {
    mcp?: MCP;
  }
}
