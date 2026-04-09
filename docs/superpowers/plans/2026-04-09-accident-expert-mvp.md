# Taiwan Accident Expert System — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working web app that guides Taiwan traffic accident victims through safety procedures, evidence collection, deadline tracking, and document generation — all driven by a rule engine grounded in Taiwan traffic law.

**Architecture:** Monolithic Next.js 15 (App Router) with a pure-TypeScript rule engine in `lib/rules-engine/`, Supabase for database/auth/storage, shadcn/ui for mobile-first UI. TDD for the rule engine, integration tests for API routes, Playwright for critical user flows.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase (PostgreSQL + Auth + Storage), Vitest, Playwright

---

## File Structure

```
taiwan-accident-expert/
├── app/
│   ├── layout.tsx                        # Root layout (fonts, metadata, providers)
│   ├── globals.css                       # Tailwind + custom CSS
│   ├── (public)/
│   │   ├── page.tsx                      # Landing page
│   │   ├── scene/
│   │   │   ├── page.tsx                  # On-scene wizard entry
│   │   │   └── _components/
│   │   │       ├── scene-wizard.tsx      # Wizard state machine
│   │   │       ├── step-safety.tsx       # Step 1: safety check
│   │   │       ├── step-injury.tsx       # Step 2: injury triage
│   │   │       ├── step-vehicle-move.tsx # Step 3: vehicle move
│   │   │       ├── step-evidence.tsx     # Step 4: evidence capture
│   │   │       ├── step-info-exchange.tsx# Step 5: info exchange
│   │   │       └── step-complete.tsx     # Step 6: case created
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                    # Auth-required layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── case-list.tsx
│   │   │       └── case-card.tsx
│   │   ├── case/
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Case overview
│   │   │       ├── evidence/page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       ├── timeline/page.tsx
│   │   │       └── _components/
│   │   │           ├── case-header.tsx
│   │   │           ├── case-tabs.tsx
│   │   │           ├── evidence-grid.tsx
│   │   │           ├── upload-zone.tsx
│   │   │           ├── document-list.tsx
│   │   │           ├── timeline-view.tsx
│   │   │           └── reminder-list.tsx
│   │   └── reminders/page.tsx
│   └── api/
│       ├── cases/
│       │   ├── route.ts                  # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts              # GET, PATCH
│       ├── evidence/
│       │   ├── route.ts                  # POST upload
│       │   └── [id]/route.ts             # GET, DELETE
│       ├── documents/
│       │   └── generate/route.ts         # POST generate
│       └── reminders/
│           └── route.ts                  # GET list, PATCH complete
├── lib/
│   ├── rules-engine/
│   │   ├── types.ts
│   │   ├── constants.ts                  # Law references data
│   │   ├── warning-distance.ts
│   │   ├── triage.ts
│   │   ├── vehicle-move.ts
│   │   ├── evidence-checklist.ts
│   │   ├── deadlines.ts
│   │   └── __tests__/
│   │       ├── warning-distance.test.ts
│   │       ├── triage.test.ts
│   │       ├── vehicle-move.test.ts
│   │       ├── evidence-checklist.test.ts
│   │       └── deadlines.test.ts
│   ├── templates/
│   │   ├── types.ts
│   │   ├── police-report-summary.ts
│   │   ├── evidence-list.ts
│   │   └── accident-timeline.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
│       ├── hash.ts
│       ├── date.ts
│       └── disclaimer.ts
├── components/
│   ├── ui/                               # shadcn/ui (auto-generated)
│   └── shared/
│       ├── law-reference-badge.tsx
│       ├── risk-badge.tsx
│       ├── disclaimer-footer.tsx
│       ├── countdown-badge.tsx
│       └── step-wizard.tsx
├── prisma/
│   └── schema.prisma
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── e2e/
│   └── scene-wizard.spec.ts
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.env.local.example`, `.gitignore`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Create Next.js project**

```bash
cd "C:\Users\pc\Documents\交通事故專家"
npx create-next-app@latest taiwan-accident-expert --typescript --tailwind --eslint --app --src=no --import-alias "@/*" --use-npm
```

When prompted, accept defaults. This creates the project in a subfolder.

- [ ] **Step 2: Move project files to root**

```bash
# Move all files from subfolder to root (since we want the project at the repo root)
cp -r taiwan-accident-expert/* taiwan-accident-expert/.* . 2>/dev/null
rm -rf taiwan-accident-expert
```

- [ ] **Step 3: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr prisma @prisma/client date-fns
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Accept defaults (New York style, Zinc color, CSS variables yes).

- [ ] **Step 5: Add shadcn/ui components we need**

```bash
npx shadcn@latest add button card input label select checkbox badge alert dialog sheet tabs progress separator
```

- [ ] **Step 6: Create Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 7: Create .env.local.example**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
```

- [ ] **Step 8: Add test script to package.json**

Add to `scripts` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Verify setup**

```bash
npm run build
npm run test
```

Expected: Build succeeds (no pages yet is OK), test command runs with 0 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, Vitest"
```

---

## Task 2: Rules Engine — Types and Constants

**Files:**
- Create: `lib/rules-engine/types.ts`, `lib/rules-engine/constants.ts`

- [ ] **Step 1: Create rule engine types**

Create `lib/rules-engine/types.ts`:

```typescript
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
```

- [ ] **Step 2: Create law reference constants**

Create `lib/rules-engine/constants.ts`:

```typescript
import type { LawReference } from './types';

// === Traffic Accident Handling Regulations (道路交通事故處理辦法) ===

export const LAW_ACCIDENT_HANDLING: Record<string, LawReference> = {
  ART_2: {
    law: '道路交通事故處理辦法',
    article: '第2條',
    summary: '道路交通事故分類：A1（造成人員當場或24小時內死亡）、A2（造成人員受傷或超過24小時死亡）、A3（僅有財物損失）。',
  },
  ART_3: {
    law: '道路交通事故處理辦法',
    article: '第3條',
    summary: '事故發生後，駕駛人應立即在適當距離處放置警告標誌，事故現場排除後應即撤除。有受傷者應迅速救護，並儘速通知消防機關。',
  },
  ART_3_MOVE: {
    law: '道路交通事故處理辦法',
    article: '第3條',
    clause: '第1項第4款',
    summary: '不得任意移動肇事車輛及現場痕跡證據。但無人傷亡且車輛尚能行駛，或有人受傷且當事人均同意者，應先標繪車輛位置及現場相關跡證後，將車輛移置不妨礙交通之處所。',
  },
  ART_4: {
    law: '道路交通事故處理辦法',
    article: '第4條',
    summary: '前條第一項第四款之標繪，指以攝影或其他方式記錄現場狀況後移置。',
  },
  ART_10: {
    law: '道路交通事故處理辦法',
    article: '第10條',
    summary: '警察機關對道路交通事故現場，應就事故現場狀況繪製現場圖，並蒐集相關跡證。',
  },
  ART_13: {
    law: '道路交通事故處理辦法',
    article: '第13條',
    summary: '當事人或利害關係人得於事故發生7日後，向警察機關申請閱覽或提供現場圖及現場照片；於事故發生30日後，申請提供道路交通事故初步分析研判表。',
  },
};

// === Road Traffic Management and Penalty Act (道路交通管理處罰條例) ===

export const LAW_TRAFFIC_PENALTY: Record<string, LawReference> = {
  ART_62: {
    law: '道路交通管理處罰條例',
    article: '第62條',
    summary: '汽車駕駛人駕駛汽車肇事，無人受傷或死亡而未依規定處置者，處新臺幣一千元以上三千元以下罰鍰；逃逸者，並吊扣其駕駛執照一個月至三個月。致人傷亡而逃逸者處以更重罰則。',
  },
  ART_62_MOVE_PENALTY: {
    law: '道路交通管理處罰條例',
    article: '第62條',
    clause: '第2項',
    summary: '無人傷亡且車輛尚能行駛而不儘速將車輛位置標繪移置，致妨礙交通者，處六百元以上一千八百元以下罰鍰。',
  },
  ART_92: {
    law: '道路交通管理處罰條例',
    article: '第92條',
    summary: '授權主管機關訂定故障車輛警告標誌設置距離相關規定。',
  },
};

// === Appraisal and Review Regulations (車輛行車事故鑑定及覆議作業辦法) ===

export const LAW_APPRAISAL: Record<string, LawReference> = {
  ART_3: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第3條',
    summary: '鑑定案件之受理，距肇事日期逾六個月以上者，原則不予受理。但因特殊原因者不在此限。',
  },
  ART_10: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第10條',
    summary: '當事人對鑑定結果不服者，得於收受鑑定書之翌日起三十日內申請覆議，以一次為限。',
  },
};

// === Compulsory Automobile Liability Insurance Act (強制汽車責任保險法) ===

export const LAW_COMPULSORY_INSURANCE: Record<string, LawReference> = {
  ART_14: {
    law: '強制汽車責任保險法',
    article: '第14條',
    summary: '請求權人對保險人之保險給付請求權，自知有損害發生及保險人時起，二年間不行使而消滅；自汽車交通事故發生時起，逾十年者亦同。',
  },
};

// === Personal Data Protection Act (個人資料保護法) ===

export const LAW_PDPA: Record<string, LawReference> = {
  ART_6: {
    law: '個人資料保護法',
    article: '第6條',
    summary: '有關醫療、基因、性生活、健康檢查及犯罪前科之個人資料，不得蒐集、處理或利用。但法律明文規定、當事人書面同意等情形例外。',
  },
  ART_8: {
    law: '個人資料保護法',
    article: '第8條',
    summary: '蒐集個人資料時，應明確告知當事人蒐集之目的、個人資料之類別、利用之期間及方式等事項。',
  },
  ART_27: {
    law: '個人資料保護法',
    article: '第27條',
    summary: '非公務機關保有個人資料檔案者，應採行適當之安全措施，防止個人資料被竊取、竄改、毀損、滅失或洩漏。',
  },
};

// === Legal Disclaimer ===

export const LEGAL_DISCLAIMER = {
  text: '本系統依據公開法規提供資訊參考與流程導航，不構成法律意見。個案情況各異，涉及權益事項請諮詢律師或法律扶助基金會（電話：412-8518）。',
  legalAidPhone: '412-8518',
  legalAidUrl: 'https://www.laf.org.tw',
} as const;

// === Forbidden output types (hard block) ===

export const FORBIDDEN_OUTPUTS = [
  'liability_determination',
  'win_probability',
  'settlement_amount',
  'legal_strategy',
  'fault_percentage',
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add lib/rules-engine/types.ts lib/rules-engine/constants.ts
git commit -m "feat: add rules engine types and law reference constants"
```

---

## Task 3: Rules Engine — Warning Distance

**Files:**
- Create: `lib/rules-engine/__tests__/warning-distance.test.ts`, `lib/rules-engine/warning-distance.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rules-engine/__tests__/warning-distance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateWarningDistance } from '../warning-distance';

describe('calculateWarningDistance', () => {
  it('returns 100m for highway', () => {
    const result = calculateWarningDistance({
      roadType: 'highway',
      speedLimit: 110,
      weather: 'clear',
    });
    expect(result.decision).toBe('100');
    expect(result.riskLevel).toBe('high');
    expect(result.lawReferences.length).toBeGreaterThan(0);
    expect(result.escalateToHuman).toBe(false);
  });

  it('returns 80m for expressway', () => {
    const result = calculateWarningDistance({
      roadType: 'expressway',
      speedLimit: 80,
      weather: 'clear',
    });
    expect(result.decision).toBe('80');
  });

  it('returns 80m for general road with speed limit > 60', () => {
    const result = calculateWarningDistance({
      roadType: 'general',
      speedLimit: 70,
      weather: 'clear',
    });
    expect(result.decision).toBe('80');
  });

  it('returns 50m for speed limit 50-60', () => {
    const result = calculateWarningDistance({
      roadType: 'general',
      speedLimit: 50,
      weather: 'clear',
    });
    expect(result.decision).toBe('50');
  });

  it('returns 30m for speed limit <= 50 on alley', () => {
    const result = calculateWarningDistance({
      roadType: 'alley',
      speedLimit: 30,
      weather: 'clear',
    });
    expect(result.decision).toBe('30');
  });

  it('adds extra distance warning for rain', () => {
    const result = calculateWarningDistance({
      roadType: 'general',
      speedLimit: 50,
      weather: 'rain',
    });
    expect(result.decision).toBe('50');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('增加');
  });

  it('adds extra distance warning for fog', () => {
    const result = calculateWarningDistance({
      roadType: 'highway',
      speedLimit: 110,
      weather: 'fog',
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('adds extra distance warning for night', () => {
    const result = calculateWarningDistance({
      roadType: 'general',
      speedLimit: 60,
      weather: 'night',
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/rules-engine/__tests__/warning-distance.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement warning distance**

Create `lib/rules-engine/warning-distance.ts`:

```typescript
import type { WarningDistanceInput, RuleResult } from './types';
import { LAW_TRAFFIC_PENALTY, LAW_ACCIDENT_HANDLING } from './constants';

export function calculateWarningDistance(input: WarningDistanceInput): RuleResult {
  const { roadType, speedLimit, weather } = input;

  let distanceMeters: number;
  let explanation: string;

  if (roadType === 'highway') {
    distanceMeters = 100;
    explanation = '高速公路應在車後 100 公尺處放置警告標誌。';
  } else if (roadType === 'expressway' || speedLimit > 60) {
    distanceMeters = 80;
    explanation = `快速道路或速限超過60km/h之路段，應在車後 80 公尺處放置警告標誌。`;
  } else if (speedLimit >= 50) {
    distanceMeters = 50;
    explanation = `速限 ${speedLimit}km/h 之路段，應在車後 50 公尺處放置警告標誌。`;
  } else {
    distanceMeters = 30;
    explanation = `速限 ${speedLimit}km/h 以下之路段，應在車後 30 公尺處放置警告標誌。`;
  }

  const warnings: string[] = [];

  if (weather === 'rain') {
    warnings.push('雨天路面濕滑，建議增加警示距離，並開啟車輛警示燈。');
  } else if (weather === 'fog') {
    warnings.push('霧天能見度低，建議大幅增加警示距離，並開啟霧燈與警示燈。');
  } else if (weather === 'night') {
    warnings.push('夜間視線不良，建議增加警示距離，並使用反光警告標誌或開啟車燈照明。');
  }

  return {
    decision: String(distanceMeters),
    explanation,
    lawReferences: [LAW_TRAFFIC_PENALTY.ART_92, LAW_ACCIDENT_HANDLING.ART_3],
    riskLevel: roadType === 'highway' || roadType === 'expressway' ? 'high' : 'medium',
    nextSteps: [
      `在車後方 ${distanceMeters} 公尺處放置警告標誌（三角反光板）`,
      '開啟雙黃燈（危險警告燈）',
      '人員移至安全處所（護欄外或路邊）',
    ],
    warnings,
    escalateToHuman: false,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/rules-engine/__tests__/warning-distance.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rules-engine/warning-distance.ts lib/rules-engine/__tests__/warning-distance.test.ts
git commit -m "feat: implement warning distance calculator with tests"
```

---

## Task 4: Rules Engine — Triage

**Files:**
- Create: `lib/rules-engine/__tests__/triage.test.ts`, `lib/rules-engine/triage.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rules-engine/__tests__/triage.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { triageAccident } from '../triage';
import type { TriageInput } from '../types';

const baseInput: TriageInput = {
  hasDeaths: false,
  hasInjuries: false,
  vehicleCount: 2,
  hasFire: false,
  hasHazmat: false,
  suspectedDUI: false,
  suspectedHitAndRun: false,
  hasMinor: false,
  hasForeignNational: false,
};

describe('triageAccident', () => {
  it('classifies A3 for property-only accidents', () => {
    const result = triageAccident(baseInput);
    expect(result.severity).toBe('A3_property_only');
    expect(result.riskLevel).toBe('low');
    expect(result.escalateToHuman).toBe(false);
  });

  it('classifies A2 for injury accidents', () => {
    const result = triageAccident({ ...baseInput, hasInjuries: true });
    expect(result.severity).toBe('A2_injury');
    expect(result.riskLevel).toBe('high');
    expect(result.escalateToHuman).toBe(true);
  });

  it('classifies A1 for fatal accidents', () => {
    const result = triageAccident({ ...baseInput, hasDeaths: true });
    expect(result.severity).toBe('A1_fatal');
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.escalateReason).toBeDefined();
  });

  it('escalates for suspected DUI regardless of injuries', () => {
    const result = triageAccident({ ...baseInput, suspectedDUI: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('dui');
  });

  it('escalates for suspected hit-and-run', () => {
    const result = triageAccident({ ...baseInput, suspectedHitAndRun: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('hit_and_run');
  });

  it('escalates for hazmat', () => {
    const result = triageAccident({ ...baseInput, hasHazmat: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('hazmat');
  });

  it('escalates for fire', () => {
    const result = triageAccident({ ...baseInput, hasFire: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('fire');
  });

  it('flags minor involvement', () => {
    const result = triageAccident({ ...baseInput, hasMinor: true });
    expect(result.riskFlags).toContain('minor');
  });

  it('flags foreign national involvement', () => {
    const result = triageAccident({ ...baseInput, hasForeignNational: true });
    expect(result.riskFlags).toContain('foreign_national');
  });

  it('includes law references', () => {
    const result = triageAccident(baseInput);
    expect(result.lawReferences.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/rules-engine/__tests__/triage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement triage**

Create `lib/rules-engine/triage.ts`:

```typescript
import type { TriageInput, RuleResult, Severity } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_TRAFFIC_PENALTY } from './constants';

export interface TriageResult extends RuleResult {
  severity: Severity;
  riskFlags: string[];
}

export function triageAccident(input: TriageInput): TriageResult {
  const riskFlags: string[] = [];
  let severity: Severity;
  let riskLevel: RuleResult['riskLevel'];
  let escalateToHuman = false;
  let escalateReason: string | undefined;
  const warnings: string[] = [];
  const nextSteps: string[] = [];

  // Determine severity
  if (input.hasDeaths) {
    severity = 'A1_fatal';
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = 'A1事故（造成人員死亡），必須由專業人員處理。';
    riskFlags.push('fatal');
    warnings.push('請立即撥打 110 報警及 119 救護。');
    warnings.push('切勿移動任何車輛或現場跡證，除非為搶救傷者。');
    nextSteps.push('立即撥打 119 及 110');
    nextSteps.push('配合警方調查，保全現場');
    nextSteps.push('建議儘速諮詢律師');
  } else if (input.hasInjuries) {
    severity = 'A2_injury';
    riskLevel = 'high';
    escalateToHuman = true;
    escalateReason = 'A2事故（造成人員受傷），涉及刑事與民事責任，建議諮詢專業人員。';
    riskFlags.push('injury');
    warnings.push('傷者救護優先！不得以「談責任」延誤就醫。');
    nextSteps.push('確保傷者已獲救護（撥打 119）');
    nextSteps.push('撥打 110 報警');
    nextSteps.push('記錄就醫醫院與診斷資訊');
  } else {
    severity = 'A3_property_only';
    riskLevel = 'low';
    nextSteps.push('設置警告標誌並確保安全');
    nextSteps.push('進行蒐證拍照');
    nextSteps.push('與對方交換資訊');
  }

  // Critical risk flags — force escalation regardless of severity
  if (input.suspectedDUI) {
    riskFlags.push('dui');
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = escalateReason || '疑似酒駕/毒駕案件，必須由專業人員處理。';
    warnings.push('疑似酒駕/毒駕，請等待警方到場進行酒測。切勿離開現場。');
  }

  if (input.suspectedHitAndRun) {
    riskFlags.push('hit_and_run');
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = escalateReason || '疑似肇事逃逸案件，請立即報警。';
    warnings.push('請立即記錄對方車牌、車型、逃逸方向。尋找附近監視器。');
  }

  if (input.hasHazmat) {
    riskFlags.push('hazmat');
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = escalateReason || '涉及危險物品事故，請遠離現場並等待專業救援。';
    warnings.push('危險物品事故！請立即遠離現場，撥打 119 通報危險物品類型。');
  }

  if (input.hasFire) {
    riskFlags.push('fire');
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = escalateReason || '車輛起火，請立即遠離並撥打 119。';
    warnings.push('車輛起火！請立即遠離至少 50 公尺以上，撥打 119。');
  }

  // Additional flags (don't force escalation alone, but combine with severity)
  if (input.hasMinor) {
    riskFlags.push('minor');
    warnings.push('事故涉及未成年人，後續處理可能需要法定代理人參與。');
  }

  if (input.hasForeignNational) {
    riskFlags.push('foreign_national');
    warnings.push('事故涉及外籍人士，可能需要翻譯協助。');
  }

  // Multi-vehicle major accident
  if (input.vehicleCount >= 3) {
    riskFlags.push('multi_vehicle');
    if (riskLevel === 'low') riskLevel = 'medium';
    warnings.push('多車事故，現場保全與證據蒐集更為重要。');
  }

  const decision = escalateToHuman
    ? `${severity} 事故 — 高風險案件，建議諮詢專業人員`
    : `${severity} 事故 — 依流程處理`;

  const explanation = severity === 'A1_fatal'
    ? '本事故造成人員死亡，屬A1類事故。涉及刑事責任（過失致死），請立即報警並保全現場，建議儘速諮詢律師。'
    : severity === 'A2_injury'
    ? '本事故造成人員受傷，屬A2類事故。可能涉及刑事責任（過失傷害），救護優先，並應報警處理。'
    : '本事故僅造成財物損失，屬A3類事故。依規定進行現場處置後，可自行協商或報警處理。';

  return {
    severity,
    riskFlags,
    decision,
    explanation,
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_2, LAW_TRAFFIC_PENALTY.ART_62],
    riskLevel,
    nextSteps,
    warnings,
    escalateToHuman,
    escalateReason,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/rules-engine/__tests__/triage.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rules-engine/triage.ts lib/rules-engine/__tests__/triage.test.ts
git commit -m "feat: implement accident triage with severity classification and risk flags"
```

---

## Task 5: Rules Engine — Vehicle Move

**Files:**
- Create: `lib/rules-engine/__tests__/vehicle-move.test.ts`, `lib/rules-engine/vehicle-move.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rules-engine/__tests__/vehicle-move.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { determineVehicleMove } from '../vehicle-move';
import type { VehicleMoveInput } from '../types';

describe('determineVehicleMove', () => {
  it('must move when no injury and vehicle can drive', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_move');
    expect(result.warnings.some(w => w.includes('罰'))).toBe(true);
  });

  it('may move when injury but both agree', () => {
    const result = determineVehicleMove({
      hasInjuries: true,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.moveDecision).toBe('may_move');
  });

  it('must not move when injury and parties disagree', () => {
    const result = determineVehicleMove({
      hasInjuries: true,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: false,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_not_move');
  });

  it('must not move when there is a dispute', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: false,
      roadType: 'general',
      hasDispute: true,
    });
    expect(result.moveDecision).toBe('must_not_move');
  });

  it('wait for tow when vehicle cannot drive', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: false,
      vehicleCanDrive: false,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.moveDecision).toBe('wait_for_tow');
  });

  it('must not move for fatal accidents', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: true,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_not_move');
    expect(result.escalateToHuman).toBe(true);
  });

  it('always includes steps to mark and photograph before moving', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.nextSteps.some(s => s.includes('標繪') || s.includes('拍照'))).toBe(true);
  });

  it('includes law references', () => {
    const result = determineVehicleMove({
      hasInjuries: false,
      hasDeaths: false,
      vehicleCanDrive: true,
      bothPartiesAgreeToMove: true,
      roadType: 'general',
      hasDispute: false,
    });
    expect(result.lawReferences.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/rules-engine/__tests__/vehicle-move.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement vehicle move**

Create `lib/rules-engine/vehicle-move.ts`:

```typescript
import type { VehicleMoveInput, RuleResult, VehicleMoveDecision } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_TRAFFIC_PENALTY } from './constants';

export interface VehicleMoveResult extends RuleResult {
  moveDecision: VehicleMoveDecision;
}

export function determineVehicleMove(input: VehicleMoveInput): VehicleMoveResult {
  const { hasInjuries, hasDeaths, vehicleCanDrive, bothPartiesAgreeToMove, hasDispute } = input;

  let moveDecision: VehicleMoveDecision;
  let decision: string;
  let explanation: string;
  let riskLevel: RuleResult['riskLevel'] = 'medium';
  let escalateToHuman = false;
  let escalateReason: string | undefined;
  const warnings: string[] = [];
  const nextSteps: string[] = [];

  if (hasDeaths) {
    // Fatal: never move, wait for police forensics
    moveDecision = 'must_not_move';
    decision = '禁止移動車輛';
    explanation = '死亡事故，車輛與現場痕跡證據為偵查必要，嚴禁移動。';
    riskLevel = 'critical';
    escalateToHuman = true;
    escalateReason = 'A1死亡事故，現場為犯罪偵查證據。';
    warnings.push('嚴禁移動車輛與現場任何痕跡證據。');
    warnings.push('等待警方到場處理，配合現場封鎖。');
    nextSteps.push('保持現場原狀，等待警方到場');
    nextSteps.push('在安全位置等候，遠離車道');
  } else if (!vehicleCanDrive) {
    // Vehicle can't move
    moveDecision = 'wait_for_tow';
    decision = '車輛無法移動，等待拖吊';
    explanation = '車輛無法行駛，應設置警告標誌並等待拖吊。';
    warnings.push('設置警告標誌，避免二次事故。');
    nextSteps.push('在適當距離放置警告標誌');
    nextSteps.push('先拍照存證，記錄現場狀況');
    nextSteps.push('撥打拖吊或道路救援電話');
  } else if (hasDispute || (!hasInjuries && !bothPartiesAgreeToMove)) {
    // Dispute or no agreement in property-only case
    moveDecision = 'must_not_move';
    decision = '保全現場，等待警方';
    explanation = hasDispute
      ? '雙方有爭議，為保障權益，應保全現場等待警方到場處理。'
      : '雙方未達成移車共識，應保全現場等待警方處理。';
    warnings.push('保持現場原狀，但注意自身安全。');
    nextSteps.push('設置警告標誌，確保安全');
    nextSteps.push('先拍照記錄現場（不移動任何物品）');
    nextSteps.push('撥打 110 報警，等待警方到場');
  } else if (hasInjuries && bothPartiesAgreeToMove) {
    // Injury but both agree to move
    moveDecision = 'may_move';
    decision = '可先標繪拍照後移車';
    explanation = '有人受傷但雙方同意移置，依法可先以攝影或標繪記錄現場後移車。';
    riskLevel = 'high';
    warnings.push('務必先完成標繪/拍照再移車，否則日後難以舉證。');
    nextSteps.push('先拍攝現場全景、碰撞點、車輛位置（含標線）');
    nextSteps.push('以粉筆或其他方式標記車輛四角位置');
    nextSteps.push('確認照片清晰完整後，將車輛移至不妨礙交通處');
    nextSteps.push('傷者優先就醫');
  } else if (hasInjuries && !bothPartiesAgreeToMove) {
    // Injury and parties don't agree
    moveDecision = 'must_not_move';
    decision = '不可移車，等待警方';
    explanation = '有人受傷且未經所有當事人同意，不得移動車輛。應保全現場等待警方。';
    riskLevel = 'high';
    warnings.push('未經所有當事人同意，移動車輛可能影響後續鑑定。');
    nextSteps.push('確保傷者已獲救護');
    nextSteps.push('設置警告標誌');
    nextSteps.push('撥打 110 報警，等待警方到場');
  } else {
    // No injury, vehicle can drive, no dispute → MUST move (penalty if not)
    moveDecision = 'must_move';
    decision = '應先標繪拍照後儘速移車';
    explanation = '無人傷亡且車輛尚能行駛，依法應先標繪/攝影後將車輛移置不妨礙交通處。未移車致妨礙交通者，可處罰鍰。';
    riskLevel = 'low';
    warnings.push('不儘速標繪移置致妨礙交通者，可處新臺幣 600 至 1,800 元罰鍰。');
    nextSteps.push('先拍攝現場全景、碰撞點、車輛位置（含標線）');
    nextSteps.push('以粉筆或其他方式標記車輛四角位置');
    nextSteps.push('確認照片清晰完整後，將車輛移至不妨礙交通處');
    nextSteps.push('移車後繼續與對方交換資訊');
  }

  return {
    moveDecision,
    decision,
    explanation,
    lawReferences: [
      LAW_ACCIDENT_HANDLING.ART_3_MOVE,
      LAW_ACCIDENT_HANDLING.ART_4,
      LAW_TRAFFIC_PENALTY.ART_62_MOVE_PENALTY,
    ],
    riskLevel,
    nextSteps,
    warnings,
    escalateToHuman,
    escalateReason,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/rules-engine/__tests__/vehicle-move.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rules-engine/vehicle-move.ts lib/rules-engine/__tests__/vehicle-move.test.ts
git commit -m "feat: implement vehicle move decision engine with tests"
```

---

## Task 6: Rules Engine — Evidence Checklist

**Files:**
- Create: `lib/rules-engine/__tests__/evidence-checklist.test.ts`, `lib/rules-engine/evidence-checklist.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rules-engine/__tests__/evidence-checklist.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateEvidenceChecklist } from '../evidence-checklist';
import type { EvidenceChecklistInput } from '../types';

const baseInput: EvidenceChecklistInput = {
  roadType: 'general',
  vehicleTypes: ['car', 'car'],
  hasTrafficSignal: true,
  hasSurveillance: false,
  hasDashcam: true,
  hasSkidMarks: false,
  weather: 'clear',
  isNight: false,
  hasInjuries: false,
};

describe('generateEvidenceChecklist', () => {
  it('includes base checklist items for all accidents', () => {
    const result = generateEvidenceChecklist(baseInput);
    const categories = result.items.map(i => i.category);
    expect(categories).toContain('scene_overview');
    expect(categories).toContain('collision_point');
    expect(categories).toContain('plate');
    expect(categories).toContain('vehicle_damage');
  });

  it('includes signal item when traffic signal present', () => {
    const result = generateEvidenceChecklist(baseInput);
    expect(result.items.some(i => i.category === 'signal')).toBe(true);
  });

  it('excludes signal item when no traffic signal', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasTrafficSignal: false });
    expect(result.items.some(i => i.category === 'signal')).toBe(false);
  });

  it('includes surveillance item when surveillance present', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasSurveillance: true });
    expect(result.items.some(i => i.category === 'surveillance')).toBe(true);
  });

  it('includes skid marks when present', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasSkidMarks: true });
    expect(result.items.some(i => i.category === 'skid_marks')).toBe(true);
  });

  it('includes injury photos when injuries exist', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasInjuries: true });
    expect(result.items.some(i => i.category === 'injury')).toBe(true);
  });

  it('adds dashcam reminder when dashcam present', () => {
    const result = generateEvidenceChecklist(baseInput);
    expect(result.warnings.some(w => w.includes('行車記錄器'))).toBe(true);
  });

  it('items are sorted by priority', () => {
    const result = generateEvidenceChecklist({
      ...baseInput,
      hasSkidMarks: true,
      hasSurveillance: true,
      hasInjuries: true,
    });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].priority).toBeGreaterThanOrEqual(result.items[i - 1].priority);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/rules-engine/__tests__/evidence-checklist.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement evidence checklist**

Create `lib/rules-engine/evidence-checklist.ts`:

```typescript
import type { EvidenceChecklistInput, EvidenceItem, RuleResult } from './types';
import { LAW_ACCIDENT_HANDLING } from './constants';

export interface EvidenceChecklistResult extends RuleResult {
  items: EvidenceItem[];
}

export function generateEvidenceChecklist(input: EvidenceChecklistInput): EvidenceChecklistResult {
  const items: EvidenceItem[] = [];
  const warnings: string[] = [];

  // Base checklist (all accidents)
  items.push({
    category: 'scene_overview',
    description: '全景照：包含道路標線、路口環境、車道配置',
    priority: 1,
    tips: '站在事故點前後各拍一張，盡量涵蓋標線、號誌、路名牌。',
    required: true,
  });

  items.push({
    category: 'collision_point',
    description: '碰撞點特寫：車輛接觸部位、地面刮痕',
    priority: 2,
    tips: '近距離拍攝碰撞痕跡，若有地面刮痕也一併記錄。',
    required: true,
  });

  items.push({
    category: 'debris',
    description: '掉落物/碎片：散落零件、玻璃碎片位置',
    priority: 3,
    tips: '碎片散落位置可協助判斷碰撞力道與方向。',
    required: true,
  });

  items.push({
    category: 'plate',
    description: '雙方車牌：清晰拍攝所有當事車輛車牌',
    priority: 4,
    tips: '確保車牌號碼清晰可辨識。',
    required: true,
  });

  items.push({
    category: 'vehicle_damage',
    description: '車損部位：各車輛受損部位特寫',
    priority: 5,
    tips: '從多角度拍攝受損部位，包含凹陷、擦痕、破損。',
    required: true,
  });

  // Conditional items
  if (input.hasTrafficSignal) {
    items.push({
      category: 'signal',
      description: '路口號誌：號誌燈號狀態（含秒數倒數）',
      priority: 6,
      tips: '若有倒數秒數，拍攝時盡量拍到秒數。可錄影記錄號誌變化。',
      required: false,
    });
  }

  if (input.hasSurveillance) {
    items.push({
      category: 'surveillance',
      description: '監視器位置：記錄附近監視器的位置與方向',
      priority: 7,
      tips: '拍攝監視器外觀與安裝位置，後續可協助警方調閱。',
      required: false,
    });
  }

  if (input.hasSkidMarks) {
    items.push({
      category: 'skid_marks',
      description: '煞車痕：煞車痕長度、方向、起訖點',
      priority: 8,
      tips: '用步伐或隨身物品（如手機）做比例參考，拍攝煞車痕全貌。',
      required: false,
    });
  }

  if (input.hasInjuries) {
    items.push({
      category: 'injury',
      description: '傷勢照片：傷者傷勢外觀記錄（需當事人同意）',
      priority: 9,
      tips: '拍攝傷勢前請先取得傷者同意。此為敏感個人資料，僅供事故處理使用。',
      required: false,
    });
  }

  // Weather/condition-specific warnings
  if (input.weather === 'rain') {
    warnings.push('雨天請注意：拍攝路面積水狀況，可作為路面濕滑的佐證。');
  }

  if (input.isNight) {
    warnings.push('夜間拍攝請注意：記錄路燈照明狀況，開啟閃光燈確保照片清晰。');
  }

  if (input.hasDashcam) {
    warnings.push('您有行車記錄器：請勿關閉電源，儘速將影片檔備份至手機或雲端，避免被覆蓋。');
  }

  // General reminder
  warnings.push('所有照片請保留原始檔案（含 EXIF 時間與 GPS 資訊），勿經修圖或裁剪。');

  // Sort by priority
  items.sort((a, b) => a.priority - b.priority);

  return {
    items,
    decision: `共 ${items.length} 項蒐證項目`,
    explanation: '依據事故類型與現場條件產生的蒐證清單，請依序拍攝記錄。',
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3, LAW_ACCIDENT_HANDLING.ART_10],
    riskLevel: 'low',
    nextSteps: items.map(i => i.description),
    warnings,
    escalateToHuman: false,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/rules-engine/__tests__/evidence-checklist.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rules-engine/evidence-checklist.ts lib/rules-engine/__tests__/evidence-checklist.test.ts
git commit -m "feat: implement evidence checklist generator with tests"
```

---

## Task 7: Rules Engine — Deadlines

**Files:**
- Create: `lib/rules-engine/__tests__/deadlines.test.ts`, `lib/rules-engine/deadlines.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rules-engine/__tests__/deadlines.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDeadlines } from '../deadlines';
import type { DeadlinesInput } from '../types';

describe('calculateDeadlines', () => {
  beforeEach(() => {
    // Fix "now" to 2026-04-09
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-09T10:00:00+08:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates 7-day scene diagram deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only',
      policeArrived: true,
    });
    const sevenDay = result.reminders.find(r => r.type === 'scene_diagram_7d');
    expect(sevenDay).toBeDefined();
    expect(sevenDay!.daysRemaining).toBe(7);
  });

  it('calculates 30-day analysis report deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only',
      policeArrived: true,
    });
    const thirtyDay = result.reminders.find(r => r.type === 'analysis_report_30d');
    expect(thirtyDay).toBeDefined();
    expect(thirtyDay!.daysRemaining).toBe(30);
  });

  it('calculates 6-month appraisal deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
    });
    const sixMonth = result.reminders.find(r => r.type === 'appraisal_6m');
    expect(sixMonth).toBeDefined();
  });

  it('calculates review deadline when appraisal received', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-01-01T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
      appraisalReceivedDate: new Date('2026-04-01T08:00:00+08:00'),
    });
    const review = result.reminders.find(r => r.type === 'review_30d');
    expect(review).toBeDefined();
    expect(review!.daysRemaining).toBeLessThanOrEqual(30);
  });

  it('does not include review deadline when no appraisal received', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
    });
    const review = result.reminders.find(r => r.type === 'review_30d');
    expect(review).toBeUndefined();
  });

  it('calculates 2-year insurance prescription', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
      knowledgeOfDamageDate: new Date('2026-04-09T08:00:00+08:00'),
    });
    const twoYear = result.reminders.find(r => r.type === 'compulsory_insurance_2y');
    expect(twoYear).toBeDefined();
  });

  it('calculates 10-year absolute insurance prescription', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
    });
    const tenYear = result.reminders.find(r => r.type === 'compulsory_insurance_10y');
    expect(tenYear).toBeDefined();
  });

  it('marks overdue reminders correctly', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2025-01-01T08:00:00+08:00'),
      severity: 'A2_injury',
      policeArrived: true,
    });
    const sevenDay = result.reminders.find(r => r.type === 'scene_diagram_7d');
    expect(sevenDay!.urgency).toBe('overdue');
    expect(sevenDay!.daysRemaining).toBeLessThan(0);
  });

  it('skips 7d and 30d reminders when police did not arrive', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only',
      policeArrived: false,
    });
    expect(result.reminders.find(r => r.type === 'scene_diagram_7d')).toBeUndefined();
    expect(result.reminders.find(r => r.type === 'analysis_report_30d')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/rules-engine/__tests__/deadlines.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement deadlines**

Create `lib/rules-engine/deadlines.ts`:

```typescript
import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import type { DeadlinesInput, Reminder, RuleResult, ReminderType } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_APPRAISAL, LAW_COMPULSORY_INSURANCE } from './constants';

export interface DeadlinesResult extends RuleResult {
  reminders: Reminder[];
}

function makeReminder(
  type: ReminderType,
  dueDate: Date,
  now: Date,
  description: string,
  lawRef: typeof LAW_ACCIDENT_HANDLING[keyof typeof LAW_ACCIDENT_HANDLING],
): Reminder {
  const daysRemaining = differenceInDays(dueDate, now);
  let urgency: Reminder['urgency'];
  if (daysRemaining < 0) urgency = 'overdue';
  else if (daysRemaining <= 3) urgency = 'urgent';
  else if (daysRemaining <= 14) urgency = 'upcoming';
  else urgency = 'normal';

  return {
    type,
    dueDate,
    daysRemaining,
    urgency,
    description,
    lawReference: lawRef,
  };
}

export function calculateDeadlines(input: DeadlinesInput): DeadlinesResult {
  const { accidentDate, severity, policeArrived, appraisalReceivedDate, knowledgeOfDamageDate } = input;
  const now = new Date();
  const reminders: Reminder[] = [];

  // 7-day: scene diagram and photos (only if police arrived and made a report)
  if (policeArrived) {
    reminders.push(makeReminder(
      'scene_diagram_7d',
      addDays(accidentDate, 7),
      now,
      '可向警察機關申請閱覽或提供現場圖及現場照片',
      LAW_ACCIDENT_HANDLING.ART_13,
    ));

    // 30-day: preliminary analysis report
    reminders.push(makeReminder(
      'analysis_report_30d',
      addDays(accidentDate, 30),
      now,
      '可向警察機關申請提供道路交通事故初步分析研判表',
      LAW_ACCIDENT_HANDLING.ART_13,
    ));
  }

  // 6-month: appraisal application deadline (mainly relevant for A1/A2, but A3 can also apply)
  reminders.push(makeReminder(
    'appraisal_6m',
    addMonths(accidentDate, 6),
    now,
    '車輛行車事故鑑定申請截止（距肇事日逾六個月原則不受理）',
    LAW_APPRAISAL.ART_3,
  ));

  // 30-day review: only if appraisal was received
  if (appraisalReceivedDate) {
    reminders.push(makeReminder(
      'review_30d',
      addDays(appraisalReceivedDate, 30),
      now,
      '鑑定覆議申請截止（收受鑑定書翌日起30日內，以一次為限）',
      LAW_APPRAISAL.ART_10,
    ));
  }

  // Insurance prescriptions (mainly for A1/A2 with injuries)
  if (severity === 'A1_fatal' || severity === 'A2_injury') {
    if (knowledgeOfDamageDate) {
      reminders.push(makeReminder(
        'compulsory_insurance_2y',
        addYears(knowledgeOfDamageDate, 2),
        now,
        '強制汽車責任保險給付請求權時效（自知有損害及保險人起2年）',
        LAW_COMPULSORY_INSURANCE.ART_14,
      ));
    }

    reminders.push(makeReminder(
      'compulsory_insurance_10y',
      addYears(accidentDate, 10),
      now,
      '強制汽車責任保險給付請求權絕對時效（自事故起10年）',
      LAW_COMPULSORY_INSURANCE.ART_14,
    ));
  }

  // Find most urgent
  const urgentReminders = reminders.filter(r => r.urgency === 'urgent' || r.urgency === 'overdue');

  return {
    reminders,
    decision: urgentReminders.length > 0
      ? `有 ${urgentReminders.length} 項緊急/逾期待辦`
      : `共 ${reminders.length} 項時程提醒`,
    explanation: '依據事故日期與案件進度，自動計算所有法定期限與建議申請時點。',
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_13, LAW_APPRAISAL.ART_3, LAW_APPRAISAL.ART_10],
    riskLevel: urgentReminders.length > 0 ? 'high' : 'low',
    nextSteps: reminders
      .filter(r => r.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3)
      .map(r => `${r.description}（剩餘 ${r.daysRemaining} 天）`),
    warnings: urgentReminders.map(r =>
      r.urgency === 'overdue'
        ? `已逾期：${r.description}`
        : `即將到期（${r.daysRemaining} 天）：${r.description}`
    ),
    escalateToHuman: false,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/rules-engine/__tests__/deadlines.test.ts
```

Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rules-engine/deadlines.ts lib/rules-engine/__tests__/deadlines.test.ts
git commit -m "feat: implement deadline calculator for all statutory time limits"
```

---

## Task 8: Run All Rules Engine Tests

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (warning-distance: 8, triage: 10, vehicle-move: 8, evidence-checklist: 8, deadlines: 9 = 43 total).

- [ ] **Step 2: Commit if any fixes were needed**

If any test failed and was fixed:
```bash
git add -A
git commit -m "fix: resolve test failures in rules engine"
```

---

## Task 9: Supabase Setup and Database Migration

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `supabase/migrations/001_initial_schema.sql`, `prisma/schema.prisma`, `middleware.ts`

- [ ] **Step 1: Create Supabase browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Create Supabase server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Create Supabase middleware**

Create `lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

- [ ] **Step 4: Create Next.js middleware**

Create `middleware.ts` (project root):

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Create SQL migration**

Create `supabase/migrations/001_initial_schema.sql` with the full SQL from the design spec (Cases, Evidence, Reminders, Documents, Audit Logs tables with indexes and RLS policies). Copy the SQL from the "Database Schema" section of `docs/superpowers/specs/2026-04-09-accident-expert-system-design.md`.

- [ ] **Step 6: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Case {
  id                String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String     @map("user_id") @db.Uuid
  status            String     @default("on_scene")
  severity          String     @default("A3_property_only")
  riskFlags         Json       @default("{}") @map("risk_flags")
  accidentDate      DateTime   @map("accident_date") @db.Timestamptz()
  locationText      String?    @map("location_text")
  locationLat       Float?     @map("location_lat")
  locationLng       Float?     @map("location_lng")
  roadType          String?    @map("road_type")
  speedLimit        Int?       @map("speed_limit")
  weather           String?
  parties           Json       @default("[]")
  witnesses         Json       @default("[]")
  triageResult      Json?      @map("triage_result")
  canMoveVehicle    Boolean?   @map("can_move_vehicle")
  moveVehicleReason String?    @map("move_vehicle_reason")
  policeArrived     Boolean    @default(false) @map("police_arrived")
  policeReportNo    String?    @map("police_report_no")
  createdAt         DateTime   @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime   @default(now()) @updatedAt @map("updated_at") @db.Timestamptz()

  evidence   Evidence[]
  reminders  Reminder[]
  documents  Document[]
  auditLogs  AuditLog[]

  @@index([userId])
  @@index([status])
  @@map("cases")
}

model Evidence {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId           String   @map("case_id") @db.Uuid
  type             String
  category         String?
  filePath         String   @map("file_path")
  fileHash         String   @map("file_hash")
  originalFilename String?  @map("original_filename")
  fileSize         BigInt?  @map("file_size")
  mimeType         String?  @map("mime_type")
  metadata         Json     @default("{}")
  notes            String?
  version          Int      @default(1)
  uploadedAt       DateTime @default(now()) @map("uploaded_at") @db.Timestamptz()
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz()

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@map("evidence")
}

model Reminder {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId      String    @map("case_id") @db.Uuid
  type        String
  dueDate     DateTime  @map("due_date") @db.Timestamptz()
  status      String    @default("pending")
  lawReference String?  @map("law_reference")
  description String?
  notifiedAt  DateTime? @map("notified_at") @db.Timestamptz()
  completedAt DateTime? @map("completed_at") @db.Timestamptz()
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz()

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@index([dueDate])
  @@map("reminders")
}

model Document {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId      String   @map("case_id") @db.Uuid
  type        String
  content     Json
  filePath    String?  @map("file_path")
  version     Int      @default(1)
  generatedAt DateTime @default(now()) @map("generated_at") @db.Timestamptz()

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@map("documents")
}

model AuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String?  @map("user_id") @db.Uuid
  caseId    String?  @map("case_id") @db.Uuid
  action    String
  detail    Json     @default("{}")
  ipAddress String?  @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  case Case? @relation(fields: [caseId], references: [id])

  @@index([caseId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/ middleware.ts supabase/ prisma/
git commit -m "feat: add Supabase client setup, middleware, DB migration, and Prisma schema"
```

---

## Task 10: Shared UI Components

**Files:**
- Create: `components/shared/disclaimer-footer.tsx`, `components/shared/law-reference-badge.tsx`, `components/shared/risk-badge.tsx`, `components/shared/countdown-badge.tsx`, `components/shared/step-wizard.tsx`, `lib/utils/disclaimer.ts`

- [ ] **Step 1: Create disclaimer utility**

Create `lib/utils/disclaimer.ts`:

```typescript
import { LEGAL_DISCLAIMER } from '@/lib/rules-engine/constants';

export const disclaimer = LEGAL_DISCLAIMER;
```

- [ ] **Step 2: Create disclaimer footer**

Create `components/shared/disclaimer-footer.tsx`:

```typescript
import { LEGAL_DISCLAIMER } from '@/lib/rules-engine/constants';

export function DisclaimerFooter() {
  return (
    <div className="border-t bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
      <p>{LEGAL_DISCLAIMER.text}</p>
      <p className="mt-1">
        法律扶助基金會：
        <a
          href={`tel:${LEGAL_DISCLAIMER.legalAidPhone}`}
          className="underline font-medium"
        >
          {LEGAL_DISCLAIMER.legalAidPhone}
        </a>
        {' | '}
        <a
          href={LEGAL_DISCLAIMER.legalAidUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          官方網站
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create law reference badge**

Create `components/shared/law-reference-badge.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LawReference } from '@/lib/rules-engine/types';

interface LawReferenceBadgeProps {
  reference: LawReference;
}

export function LawReferenceBadge({ reference }: LawReferenceBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="inline-block">
      <Badge
        variant="outline"
        className="cursor-pointer text-xs hover:bg-accent"
        onClick={() => setExpanded(!expanded)}
      >
        {reference.law} {reference.article}
        {reference.clause ? ` ${reference.clause}` : ''}
      </Badge>
      {expanded && (
        <span className="block mt-1 text-xs text-muted-foreground bg-muted rounded p-2">
          {reference.summary}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Create risk badge**

Create `components/shared/risk-badge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import type { Severity } from '@/lib/rules-engine/types';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  A1_fatal: { label: 'A1 死亡', className: 'bg-red-600 text-white hover:bg-red-700' },
  A2_injury: { label: 'A2 受傷', className: 'bg-yellow-500 text-black hover:bg-yellow-600' },
  A3_property_only: { label: 'A3 財損', className: 'bg-green-600 text-white hover:bg-green-700' },
};

const riskConfig: Record<string, { label: string; className: string }> = {
  low: { label: '低風險', className: 'bg-green-100 text-green-800' },
  medium: { label: '中風險', className: 'bg-yellow-100 text-yellow-800' },
  high: { label: '高風險', className: 'bg-orange-100 text-orange-800' },
  critical: { label: '極高風險', className: 'bg-red-100 text-red-800' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return <Badge className={config.className}>{config.label}</Badge>;
}

export function RiskBadge({ level }: { level: string }) {
  const config = riskConfig[level] || riskConfig.low;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}
```

- [ ] **Step 5: Create countdown badge**

Create `components/shared/countdown-badge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';

interface CountdownBadgeProps {
  daysRemaining: number;
  label?: string;
}

export function CountdownBadge({ daysRemaining, label }: CountdownBadgeProps) {
  let className: string;
  let text: string;

  if (daysRemaining < 0) {
    className = 'bg-red-600 text-white';
    text = `已逾期 ${Math.abs(daysRemaining)} 天`;
  } else if (daysRemaining === 0) {
    className = 'bg-red-500 text-white';
    text = '今天到期';
  } else if (daysRemaining <= 3) {
    className = 'bg-red-100 text-red-800';
    text = `剩餘 ${daysRemaining} 天`;
  } else if (daysRemaining <= 14) {
    className = 'bg-yellow-100 text-yellow-800';
    text = `剩餘 ${daysRemaining} 天`;
  } else {
    className = 'bg-muted text-muted-foreground';
    text = `剩餘 ${daysRemaining} 天`;
  }

  return (
    <Badge variant="outline" className={className}>
      {label ? `${label}：${text}` : text}
    </Badge>
  );
}
```

- [ ] **Step 6: Create step wizard**

Create `components/shared/step-wizard.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepWizard({
  currentStep,
  totalSteps,
  stepTitle,
  children,
  onNext,
  onBack,
  nextLabel = '下一步',
  nextDisabled = false,
  showBack = true,
}: StepWizardProps) {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>步驟 {currentStep}/{totalSteps}</span>
          <span>{stepTitle}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {children}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background border-t px-4 py-3 flex gap-3">
        {showBack && currentStep > 1 && onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            上一步
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 h-12 text-lg font-semibold"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/shared/ lib/utils/disclaimer.ts
git commit -m "feat: add shared UI components (disclaimer, law badge, risk badge, countdown, wizard)"
```

---

## Task 11: Landing Page

**Files:**
- Create: `app/(public)/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `app/layout.tsx` content:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '台灣車禍事故處理專家 — 安全處置、證據蒐集、程序導航',
  description: '依據台灣交通法規，提供事故現場安全處置、可移車判斷、蒐證清單、資料申請時效提醒、文件生成等全流程導航。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create landing page**

Create `app/(public)/page.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-bold">台灣車禍事故處理專家</h1>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">
            車禍發生，不要慌
          </h2>
          <p className="text-muted-foreground">
            依據台灣交通法規，一步步引導你完成安全處置、蒐證、申請資料、準備文件。
          </p>
        </div>

        {/* Primary CTA */}
        <Link href="/scene" className="w-full max-w-md">
          <Button
            size="lg"
            className="w-full h-16 text-xl font-bold bg-red-600 hover:bg-red-700"
          >
            我剛發生事故
          </Button>
        </Link>

        {/* Secondary CTA */}
        <Link href="/dashboard" className="w-full max-w-md">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-base"
          >
            管理我的案件
          </Button>
        </Link>

        {/* Feature cards */}
        <div className="grid gap-3 w-full max-w-md mt-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">安全處置指引</h3>
              <p className="text-sm text-muted-foreground">
                警示距離、可移車判斷、救護通報 — 每一步都有法規依據。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">時效提醒不漏步</h3>
              <p className="text-sm text-muted-foreground">
                7日現場圖、30日研判表、6個月鑑定、2年保險時效 — 自動幫你算好。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">文件一鍵生成</h3>
              <p className="text-sm text-muted-foreground">
                報案摘要、證據清單、事故時間線 — 結構化文件可下載。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <DisclaimerFooter />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx "app/(public)/page.tsx"
git commit -m "feat: add landing page with CTAs and feature cards"
```

---

## Task 12: On-Scene Wizard — State Machine and Steps 1-3

**Files:**
- Create: `app/(public)/scene/page.tsx`, `app/(public)/scene/_components/scene-wizard.tsx`, `app/(public)/scene/_components/step-safety.tsx`, `app/(public)/scene/_components/step-injury.tsx`, `app/(public)/scene/_components/step-vehicle-move.tsx`

- [ ] **Step 1: Create scene page**

Create `app/(public)/scene/page.tsx`:

```typescript
import { SceneWizard } from './_components/scene-wizard';

export default function ScenePage() {
  return <SceneWizard />;
}
```

- [ ] **Step 2: Create scene wizard state machine**

Create `app/(public)/scene/_components/scene-wizard.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { RoadType, Weather, VehicleType } from '@/lib/rules-engine/types';
import { StepSafety } from './step-safety';
import { StepInjury } from './step-injury';
import { StepVehicleMove } from './step-vehicle-move';

export interface SceneData {
  // Step 1: Safety
  roadType?: RoadType;
  speedLimit?: number;
  weather?: Weather;
  // Step 2: Injury
  hasDeaths: boolean;
  hasInjuries: boolean;
  hasFire: boolean;
  hasHazmat: boolean;
  suspectedDUI: boolean;
  suspectedHitAndRun: boolean;
  // Step 3: Vehicle move
  vehicleCanDrive: boolean;
  bothPartiesAgreeToMove: boolean;
  hasDispute: boolean;
  // Step 4: Evidence
  vehicleTypes: VehicleType[];
  hasTrafficSignal: boolean;
  hasSurveillance: boolean;
  hasDashcam: boolean;
  hasSkidMarks: boolean;
  // Step 5: Info exchange
  otherPartyName?: string;
  otherPartyPlate?: string;
  otherPartyPhone?: string;
  otherPartyInsurance?: string;
  witnessName?: string;
  witnessPhone?: string;
}

const initialData: SceneData = {
  hasDeaths: false,
  hasInjuries: false,
  hasFire: false,
  hasHazmat: false,
  suspectedDUI: false,
  suspectedHitAndRun: false,
  vehicleCanDrive: true,
  bothPartiesAgreeToMove: true,
  hasDispute: false,
  vehicleTypes: ['car', 'car'],
  hasTrafficSignal: false,
  hasSurveillance: false,
  hasDashcam: false,
  hasSkidMarks: false,
};

export function SceneWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SceneData>(initialData);

  const updateData = useCallback((updates: Partial<SceneData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const next = useCallback(() => setStep(s => Math.min(s + 1, 6)), []);
  const back = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  switch (step) {
    case 1:
      return <StepSafety data={data} updateData={updateData} onNext={next} />;
    case 2:
      return <StepInjury data={data} updateData={updateData} onNext={next} onBack={back} />;
    case 3:
      return <StepVehicleMove data={data} updateData={updateData} onNext={next} onBack={back} />;
    default:
      // Steps 4-6 will be added in the next task
      return (
        <div className="p-8 text-center">
          <p className="text-lg">步驟 {step} 開發中...</p>
          <button onClick={back} className="mt-4 underline">返回上一步</button>
        </div>
      );
  }
}
```

- [ ] **Step 3: Create Step 1 — Safety**

Create `app/(public)/scene/_components/step-safety.tsx`:

```typescript
'use client';

import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateWarningDistance } from '@/lib/rules-engine/warning-distance';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SceneData } from './scene-wizard';
import type { RoadType, Weather } from '@/lib/rules-engine/types';

interface Props {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
}

const roadTypeOptions: { value: RoadType; label: string }[] = [
  { value: 'highway', label: '高速公路' },
  { value: 'expressway', label: '快速道路' },
  { value: 'general', label: '一般道路' },
  { value: 'alley', label: '巷道/慢車道' },
];

const speedLimitOptions = [110, 100, 90, 80, 70, 60, 50, 40, 30, 20];

const weatherOptions: { value: Weather; label: string }[] = [
  { value: 'clear', label: '晴天/良好' },
  { value: 'rain', label: '雨天' },
  { value: 'fog', label: '霧天/能見度不良' },
  { value: 'night', label: '夜間' },
];

export function StepSafety({ data, updateData, onNext }: Props) {
  const roadType = data.roadType || 'general';
  const speedLimit = data.speedLimit || 50;
  const weather = data.weather || 'clear';

  const distanceResult = calculateWarningDistance({ roadType, speedLimit, weather });

  return (
    <StepWizard
      currentStep={1}
      totalSteps={6}
      stepTitle="安全第一"
      onNext={() => {
        updateData({ roadType, speedLimit, weather });
        onNext();
      }}
      showBack={false}
      nextLabel="已確保安全，下一步"
    >
      <div className="space-y-6">
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-base font-semibold text-red-800">
            先確保安全！請立即執行以下動作：
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-semibold">開啟雙黃燈（危險警告燈）</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <span className="text-2xl">🚶</span>
            <div>
              <p className="font-semibold">人員遠離車道，移至安全處所</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">在車後方放置警告標誌</p>
            </div>
          </div>
        </div>

        {/* Warning distance calculator */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">計算你的警示距離</h3>

            <div className="space-y-3">
              <div>
                <Label>道路類型</Label>
                <Select value={roadType} onValueChange={(v) => updateData({ roadType: v as RoadType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roadTypeOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>速限 (km/h)</Label>
                <Select value={String(speedLimit)} onValueChange={(v) => updateData({ speedLimit: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {speedLimitOptions.map(s => (
                      <SelectItem key={s} value={String(s)}>{s} km/h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>天氣/能見度</Label>
                <Select value={weather} onValueChange={(v) => updateData({ weather: v as Weather })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {weatherOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-lg font-bold text-center">
                請在車後方 {distanceResult.decision} 公尺處放置警告標誌
              </AlertDescription>
            </Alert>

            {distanceResult.warnings.map((w, i) => (
              <p key={i} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                ⚠️ {w}
              </p>
            ))}

            <div className="flex flex-wrap gap-1">
              {distanceResult.lawReferences.map((ref, i) => (
                <LawReferenceBadge key={i} reference={ref} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StepWizard>
  );
}
```

- [ ] **Step 4: Create Step 2 — Injury Triage**

Create `app/(public)/scene/_components/step-injury.tsx`:

```typescript
'use client';

import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { triageAccident } from '@/lib/rules-engine/triage';
import type { SceneData } from './scene-wizard';

interface Props {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInjury({ data, updateData, onNext, onBack }: Props) {
  const handleSelect = (type: 'fatal' | 'injury' | 'none') => {
    updateData({
      hasDeaths: type === 'fatal',
      hasInjuries: type === 'injury',
    });
  };

  const selected = data.hasDeaths ? 'fatal' : data.hasInjuries ? 'injury' : 'none';

  const triageResult = triageAccident({
    hasDeaths: data.hasDeaths,
    hasInjuries: data.hasInjuries,
    vehicleCount: 2,
    hasFire: data.hasFire,
    hasHazmat: data.hasHazmat,
    suspectedDUI: data.suspectedDUI,
    suspectedHitAndRun: data.suspectedHitAndRun,
    hasMinor: false,
    hasForeignNational: false,
  });

  return (
    <StepWizard
      currentStep={2}
      totalSteps={6}
      stepTitle="傷亡確認"
      onNext={onNext}
      onBack={onBack}
      nextLabel={selected === 'fatal' ? '已撥打 119/110，下一步' : '下一步'}
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold">有人受傷嗎？</h2>

        <div className="space-y-3">
          <Button
            variant={selected === 'fatal' ? 'default' : 'outline'}
            className={`w-full h-16 text-lg justify-start ${selected === 'fatal' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={() => handleSelect('fatal')}
          >
            <span className="text-2xl mr-3">🔴</span>
            有人死亡或重傷
          </Button>

          <Button
            variant={selected === 'injury' ? 'default' : 'outline'}
            className={`w-full h-16 text-lg justify-start ${selected === 'injury' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
            onClick={() => handleSelect('injury')}
          >
            <span className="text-2xl mr-3">🟡</span>
            有人輕傷
          </Button>

          <Button
            variant={selected === 'none' ? 'default' : 'outline'}
            className={`w-full h-16 text-lg justify-start ${selected === 'none' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={() => handleSelect('none')}
          >
            <span className="text-2xl mr-3">🟢</span>
            沒有人受傷
          </Button>
        </div>

        {/* Context-dependent alerts */}
        {selected === 'fatal' && (
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="space-y-2">
              <p className="font-bold text-red-800">請立即撥打 119 救護及 110 報警</p>
              <p className="text-sm text-red-700">救護優先！切勿移動任何車輛或現場痕跡證據，除非為搶救傷者。</p>
              <div className="flex gap-2 mt-2">
                <a href="tel:119" className="flex-1">
                  <Button variant="destructive" className="w-full">撥打 119</Button>
                </a>
                <a href="tel:110" className="flex-1">
                  <Button variant="destructive" className="w-full">撥打 110</Button>
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {selected === 'injury' && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertDescription className="space-y-2">
              <p className="font-bold text-yellow-800">傷者救護優先！</p>
              <p className="text-sm text-yellow-700">不得以「談責任」延誤就醫。建議撥打 119 救護及 110 報警。</p>
              <div className="flex gap-2 mt-2">
                <a href="tel:119" className="flex-1">
                  <Button variant="outline" className="w-full border-yellow-500">撥打 119</Button>
                </a>
                <a href="tel:110" className="flex-1">
                  <Button variant="outline" className="w-full border-yellow-500">撥打 110</Button>
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {triageResult.warnings.length > 0 && (
          <div className="space-y-2">
            {triageResult.warnings.map((w, i) => (
              <p key={i} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {w}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {triageResult.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
```

- [ ] **Step 5: Create Step 3 — Vehicle Move**

Create `app/(public)/scene/_components/step-vehicle-move.tsx`:

```typescript
'use client';

import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { determineVehicleMove } from '@/lib/rules-engine/vehicle-move';
import type { SceneData } from './scene-wizard';

interface Props {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepVehicleMove({ data, updateData, onNext, onBack }: Props) {
  const result = determineVehicleMove({
    hasInjuries: data.hasInjuries,
    hasDeaths: data.hasDeaths,
    vehicleCanDrive: data.vehicleCanDrive,
    bothPartiesAgreeToMove: data.bothPartiesAgreeToMove,
    roadType: data.roadType || 'general',
    hasDispute: data.hasDispute,
  });

  const decisionColor = {
    must_move: 'border-green-500 bg-green-50',
    may_move: 'border-yellow-500 bg-yellow-50',
    must_not_move: 'border-red-500 bg-red-50',
    wait_for_tow: 'border-blue-500 bg-blue-50',
  }[result.moveDecision];

  return (
    <StepWizard
      currentStep={3}
      totalSteps={6}
      stepTitle="可否移車"
      onNext={onNext}
      onBack={onBack}
      nextLabel="了解，下一步"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold">車輛可以移動嗎？</h2>

        {/* Quick questions if not death case */}
        {!data.hasDeaths && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-muted">
              <span>車輛還能行駛嗎？</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={data.vehicleCanDrive ? 'default' : 'outline'}
                  onClick={() => updateData({ vehicleCanDrive: true })}
                >
                  可以
                </Button>
                <Button
                  size="sm"
                  variant={!data.vehicleCanDrive ? 'default' : 'outline'}
                  onClick={() => updateData({ vehicleCanDrive: false })}
                >
                  不行
                </Button>
              </div>
            </div>

            {data.vehicleCanDrive && (
              <div className="flex items-center justify-between p-3 rounded bg-muted">
                <span>雙方同意先移車嗎？</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={data.bothPartiesAgreeToMove && !data.hasDispute ? 'default' : 'outline'}
                    onClick={() => updateData({ bothPartiesAgreeToMove: true, hasDispute: false })}
                  >
                    同意
                  </Button>
                  <Button
                    size="sm"
                    variant={!data.bothPartiesAgreeToMove || data.hasDispute ? 'default' : 'outline'}
                    onClick={() => updateData({ bothPartiesAgreeToMove: false, hasDispute: true })}
                  >
                    不同意/有爭議
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decision result */}
        <Alert className={decisionColor}>
          <AlertDescription>
            <p className="text-lg font-bold mb-2">{result.decision}</p>
            <p className="text-sm">{result.explanation}</p>
          </AlertDescription>
        </Alert>

        {/* Steps */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">操作步驟：</h3>
            <ol className="space-y-2">
              {result.nextSteps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Warnings */}
        {result.warnings.map((w, i) => (
          <p key={i} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
            ⚠️ {w}
          </p>
        ))}

        <div className="flex flex-wrap gap-1">
          {result.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/scene/"
git commit -m "feat: implement on-scene wizard steps 1-3 (safety, injury triage, vehicle move)"
```

---

## Task 13: On-Scene Wizard — Steps 4-6

**Files:**
- Create: `app/(public)/scene/_components/step-evidence.tsx`, `app/(public)/scene/_components/step-info-exchange.tsx`, `app/(public)/scene/_components/step-complete.tsx`
- Modify: `app/(public)/scene/_components/scene-wizard.tsx`

- [ ] **Step 1: Create Step 4 — Evidence Capture**

Create `app/(public)/scene/_components/step-evidence.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { generateEvidenceChecklist } from '@/lib/rules-engine/evidence-checklist';
import type { SceneData } from './scene-wizard';

interface Props {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepEvidence({ data, updateData, onNext, onBack }: Props) {
  const result = generateEvidenceChecklist({
    roadType: data.roadType || 'general',
    vehicleTypes: data.vehicleTypes,
    hasTrafficSignal: data.hasTrafficSignal,
    hasSurveillance: data.hasSurveillance,
    hasDashcam: data.hasDashcam,
    hasSkidMarks: data.hasSkidMarks,
    weather: data.weather || 'clear',
    isNight: data.weather === 'night',
    hasInjuries: data.hasInjuries,
  });

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (category: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <StepWizard
      currentStep={4}
      totalSteps={6}
      stepTitle="蒐證拍攝"
      onNext={onNext}
      onBack={onBack}
      nextLabel={`已拍 ${checked.size}/${result.items.length} 項，下一步`}
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold">現在開始蒐證</h2>
        <p className="text-sm text-muted-foreground">請依序拍攝以下項目，勾選已完成的項目：</p>

        {/* Quick toggles for conditional items */}
        <div className="flex flex-wrap gap-2">
          <Label className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2">
            <Checkbox
              checked={data.hasTrafficSignal}
              onCheckedChange={(c) => updateData({ hasTrafficSignal: !!c })}
            />
            有號誌
          </Label>
          <Label className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2">
            <Checkbox
              checked={data.hasSurveillance}
              onCheckedChange={(c) => updateData({ hasSurveillance: !!c })}
            />
            有監視器
          </Label>
          <Label className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2">
            <Checkbox
              checked={data.hasDashcam}
              onCheckedChange={(c) => updateData({ hasDashcam: !!c })}
            />
            有行車記錄器
          </Label>
          <Label className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2">
            <Checkbox
              checked={data.hasSkidMarks}
              onCheckedChange={(c) => updateData({ hasSkidMarks: !!c })}
            />
            有煞車痕
          </Label>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {result.items.map((item, i) => (
            <div
              key={item.category}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                checked.has(item.category) ? 'bg-green-50 border-green-300' : 'bg-background'
              }`}
              onClick={() => toggle(item.category)}
            >
              <Checkbox
                checked={checked.has(item.category)}
                onCheckedChange={() => toggle(item.category)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">
                  {i + 1}. {item.description}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{item.tips}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {result.warnings.map((w, i) => (
          <p key={i} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
            ⚠️ {w}
          </p>
        ))}

        <div className="flex flex-wrap gap-1">
          {result.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
```

- [ ] **Step 2: Create Step 5 — Info Exchange**

Create `app/(public)/scene/_components/step-info-exchange.tsx`:

```typescript
'use client';

import { StepWizard } from '@/components/shared/step-wizard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { SceneData } from './scene-wizard';

interface Props {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInfoExchange({ data, updateData, onNext, onBack }: Props) {
  return (
    <StepWizard
      currentStep={5}
      totalSteps={6}
      stepTitle="資訊交換"
      onNext={onNext}
      onBack={onBack}
      nextLabel="完成，建立案件"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold">記錄對方資訊</h2>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">對方當事人</h3>
            <div>
              <Label htmlFor="otherName">姓名</Label>
              <Input
                id="otherName"
                value={data.otherPartyName || ''}
                onChange={(e) => updateData({ otherPartyName: e.target.value })}
                placeholder="對方姓名"
              />
            </div>
            <div>
              <Label htmlFor="otherPlate">車牌號碼</Label>
              <Input
                id="otherPlate"
                value={data.otherPartyPlate || ''}
                onChange={(e) => updateData({ otherPartyPlate: e.target.value })}
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <Label htmlFor="otherPhone">電話</Label>
              <Input
                id="otherPhone"
                type="tel"
                value={data.otherPartyPhone || ''}
                onChange={(e) => updateData({ otherPartyPhone: e.target.value })}
                placeholder="0912-345-678"
              />
            </div>
            <div>
              <Label htmlFor="otherInsurance">保險公司</Label>
              <Input
                id="otherInsurance"
                value={data.otherPartyInsurance || ''}
                onChange={(e) => updateData({ otherPartyInsurance: e.target.value })}
                placeholder="保險公司名稱"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">目擊者（如有）</h3>
            <div>
              <Label htmlFor="witnessName">姓名</Label>
              <Input
                id="witnessName"
                value={data.witnessName || ''}
                onChange={(e) => updateData({ witnessName: e.target.value })}
                placeholder="目擊者姓名"
              />
            </div>
            <div>
              <Label htmlFor="witnessPhone">電話</Label>
              <Input
                id="witnessPhone"
                type="tel"
                value={data.witnessPhone || ''}
                onChange={(e) => updateData({ witnessPhone: e.target.value })}
                placeholder="目擊者電話"
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground bg-muted p-3 rounded">
          💡 您也可以直接拍攝對方行照/駕照來代替手動輸入。這些資訊僅用於本案件處理，不會分享給第三方。
        </p>
      </div>
    </StepWizard>
  );
}
```

- [ ] **Step 3: Create Step 6 — Complete**

Create `app/(public)/scene/_components/step-complete.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { calculateDeadlines } from '@/lib/rules-engine/deadlines';
import { triageAccident } from '@/lib/rules-engine/triage';
import type { SceneData } from './scene-wizard';

interface Props {
  data: SceneData;
}

export function StepComplete({ data }: Props) {
  const triage = triageAccident({
    hasDeaths: data.hasDeaths,
    hasInjuries: data.hasInjuries,
    vehicleCount: 2,
    hasFire: data.hasFire,
    hasHazmat: data.hasHazmat,
    suspectedDUI: data.suspectedDUI,
    suspectedHitAndRun: data.suspectedHitAndRun,
    hasMinor: false,
    hasForeignNational: false,
  });

  const deadlines = useMemo(() => calculateDeadlines({
    accidentDate: new Date(),
    severity: triage.severity,
    policeArrived: true,
  }), [triage.severity]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 py-6 space-y-6">
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription>
            <p className="text-lg font-bold text-green-800">案件資料已暫存！</p>
            <p className="text-sm text-green-700 mt-1">
              請註冊帳號以永久保存案件資料並啟用時效提醒。
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">事故分類</h3>
              <SeverityBadge severity={triage.severity} />
            </div>
            <p className="text-sm text-muted-foreground">{triage.explanation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">系統已設定提醒</h3>
            <div className="space-y-2">
              {deadlines.reminders.map((r) => (
                <div key={r.type} className="flex items-center justify-between text-sm">
                  <span>{r.description}</span>
                  <CountdownBadge daysRemaining={r.daysRemaining} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {triage.escalateToHuman && (
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription>
              <p className="font-bold text-red-800">本案件為高風險案件</p>
              <p className="text-sm text-red-700 mt-1">
                強烈建議諮詢律師或法律扶助基金會（電話：412-8518）。
              </p>
              <a href="tel:412-8518">
                <Button variant="destructive" className="w-full mt-3">
                  撥打法律扶助專線 412-8518
                </Button>
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            註冊帳號，永久保存案件
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            暫不註冊（資料保留 7 天）
          </Button>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  );
}
```

- [ ] **Step 4: Update scene wizard to include steps 4-6**

Edit `app/(public)/scene/_components/scene-wizard.tsx` — update the imports and switch cases:

Add imports at the top:
```typescript
import { StepEvidence } from './step-evidence';
import { StepInfoExchange } from './step-info-exchange';
import { StepComplete } from './step-complete';
```

Replace the `default` case in the switch statement:
```typescript
    case 4:
      return <StepEvidence data={data} updateData={updateData} onNext={next} onBack={back} />;
    case 5:
      return <StepInfoExchange data={data} updateData={updateData} onNext={next} onBack={back} />;
    case 6:
      return <StepComplete data={data} />;
    default:
      return null;
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/scene/"
git commit -m "feat: complete on-scene wizard steps 4-6 (evidence, info exchange, completion)"
```

---

## Task 14: API Routes — Cases

**Files:**
- Create: `app/api/cases/route.ts`, `app/api/cases/[id]/route.ts`, `lib/utils/hash.ts`, `lib/utils/date.ts`

- [ ] **Step 1: Create date utility**

Create `lib/utils/date.ts`:

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function formatDateTW(date: Date | string): string {
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: zhTW });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhTW });
}
```

- [ ] **Step 2: Create hash utility**

Create `lib/utils/hash.ts`:

```typescript
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

- [ ] **Step 3: Create cases list/create API**

Create `app/api/cases/route.ts`:

```typescript
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
```

- [ ] **Step 4: Create case detail API**

Create `app/api/cases/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('cases')
    .select('*, evidence(*), reminders(*), documents(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('cases')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/ lib/utils/
git commit -m "feat: add case CRUD API routes and utility functions"
```

---

## Task 15: Dashboard and Case Detail Pages

**Files:**
- Create: `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `app/(app)/dashboard/_components/case-card.tsx`, `app/(app)/case/[id]/page.tsx`, `app/(app)/case/[id]/timeline/page.tsx`, `app/(app)/case/[id]/_components/case-header.tsx`, `app/(app)/case/[id]/_components/timeline-view.tsx`

- [ ] **Step 1: Create authenticated layout**

Create `app/(app)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">
          <a href="/dashboard">台灣車禍事故處理專家</a>
        </h1>
        <span className="text-sm text-muted-foreground">{user.phone || user.email}</span>
      </header>
      <main className="flex-1">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
```

- [ ] **Step 2: Create case card component**

Create `app/(app)/dashboard/_components/case-card.tsx`:

```typescript
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { formatDateTW } from '@/lib/utils/date';
import type { Severity } from '@/lib/rules-engine/types';

interface CaseCardProps {
  id: string;
  severity: Severity;
  roadType: string | null;
  accidentDate: string;
  status: string;
  nearestReminder?: {
    description: string;
    daysRemaining: number;
  };
  evidenceCount: number;
  documentCount: number;
}

const statusLabels: Record<string, string> = {
  on_scene: '現場處理中',
  post_scene: '事故後處理',
  data_request: '資料申請中',
  appraisal: '鑑定中',
  mediation: '調解中',
  closed: '已結案',
};

const roadTypeLabels: Record<string, string> = {
  highway: '高速公路',
  expressway: '快速道路',
  general: '一般道路',
  alley: '巷道',
};

export function CaseCard(props: CaseCardProps) {
  return (
    <Link href={`/case/${props.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <SeverityBadge severity={props.severity} />
            <span className="text-xs text-muted-foreground">
              {statusLabels[props.status] || props.status}
            </span>
          </div>
          <div className="text-sm">
            <span>{formatDateTW(props.accidentDate)}</span>
            {props.roadType && (
              <span className="ml-2 text-muted-foreground">
                {roadTypeLabels[props.roadType] || props.roadType}
              </span>
            )}
          </div>
          {props.nearestReminder && (
            <div className="flex items-center justify-between">
              <span className="text-sm truncate mr-2">{props.nearestReminder.description}</span>
              <CountdownBadge daysRemaining={props.nearestReminder.daysRemaining} />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            證據 {props.evidenceCount} 件 | 文件 {props.documentCount} 份
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: Create dashboard page**

Create `app/(app)/dashboard/page.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CaseCard } from './_components/case-card';
import { differenceInDays } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: cases } = await supabase
    .from('cases')
    .select('*, reminders(*), evidence(id), documents(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">我的案件</h2>
        <Link href="/scene">
          <Button size="sm">+ 新增案件</Button>
        </Link>
      </div>

      {!cases || cases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-4">尚無案件</p>
          <Link href="/scene">
            <Button>建立第一個案件</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c: any) => {
            const pendingReminders = (c.reminders || [])
              .filter((r: any) => r.status === 'pending')
              .map((r: any) => ({
                description: r.description || r.type,
                daysRemaining: differenceInDays(new Date(r.due_date), new Date()),
              }))
              .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

            return (
              <CaseCard
                key={c.id}
                id={c.id}
                severity={c.severity}
                roadType={c.road_type}
                accidentDate={c.accident_date}
                status={c.status}
                nearestReminder={pendingReminders[0]}
                evidenceCount={(c.evidence || []).length}
                documentCount={(c.documents || []).length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create case detail page**

Create `app/(app)/case/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeverityBadge, RiskBadge } from '@/components/shared/risk-badge';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { formatDateTW } from '@/lib/utils/date';
import { differenceInDays } from 'date-fns';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, reminders(*), evidence(*), documents(*)')
    .eq('id', id)
    .single();

  if (!caseData) notFound();

  const triageResult = caseData.triage_result as any;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">案件詳情</h2>
          <p className="text-sm text-muted-foreground">{formatDateTW(caseData.accident_date)}</p>
        </div>
        <SeverityBadge severity={caseData.severity} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">概覽</TabsTrigger>
          <TabsTrigger value="evidence" className="flex-1">證據</TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1">時間線</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Triage result */}
          {triageResult && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">分流結果</h3>
                  <RiskBadge level={triageResult.riskLevel} />
                </div>
                <p className="text-sm">{triageResult.explanation}</p>
                {triageResult.lawReferences?.map((ref: any, i: number) => (
                  <LawReferenceBadge key={i} reference={ref} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming reminders */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">待辦提醒</h3>
              {(caseData.reminders || [])
                .filter((r: any) => r.status === 'pending')
                .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>{r.description || r.type}</span>
                    <CountdownBadge daysRemaining={differenceInDays(new Date(r.due_date), new Date())} />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>證據管理功能開發中</p>
            <p className="text-sm mt-1">共 {(caseData.evidence || []).length} 件證據</p>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-4">
            {(caseData.reminders || [])
              .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .map((r: any, i: number) => {
                const days = differenceInDays(new Date(r.due_date), new Date());
                return (
                  <div key={r.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        r.status === 'completed' ? 'bg-green-500' :
                        days < 0 ? 'bg-red-500' :
                        days <= 7 ? 'bg-yellow-500' : 'bg-muted-foreground'
                      }`} />
                      {i < (caseData.reminders || []).length - 1 && (
                        <div className="w-0.5 h-full bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium">{r.description || r.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTW(r.due_date)}
                      </p>
                      <CountdownBadge daysRemaining={days} />
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/"
git commit -m "feat: add dashboard and case detail pages with timeline view"
```

---

## Task 16: Privacy Policy and Terms Pages

**Files:**
- Create: `app/(public)/privacy/page.tsx`, `app/(public)/terms/page.tsx`

- [ ] **Step 1: Create privacy policy page**

Create `app/(public)/privacy/page.tsx`:

```typescript
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm">
      <h1>隱私權政策</h1>
      <p>最後更新：2026年4月</p>

      <h2>一、蒐集之目的</h2>
      <p>本系統蒐集您的個人資料，僅用於提供交通事故處理流程導航、證據管理、時效提醒及文件生成等服務。</p>

      <h2>二、蒐集之個人資料類別</h2>
      <ul>
        <li>識別類：姓名、電話號碼</li>
        <li>事故相關：事故日期、地點、車輛資訊、現場照片</li>
        <li>特種個人資料（如有）：傷勢照片、診斷書（需額外書面同意）</li>
      </ul>

      <h2>三、利用之期間、地區、對象及方式</h2>
      <p>期間：至案件結案後一年，或依您的要求提前刪除。地區：中華民國境內。對象：僅限您本人及您授權之人員。方式：電子化處理與利用。</p>

      <h2>四、當事人權利</h2>
      <p>依個人資料保護法第3條，您得隨時請求查詢、閱覽、複製、補充、更正、停止蒐集/處理/利用或刪除您的個人資料。</p>

      <h2>五、安全維護措施</h2>
      <p>本系統採用傳輸加密（TLS）及靜態加密保護您的資料，並設有存取權限控管與稽核日誌。</p>

      <h2>六、聯絡方式</h2>
      <p>如有任何隱私相關問題，請透過系統內建聯絡功能與我們聯繫。</p>
    </div>
  );
}
```

- [ ] **Step 2: Create terms of service page**

Create `app/(public)/terms/page.tsx`:

```typescript
export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm">
      <h1>服務條款</h1>
      <p>最後更新：2026年4月</p>

      <h2>一、服務說明</h2>
      <p>本系統（以下稱「本服務」）依據中華民國公開法規，提供交通事故處理之資訊參考與流程導航工具。</p>

      <h2>二、重要聲明</h2>
      <p><strong>本服務不構成法律意見。</strong>本服務提供之所有資訊僅供參考，不代表對個案之法律判斷、責任認定或訴訟結果之保證。個案情況各異，涉及權益事項請諮詢律師或法律扶助基金會（電話：412-8518）。</p>

      <h2>三、使用限制</h2>
      <p>本服務不提供以下內容：肇事責任判定、勝訴機率評估、和解金額建議、訴訟策略、肇責比例分配。</p>

      <h2>四、使用者責任</h2>
      <p>您應確保所提供之資訊正確完整。本服務之建議基於您所提供之資訊，如資訊有誤可能導致不適當之建議。</p>

      <h2>五、免責聲明</h2>
      <p>本服務盡力確保法規資訊之正確性與即時性，但不保證絕對無誤。法規如有修正，以全國法規資料庫公告為準。因使用本服務所生之任何損害，本服務不負賠償責任。</p>

      <h2>六、智慧財產權</h2>
      <p>本服務之程式碼、介面設計、文件模板等均受著作權法保護。法規條文內容屬公共領域。</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/privacy/" "app/(public)/terms/"
git commit -m "feat: add privacy policy and terms of service pages"
```

---

## Task 17: Final Build Verification and Full Test Run

- [ ] **Step 1: Run all rules engine tests**

```bash
npx vitest run
```

Expected: All 43 tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Start dev server and verify landing page**

```bash
npm run dev
```

Open http://localhost:3000 — verify:
- Landing page renders with two CTAs
- "我剛發生事故" button links to /scene
- Feature cards display correctly
- Disclaimer footer is visible

- [ ] **Step 4: Verify on-scene wizard flow**

Navigate to /scene — verify:
- Step 1: Safety checklist renders, warning distance calculator works
- Step 2: Injury options render, clicking shows appropriate alerts
- Step 3: Vehicle move decision updates based on selections
- Step 4: Evidence checklist renders with toggleable conditions
- Step 5: Info exchange form renders
- Step 6: Completion page shows severity, deadlines, and disclaimer

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: MVP milestone — rules engine, on-scene wizard, dashboard, case detail complete"
```
