import type { TriageInput, RuleResult, Severity } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_TRAFFIC_PENALTY } from './constants';

export interface TriageResult extends RuleResult {
  severity: Severity;
  riskFlags: string[];
}

export function triageAccident(input: TriageInput): TriageResult {
  const riskFlags: string[] = [];

  // Collect risk flags
  if (input.suspectedDUI) riskFlags.push('dui');
  if (input.suspectedHitAndRun) riskFlags.push('hit_and_run');
  if (input.hasHazmat) riskFlags.push('hazmat');
  if (input.hasFire) riskFlags.push('fire');
  if (input.hasMinor) riskFlags.push('minor');
  if (input.hasForeignNational) riskFlags.push('foreign_national');

  // Determine if critical aggravating factors are present
  const hasCriticalFlag =
    input.suspectedDUI ||
    input.suspectedHitAndRun ||
    input.hasHazmat ||
    input.hasFire;

  // Determine severity classification (A1 > A2 > A3)
  let severity: Severity;
  if (input.hasDeaths) {
    severity = 'A1_fatal';
  } else if (input.hasInjuries) {
    severity = 'A2_injury';
  } else {
    severity = 'A3_property_only';
  }

  // Determine risk level
  let riskLevel: RuleResult['riskLevel'];
  if (severity === 'A1_fatal' || hasCriticalFlag) {
    riskLevel = 'critical';
  } else if (severity === 'A2_injury') {
    riskLevel = 'high';
  } else if (input.vehicleCount >= 3) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Determine escalation
  const escalateToHuman = riskLevel === 'critical' || severity === 'A2_injury';

  // Build escalate reason for critical/fatal cases
  let escalateReason: string | undefined;
  if (severity === 'A1_fatal') {
    escalateReason = '事故造成人員死亡（A1），依法須通報警察機關並涉及刑事責任，請立即聯繫律師或法律扶助。';
  } else if (hasCriticalFlag) {
    const flagLabels: Record<string, string> = {
      dui: '疑似酒駕',
      hit_and_run: '疑似肇事逃逸',
      hazmat: '危險物品',
      fire: '火災',
    };
    const reasons = riskFlags
      .filter((f) => flagLabels[f])
      .map((f) => flagLabels[f]);
    escalateReason = `高風險情況：${reasons.join('、')}，建議立即諮詢專業人員。`;
  }

  // Build explanation
  let explanation: string;
  if (severity === 'A1_fatal') {
    explanation = '本事故屬A1類（死亡事故），情節最為嚴重，涉及刑事及民事雙重責任。';
  } else if (severity === 'A2_injury') {
    explanation = '本事故屬A2類（傷亡事故），涉及刑事傷害及民事損害賠償風險，建議儘速蒐集證據並諮詢律師。';
  } else {
    explanation = '本事故屬A3類（財損事故），僅涉及財物損失，依法須完成現場處置並向保險公司申報。';
  }

  if (riskFlags.length > 0) {
    const flagDescriptions: Record<string, string> = {
      dui: '疑似酒駕',
      hit_and_run: '疑似肇事逃逸',
      hazmat: '危險物品涉及',
      fire: '現場起火',
      minor: '未成年人涉及',
      foreign_national: '外籍人士涉及',
    };
    const flagText = riskFlags.map((f) => flagDescriptions[f] ?? f).join('、');
    explanation += `另有加重風險因素：${flagText}。`;
  }

  // Next steps
  const nextSteps: string[] = [
    '確認現場安全，設置警告標誌',
    '通知警察機關到場處理',
  ];
  if (severity !== 'A3_property_only') {
    nextSteps.push('立即救護傷患，通知消防/救護單位');
  }
  if (escalateToHuman) {
    nextSteps.push('諮詢律師或法律扶助基金會（412-8518）');
  }
  nextSteps.push('蒐集現場照片與目擊者資料');
  nextSteps.push('向保險公司申報事故');

  // Warnings
  const warnings: string[] = [];
  if (input.suspectedHitAndRun) {
    warnings.push('肇事逃逸將面臨吊扣駕照及刑事責任，請留在現場配合處理。');
  }
  if (input.suspectedDUI) {
    warnings.push('酒駕肇事將加重刑事處罰，請配合酒測並勿移動車輛。');
  }
  if (input.hasHazmat) {
    warnings.push('危險物品外洩，請立即疏散周圍人員並通知消防機關。');
  }
  if (input.hasFire) {
    warnings.push('現場起火，請立即撤離並撥打119。');
  }

  return {
    severity,
    riskLevel,
    riskFlags,
    escalateToHuman,
    escalateReason,
    decision: severity,
    explanation,
    lawReferences: [
      LAW_ACCIDENT_HANDLING.ART_2,
      LAW_TRAFFIC_PENALTY.ART_62,
    ],
    nextSteps,
    warnings,
  };
}
