// === Common Output Types ===

export interface LawReference {
  /** Law name, e.g. "道路交通事故處理辦法" */
  law: string;
  /** Article, e.g. "第3條" */
  article: string;
  /** Clause, e.g. "第1項第2款" */
  clause?: string;
  /** One-line summary in Traditional Chinese */
  summary: string;
}

export interface RuleResult {
  decision: string;
  explanation: string;
  lawReferences: LawReference[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  nextSteps: string[];
  warnings: string[];
  escalateToHuman: boolean;
  escalateReason?: string;
}

// === Enums ===

export type Severity = 'A1_fatal' | 'A2_injury' | 'A3_property_only';

export type RoadType = 'highway' | 'expressway' | 'general' | 'alley';

export type Weather = 'clear' | 'rain' | 'fog' | 'night';

export type EvidenceCategory =
  | 'scene_overview'
  | 'collision_point'
  | 'debris'
  | 'plate'
  | 'signal'
  | 'surveillance'
  | 'skid_marks'
  | 'injury'
  | 'vehicle_damage'
  | 'other';

export type VehicleType = 'car' | 'motorcycle' | 'bicycle' | 'pedestrian' | 'truck' | 'bus' | 'other';

export type ReminderType =
  | 'registration_form'
  | 'scene_diagram_7d'
  | 'analysis_report_30d'
  | 'appraisal_6m'
  | 'review_30d'
  | 'compulsory_insurance_2y'
  | 'compulsory_insurance_10y';

// === Input Types ===

export interface TriageInput {
  hasDeaths: boolean;
  hasInjuries: boolean;
  vehicleCount: number;
  hasFire: boolean;
  hasHazmat: boolean;
  suspectedDUI: boolean;
  suspectedHitAndRun: boolean;
  hasMinor: boolean;
  hasForeignNational: boolean;
}

export interface VehicleMoveInput {
  hasInjuries: boolean;
  hasDeaths: boolean;
  vehicleCanDrive: boolean;
  bothPartiesAgreeToMove: boolean;
  roadType: RoadType;
  hasDispute: boolean;
}

export interface WarningDistanceInput {
  roadType: RoadType;
  speedLimit: number;
  weather: Weather;
}

export interface EvidenceChecklistInput {
  roadType: RoadType;
  vehicleTypes: VehicleType[];
  hasTrafficSignal: boolean;
  hasSurveillance: boolean;
  hasDashcam: boolean;
  hasSkidMarks: boolean;
  weather: Weather;
  isNight: boolean;
  hasInjuries: boolean;
}

export interface DeadlinesInput {
  accidentDate: Date;
  severity: Severity;
  policeArrived: boolean;
  appraisalReceivedDate?: Date;
  knowledgeOfDamageDate?: Date;
}

export interface Reminder {
  type: ReminderType;
  dueDate: Date;
  daysRemaining: number;
  urgency: 'normal' | 'upcoming' | 'urgent' | 'overdue';
  description: string;
  lawReference: LawReference;
  actionUrl?: string;
}

export interface EvidenceItem {
  category: EvidenceCategory;
  description: string;
  priority: number;
  tips: string;
  required: boolean;
}

export type VehicleMoveDecision = 'must_move' | 'may_move' | 'must_not_move' | 'wait_for_tow';
