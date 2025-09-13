import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema matching the frontend
const driverApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  vehicleType: z.string().optional(),
  cashappHandle: z.string().optional(),
  about: z.string().max(500, 'Description must be 500 characters or less').optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = driverApplicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, phone, email, availability, vehicleType, cashappHandle, about } = validationResult.data;

    // Check if email or phone already exists
    const { data: existingApplication } = await supabase
      .from('driver_applications')
      .select('id, email, phone')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An application with this email or phone number already exists.' 
        },
        { status: 409 }
      );
    }

    // Insert the application into the database
    const { data, error } = await supabase
      .from('driver_applications')
      .insert([
        {
          name,
          phone,
          email,
          availability,
          vehicle_type: vehicleType || null,
          cashapp_handle: cashappHandle || null,
          about: about || null,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to submit application. Please try again.' 
        },
        { status: 500 }
      );
    }

    // TODO: Send notification to admin about new application
    // This could be an email, Discord webhook, or Slack notification

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: data.id
    });

  } catch (error) {
    console.error('Unexpected error in driver application:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}
