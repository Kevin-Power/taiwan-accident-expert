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
// Generator: 現場檢查清單 (Scene Checklist)
// ============================================================================

export function generateSceneChecklist(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('scene_checklist');
  const sections: GeneratedSection[] = [];

  const roadLabel = input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '未填';

  // Step 1: 立即安全
  sections.push({
    title: '第一步：立即安全措施（30秒內完成）',
    content: [
      '□ 開啟雙黃燈（危險警告燈）',
      '□ 人員移至護欄外或路邊安全處',
      '□ 在車後方放置三角警告標誌',
      '',
      `【警示距離】本案路段為「${roadLabel}」${input.speedLimit ? `（速限 ${input.speedLimit} km/h）` : ''}：`,
      input.roadType === 'highway' ? '→ 請在車後方 100 公尺處放置警告標誌' :
      input.roadType === 'expressway' || (input.speedLimit && input.speedLimit > 60) ? '→ 請在車後方 80 公尺處放置警告標誌' :
      input.speedLimit && input.speedLimit >= 50 ? '→ 請在車後方 50 公尺處放置警告標誌' :
      '→ 請在車後方 30 公尺處放置警告標誌',
      input.weather === 'rain' || input.weather === 'fog' || input.weather === 'night'
        ? '⚠️ 本案天候視線不良，請增加警示距離'
        : '',
    ].filter(Boolean).join('\n'),
    isEditable: false,
  });

  // Step 2: 傷亡救護
  if (input.hasDeaths || input.hasInjuries) {
    sections.push({
      title: '第二步：傷亡救護（優先）',
      content: [
        '□ 立即撥打 119 救護車',
        '□ 不要移動傷者（除非現場有立即危險）',
        '□ 若受過急救訓練，可提供基本急救',
        '□ 保持傷者清醒並給予心理支持',
        '□ 記錄送醫醫院名稱',
        '',
        '⚠️ 救護優先！切勿以「談責任」延誤就醫。',
      ].join('\n'),
      isEditable: false,
    });
  }

  // Step 3: 報警
  sections.push({
    title: '第三步：報警',
    content: [
      `□ 撥打 110 報警${input.roadType === 'highway' ? '（國道請撥 1968）' : ''}`,
      '□ 告知準確位置（路名 + 方向 + 地標）',
      '□ 說明傷亡與車輛數',
      '□ 等候警方到場',
      '',
      '※ 可使用系統產生的「報警敘述稿」一鍵複製',
    ].join('\n'),
    isEditable: false,
  });

  // Step 4: 可移車判斷
  const canMove = !input.hasDeaths && input.vehicleCanDrive && input.bothPartiesAgreeToMove && !input.hasDispute;
  sections.push({
    title: '第四步：可否移車判斷',
    content: canMove
      ? [
          '✅ 本案可以移車（但需先記錄現場）',
          '',
          '□ 先標繪車輛位置（用粉筆、膠帶等）',
          '□ 從多角度拍攝全景照片',
          '□ 拍攝碰撞點特寫',
          '□ 拍攝地面痕跡與散落物',
          '□ 完成紀錄後，將車移至不妨礙交通處',
          '',
          '⚠️ 未記錄即移車可能影響後續鑑定',
        ].join('\n')
      : [
          '❌ 本案不建議移車',
          '',
          input.hasDeaths ? '理由：有人員死亡，現場為刑事偵查證據' :
          !input.vehicleCanDrive ? '理由：車輛無法行駛，請等待拖吊' :
          input.hasDispute ? '理由：雙方有爭議，應保全現場等待警方' :
          '理由：未達成移車共識，應保全現場等待警方',
          '',
          '□ 保持現場原狀',
          '□ 設置警示標誌防止二次事故',
          '□ 等候警方到場處理',
        ].join('\n'),
    isEditable: false,
  });

  // Step 5: 蒐證清單
  const evidenceItems = [
    '□ 事故現場全景（含標線、環境、車輛相對位置）',
    '□ 碰撞點特寫（多角度）',
    '□ 散落物與地面痕跡',
    '□ 雙方車牌清晰照',
    '□ 雙方車損部位特寫',
  ];
  if (input.hasTrafficSignal) evidenceItems.push('□ 路口號誌狀態（含秒數倒數）');
  if (input.hasSurveillance) evidenceItems.push('□ 附近監視器位置記錄');
  if (input.hasSkidMarks) evidenceItems.push('□ 煞車痕長度與方向');
  if (input.hasDashcam) evidenceItems.push('□ 行車記錄器檔案備份');
  if (input.hasInjuries) evidenceItems.push('□ 傷勢照片（需同意）');

  sections.push({
    title: '第五步：蒐證拍攝清單',
    content: evidenceItems.join('\n'),
    isEditable: false,
  });

  // Step 6: 資訊交換
  sections.push({
    title: '第六步：資訊交換',
    content: [
      '□ 對方姓名：_______________',
      '□ 對方車牌：_______________',
      '□ 對方電話：_______________',
      '□ 對方保險公司：_______________',
      '□ 目擊者姓名與電話：_______________',
      '',
      '⚠️ 切勿在現場承認責任或簽署任何文件',
      '⚠️ 避免私下和解承諾',
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
// Generator: 事故時間線 (Accident Timeline)
// ============================================================================

export function generateAccidentTimeline(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('accident_timeline');
  const sections: GeneratedSection[] = [];

  const base = input.accidentDate;
  const addDays = (days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };
  const addMonths = (months: number) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + months);
    return formatDate(d);
  };
  const addYears = (years: number) => {
    const d = new Date(base);
    d.setFullYear(d.getFullYear() + years);
    return formatDate(d);
  };

  sections.push({
    title: '案件資訊',
    content: [
      `案件編號：${input.caseId}`,
      `事故等級：${severityLabel(input)}`,
      `道路類型：${input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '未填'}`,
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '階段一：事故當下（T+0）',
    content: [
      `◉ ${formatDate(input.accidentDate)}`,
      '  事故發生',
      '  □ 安全處置（雙黃燈、警示標誌）',
      '  □ 傷亡救護（如需要）',
      '  □ 報警與通報',
      '  □ 蒐證拍攝',
      '  □ 資訊交換',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '階段二：資料申請期（T+7 ~ T+30）',
    content: [
      `○ ${addDays(7)}`,
      '  可向警察機關申請：',
      '  □ 現場圖',
      '  □ 現場照片',
      '',
      `○ ${addDays(30)}`,
      '  可向警察機關申請：',
      '  □ 道路交通事故初步分析研判表',
      '',
      '【法規依據】道路交通事故處理辦法 第13條',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '階段三：鑑定申請期（T+180 內）',
    content: [
      `○ ${addMonths(6)}【重要期限】`,
      '  車輛行車事故鑑定申請截止',
      '  □ 距肇事日逾 6 個月原則不受理',
      '  □ 規費：新臺幣 3,000 元',
      '',
      '【法規依據】車輛行車事故鑑定及覆議作業辦法 第3條',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '階段四：覆議與時效',
    content: [
      '○ 收到鑑定結果後 30 日內',
      '  □ 可提出覆議申請（以一次為限）',
      '',
      `○ ${addYears(2)}`,
      '  強制汽車責任保險請求權時效（知有損害起 2 年）',
      '',
      `○ ${addYears(10)}【絕對時效】`,
      '  強制汽車責任保險請求權絕對時效（事故起 10 年）',
      '',
      '【法規依據】強制汽車責任保險法 第14條、鑑定覆議辦法 第10條',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '現況記錄（請自行更新）',
    content: [
      '□ 已報案並取得報案三聯單',
      '□ 已申請現場圖（日期：_______）',
      '□ 已申請初步分析研判表（日期：_______）',
      '□ 已申請鑑定（日期：_______）',
      '□ 已收到鑑定結果（日期：_______）',
      '□ 已向保險公司報案（日期：_______）',
      '□ 已達成和解 / 進入調解 / 進入訴訟',
    ].join('\n'),
    isEditable: true,
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
// Generator: 調解陳述書初稿 (Mediation Statement)
// ============================================================================

export function generateMediationStatement(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('mediation_statement');
  const sections: GeneratedSection[] = [];

  sections.push({
    title: '聲請人基本資料',
    content: [
      '聲請人：_______________',
      '身分證字號：_______________',
      '住址：_______________',
      '電話：_______________',
      '',
      '對造人：' + (input.otherPartyName || '_______________'),
      '車牌：' + (input.otherPartyPlate || '_______________'),
      '電話：' + (input.otherPartyPhone || '_______________'),
      '住址：_______________',
    ].join('\n'),
    isEditable: true,
  });

  const roadLabel = input.roadType ? ROAD_TYPE_LABELS[input.roadType] : '一般道路';
  const weatherLabel = input.weather ? WEATHER_LABELS[input.weather] : '晴天';

  sections.push({
    title: '一、事故發生經過（客觀敘述）',
    content: `一、事故時間：${formatDate(input.accidentDate)}\n\n二、事故地點：${input.locationText || '[待補填]'}（${roadLabel}${input.speedLimit ? `，速限 ${input.speedLimit} km/h` : ''}）\n\n三、天候狀況：${weatherLabel}\n\n四、事故經過：\n（請以客觀事實描述，避免使用「對方故意」「都是對方的錯」等主觀結論）\n\n________________________________________________\n________________________________________________\n________________________________________________\n________________________________________________`,
    isEditable: true,
  });

  sections.push({
    title: '二、損害項目',
    content: [
      '【人員傷害】',
      input.hasDeaths ? '✗ 造成人員死亡' :
      input.hasInjuries ? '✗ 造成人員受傷（請檢附醫院診斷書）' :
      '○ 無人員傷亡',
      '',
      '傷勢描述：_______________',
      '就醫醫院：_______________',
      '醫療費用：新臺幣 _____ 元（請檢附收據）',
      '工作損失：新臺幣 _____ 元（若有）',
      '',
      '【車輛損害】',
      input.damageDescription || '車損部位與程度：_______________',
      '修復費用：新臺幣 _____ 元（請檢附估價單）',
      '代步車費用：新臺幣 _____ 元（若有）',
      '',
      '【其他財物損害】',
      '項目與金額：_______________',
      '',
      '【精神慰撫金】（民法第195條）',
      '金額：新臺幣 _____ 元',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '三、爭議要點',
    content: `（列出雙方認知有差異的事實或責任歸屬點，供調解委員參考）\n\n1. _______________\n\n2. _______________\n\n3. _______________`,
    isEditable: true,
  });

  sections.push({
    title: '四、調解請求',
    content: [
      '聲請人之請求：',
      '',
      '□ 對造人給付損害賠償新臺幣 _____ 元',
      '□ 對造人道歉',
      '□ 其他：_______________',
      '',
      '付款方式：□ 一次付清 □ 分期付款',
      '付款期限：_______________',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '五、檢附資料',
    content: [
      '□ 道路交通事故當事人登記聯單',
      '□ 道路交通事故現場圖',
      '□ 道路交通事故現場照片',
      '□ 道路交通事故初步分析研判表',
      '□ 車輛行車事故鑑定意見書（如有）',
      '□ 醫院診斷書與收據',
      '□ 車輛修復估價單與收據',
      '□ 其他：_______________',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '重要提醒',
    content: [
      '• 依鄉鎮市調解條例第27條，調解經法院核定後，與確定判決有同一效力',
      '• 刑事告訴乃論案件經調解成立，得撤回告訴',
      '• 調解書製成後 3 日內送法院審核',
      '• 經法院核定後 30 日內得請求撤銷或宣告無效',
      '',
      '⚠️ 調解為重要法律行為，強烈建議簽署前諮詢律師',
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
// Generator: 和解條款檢核表 (Settlement Checklist)
// ============================================================================

export function generateSettlementChecklist(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('settlement_checklist');
  const sections: GeneratedSection[] = [];

  sections.push({
    title: '簽署前必查清單',
    content: [
      '【金額相關】',
      '□ 和解金額是否明確記載於條款',
      '□ 金額是否含稅／未稅已載明',
      '□ 金額是否涵蓋全部損害項目（車損、醫療、工作損失、精神慰撫金）',
      '□ 後續醫療費用處理方式是否載明',
      '',
      '【付款方式】',
      '□ 付款方式（現金／匯款／支票）已載明',
      '□ 付款期限已明確載明',
      '□ 分期付款者，各期金額與日期已列明',
      '□ 違約條款已約定（未按期付款之處理）',
      '',
      '【爭議處理】',
      '□ 是否約定一方違約時可聲請法院強制執行',
      '□ 是否約定管轄法院',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '容易遺漏的條款',
    content: [
      '□ 「拋棄其他請求權」條款 — 雙方對本事故不再有任何請求',
      '□ 刑事部分之處理（撤回告訴／不提告）',
      '□ 後遺症條款（若日後發現後遺症如何處理）',
      '□ 保密條款（是否限制對外談論本案）',
      '□ 第三方代位求償處理（保險公司之求償權）',
      '□ 稅務處理（賠償金是否需開立收據）',
      '□ 雙方簽名與日期',
      '□ 見證人（如有）',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '風險提示',
    content: [
      '⚠️ 若有人員受傷/死亡（本案：' + severityLabel(input) + '），刑事責任不能單純靠民事和解消滅',
      input.hasInjuries || input.hasDeaths
        ? '  → 過失傷害罪為告訴乃論，和解後需向檢察官撤回告訴才能免責\n  → 過失致死罪為非告訴乃論，仍會由檢察官偵辦'
        : '',
      '',
      '⚠️ 和解後無法反悔：除非有詐欺、脅迫、顯失公平等情形',
      '⚠️ 若可能涉及強制險請求，和解前確認是否已請領',
      '⚠️ 金額若遠低於鑑定損害（或遠高於對方賠付能力），建議先諮詢律師',
      '',
      '✅ 建議做法：',
      '• 先經調解委員會調解（調解書經法院核定有確定判決效力）',
      '• 或委託律師審閱和解書',
      '• 簽署前務必保留副本與所有證據',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '雙方資料',
    content: [
      '【甲方（己方）】',
      '姓名：_______________',
      '身分證字號：_______________',
      '住址：_______________',
      '',
      '【乙方（對方）】',
      '姓名：' + (input.otherPartyName || '_______________'),
      '身分證字號：_______________',
      '住址：_______________',
      '車牌：' + (input.otherPartyPlate || '_______________'),
    ].join('\n'),
    isEditable: true,
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
// Generator: 鑑定申請資料包 (Appraisal Application Pack)
// ============================================================================

export function generateAppraisalApplicationPack(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('appraisal_application_pack');
  const sections: GeneratedSection[] = [];

  const sixMonthsLater = new Date(input.accidentDate);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const daysRemaining = Math.ceil((sixMonthsLater.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  sections.push({
    title: '申請前檢查',
    content: [
      `⏰ 重要：距肇事日逾 6 個月原則不予受理`,
      `   本案事故日：${formatDate(input.accidentDate)}`,
      `   申請截止：${formatDate(sixMonthsLater)}`,
      `   剩餘天數：${daysRemaining > 0 ? `${daysRemaining} 天` : '已逾期，請參考例外條件'}`,
      '',
      '💰 規費：新臺幣 3,000 元',
      '',
      '⚠️ 不受理情形（車輛行車事故鑑定及覆議作業辦法 第3條）：',
      '  1. 非屬道路交通事故',
      '  2. 未經警察機關處理',
      '  3. 已進入偵查或審判程序（且非法院/檢察官囑託）',
      '  4. 距肇事日逾 6 個月（除不可歸責事由）',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '應備文件清單',
    content: [
      '□ 鑑定申請書（向鑑定會索取或下載）',
      '□ 申請人身分證影本',
      '□ 道路交通事故當事人登記聯單',
      '□ 道路交通事故現場圖（事故後 7 日可向警察機關申請）',
      '□ 道路交通事故現場照片（事故後 7 日可申請）',
      '□ 道路交通事故初步分析研判表（事故後 30 日可申請）',
      '□ 行車執照影本',
      '□ 駕駛執照影本',
      '□ 車輛險鑑定規費收據',
      '□ 委任書（若委託他人申請）',
      '□ 其他補充資料（行車記錄器、監視器影片等）',
    ].join('\n'),
    isEditable: false,
  });

  sections.push({
    title: '申請書填寫要點',
    content: [
      '【基本資料】',
      `申請人：_______________`,
      `身分證字號：_______________`,
      `電話：_______________`,
      `住址：_______________`,
      '',
      '【事故資料】',
      `事故時間：${formatDate(input.accidentDate)}`,
      `事故地點：${input.locationText || '_______________'}`,
      `處理警察單位：_______________ 分局 _______________ 分駐（派出）所`,
      `當事人關係：□ 車主 □ 駕駛 □ 被害人 □ 家屬 □ 其他：______`,
      '',
      '【車輛資料】',
      `車種：${input.vehicleTypes.join('、') || '_______________'}`,
      `車牌：_______________`,
      '',
      '【鑑定請求事項】',
      '（請客觀描述要求鑑定之爭點，避免引導性語言）',
      '________________________________________________',
      '________________________________________________',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '流程時程',
    content: [
      '1. 備齊文件並繳納規費',
      '2. 向事故發生地所屬鑑定委員會提出申請',
      '3. 鑑定委員會受理並進行鑑定（法定期限 2 個月，必要時可延長 2 個月）',
      '4. 收到鑑定意見書',
      '5. 若對結果不服，自收受鑑定書翌日起 30 日內得申請覆議（以一次為限）',
      '',
      '【法規依據】車輛行車事故鑑定及覆議作業辦法 第3、9、10條',
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
// Generator: 覆議理由整理模板 (Review Reason Template)
// ============================================================================

export function generateReviewReasonTemplate(input: GeneratorInput): GeneratedDocument {
  const template = getTemplate('review_reason_template');
  const sections: GeneratedSection[] = [];

  sections.push({
    title: '覆議申請基本資訊',
    content: [
      `原案件編號：${input.caseId}`,
      `原鑑定案號：_______________（請填入鑑定意見書案號）`,
      `事故時間：${formatDate(input.accidentDate)}`,
      `事故地點：${input.locationText || '_______________'}`,
      '',
      '申請人：_______________',
      '身分證字號：_______________',
      '電話：_______________',
      '',
      '收受鑑定書日期：_______________',
      '覆議申請截止日：_______________（收受翌日起 30 日內）',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '一、原鑑定意見摘要',
    content: [
      '（請摘錄原鑑定意見書之結論，供覆議會參考）',
      '',
      '原鑑定意見：',
      '________________________________________________',
      '________________________________________________',
      '________________________________________________',
      '',
      '原鑑定依據：',
      '________________________________________________',
      '________________________________________________',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '二、異議事實（客觀陳述）',
    content: [
      '（請條列式列出原鑑定認定之事實中，您認為不符實際狀況之處）',
      '',
      '1. 原鑑定認定：_______________',
      '   實際情況：_______________',
      '   支持證據：_______________',
      '',
      '2. 原鑑定認定：_______________',
      '   實際情況：_______________',
      '   支持證據：_______________',
      '',
      '3. 原鑑定認定：_______________',
      '   實際情況：_______________',
      '   支持證據：_______________',
      '',
      '⚠️ 請避免使用「錯誤」「顯然偏頗」等情緒性用語',
      '⚠️ 以客觀事實與證據為主',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '三、異議證據',
    content: [
      '（請列出原鑑定未採用或未充分考量之證據）',
      '',
      '□ 行車記錄器影片（時間碼：_____）',
      '□ 監視器畫面（位置：_____）',
      '□ 新發現的目擊者證詞',
      '□ 專業意見書（醫院／鑑識單位）',
      '□ 照片資料（說明：_____）',
      '□ 其他：_____',
      '',
      '【證據清單】',
      '1. _______________',
      '2. _______________',
      '3. _______________',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '四、待查爭點',
    content: [
      '（請條列式列出希望覆議會重新審視的爭點，但不應預設結論）',
      '',
      '爭點一：_______________',
      '爭點二：_______________',
      '爭點三：_______________',
      '',
      '備註：覆議為對原鑑定之重新審視，非重新鑑定。',
    ].join('\n'),
    isEditable: true,
  });

  sections.push({
    title: '重要時效提醒',
    content: [
      '⏰ 覆議期限：自收受鑑定書翌日起 30 日內',
      '📌 覆議以一次為限（不得再次申請）',
      '💰 規費：依各鑑定覆議會公告',
      '',
      '【法規依據】車輛行車事故鑑定及覆議作業辦法 第10條',
      '',
      '⚠️ 建議：若覆議結果仍不服，可於後續民事/刑事程序中提出',
      '⚠️ 涉及刑事責任認定者，強烈建議委任律師',
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
  scene_checklist: generateSceneChecklist,
  police_report_script: generatePoliceReportScript,
  insurance_claim_summary: generateInsuranceClaimSummary,
  evidence_inventory: generateEvidenceInventory,
  accident_timeline: generateAccidentTimeline,
  mediation_statement: generateMediationStatement,
  settlement_checklist: generateSettlementChecklist,
  appraisal_application_pack: generateAppraisalApplicationPack,
  review_reason_template: generateReviewReasonTemplate,
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
