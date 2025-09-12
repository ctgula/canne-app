// Admin Setup Script
// Run this in browser console or as a separate script to set up first admin user

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// 1. Create admin user account
async function createAdminUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    console.log('Admin user created:', data.user?.email);

    // 2. Set admin privileges in profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          is_admin: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
      console.log('Admin privileges set successfully');
    }

    return data.user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Usage: Call this function with your desired admin credentials
// createAdminUser('admin@yourdomain.com', 'secure-password-here');

// After running, you can log in at /admin/login with these credentials
