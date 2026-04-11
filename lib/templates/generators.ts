/**
 * Document generators — turn SceneData + rule engine results into structured documents.
 *
 * Each generator is a pure function that takes scene data and returns a GeneratedDocument.
 * Outputs are structured sections that can be rendered to HTML/PDF/DOCX by separate render layers.
 */

import type { GeneratedDocument, GeneratedSection } from './types';
import { DOCUMENT_TEMPLATES } from './all-templates';
import { LEGAL_DISCLAIMER } from '@/lib/rules-engine/constants';

/**
 * Generator input — all data needed to generate any document.
 * Mirrors SceneData from scene-wizard.tsx plus case metadata.
 */
export interface GeneratorInput {
  caseId: string;
  accidentDate: Date;
  // Scene conditions
  roadType?: string;
  speedLimit?: number;
  weather?: string;
  // Injury/severity
  hasDeaths: boolean;
  hasInjuries: boolean;
  hasFire: boolean;
  hasHazmat: boolean;
  suspectedDUI: boolean;
  suspectedHitAndRun: boolean;
  // Vehicle state
  vehicleCanDrive: boolean;
  bothPartiesAgreeToMove: boolean;
  hasDispute: boolean;
  // Evidence context
  hasTrafficSignal: boolean;
  hasSurveillance: boolean;
  hasDashcam: boolean;
  hasSkidMarks: boolean;
  vehicleTypes: string[];
  // Other party + witness
  otherPartyName?: string;
  otherPartyPlate?: string;
  otherPartyPhone?: string;
  otherPartyInsurance?: string;
  witnessName?: string;
  witnessPhone?: string;
  // Optional free-text fields the user may fill in later
  locationText?: string;
  damageDescription?: string;
  injuryDescription?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const ROAD_TYPE_LABELS: Record<string, string> = {
  highway: '高速公路',
  expressway: '快速道路',
  general: '一般道路',
  alley: '巷弄',
};

const WEATHER_LABELS: Record<string, string> = {
  clear: '晴天',
  rain: '雨天',
  fog: '霧天',
  night: '夜間',
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}年${m}月${day}日 ${hh}時${mm}分`;
}

function severityLabel(input: GeneratorInput): string {
  if (input.hasDeaths) return 'A1（有人死亡）';
  if (input.hasInjuries) return 'A2（有人受傷）';
  return 'A3（僅財物損失）';
}

function getTemplate(id: string) {
  const t = DOCUMENT_TEMPLATES.find(t => t.id === id);
  if (!t) throw new Error(`Template not found: ${id}`);
  return t;
}

// ============================================================================
// Generator: 報警敘述稿 (Police Report Script)
// ============================================================================

export function generatePoliceReportScript(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('police_report_script');
  const sections: GeneratedSection[] = [];

  const roadLabel = input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '未填';
  const locationText = input.locationText || '[請補填地點]';
  const severityText = severityLabel(input);

  const injuryText = input.hasDeaths
    ? '有人員死亡'
    : input.hasInjuries
    ? '有人員受傷'
    : '無人員傷亡';

  const vehicleCount = input.vehicleTypes.length;
  const vehicleTypesText = input.vehicleTypes
    .map(v => ({ car: '汽車', motorcycle: '機車', bicycle: '腳踏車', pedestrian: '行人', truck: '貨車', bus: '公車' }[v as string] || '車輛'))
    .join('與');

  // 30-second version
  sections.push({
    title: '30秒簡版（適用：報案專線 110）',
    content: `您好，我要報案。我在「${locationText}」發生車禍。時間是${formatDate(input.accidentDate)}。事故為${severityText}，${injuryText}。涉及${vehicleCount}台${vehicleTypesText}。${input.suspectedHitAndRun ? '對方已肇事逃逸。' : ''}${input.suspectedDUI ? '懷疑對方酒駕。' : ''}現場在${roadLabel}，請派員處理，我會在原地等候。`,
    isEditable: true,
  });

  // 90-second full version
  const fullParts: string[] = [
    `您好，我要通報一件交通事故。`,
    `事故時間：${formatDate(input.accidentDate)}。`,
    `事故地點：${locationText}，屬${roadLabel}路段${input.speedLimit ? `（速限 ${input.speedLimit} km/h）` : ''}。`,
    `天候狀況：${input.weather ? WEATHER_LABELS[input.weather] : '未填'}。`,
    `事故等級：${severityText}。`,
    `傷亡狀況：${injuryText}。`,
    `涉及車輛：${vehicleCount}台（${vehicleTypesText}）。`,
    `車輛狀態：${input.vehicleCanDrive ? '車輛尚能行駛' : '車輛無法行駛'}。`,
  ];

  if (input.suspectedHitAndRun) fullParts.push('⚠️ 對方肇事逃逸。');
  if (input.suspectedDUI) fullParts.push('⚠️ 懷疑對方有酒駕嫌疑。');
  if (input.hasFire) fullParts.push('⚠️ 現場有車輛起火。');
  if (input.hasHazmat) fullParts.push('⚠️ 現場有危險物品外洩。');

  if (input.otherPartyName || input.otherPartyPlate) {
    fullParts.push(`對方資訊：${input.otherPartyName || '未知'}，車牌 ${input.otherPartyPlate || '未知'}。`);
  }

  fullParts.push('我會在現場等候警方到場，感謝。');

  sections.push({
    title: '90秒完整版（適用：需詳細通報時）',
    content: fullParts.join('\n'),
    isEditable: true,
  });

  // Dispatch tips
  sections.push({
    title: '報案提示',
    content: [
      '• 保持冷靜，清楚說出地點（有路名與最近的路口或明顯地標）',
      '• 若有人受傷，請同時或先撥打 119 救護',
      '• 若在國道，撥打 1968',
      '• 電話接通後聽清楚警員問題，逐項回答',
      '• 切勿在電話中承認責任或做出任何承諾',
      '• 掛斷前確認警方是否派人前往',
    ].join('\n'),
    isEditable: false,
  });

  return {
    template,
    sections,
    generatedAt: new Date(),
    caseId: input.caseId,
    disclaimer: template.disclaimer,
  };
}

// ============================================================================
// Generator: 證據清冊與版本表 (Evidence Inventory)
// ============================================================================

export function generateEvidenceInventory(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('evidence_inventory');
  const sections: GeneratedSection[] = [];

  // Header
  sections.push({
    title: '案件基本資訊',
    content: [
      `案件編號：${input.caseId}`,
      `事故時間：${formatDate(input.accidentDate)}`,
      `事故地點：${input.locationText || '[待補填]'}`,
      `道路類型：${input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '未填'}`,
      `天候狀況：${input.weather ? WEATHER_LABELS[input.weather] : '未填'}`,
      `事故等級：${severityLabel(input)}`,
    ].join('\n'),
    isEditable: false,
  });

  // Base evidence checklist (always required)
  const baseItems = [
    { no: 1, name: '事故現場全景照片', required: '必備', status: '□ 未上傳' },
    { no: 2, name: '碰撞點特寫照片', required: '必備', status: '□ 未上傳' },
    { no: 3, name: '散落物與地面痕跡', required: '必備', status: '□ 未上傳' },
    { no: 4, name: '雙方車牌照片', required: '必備', status: '□ 未上傳' },
    { no: 5, name: '雙方車損部位', required: '必備', status: '□ 未上傳' },
  ];

  sections.push({
    title: '基本證據清單（所有事故均需蒐集）',
    content: baseItems.map(i => `${i.no}. ${i.name}【${i.required}】${i.status}`).join('\n'),
    isEditable: false,
  });

  // Conditional items
  const conditionalItems: string[] = [];
  if (input.hasTrafficSignal) conditionalItems.push('□ 路口號誌狀態（含秒數倒數）');
  if (input.hasSurveillance) conditionalItems.push('□ 附近監視器位置記錄（⚠️ 通常 30 日內會覆蓋，請儘速申請調閱）');
  if (input.hasSkidMarks) conditionalItems.push('□ 煞車痕長度與方向');
  if (input.hasInjuries) conditionalItems.push('□ 傷勢照片（需當事人同意，屬敏感個資）');
  if (input.hasDashcam) conditionalItems.push('□ 行車記錄器原始檔案（請立即備份）');
  if (input.weather === 'rain') conditionalItems.push('□ 路面積水狀況');
  if (input.weather === 'night') conditionalItems.push('□ 路燈照明狀況');

  if (conditionalItems.length > 0) {
    sections.push({
      title: '本案情境加強項目',
      content: conditionalItems.join('\n'),
      isEditable: false,
    });
  }

  // Other party info
  if (input.otherPartyName || input.otherPartyPlate || input.otherPartyPhone || input.otherPartyInsurance) {
    sections.push({
      title: '對方當事人資料',
      content: [
        `姓名：${input.otherPartyName || '未填'}`,
        `車牌：${input.otherPartyPlate || '未填'}`,
        `電話：${input.otherPartyPhone || '未填'}`,
        `保險公司：${input.otherPartyInsurance || '未填'}`,
      ].join('\n'),
      isEditable: true,
    });
  }

  // Witness
  if (input.witnessName || input.witnessPhone) {
    sections.push({
      title: '目擊者資料',
      content: [
        `姓名：${input.witnessName || '未填'}`,
        `電話：${input.witnessPhone || '未填'}`,
      ].join('\n'),
      isEditable: true,
    });
  }

  // Integrity notes
  sections.push({
    title: '檔案完整性備註',
    content: [
      '• 所有證據請保留原始檔案，勿經修圖或裁剪',
      '• 請保留照片 EXIF 資訊（時間與 GPS）',
      '• 行車記錄器影片請立即備份至雲端或其他儲存裝置',
      '• 實際上傳至系統的檔案會計算 SHA-256 雜湊值以確保完整性',
    ].join('\n'),
    isEditable: false,
  });

  return {
    template,
    sections,
    generatedAt: new Date(),
    caseId: input.caseId,
    disclaimer: template.disclaimer,
  };
}

// ============================================================================
// Generator: 保險報案摘要 (Insurance Claim Summary)
// ============================================================================

export function generateInsuranceClaimSummary(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('insurance_claim_summary');
  const sections: GeneratedSection[] = [];

  // Basic info
  sections.push({
    title: '一、事故基本資訊',
    content: [
      `案件編號：${input.caseId}`,
      `事故時間：${formatDate(input.accidentDate)}`,
      `事故地點：${input.locationText || '[待補填]'}`,
      `道路類型：${input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '未填'}`,
      `天候狀況：${input.weather ? WEATHER_LABELS[input.weather] : '未填'}`,
      `事故等級：${severityLabel(input)}`,
    ].join('\n'),
    isEditable: false,
  });

  // Parties
  sections.push({
    title: '二、當事人資料',
    content: [
      `【本方】`,
      `姓名：_______________`,
      `車牌：_______________`,
      `電話：_______________`,
      `保險公司：_______________`,
      `保單號碼：_______________`,
      ``,
      `【對方】`,
      `姓名：${input.otherPartyName || '[待補填]'}`,
      `車牌：${input.otherPartyPlate || '[待補填]'}`,
      `電話：${input.otherPartyPhone || '[待補填]'}`,
      `保險公司：${input.otherPartyInsurance || '[待補填]'}`,
    ].join('\n'),
    isEditable: true,
  });

  // Accident description
  const severityText = severityLabel(input);
  const roadLabel = input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '一般道路';
  const weatherLabel = input.weather ? WEATHER_LABELS[input.weather] : '晴天';

  sections.push({
    title: '三、事故經過（客觀敘述）',
    content: `本人於${formatDate(input.accidentDate)}，在「${input.locationText || '[待補填]'}」${roadLabel}路段${input.speedLimit ? `（速限 ${input.speedLimit} km/h）` : ''}發生交通事故。當時天候為${weatherLabel}。事故屬${severityText}。\n\n事故經過：[請以客觀事實敘述，勿推論對方責任]\n________________________________\n________________________________\n________________________________`,
    isEditable: true,
  });

  // Damage
  sections.push({
    title: '四、損害項目',
    content: [
      `【車輛損害】`,
      input.damageDescription || '[請描述車損部位與程度]',
      ``,
      `【人員傷勢】`,
      input.hasInjuries || input.hasDeaths
        ? (input.injuryDescription || '[請描述傷勢並附醫院診斷書]')
        : '本事故無人員傷亡',
    ].join('\n'),
    isEditable: true,
  });

  // Evidence attachments index
  const attachments: string[] = ['□ 事故現場全景照片', '□ 碰撞點特寫', '□ 車損照片', '□ 雙方車牌照片'];
  if (input.hasTrafficSignal) attachments.push('□ 路口號誌照片');
  if (input.hasDashcam) attachments.push('□ 行車記錄器影片');
  if (input.hasInjuries) attachments.push('□ 醫院診斷書');
  attachments.push('□ 事故現場圖（警方提供）');
  attachments.push('□ 初步分析研判表（警方提供）');

  sections.push({
    title: '五、證據附件索引',
    content: attachments.join('\n'),
    isEditable: false,
  });

  // Key reminders
  sections.push({
    title: '六、重要時效提醒',
    content: [
      '• 強制汽車責任保險請求權時效：自知有損害及保險人起 2 年；事故起最長 10 年',
      '• 警方現場圖及照片：事故後 7 日起可申請',
      '• 警方初步分析研判表：事故後 30 日起可申請',
      '• 車輛行車事故鑑定：事故後 6 個月內申請，逾期原則不受理',
      '',
      '（本摘要為報案輔助文件，請以保險公司正式理賠程序為準）',
    ].join('\n'),
    isEditable: false,
  });

  return {
    template,
    sections,
    generatedAt: new Date(),
    caseId: input.caseId,
    disclaimer: template.disclaimer,
  };
}

// ============================================================================
// Generator registry
// ============================================================================

export type GeneratorFn = (input: GeneratorInput) => GeneratedDocument;

export const GENERATORS: Record<string, GeneratorFn> = {
  police_report_script: generatePoliceReportScript,
  evidence_inventory: generateEvidenceInventory,
  insurance_claim_summary: generateInsuranceClaimSummary,
};

export function isGeneratorAvailable(templateId: string): boolean {
  return templateId in GENERATORS;
}

export function generateDocument(templateId: string, input: GeneratorInput): GeneratedDocument {
  const generator = GENERATORS[templateId];
  if (!generator) {
    throw new Error(`No generator implemented for template: ${templateId}`);
  }
  return generator(input);
}

// Re-export disclaimer for convenience
export { LEGAL_DISCLAIMER };
