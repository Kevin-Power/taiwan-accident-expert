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
