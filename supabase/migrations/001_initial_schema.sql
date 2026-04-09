-- Cases (core entity)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'on_scene'
    CHECK (status IN ('on_scene','post_scene','data_request','appraisal','mediation','closed')),
  severity TEXT NOT NULL DEFAULT 'A3_property_only'
    CHECK (severity IN ('A1_fatal','A2_injury','A3_property_only')),
  risk_flags JSONB NOT NULL DEFAULT '{}',
  accident_date TIMESTAMPTZ NOT NULL,
  location_text TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  road_type TEXT CHECK (road_type IN ('highway','expressway','general','alley')),
  speed_limit INT,
  weather TEXT CHECK (weather IN ('clear','rain','fog','night')),
  parties JSONB NOT NULL DEFAULT '[]',
  witnesses JSONB NOT NULL DEFAULT '[]',
  triage_result JSONB,
  can_move_vehicle BOOLEAN,
  move_vehicle_reason TEXT,
  police_arrived BOOLEAN DEFAULT false,
  police_report_no TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo','video','dashcam','document','audio','other')),
  category TEXT CHECK (category IN (
    'scene_overview','collision_point','debris','plate','signal',
    'surveillance','skid_marks','injury','vehicle_damage','other'
  )),
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  original_filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  version INT NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'registration_form','scene_diagram_7d','analysis_report_30d',
    'appraisal_6m','review_30d','compulsory_insurance_2y',
    'compulsory_insurance_10y','custom'
  )),
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','notified','completed','expired')),
  law_reference TEXT,
  description TEXT,
  notified_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generated documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'police_report_summary','evidence_list','accident_timeline',
    'insurance_claim','mediation_statement','appraisal_application'
  )),
  content JSONB NOT NULL,
  file_path TEXT,
  version INT NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  case_id UUID REFERENCES cases(id),
  action TEXT NOT NULL,
  detail JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_reminders_case_id ON reminders(case_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date) WHERE status = 'pending';
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_audit_logs_case_id ON audit_logs(case_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS policies
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own cases"
  ON cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access evidence for own cases"
  ON evidence FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can only access reminders for own cases"
  ON reminders FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can only access documents for own cases"
  ON documents FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can only access own audit logs"
  ON audit_logs FOR SELECT USING (auth.uid() = user_id);
