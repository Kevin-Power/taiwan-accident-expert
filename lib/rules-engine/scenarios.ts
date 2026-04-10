import type { RoadType, EvidenceCategory, LawReference } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_TRAFFIC_PENALTY } from './constants';

// === Scenario Types ===

export interface ScenarioGuidance {
  id: string;
  name: string;
  description: string;
  /** Key decision questions for this scenario */
  decisionNodes: string[];
  /** Recommended actions */
  actions: string[];
  /** Scenario-specific evidence to collect */
  evidenceFocus: { category: EvidenceCategory; tip: string }[];
  /** When system should escalate to human */
  escalationTriggers: string[];
  /** Relevant law references */
  lawReferences: LawReference[];
}

// === Scenario Registry ===

export const SCENARIOS: ScenarioGuidance[] = [
  {
    id: 'a3_minor_scratch',
    name: 'A3 輕微擦撞（車能動、無傷亡）',
    description: '最常見的事故類型。車輛尚能行駛，無人受傷。',
    decisionNodes: [
      '是否在車道/路肩？',
      '車輛是否可行駛？',
      '是否影響交通？',
    ],
    actions: [
      '先設警示標誌',
      '拍攝/標繪現場',
      '儘速移置路邊不妨礙交通',
      '必要時通知警方',
      '與對方交換資訊',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含標線與兩車相對位置' },
      { category: 'collision_point', tip: '擦撞痕跡特寫' },
      { category: 'vehicle_damage', tip: '雙方車損部位' },
      { category: 'plate', tip: '雙方車牌' },
    ],
    escalationTriggers: [
      '使用者拒絕移置且妨礙交通 → 提醒可能受罰（道交條例§62）',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3_MOVE, LAW_TRAFFIC_PENALTY.ART_62_MOVE_PENALTY],
  },
  {
    id: 'a3_vehicle_immobile',
    name: 'A3 車不能動或散落物多',
    description: '財損事故但車輛無法移動，或散落碎片較多。',
    decisionNodes: [
      '是否阻礙交通？',
      '是否需清理散落物？',
      '是否有二次事故風險？',
    ],
    actions: [
      '設置警示標誌（注意距離要足夠）',
      '避免站立車道上',
      '報警並求援拖吊',
      '拍攝後等待警方或拖吊',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '全景含散落物分布' },
      { category: 'debris', tip: '碎片位置與範圍' },
      { category: 'collision_point', tip: '碰撞點' },
      { category: 'vehicle_damage', tip: '車損導致無法行駛的部位' },
    ],
    escalationTriggers: [
      '夜間高速路段 → 強制安全模式，優先人員撤離',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3],
  },
  {
    id: 'a2_both_agree_move',
    name: 'A2 有人受傷但雙方同意移車',
    description: '有人受傷，但雙方當事人均同意先移置車輛。',
    decisionNodes: [
      '傷勢是否嚴重？',
      '是否「當事人均同意」移置？',
      '車道風險高低？',
    ],
    actions: [
      '傷者救護優先（撥打119）',
      '先標繪/攝影車位與痕跡',
      '移置至不妨礙交通處',
      '報警（撥打110）',
      '記錄就醫醫院',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '移車前全景（含車道位置）' },
      { category: 'collision_point', tip: '碰撞點與地面痕跡' },
      { category: 'injury', tip: '傷勢照片（需同意）' },
      { category: 'vehicle_damage', tip: '雙方車損' },
    ],
    escalationTriggers: [
      '一方不同意移置 → 禁止建議移車，等待警方',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3_MOVE, LAW_ACCIDENT_HANDLING.ART_4],
  },
  {
    id: 'a2_dispute',
    name: 'A2 有人受傷且責任爭執',
    description: '有人受傷，雙方對責任有強烈爭執。',
    decisionNodes: [
      '傷勢嚴重程度？',
      '爭執強度？',
      '是否可能暴力/威脅？',
    ],
    actions: [
      '傷者救護優先',
      '保持現場原狀，等待警方',
      '記錄目擊者與監視器位置',
      '避免私下承諾任何和解條件',
      '不要在情緒激動時簽署任何文件',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '不移動任何東西，拍攝全景' },
      { category: 'surveillance', tip: '附近監視器位置（盡快記錄）' },
      { category: 'collision_point', tip: '碰撞點' },
    ],
    escalationTriggers: [
      '爭執涉及暴力威脅 → 立即報警',
      '觸發人工（法律/調解）入口',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3],
  },
  {
    id: 'highway_accident',
    name: '國道事故（不論傷亡）',
    description: '發生在高速公路上的事故，車流高速，安全風險極高。',
    decisionNodes: [
      '是否能安全下車？',
      '車輛位置（車道/路肩/匝道）？',
      '天候/能見度？',
    ],
    actions: [
      '開啟雙黃燈',
      '在車後100公尺（雨霧需加距）設置警示標誌',
      '全員撤離至護欄外側',
      '撥打110或國道警察1968',
      '絕對不要站在車道上或車輛後方',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '安全位置拍攝全景' },
      { category: 'vehicle_damage', tip: '在安全前提下拍攝' },
      { category: 'plate', tip: '對方車牌' },
    ],
    escalationTriggers: [
      '強制安全指引優先，所有其他建議暫緩',
      '夜間/雨霧國道事故 → 最高級安全警示',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3, LAW_TRAFFIC_PENALTY.ART_92],
  },
  {
    id: 'expressway_accident',
    name: '快速道路/速限>60事故',
    description: '發生在快速道路或速限超過60km/h路段的事故。',
    decisionNodes: [
      '道路型態（快速道路/速限>60）？',
      '視線/天候？',
      '是否壅塞？',
    ],
    actions: [
      '在車後80公尺處（天候不佳需加距）設置警示',
      '完成拍攝再依規定移置或等待警方',
      '人員盡快遠離車道',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含道路標線、速限標誌' },
      { category: 'collision_point', tip: '碰撞點' },
      { category: 'vehicle_damage', tip: '車損' },
    ],
    escalationTriggers: [
      '強制安全優先',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3, LAW_TRAFFIC_PENALTY.ART_92],
  },
  {
    id: 'rear_end_collision',
    name: '追撞（後車撞前車）',
    description: '最常見的事故型態之一，後車撞擊前車。',
    decisionNodes: [
      '是否有人受傷？',
      '車輛是否可移動？',
      '是否有行車記錄器？',
    ],
    actions: [
      '安全處置（設警示、遠離車道）',
      '最優先保全行車記錄器原始檔案',
      '拍攝標線與車距（煞車前車距）',
      '依傷亡狀況決定是否移置',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含車距與標線' },
      { category: 'collision_point', tip: '追撞接觸部位' },
      { category: 'skid_marks', tip: '煞車痕長度與方向（重要！）' },
      { category: 'vehicle_damage', tip: '前車後方與後車前方損傷' },
    ],
    escalationTriggers: [
      '有人受傷 → 高風險流程',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3_MOVE],
  },
  {
    id: 'lane_change_sideswipe',
    name: '變換車道擦撞',
    description: '變換車道時與鄰車發生側向碰撞。',
    decisionNodes: [
      '是否有側向痕跡？',
      '是否有盲點爭議？',
      '誰在變換車道？',
    ],
    actions: [
      '拍攝輪胎痕與車道線',
      '記錄碰撞高度（判斷接觸角度）',
      '保存行車記錄器',
      '收集目擊者資訊',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含車道線與兩車位置' },
      { category: 'collision_point', tip: '側面擦撞痕跡高度' },
      { category: 'skid_marks', tip: '輪胎痕方向（判斷變道軌跡）' },
      { category: 'vehicle_damage', tip: '側面損傷部位與高度' },
    ],
    escalationTriggers: [
      '可建議後續申請鑑定（6個月內）',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3_MOVE],
  },
  {
    id: 'intersection_collision',
    name: '路口碰撞（含號誌）',
    description: '在路口發生的碰撞，可能涉及號誌號碼或路權爭議。',
    decisionNodes: [
      '是否有號誌？號誌狀態？',
      '附近是否有監視器？',
      '是否需要調閱監視器？',
    ],
    actions: [
      '記錄附近監視器位置與店家（盡快！）',
      '拍攝號誌狀態（含秒數倒數）',
      '拍攝停止線與路口標線',
      '建立事故時間線',
    ],
    evidenceFocus: [
      { category: 'signal', tip: '號誌燈號與秒數（可錄影）' },
      { category: 'surveillance', tip: '附近監視器位置（最重要！監視器影片通常30天後覆蓋）' },
      { category: 'scene_overview', tip: '路口全景含標線與停止線' },
      { category: 'collision_point', tip: '碰撞點位於路口何處' },
    ],
    escalationTriggers: [
      '監視器可能被覆蓋 → 立即提醒「盡快向警方申請調閱」',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3, LAW_ACCIDENT_HANDLING.ART_10],
  },
  {
    id: 'motorcycle_vs_car',
    name: '機車與汽車事故',
    description: '機車與汽車之間的碰撞，機車騎士受傷風險較高。',
    decisionNodes: [
      '機車騎士是否受傷？',
      '是否涉及兩段式轉彎爭議？',
      '是否在內側車道或機車專用道？',
    ],
    actions: [
      '傷者救護優先',
      '記錄車道配置與轉彎軌跡',
      '保存傷勢照片與就醫紀錄',
      '記錄安全帽/防護裝備狀態',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含車道/停止線/轉彎軌跡' },
      { category: 'collision_point', tip: '碰撞接觸部位' },
      { category: 'injury', tip: '傷勢與防護裝備狀態' },
      { category: 'vehicle_damage', tip: '機車倒地滑行痕跡' },
    ],
    escalationTriggers: [
      '涉及重傷 → 強制人工處理',
      '兩段式轉彎爭議 → 標記待查',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3],
  },
  {
    id: 'pedestrian_accident',
    name: '行人事故',
    description: '車輛撞擊行人，通常涉及較嚴重傷勢。',
    decisionNodes: [
      '行人傷勢嚴重程度？',
      '事故發生在斑馬線上/外？',
      '是否有號誌？行人號誌狀態？',
    ],
    actions: [
      '立即撥打119救護',
      '不要移動傷者（除非有立即危險）',
      '撥打110報警',
      '記錄斑馬線與行人號誌狀態',
      '尋找目擊者',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含斑馬線、行人號誌、車輛位置' },
      { category: 'collision_point', tip: '撞擊點與倒地位置' },
      { category: 'signal', tip: '行人號誌狀態' },
      { category: 'surveillance', tip: '附近監視器' },
    ],
    escalationTriggers: [
      '行人事故一律標記高風險',
      '重傷/死亡 → 強制人工處理',
    ],
    lawReferences: [LAW_ACCIDENT_HANDLING.ART_3],
  },
  {
    id: 'hit_and_run',
    name: '肇事逃逸',
    description: '對方離開現場，可能涉及刑事責任。',
    decisionNodes: [
      '是否記得對方車牌？',
      '附近是否有監視器？',
      '是否有目擊者？',
    ],
    actions: [
      '立即撥打110報警',
      '記錄對方車牌、車型、顏色、逃逸方向',
      '尋找並記錄附近所有監視器位置',
      '詢問目擊者並記錄聯絡方式',
      '若有傷勢，同時撥打119',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '逃逸方向的道路環境' },
      { category: 'surveillance', tip: '所有可能拍到逃逸車輛的監視器（最重要！）' },
      { category: 'vehicle_damage', tip: '自己車輛的損傷（可能殘留對方車漆）' },
      { category: 'debris', tip: '對方車輛掉落的碎片' },
    ],
    escalationTriggers: [
      '肇逃一律強制人工升級',
      '可向特別補償基金申請補償',
    ],
    lawReferences: [LAW_TRAFFIC_PENALTY.ART_62],
  },
  {
    id: 'dui_suspected',
    name: '疑似酒駕/毒駕',
    description: '懷疑對方或自己酒駕/毒駕。',
    decisionNodes: [
      '對方是否有酒味/異常行為？',
      '是否已報警？',
      '是否有受傷？',
    ],
    actions: [
      '立即撥打110報警',
      '等待警方到場進行酒測',
      '切勿離開現場',
      '切勿讓疑似酒駕者駕車離去',
      '記錄對方行為異常狀態',
    ],
    evidenceFocus: [
      { category: 'scene_overview', tip: '含對方車輛狀態與行駛軌跡' },
      { category: 'surveillance', tip: '監視器（可能拍到駕駛異常行為）' },
      { category: 'vehicle_damage', tip: '碰撞痕跡' },
    ],
    escalationTriggers: [
      '酒駕/毒駕一律強制人工升級',
      '涉及刑事責任',
    ],
    lawReferences: [LAW_TRAFFIC_PENALTY.ART_62],
  },
];

/**
 * Find matching scenarios based on accident characteristics
 */
export function findMatchingScenarios(input: {
  severity: string;
  roadType?: RoadType;
  hasInjuries: boolean;
  hasDeaths: boolean;
  vehicleCanDrive: boolean;
  suspectedHitAndRun: boolean;
  suspectedDUI: boolean;
  hasDispute: boolean;
  vehicleTypes: string[];
}): ScenarioGuidance[] {
  const matches: ScenarioGuidance[] = [];

  // Always check special cases first
  if (input.suspectedHitAndRun) {
    matches.push(SCENARIOS.find(s => s.id === 'hit_and_run')!);
  }
  if (input.suspectedDUI) {
    matches.push(SCENARIOS.find(s => s.id === 'dui_suspected')!);
  }

  // Road type specific
  if (input.roadType === 'highway') {
    matches.push(SCENARIOS.find(s => s.id === 'highway_accident')!);
  } else if (input.roadType === 'expressway') {
    matches.push(SCENARIOS.find(s => s.id === 'expressway_accident')!);
  }

  // Vehicle type specific
  if (input.vehicleTypes.includes('pedestrian')) {
    matches.push(SCENARIOS.find(s => s.id === 'pedestrian_accident')!);
  } else if (input.vehicleTypes.includes('motorcycle') && input.vehicleTypes.includes('car')) {
    matches.push(SCENARIOS.find(s => s.id === 'motorcycle_vs_car')!);
  }

  // Injury + dispute
  if (input.hasInjuries && input.hasDispute) {
    matches.push(SCENARIOS.find(s => s.id === 'a2_dispute')!);
  } else if (input.hasInjuries && !input.hasDispute) {
    matches.push(SCENARIOS.find(s => s.id === 'a2_both_agree_move')!);
  }

  // A3 scenarios
  if (!input.hasInjuries && !input.hasDeaths) {
    if (input.vehicleCanDrive) {
      matches.push(SCENARIOS.find(s => s.id === 'a3_minor_scratch')!);
    } else {
      matches.push(SCENARIOS.find(s => s.id === 'a3_vehicle_immobile')!);
    }
  }

  // Remove duplicates and nulls
  return [...new Map(matches.filter(Boolean).map(s => [s.id, s])).values()];
}
