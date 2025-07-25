'use client';

/**
 * Supabase MCP Configuration
 * 
 * This file contains configuration settings for the Supabase MCP integration.
 * To use this with Cursor IDE's MCP, make sure your mcp_config.json includes
 * the Supabase server with the correct project reference and region.
 */

export const SUPABASE_MCP_CONFIG = {
  // Your Supabase project reference ID - this should match what's in your .env.local
  projectRef: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || 'radtljksnoznrsyntazx',
  
  // The region where your Supabase project is hosted
  // Common regions: 'us-east-1', 'us-west-1', 'eu-central-1', 'ap-southeast-1'
  region: 'us-east-1',
  
  // Whether to enable debug logging for MCP operations
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Instructions for setting up Supabase MCP in Cursor IDE:
 * 
 * 1. Open Cursor IDE settings
 * 2. Navigate to the MCP configuration section
 * 3. Add the Supabase server with the following configuration:
 *    {
 *      "servers": [
 *        {
 *          "name": "supabase",
 *          "url": "https://mcp.cursor.sh/supabase",
 *          "config": {
 *            "SUPABASE_PROJECT_REF": "your-project-ref",
 *            "SUPABASE_REGION": "us-east-1"
 *          }
 *        }
 *      ]
 *    }
 * 4. Replace "your-project-ref" with your actual Supabase project reference
 * 5. Set the correct region for your Supabase project
 * 6. Save the configuration
 */

// Helper function to check if MCP Supabase integration is available
export function isMCPSupabaseAvailable(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if MCP is available - more thorough check
    const mcp = (window as any).mcp;
    
    // Check if the mcp object exists and has the supabase property
    if (!mcp || typeof mcp !== 'object') {
      console.log('MCP object not found or not an object');
      return false;
    }
    
    // Check if the supabase property exists
    if (!mcp.supabase) {
      console.log('MCP object exists but supabase property is missing');
      return false;
    }
    
    // All checks passed
    console.log('MCP Supabase integration available');
    return true;
  } catch (error) {
    console.error('Error checking MCP availability:', error);
    return false;
  }
}

// Get the current MCP Supabase configuration
export function getMCPSupabaseConfig() {
  if (!isMCPSupabaseAvailable()) {
    return null;
  }
  
  const mcp = (window as any).mcp;
  return {
    projectRef: mcp.supabase.config?.SUPABASE_PROJECT_REF || null,
    region: mcp.supabase.config?.SUPABASE_REGION || null,
  };
}
