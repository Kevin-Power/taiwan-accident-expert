/**
 * Case record types — shared between storage backends.
 */

import type { RoadType, Weather, VehicleType, Severity } from '@/lib/rules-engine/types';

/**
 * Serializable case payload. Matches the shape of Supabase `cases` table
 * columns with camelCase field names.
 */
export interface CaseRecord {
  id: string;
  anonymousId?: string | null;
  userId?: string | null;
  status: 'on_scene' | 'post_scene' | 'data_request' | 'appraisal' | 'mediation' | 'closed';
  severity: Severity;
  riskFlags: Record<string, boolean>;

  // Accident basics
  accidentDate: string; // ISO timestamp
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  roadType?: RoadType | null;
  speedLimit?: number | null;
  weather?: Weather | null;

  // Parties & witnesses
  parties: Array<{
    role: 'self' | 'other' | 'witness';
    name?: string;
    plate?: string;
    phone?: string;
    insurance?: string;
    vehicleType?: VehicleType;
  }>;
  witnesses: Array<{ name?: string; phone?: string; description?: string }>;

  // Scene conditions (for evidence checklist & scenario matching)
  vehicleTypes: VehicleType[];
  hasTrafficSignal: boolean;
  hasSurveillance: boolean;
  hasDashcam: boolean;
  hasSkidMarks: boolean;

  // Triage results
  triageResult?: unknown | null;
  canMoveVehicle?: boolean | null;
  moveVehicleReason?: string | null;

  // Police state
  policeArrived: boolean;
  policeReportNo?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Input shape used by SceneWizard / Step 6 to create a new case.
 * Omits server-assigned fields (id, timestamps) and normalizes booleans.
 */
export type NewCaseInput = Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt' | 'anonymousId' | 'userId'>;

/**
 * Result of a save operation, indicating which backend was used.
 */
export interface SaveResult {
  caseId: string;
  backend: 'supabase' | 'local';
  error?: string;
}
