'use client';

import { useState } from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { supabase } from '@/lib/supabase';
import { isMCPSupabaseAvailable } from '@/lib/supabase-mcp-config';

export default function SupabaseTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTestQuery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      if (error) {
        setError(error.message);
      } else {
        setTestResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase MCP Connection Test</h1>
      
      <div className="mb-8">
        <SupabaseConnectionTest />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Database Query</h2>
        <button 
          onClick={runTestQuery}
          disabled={isLoading || !isMCPSupabaseAvailable()}
          className={`px-4 py-2 rounded ${
            isMCPSupabaseAvailable() 
              ? 'bg-pink-500 hover:bg-pink-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Running...' : 'Run Test Query'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            <p className="font-medium">Error:</p>
            <p className="font-mono text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {testResult && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Query Results:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded">
                <thead className="bg-gray-100">
                  <tr>
                    {testResult.length > 0 && Object.keys(testResult[0]).map(key => (
                      <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testResult.map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {Object.values(row).map((value: any, j: number) => (
                        <td key={j} className="px-4 py-2 text-sm border-t border-gray-200">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
        <h2 className="text-xl font-semibold mb-2">MCP Configuration Instructions</h2>
        <p className="mb-4">To connect your Supabase project with MCP in Cursor IDE:</p>
        
        <ol className="list-decimal ml-5 space-y-2">
          <li>Open Cursor IDE settings</li>
          <li>Navigate to the MCP configuration section</li>
          <li>Add or update the Supabase server with the following configuration:</li>
          <li>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
{`{
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
}`}
            </pre>
          </li>
          <li>Replace the project reference with your actual Supabase project reference</li>
          <li>Update the region to match your Supabase project region</li>
          <li>Common regions are: us-east-1, us-west-1, eu-central-1, ap-southeast-1</li>
          <li>Save the configuration and restart Cursor IDE</li>
        </ol>
      </div>
    </div>
  );
}
