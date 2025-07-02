'use client';

import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/supabase-mcp';
import { isMCPSupabaseAvailable, getMCPSupabaseConfig } from '@/lib/supabase-mcp-config';

type ConnectionStatus = 'loading' | 'connected' | 'error' | 'missing-mcp' | 'region-mismatch';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [mcpConfig, setMcpConfig] = useState<{projectRef: string | null, region: string | null} | null>(null);

  useEffect(() => {
    // Using MCP Supabase integration for connection testing
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shfaxsmyxhlzzdmzmgwo.supabase.co';
    setSupabaseUrl(url);

    // Check if MCP Supabase integration is available
    const mcpAvailable = isMCPSupabaseAvailable();
    if (!mcpAvailable) {
      setStatus('missing-mcp');
      return;
    }

    // Get MCP Supabase configuration
    const config = getMCPSupabaseConfig();
    setMcpConfig(config);
    
    async function checkConnection() {
      try {
        // First check MCP configuration
        const configResponse = await fetch('/api/supabase-mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_config' })
        });
        
        if (!configResponse.ok) {
          throw new Error('Failed to get MCP configuration');
        }
        
        const configData = await configResponse.json();
        if (configData.error) {
          throw new Error(configData.error);
        }
        
        // Now execute a test query
        const result = await executeQuery('SELECT NOW() as current_time;');
        
        if (result.error) {
          // Check for region mismatch error
          if (result.error.includes('Region mismatch') || result.error.includes('region')) {
            setStatus('region-mismatch');
            setErrorMessage(result.error);
            return;
          }
          throw new Error(result.error);
        }
        
        // Extract the timestamp from the result
        if (result.data && result.data.length > 0) {
          setTimestamp(new Date(result.data[0].current_time).toLocaleString());
          setStatus('connected');
        } else {
          throw new Error('No data returned from Supabase');
        }
      } catch (error) {
        console.error('Supabase MCP connection error:', error);
        
        // Check if it's related to missing MCP integration
        if (!isMCPSupabaseAvailable()) {
          setStatus('missing-mcp');
          setErrorMessage('MCP Supabase integration not available');
        } else {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error connecting to Supabase');
        }
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg mb-4 bg-white/50 dark:bg-gray-800/50">
      <h3 className="text-lg font-medium mb-2">Supabase MCP Connection Status</h3>
      
      {status === 'loading' && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
          <p>Checking connection...</p>
        </div>
      )}
      
      {status === 'connected' && (
        <div className="text-green-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Connected to Supabase via MCP successfully!</p>
          </div>
          <div className="mt-1 ml-7 text-sm">
            <p>Server time: <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">{timestamp}</span></p>
            <p className="mt-1">Supabase URL: <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">{supabaseUrl}</span></p>
            {mcpConfig && (
              <>
                <p className="mt-1">Project Ref: <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">{mcpConfig.projectRef}</span></p>
                <p className="mt-1">Region: <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">{mcpConfig.region}</span></p>
              </>
            )}
          </div>
        </div>
      )}
      
      {status === 'missing-mcp' && (
        <div className="text-amber-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>MCP Supabase Integration Not Available</p>
          </div>
          <div className="mt-2 ml-7 text-sm">
            <p>Supabase URL is configured as: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{supabaseUrl}</span></p>
            <p className="mt-2">To set up the MCP Supabase integration:</p>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Open Cursor IDE settings</li>
              <li>Navigate to the MCP configuration section</li>
              <li>Add the Supabase server with the following configuration:</li>
              <li className="ml-5 font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded whitespace-pre">
                {JSON.stringify({
                  "servers": [
                    {
                      "name": "supabase",
                      "url": "https://mcp.cursor.sh/supabase",
                      "config": {
                        "SUPABASE_PROJECT_REF": "shfaxsmyxhlzzdmzmgwo",
                        "SUPABASE_REGION": "us-east-1"
                      }
                    }
                  ]
                }, null, 2)}
              </li>
              <li>Save the configuration and restart Cursor IDE</li>
              <li>Refresh this page to try again</li>
            </ol>
          </div>
        </div>
      )}

      {status === 'region-mismatch' && (
        <div className="text-amber-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>Supabase Region Mismatch</p>
          </div>
          <div className="mt-2 ml-7 text-sm">
            <p className="text-sm mt-1">{errorMessage}</p>
            <p className="mt-2">To fix this issue:</p>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Open Cursor IDE settings</li>
              <li>Navigate to the MCP configuration section</li>
              <li>Update the SUPABASE_REGION value in your Supabase server configuration</li>
              <li>Common regions are: us-east-1, us-west-1, eu-central-1, ap-southeast-1</li>
              <li>Save the configuration and restart Cursor IDE</li>
              <li>Refresh this page to try again</li>
            </ol>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>Failed to connect to Supabase via MCP</p>
          </div>
          <p className="text-sm mt-1 ml-7">{errorMessage}</p>
          <div className="mt-2 ml-7 text-sm">
            <p>Please check:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Your MCP configuration has the correct Supabase project reference</li>
              <li>The Supabase project is active and accessible</li>
              <li>Your network connection</li>
              <li>MCP server status in Cursor IDE</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
