import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      user_id: user.id,
      status: body.status || 'on_scene',
      severity: body.severity || 'A3_property_only',
      risk_flags: body.riskFlags || {},
      accident_date: body.accidentDate || new Date().toISOString(),
      location_text: body.locationText,
      location_lat: body.locationLat,
      location_lng: body.locationLng,
      road_type: body.roadType,
      speed_limit: body.speedLimit,
      weather: body.weather,
      parties: body.parties || [],
      witnesses: body.witnesses || [],
      triage_result: body.triageResult,
      can_move_vehicle: body.canMoveVehicle,
      move_vehicle_reason: body.moveVehicleReason,
      police_arrived: body.policeArrived || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
