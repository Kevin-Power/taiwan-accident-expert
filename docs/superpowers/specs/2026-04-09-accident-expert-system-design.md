# Taiwan Accident Expert System - Design Spec

## Overview

A web-based expert system that guides Taiwan traffic accident victims through the entire post-accident lifecycle: immediate safety, evidence collection, police data requests, appraisal applications, mediation, and insurance claims. The system uses a rule engine driven by Taiwan traffic law to provide explainable, traceable guidance — never legal opinions or liability determinations.

**Product positioning**: "Taiwan localized accident SOP and document/evidence hub"
**Core principle**: Rules engine first, LLM later. Safety first, evidence traceable, no step missed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (full stack) |
| UI | shadcn/ui + Tailwind CSS (mobile-first) |
| Database | Supabase PostgreSQL + Prisma ORM |
| Auth | Supabase Auth (phone OTP primary) |
| File Storage | Supabase Storage (evidence photos/docs) |
| Deployment | Vercel |
| Testing | Vitest (rules engine unit tests) + Playwright (E2E) |

## Architecture

Monolithic Next.js — single codebase, clean module boundaries.

```
taiwan-accident-expert/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages (no auth)
│   │   ├── page.tsx              # Landing page
│   │   ├── scene/                # On-scene mode (no login required to start)
│   │   │   └── page.tsx
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (app)/                    # Authenticated pages
│   │   ├── dashboard/page.tsx    # Case overview
│   │   ├── case/
│   │   │   ├── new/page.tsx      # Create case (from scene data or manual)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Case detail - overview tab
│   │   │       ├── evidence/page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       └── timeline/page.tsx
│   │   ├── reminders/page.tsx    # All reminders center
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── cases/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │       ├── triage/route.ts
│   │   │       └── vehicle-move/route.ts
│   │   ├── evidence/
│   │   │   ├── route.ts          # POST upload
│   │   │   └── [id]/route.ts
│   │   ├── documents/
│   │   │   ├── generate/route.ts # POST generate document
│   │   │   └── [id]/route.ts
│   │   └── reminders/
│   │       └── route.ts
│   └── layout.tsx                # Root layout
├── lib/
│   ├── rules-engine/             # Core rules (pure TS, zero deps)
│   │   ├── types.ts
│   │   ├── triage.ts
│   │   ├── vehicle-move.ts
│   │   ├── evidence-checklist.ts
│   │   ├── deadlines.ts
│   │   ├── warning-distance.ts
│   │   ├── constants.ts          # Law text, article references
│   │   └── __tests__/
│   │       ├── triage.test.ts
│   │       ├── vehicle-move.test.ts
│   │       ├── evidence-checklist.test.ts
│   │       ├── deadlines.test.ts
│   │       └── warning-distance.test.ts
│   ├── templates/                # Document templates
│   │   ├── police-report-summary.ts
│   │   ├── evidence-list.ts
│   │   ├── accident-timeline.ts
│   │   ├── insurance-claim.ts
│   │   └── renderer.ts          # JSON → PDF/DOCX
│   ├── law-references/           # Static law data (JSON)
│   │   ├── traffic-accident-handling.json
│   │   ├── road-traffic-management.json
│   │   ├── appraisal-review.json
│   │   ├── compulsory-insurance.json
│   │   └── personal-data-protection.json
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   └── utils/
│       ├── hash.ts               # SHA-256 for evidence integrity
│       ├── date.ts               # Date helpers (TW timezone)
│       └── disclaimer.ts         # Legal disclaimer constants
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── scene/                    # On-scene mode components
│   │   ├── safety-check.tsx
│   │   ├── injury-triage.tsx
│   │   ├── vehicle-move-decision.tsx
│   │   ├── evidence-capture.tsx
│   │   └── info-exchange.tsx
│   ├── case/
│   │   ├── case-card.tsx
│   │   ├── case-overview.tsx
│   │   ├── timeline-view.tsx
│   │   └── reminder-list.tsx
│   ├── evidence/
│   │   ├── evidence-grid.tsx
│   │   ├── upload-zone.tsx
│   │   └── evidence-detail.tsx
│   ├── documents/
│   │   ├── document-list.tsx
│   │   ├── document-preview.tsx
│   │   └── generate-button.tsx
│   └── shared/
│       ├── law-reference-badge.tsx    # Expandable law citation
│       ├── risk-badge.tsx             # A1/A2/A3 + risk level
│       ├── disclaimer-footer.tsx      # Mandatory legal disclaimer
│       ├── countdown-badge.tsx        # Days remaining
│       └── step-wizard.tsx            # Multi-step form wrapper
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── icons/
├── docs/
│   └── superpowers/specs/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## Database Schema

```sql
-- Cases (core entity)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'on_scene'
    CHECK (status IN ('on_scene','post_scene','data_request','appraisal','mediation','closed')),
  severity TEXT NOT NULL DEFAULT 'A3_property_only'
    CHECK (severity IN ('A1_fatal','A2_injury','A3_property_only')),
  risk_flags JSONB NOT NULL DEFAULT '{}',

  -- Accident basics
  accident_date TIMESTAMPTZ NOT NULL,
  location_text TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  road_type TEXT CHECK (road_type IN ('highway','expressway','general','alley')),
  speed_limit INT,
  weather TEXT CHECK (weather IN ('clear','rain','fog','night')),

  -- Parties & witnesses
  parties JSONB NOT NULL DEFAULT '[]',
  witnesses JSONB NOT NULL DEFAULT '[]',

  -- Triage results (rule engine snapshot)
  triage_result JSONB,
  can_move_vehicle BOOLEAN,
  move_vehicle_reason TEXT,

  -- Police
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
```

## Rules Engine

Pure TypeScript functions, zero external dependencies. Every rule returns a `RuleResult` with decision, explanation, law references, risk level, and whether to escalate to human.

### Common Types

```typescript
interface RuleResult {
  decision: string;
  explanation: string;
  lawReferences: LawReference[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  nextSteps: string[];
  warnings: string[];
  escalateToHuman: boolean;
  escalateReason?: string;
}

interface LawReference {
  law: string;
  article: string;
  clause?: string;
  summary: string;
  fullText: string;
}
```

### Module 1: Triage (`triage.ts`)

Classifies accident severity and sets risk flags.

| Input | Output |
|-------|--------|
| hasDeaths, hasInjuries, vehicleCount, hasFire, hasHazmat, suspectedDUI, suspectedHitAndRun, hasMinor, hasForeignNational | severity (A1/A2/A3), riskFlags[], escalateToHuman, riskLevel |

Rules:
- Death → A1 + critical + mandatory human escalation
- Injury → A2 + high + criminal/civil risk notice + human referral
- Property only → A3 + low/medium
- Hit-and-run/DUI/hazmat → critical + mandatory human escalation regardless of injury
- Minor/foreign national → additional flag

Law basis: Road Traffic Management and Penalty Act §62, Traffic Accident Handling Regulations §2

### Module 2: Vehicle Move (`vehicle-move.ts`)

Determines whether vehicles can/should be moved.

| Input | Output |
|-------|--------|
| hasInjuries, vehicleCanDrive, bothPartiesAgreeToMove, roadType, hasDispute | canMove (boolean), action (must_move/may_move/must_not_move), steps[], warnings[] |

Decision tree:
- No injury + vehicle drivable → MUST mark and photograph then move (penalty risk if not)
- Injury + both agree → MAY mark and photograph then move
- Injury + disagree/dispute → MUST NOT move, wait for police
- Vehicle not drivable → Set warning signs, wait for tow

Law basis: Traffic Accident Handling Regulations §3, §4; Road Traffic Management and Penalty Act §62

### Module 3: Warning Distance (`warning-distance.ts`)

Calculates required warning sign distance.

| Input | Output |
|-------|--------|
| roadType, speedLimit, weather | distanceMeters (number), explanation |

Rules:
- Highway → 100m
- Expressway or speed limit > 60 → 80m
- Speed limit 50-60 → 50m
- Speed limit ≤ 50 → 30m
- Congestion/speed ≤ 10km/h → 5m
- Rain/fog/night/poor visibility → increase distance

Law basis: Road Traffic Management and Penalty Act §92 delegated regulations

### Module 4: Evidence Checklist (`evidence-checklist.ts`)

Generates prioritized evidence collection checklist based on accident type.

| Input | Output |
|-------|--------|
| roadType, vehicleTypes[], hasTrafficSignal, hasSurveillance, hasDashcam, hasSkidMarks, weather, timeOfDay | checklist: EvidenceItem[] (ordered by priority) |

Base checklist (all cases):
1. Scene overview with road markings
2. Collision point close-up
3. Debris/fallen objects
4. Both vehicles' plates
5. Vehicle damage
6. Traffic signal (with countdown if applicable)
7. Surveillance camera locations
8. Dashcam preservation reminder

Conditional additions:
- Skid marks → skid mark length and direction
- Rain → road water accumulation
- Night → street lighting conditions
- Injury → injury photos (with sensitivity notice)

### Module 5: Deadlines (`deadlines.ts`)

Calculates all statutory deadlines from accident date.

| Input | Output |
|-------|--------|
| accidentDate, severity, currentPhase, appraisalReceivedDate?, knowledgeOfDamageDate? | reminders: Reminder[] (with due dates, days remaining, urgency) |

Automatic calculations:
- accident + 7 days → Can request scene diagram/photos
- accident + 30 days → Can request preliminary analysis report
- accident + 6 months → Appraisal application deadline (generally not accepted after)
- appraisalReceived + 30 days → Review deadline (one time only)
- knowledgeOfDamage + 2 years → Compulsory insurance claim prescription
- accident + 10 years → Compulsory insurance absolute prescription

Law basis: Traffic Accident Handling Regulations §13, Appraisal and Review Regulations §3/§10, Compulsory Automobile Liability Insurance Act §14

### Module 6: Document Templates (`templates/`)

Generates structured documents from case data.

Templates:
- **Police report summary**: Structured accident facts for police filing
- **Evidence list**: All evidence with file hash, timestamp, category (exportable PDF)
- **Accident timeline**: Chronological event reconstruction
- **Insurance claim summary**: Formatted for insurance company submission
- **Appraisal application helper**: Pre-filled form assistance with fee reminder

## UI/UX Design

### Design Principles

1. **Mobile-first**: 99% of on-scene users are on phones
2. **On-scene mode**: Dark background, extra-large text, high contrast (outdoor sunlight readable)
3. **One decision per step**: Never present multiple choices simultaneously
4. **Law citations expandable**: Show summary by default, tap to expand full text
5. **Mandatory disclaimer**: Every result page has non-dismissable legal disclaimer footer
6. **Accessibility**: WCAG 2.1 AA compliant

### Navigation Structure

```
Landing Page
├── [CTA] "I just had an accident" → On-Scene Mode (no login required to start)
├── [CTA] "Manage my cases" → Login → Dashboard
└── Footer: About / Disclaimer / Privacy Policy / Terms

Dashboard (authenticated)
├── Case list (cards with status + next deadline + countdown)
├── Reminder center
└── + New case

Case Detail (tabs)
├── Overview (accident info + triage result + rule suggestions)
├── Evidence (photo/video grid + upload + export)
├── Documents (generate + preview + download PDF/DOCX)
└── Timeline (vertical timeline with all deadlines and status)
```

### On-Scene Mode Flow (6 steps)

**Step 1: Safety First**
- Checklist: hazard lights, move away from traffic, set warning signs
- Auto-calculate warning distance based on road type selection
- Law reference: Road Traffic Management and Penalty Act §92

**Step 2: Injury Triage**
- Three options: fatal/serious injury, minor injury, no injury
- Fatal/serious → immediate 119/110 prompt, system locks to safety-only mode
- Law reference: Traffic Accident Handling Regulations §3

**Step 3: Vehicle Move Decision**
- Auto-determined from Step 2 results
- Clear action + step-by-step instructions + penalty risk warning
- Law reference: Traffic Accident Handling Regulations §4, Road Traffic Act §62

**Step 4: Evidence Capture**
- Sequential photo checklist with camera integration
- Each item checkable, photos attach to case
- Dashcam preservation reminder
- Law reference: Traffic Accident Handling Regulations §3

**Step 5: Information Exchange**
- Form for other party's info (name, plate, phone, insurance)
- Option to photograph license/registration instead of manual entry
- PII minimization notice

**Step 6: Case Created**
- Case number assigned
- All deadline reminders auto-scheduled
- Push notification permission request
- Summary of next steps

### On-Scene Data Persistence

On-scene mode works without login. Data is stored in browser localStorage during the flow. At Step 6, the user is prompted to create an account (phone OTP) to save the case. If they don't sign up, data remains in localStorage for 7 days with a reminder banner on revisit.

## Legal Compliance

### Lawyer Act (律師法) Compliance

The system is an **information reference and SOP navigation tool**, not legal counsel.

Prohibited outputs (hard-blocked in code):
- Liability determinations ("you are/aren't at fault")
- Win/loss probability
- Settlement amount suggestions
- Litigation strategy
- Fault percentage allocation

Required output structure:
- "Based on the information you provided, the relevant legal obligations/deadlines/procedures are..."
- "This still requires confirmation by police/appraisal committee/court"

### Personal Data Protection Act (個資法) Compliance

- §8: Clear notice of collection purpose, scope, retention period at registration
- §6: Medical data (diagnosis, injury photos) requires explicit written consent
- §27: Security measures for non-government entities (encryption, access control, audit logs)
- §3: Users can request deletion at any time
- §12: Breach notification procedures built into system

### Mandatory Legal Disclaimer

Displayed on every result page, non-dismissable:

> 本系統依據公開法規提供資訊參考與流程導航，不構成法律意見。個案情況各異，涉及權益事項請諮詢律師或法律扶助基金會（電話：412-8518）。

### High-Risk Case Escalation

Cases matching ANY of these conditions automatically set `escalateToHuman: true`:
- A1 (fatal) or A2 (injury)
- Suspected hit-and-run
- Suspected DUI/drug driving
- Hazardous materials involved
- Minor or foreign national involved
- Case already under criminal investigation/trial
- Major accident (as defined in Traffic Accident Handling Regulations)

When escalated:
- UI locks general advice sections
- Only safety guidance and emergency contacts shown
- Prominent link to legal aid and lawyer referral
- System will NOT generate mediation statements or settlement-related documents

## Security

- All traffic over HTTPS (Vercel default)
- Database encryption at rest (Supabase default)
- Evidence files: SHA-256 hash computed on upload, stored for integrity verification
- Supabase RLS policies ensure users can only access their own data
- Audit log records every read/write operation with user ID, action, timestamp, IP
- Sensitive PII fields (ID number, address) masked by default in UI
- Session timeout: 30 minutes inactive
- Rate limiting on API routes

## MVP Scope

### In Scope (P0)
1. On-scene mode (6-step wizard)
2. Rules engine: triage, vehicle-move, warning-distance, evidence-checklist, deadlines
3. Evidence upload with hash verification
4. Deadline reminders (7d/30d/6m/review/2y/10y)
5. Document generation: police report summary, evidence list, accident timeline
6. Auth (phone OTP)
7. Legal compliance foundation (disclaimer, PII handling, audit logs)

### P1 (after MVP validation)
- Appraisal application document pack
- Review deadline tracking
- Push notifications (web push)
- Export all case data as ZIP

### P2 (after product-market fit)
- Lawyer/fleet admin workstation (multi-user, role-based)
- Evidence analysis (image annotation, key frame extraction)
- LINE Bot integration for reminders
- LLM-assisted document drafting
- Open data integration (government accident datasets)

### Out of Scope (by design, not by schedule)
- Liability determination
- Settlement amount calculation
- Legal advice of any kind
- Direct filing to police/insurance systems
- Payment processing
