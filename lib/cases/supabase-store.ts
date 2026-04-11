/**
 * Supabase case store — writes and reads cases from the Supabase `cases` table.
 * Uses anonymous IDs for guest users (no auth required) until proper auth is
 * wired up.
 *
 * All functions return null / undefined on failure so the caller can fall
 * back to local storage.
 */

import { createClient } from '@/lib/supabase/client';
import type { CaseRecord, NewCaseInput, SaveResult } from './types';
import { getAnonymousId } from './anonymous-id';

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Convert a CaseRecord to a Supabase row (snake_case columns).
 */
function toRow(record: Partial<CaseRecord>): Record<string, unknown> {
  return {
    anonymous_id: record.anonymousId,
    user_id: record.userId,
    status: record.status,
    severity: record.severity,
    risk_flags: record.riskFlags,
    accident_date: record.accidentDate,
    location_text: record.locationText,
    location_lat: record.locationLat,
    location_lng: record.locationLng,
    road_type: record.roadType,
    speed_limit: record.speedLimit,
    weather: record.weather,
    parties: record.parties,
    witnesses: record.witnesses,
    vehicle_types: record.vehicleTypes,
    has_traffic_signal: record.hasTrafficSignal,
    has_surveillance: record.hasSurveillance,
    has_dashcam: record.hasDashcam,
    has_skid_marks: record.hasSkidMarks,
    triage_result: record.triageResult,
    can_move_vehicle: record.canMoveVehicle,
    move_vehicle_reason: record.moveVehicleReason,
    police_arrived: record.policeArrived,
    police_report_no: record.policeReportNo,
  };
}

/**
 * Convert a Supabase row back into a CaseRecord.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(row: any): CaseRecord {
  return {
    id: row.id,
    anonymousId: row.anonymous_id,
    userId: row.user_id,
    status: row.status,
    severity: row.severity,
    riskFlags: row.risk_flags || {},
    accidentDate: row.accident_date,
    locationText: row.location_text,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    roadType: row.road_type,
    speedLimit: row.speed_limit,
    weather: row.weather,
    parties: row.parties || [],
    witnesses: row.witnesses || [],
    vehicleTypes: row.vehicle_types || [],
    hasTrafficSignal: !!row.has_traffic_signal,
    hasSurveillance: !!row.has_surveillance,
    hasDashcam: !!row.has_dashcam,
    hasSkidMarks: !!row.has_skid_marks,
    triageResult: row.triage_result,
    canMoveVehicle: row.can_move_vehicle,
    moveVehicleReason: row.move_vehicle_reason,
    policeArrived: !!row.police_arrived,
    policeReportNo: row.police_report_no,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function saveCaseSupabase(input: NewCaseInput): Promise<SaveResult | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const anonymousId = getAnonymousId();

    const row = toRow({
      ...input,
      anonymousId,
    });

    const { data, error } = await supabase
      .from('cases')
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      return {
        caseId: '',
        backend: 'supabase',
        error: error?.message || 'Unknown Supabase error',
      };
    }

    return {
      caseId: data.id,
      backend: 'supabase',
    };
  } catch (e) {
    return {
      caseId: '',
      backend: 'supabase',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

export async function listCasesSupabase(): Promise<CaseRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const anonymousId = getAnonymousId();

    let query = supabase.from('cases').select('*').order('created_at', { ascending: false });

    // Scope to this anonymous user if we have an ID
    if (anonymousId) {
      query = query.eq('anonymous_id', anonymousId);
    }

    const { data, error } = await query;

    if (error || !data) return null;
    return data.map(fromRow);
  } catch {
    return null;
  }
}

export async function getCaseSupabase(id: string): Promise<CaseRecord | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return fromRow(data);
  } catch {
    return null;
  }
}
