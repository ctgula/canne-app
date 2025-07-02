'use client';

import { useState } from 'react';

/**
 * Type definitions for Supabase MCP responses
 */
export type SupabaseMCPResponse<T = any> = {
  data?: T;
  error?: string;
  count?: number;
};

/**
 * Executes a PostgreSQL query using the Supabase MCP integration.
 * This function abstracts the complexity of working with the MCP interface.
 *
 * @param query The SQL query to execute
 * @param params Optional array of parameters for the query
 * @returns Promise with the query results or error
 */
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<SupabaseMCPResponse<T>> {
  try {
    // Use MCP integration instead of direct supabase client
    const response = await fetch('/api/supabase-mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, params }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Query failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing query:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * React hook for working with Supabase through MCP
 * Provides state management and error handling
 */
export function useSupabaseMCP() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any | null>(null);

  /**
   * Execute a query with loading state management
   */
  async function query<T = any>(sql: string, params: any[] = []): Promise<SupabaseMCPResponse<T>> {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await executeQuery<T>(sql, params);
      
      if (result.error) {
        setError(new Error(result.error));
      } else {
        setData(result.data);
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      return { error: errorObj.message };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    query,
    isLoading,
    error,
    data
  };
}
