import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API route handler for Supabase integration
 * This route provides a secure way to execute PostgreSQL queries
 */
export async function POST(request: Request) {
  try {
    const { query, params, action, payload } = await request.json();
    
    // Initialize Supabase client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing', 
          details: 'Please check your environment variables' },
        { status: 503 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different action types
    if (action) {
      switch (action) {
        case 'get_config':
          return NextResponse.json({
            data: {
              available: true,
              projectRef: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || null,
              region: 'us-east-1'
            }
          });
          
        case 'auth_admin':
          return NextResponse.json(
            { error: 'Auth admin methods not supported in this implementation' },
            { status: 501 }
          );
          
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

    // Execute the query using Supabase client
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
      
      if (error) {
        throw error;
      }

      return NextResponse.json({ data, error: null });
    } catch (error: any) {
      console.error('Error executing query:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Query execution failed',
          details: error.details || null
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error executing Supabase query via MCP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
