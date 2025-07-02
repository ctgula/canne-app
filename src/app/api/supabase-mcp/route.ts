import { NextResponse } from 'next/server';

/**
 * API route handler for Supabase MCP integration
 * This route provides a secure way to execute PostgreSQL queries using the MCP tools
 */
export async function POST(request: Request) {
  try {
    const { query, params, action, payload } = await request.json();
    
    // Call the MCP client which is available in server components
    // @ts-ignore - MCP types are not available in TypeScript
    const mcp = global.mcp;
    
    if (!mcp || !mcp.supabase) {
      return NextResponse.json(
        { error: 'MCP Supabase integration is not available', 
          details: 'Please configure the Supabase MCP server in Cursor IDE settings' },
        { status: 503 }
      );
    }

    // Handle different action types
    if (action) {
      switch (action) {
        case 'get_config':
          return NextResponse.json({
            data: {
              available: true,
              projectRef: mcp.supabase.config?.SUPABASE_PROJECT_REF || null,
              region: mcp.supabase.config?.SUPABASE_REGION || null
            }
          });
          
        case 'auth_admin':
          if (!payload || !payload.method) {
            return NextResponse.json({ error: 'Method parameter is required for auth_admin action' }, { status: 400 });
          }
          
          try {
            const result = await mcp.supabase.call_auth_admin_method({
              method: payload.method,
              params: payload.params || {}
            });
            return NextResponse.json(result);
          } catch (error) {
            console.error('Error calling auth admin method:', error);
            return NextResponse.json(
              { error: error instanceof Error ? error.message : 'Auth admin method failed' },
              { status: 500 }
            );
          }
          
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }
    }
    
    // Handle SQL query execution (default behavior)
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // In a production environment, you should validate and sanitize queries
    // and implement proper authorization checks
    try {
      // First check if we need to enable unsafe mode for write operations
      if (!query.trim().toLowerCase().startsWith('select')) {
        await mcp.supabase.live_dangerously({
          service: 'database',
          enable_unsafe_mode: true
        });
      }
      
      const result = await mcp.supabase.execute_postgresql({
        query,
        params: params || []
      });
      
      // Reset to safe mode after write operations
      if (!query.trim().toLowerCase().startsWith('select')) {
        await mcp.supabase.live_dangerously({
          service: 'database',
          enable_unsafe_mode: false
        });
      }

      return NextResponse.json(result);
    } catch (error: any) {
      // Check for region mismatch error
      if (error.message && error.message.includes('Region mismatch detected')) {
        return NextResponse.json(
          { 
            error: 'Supabase region configuration error', 
            details: 'The region in your MCP configuration does not match your Supabase project region',
            message: error.message
          },
          { status: 503 }
        );
      }
      
      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error executing Supabase query via MCP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
