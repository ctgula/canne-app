import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { z } from 'zod';

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

    // Sanitize inputs
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if email or phone already exists
    const { data: existingApplication } = await supabase
      .from('driver_applications')
      .select('id, email, phone')
      .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
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
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          availability,
          vehicle_type: vehicleType?.trim() || null,
          cashapp_handle: cashappHandle?.trim() || null,
          about: about?.trim() || null,
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

    // Send Discord notification for new driver application
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🚗 New Driver Application',
              color: 0x9333ea,
              fields: [
                { name: 'Name', value: cleanName, inline: true },
                { name: 'Phone', value: cleanPhone, inline: true },
                { name: 'Email', value: cleanEmail, inline: true },
                { name: 'Availability', value: availability.join(', ') },
                { name: 'Vehicle', value: vehicleType || 'Not specified', inline: true },
                { name: 'Cash App', value: cashappHandle || 'Not provided', inline: true },
              ],
              timestamp: new Date().toISOString(),
            }],
          }),
        });
      }
    } catch (discordError) {
      console.error('Discord notification error:', discordError);
    }

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
