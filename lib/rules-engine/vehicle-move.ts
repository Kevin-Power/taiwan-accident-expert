import type { VehicleMoveInput, VehicleMoveDecision, RuleResult } from './types';
import { LAW_ACCIDENT_HANDLING, LAW_TRAFFIC_PENALTY } from './constants';

export interface VehicleMoveResult extends RuleResult {
  moveDecision: VehicleMoveDecision;
}

/**
 * Decision tree (priority order):
 * 1. Death present         → must_not_move + critical + escalate
 * 2. Vehicle cannot drive  → wait_for_tow
 * 3. Dispute present       → must_not_move
 * 4. Injury + both agree   → may_move
 * 5. Injury + disagree     → must_not_move
 * 6. No injury, can drive, no dispute → must_move (penalty warning if not moved)
 */
export function determineVehicleMove(input: VehicleMoveInput): VehicleMoveResult {
  const { hasDeaths, hasInjuries, vehicleCanDrive, bothPartiesAgreeToMove, hasDispute } = input;

  // Base law references always included
  const baseLawReferences = [
    LAW_ACCIDENT_HANDLING.ART_3_MOVE,
    LAW_ACCIDENT_HANDLING.ART_4,
  ];

  // Steps that always apply: mark position and photograph before any move
  const markAndPhotoSteps = [
    '移車前須先以粉筆、三角錐或其他方式標繪車輛位置及輪胎痕跡',
    '以手機或相機拍照記錄現場：車輛位置、碰撞點、殘骸散落情形、車牌號碼',
  ];

  // --- Branch 1: Fatal accident ---
  if (hasDeaths) {
    return {
      moveDecision: 'must_not_move',
      decision: 'must_not_move',
      explanation: '事故造成人員死亡，屬A1類重大事故，現場必須完整保留，絕對不得移動車輛，等候警方鑑識人員到場。',
      riskLevel: 'critical',
      escalateToHuman: true,
      escalateReason: '死亡事故，需由警方主導現場保全及鑑識，請立即撥打110報警並等候指示。',
      lawReferences: [
        LAW_ACCIDENT_HANDLING.ART_3_MOVE,
        LAW_ACCIDENT_HANDLING.ART_4,
      ],
      nextSteps: [
        '立即撥打110報警，並告知有人員死亡',
        '撥打119請求緊急救護',
        '保持現場原狀，禁止任何人移動車輛或現場物品',
        '在安全距離處放置警告標誌，避免二次事故',
        markAndPhotoSteps[1], // 仍應拍照保存證據
      ],
      warnings: [
        '死亡事故現場保全至關重要，移動任何物品均可能影響後續鑑定結果',
        '請勿擅自離開現場，等候警方指示',
      ],
    };
  }

  // --- Branch 2: Vehicle cannot drive ---
  if (!vehicleCanDrive) {
    return {
      moveDecision: 'wait_for_tow',
      decision: 'wait_for_tow',
      explanation: '車輛無法自行行駛，須等候拖吊車到場後方能移置。移置前務必完成標繪及拍照作業。',
      riskLevel: hasInjuries ? 'high' : 'medium',
      escalateToHuman: false,
      lawReferences: baseLawReferences,
      nextSteps: [
        ...markAndPhotoSteps,
        '聯絡拖吊業者或請警方協助安排拖吊',
        '在車輛後方適當距離處放置警告標誌，防止後方來車追撞',
        hasInjuries ? '確認傷者狀況，已撥打119緊急救護' : '通知保險公司及相關單位',
      ],
      warnings: [
        '車輛無法移動期間，請開啟危險警示燈，並在安全距離設置警告標誌',
      ],
    };
  }

  // --- Branch 3: Dispute present (no injury, but dispute) ---
  if (hasDispute && !hasInjuries) {
    return {
      moveDecision: 'must_not_move',
      decision: 'must_not_move',
      explanation: '雙方當事人對事故責任有爭議，現場須保留供警方判斷，不得擅自移動車輛。',
      riskLevel: 'medium',
      escalateToHuman: false,
      lawReferences: baseLawReferences,
      nextSteps: [
        ...markAndPhotoSteps,
        '撥打110報警，請警方到場處理及製作筆錄',
        '保持冷靜，不要與對方爭執，等候警方仲裁',
        '記錄對方車牌、聯絡方式及保險資訊',
      ],
      warnings: [
        '有爭議時切勿擅自移動車輛，否則可能喪失現場保全的優勢',
      ],
    };
  }

  // --- Branch 4: Injury + both agree to move ---
  if (hasInjuries && bothPartiesAgreeToMove) {
    return {
      moveDecision: 'may_move',
      decision: 'may_move',
      explanation: '事故有人受傷，但雙方當事人均同意移車。依法完成標繪及拍照後，可將車輛移置不妨礙交通之處所。',
      riskLevel: 'high',
      escalateToHuman: false,
      lawReferences: [
        LAW_ACCIDENT_HANDLING.ART_3_MOVE,
        LAW_ACCIDENT_HANDLING.ART_4,
      ],
      nextSteps: [
        '確認傷者狀況，已撥打119緊急救護（如尚未撥打）',
        ...markAndPhotoSteps,
        '雙方確認同意後，將車輛移置路邊不妨礙交通之處',
        '撥打110報警，請警方到場製作事故報告',
        '記錄雙方同意移車之時間及情況',
      ],
      warnings: [
        '移車前須取得雙方明確同意，並確實完成現場標繪及拍照，否則可能影響事後責任認定',
        '傷者救護為第一優先，確保119已通報',
      ],
    };
  }

  // --- Branch 5: Injury + disagree ---
  if (hasInjuries && !bothPartiesAgreeToMove) {
    return {
      moveDecision: 'must_not_move',
      decision: 'must_not_move',
      explanation: '事故有人受傷，且當事人未達成移車共識，依法不得移動車輛，應保留現場等候警方處理。',
      riskLevel: 'high',
      escalateToHuman: false,
      lawReferences: baseLawReferences,
      nextSteps: [
        '優先確認傷者狀況，撥打119緊急救護',
        ...markAndPhotoSteps,
        '撥打110報警，等候警方到場處理',
        '在安全距離處放置警告標誌，避免二次事故',
        '記錄對方資訊：車牌、駕照、保險資料',
      ],
      warnings: [
        '有人受傷且未取得雙方同意時，移動車輛可能影響事故責任認定，請勿擅自移車',
      ],
    };
  }

  // --- Branch 6: No injury, can drive, no dispute → must_move ---
  return {
    moveDecision: 'must_move',
    decision: 'must_move',
    explanation: '無人傷亡且車輛可自行行駛，依法應儘速完成標繪及拍照後將車輛移置不妨礙交通之處所，否則將面臨罰鍰。',
    riskLevel: 'low',
    escalateToHuman: false,
    lawReferences: [
      LAW_ACCIDENT_HANDLING.ART_3_MOVE,
      LAW_ACCIDENT_HANDLING.ART_4,
      LAW_TRAFFIC_PENALTY.ART_62_MOVE_PENALTY,
    ],
    nextSteps: [
      ...markAndPhotoSteps,
      '完成標繪及拍照後，將車輛移置路邊不妨礙交通之處',
      '與對方交換聯絡方式、車牌號碼及保險資訊',
      '如有必要，向警察局申請道路交通事故當事人登記聯單',
    ],
    warnings: [
      '無人傷亡時若未儘速移車致妨礙交通，依道路交通管理處罰條例第62條第2項，可處600元以上1,800元以下罰鍰',
      '移車前務必先完成標繪及拍照，否則將失去現場證據',
    ],
  };
}
