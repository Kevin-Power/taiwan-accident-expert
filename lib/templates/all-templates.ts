import type { DocumentTemplate } from './types';

const DEFAULT_DISCLAIMER = '本文件由系統依據使用者輸入之事實資料自動生成，僅供參考。內容需由使用者自行確認，必要時請諮詢專業律師。';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // === 現場類 ===
  {
    id: 'scene_checklist',
    name: '現場檢查清單',
    category: '現場',
    description: '逐步安全檢查與證據蒐集清單，含影像拍攝指引。',
    requiredInputs: ['道路型態', '傷亡狀況', '車輛狀況'],
    outputDescription: '逐步清單 + 影像拍攝指引',
    priority: 'P0',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // === 警方互動類 ===
  {
    id: 'police_report_script',
    name: '報警敘述稿',
    category: '警方互動',
    description: '可直接複製使用的報警/報案用敘述內容，包含30秒簡版與90秒完整版。',
    requiredInputs: ['事故時間', '事故地點', '人車數量', '傷亡狀況', '現場概況'],
    outputDescription: '30秒版/90秒版報案敘述稿（可複製）',
    priority: 'P0',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // === 保險類 ===
  {
    id: 'insurance_claim_summary',
    name: '保險報案摘要',
    category: '保險',
    description: '一頁式保險報案摘要，含事故概述、車損/人傷描述、證據附件索引。',
    requiredInputs: ['事故摘要', '車損描述', '人傷描述', '證據清單'],
    outputDescription: '一頁式摘要（含附件索引）',
    priority: 'P0',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // === 證據類 ===
  {
    id: 'evidence_inventory',
    name: '證據清冊與版本表',
    category: '證據',
    description: '所有證據的完整清冊，含檔案雜湊值、來源、時間戳、版本記錄。可匯出為PDF或CSV。',
    requiredInputs: ['檔案雜湊', '來源', '時間戳'],
    outputDescription: '可匯出PDF/CSV清冊',
    priority: 'P0',
    disclaimer: DEFAULT_DISCLAIMER,
  },
  {
    id: 'accident_timeline',
    name: '事故時間線',
    category: '證據',
    description: '依時間順序整理的事故經過記錄，從事故發生到目前處理進度。',
    requiredInputs: ['事故時間', '各階段時間戳', '處理進度'],
    outputDescription: '時間軸文件（可下載PDF）',
    priority: 'P0',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // === 調解類 ===
  {
    id: 'mediation_statement',
    name: '調解陳述書初稿',
    category: '調解',
    description: '適用於鄉鎮市調解委員會的陳述書草稿，以客觀事實為主，不下責任結論。',
    requiredInputs: ['事故經過', '爭點描述', '損害項目與金額'],
    outputDescription: '符合調解使用語氣的陳述草稿',
    priority: 'P1',
    disclaimer: DEFAULT_DISCLAIMER + ' 調解經法院核定後具確定判決之效力，請務必謹慎確認內容。',
  },

  // === 和解類 ===
  {
    id: 'settlement_checklist',
    name: '和解條款檢核表',
    category: '和解',
    description: '和解前的條款檢查清單，提示常見遺漏條款與風險。不提供金額建議。',
    requiredInputs: ['和解金額', '付款期限', '付款方式', '其他條件（撤告/保密等）'],
    outputDescription: '條款風險提示 + 建議補充條款',
    priority: 'P1',
    disclaimer: DEFAULT_DISCLAIMER + ' 和解為重要法律行為，強烈建議簽署前諮詢律師。',
  },

  // === 鑑定類 ===
  {
    id: 'appraisal_application_pack',
    name: '鑑定申請資料包封面',
    category: '鑑定',
    description: '申請車輛行車事故鑑定的資料包封面，含應備文件清單與填表提示。',
    requiredInputs: ['事故時間地點', '警察處理單位', '當事人關係'],
    outputDescription: '應備文件清單 + 填表提示（含6個月期限與3,000元規費提醒）',
    priority: 'P1',
    disclaimer: DEFAULT_DISCLAIMER + ' 鑑定申請須於事故發生6個月內提出，規費新臺幣3,000元。',
  },

  // === 覆議類 ===
  {
    id: 'review_reason_template',
    name: '覆議理由整理模板',
    category: '覆議',
    description: '對鑑定結果不服時的覆議理由整理工具，以條列式「事實/證據/爭點」呈現，不下結論。',
    requiredInputs: ['鑑定意見摘要', '使用者異議點'],
    outputDescription: '條列式「事實/證據/爭點」草稿（不下結論）',
    priority: 'P1',
    disclaimer: DEFAULT_DISCLAIMER + ' 覆議須於收受鑑定書翌日起30日內提出，以一次為限。',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by priority
 */
export function getTemplatesByPriority(priority: DocumentTemplate['priority']): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.priority === priority);
}

/**
 * Get all available template categories
 */
export function getTemplateCategories(): DocumentTemplate['category'][] {
  return [...new Set(DOCUMENT_TEMPLATES.map(t => t.category))];
}
