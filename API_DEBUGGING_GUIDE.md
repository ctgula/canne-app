# API Order Debugging Guide

## The Problem
If you're getting INSERT errors in your API routes, it's likely because you're using the wrong Supabase client.

## ❌ WRONG - This will fail due to RLS:
```typescript
import { supabase } from '@/lib/supabase'; // Regular client with anon key

export async function POST(req: NextRequest) {
  const { data, error } = await supabase.from('orders').insert(req.body);
  // This WILL FAIL because RLS blocks client-side inserts
}
```

## ✅ CORRECT - Use supabaseAdmin with service role key:
```typescript
import { supabaseAdmin } from '@/lib/supabase-admin'; // Admin client with service role key

export async function POST(req: NextRequest) {
  const { data, error } = await supabaseAdmin.from('orders').insert(req.body);
  // This WORKS because service role bypasses RLS
}
```

## Current Working API Routes:
- `/api/place-order` - ✅ Uses supabaseAdmin correctly
- `/api/orders` - ✅ Uses supabaseAdmin correctly  
- `/api/supabase` - ✅ Uses supabaseAdmin correctly

## How to Fix Any Broken API Route:

1. **Change the import:**
   ```typescript
   // FROM:
   import { supabase } from '@/lib/supabase';
   
   // TO:
   import { supabaseAdmin } from '@/lib/supabase-admin';
   ```

2. **Change the client usage:**
   ```typescript
   // FROM:
   await supabase.from('table').insert(data);
   
   // TO:
   await supabaseAdmin.from('table').insert(data);
   ```

## Environment Variables Required:
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://radtljksnoznrsyntazx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Order Placement:
1. Go to `/checkout` page
2. Add items to cart
3. Fill out delivery details
4. Submit order
5. Check browser network tab for API call to `/api/place-order`
6. Check server logs for any errors

## Common Error Messages:
- "new row violates row-level security policy" = Using wrong client
- "permission denied for table" = Using wrong client
- "INSERT-ERROR" = Usually RLS blocking the insert

## Quick Fix:
If you have a specific API route failing, share the code and I'll fix it immediately.
