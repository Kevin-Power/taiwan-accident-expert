import type { EvidenceChecklistInput, EvidenceItem, RuleResult } from './types';
import { LAW_ACCIDENT_HANDLING } from './constants';

export interface EvidenceChecklistResult extends RuleResult {
  items: EvidenceItem[];
}

export function generateEvidenceChecklist(input: EvidenceChecklistInput): EvidenceChecklistResult {
  const {
    hasTrafficSignal,
    hasSurveillance,
    hasDashcam,
    hasSkidMarks,
    weather,
    isNight,
    hasInjuries,
  } = input;

  // Base items — always included (priority 1–5)
  const items: EvidenceItem[] = [
    {
      category: 'scene_overview',
      description: '事故現場全景照片',
      priority: 1,
      tips: '站在可涵蓋整個事故現場的位置拍攝，包含道路標線、周邊環境與車輛位置。',
      required: true,
    },
    {
      category: 'collision_point',
      description: '碰撞點特寫照片',
      priority: 2,
      tips: '拍攝兩車碰撞接觸點的近距離照片，確保清楚呈現接觸位置與受損情況。',
      required: true,
    },
    {
      category: 'debris',
      description: '散落物與地面痕跡',
      priority: 3,
      tips: '拍攝車輛碎片、玻璃、油漬等散落物，有助於還原碰撞位置與力道。',
      required: true,
    },
    {
      category: 'plate',
      description: '各車牌照清楚拍攝',
      priority: 4,
      tips: '確保每輛車的車牌均清晰可辨識，包含前後車牌。',
      required: true,
    },
    {
      category: 'vehicle_damage',
      description: '車輛損壞情況照片',
      priority: 5,
      tips: '從多個角度拍攝每輛車的損壞部位，包含遠景與特寫。',
      required: true,
    },
  ];

  // Conditional items — priority 6 onwards
  if (hasTrafficSignal) {
    items.push({
      category: 'signal',
      description: '交通號誌狀態拍攝',
      priority: 6,
      tips: '拍攝事故地點附近的紅綠燈、號誌燈現況，若有行車記錄器更可輔助確認號誌顯示。',
      required: false,
    });
  }

  if (hasSurveillance) {
    items.push({
      category: 'surveillance',
      description: '周邊監視器位置記錄',
      priority: 7,
      tips: '拍下附近監視器的位置，並儘快向管理單位申請調閱錄影，避免錄影遭覆蓋（通常保存7–30天）。',
      required: false,
    });
  }

  if (hasSkidMarks) {
    items.push({
      category: 'skid_marks',
      description: '煞車痕跡拍攝與量測',
      priority: 8,
      tips: '拍攝輪胎煞車痕並記錄長度，可協助判斷車輛速度。建議放置比例尺或以硬幣輔助標示。',
      required: false,
    });
  }

  if (hasInjuries) {
    items.push({
      category: 'injury',
      description: '傷者傷勢照片（需取得同意）',
      priority: 9,
      tips: '拍攝傷勢前應取得當事人同意，注意個人資料保護。傷勢照片應於就醫前後均留存，以利後續求償。',
      required: false,
    });
  }

  // Sort by priority (ascending)
  items.sort((a, b) => a.priority - b.priority);

  // Warnings
  const warnings: string[] = [];

  if (weather === 'rain') {
    warnings.push('路面積水可能影響制動距離，拍照時注意積水痕跡有助判斷行車狀況。');
  }

  if (isNight) {
    warnings.push('夜間光線不足，拍照時請開啟閃光燈或使用手電筒補光，確保照片清晰。');
  }

  if (hasDashcam) {
    warnings.push('行車記錄器影片請立即備份至手機或其他裝置，避免記憶卡遭覆蓋或設備損壞導致影像遺失。');
  }

  warnings.push('所有原始照片與影片請保存原檔，勿裁切或修圖，以維持證據效力。');

  return {
    decision: `共 ${items.length} 項蒐證項目`,
    explanation: '依據道路交通事故處理辦法第3條及第10條，事故發生後應妥善保全現場跡證。以下為建議蒐集之證據清單，請依優先順序逐項完成。',
    lawReferences: [
      LAW_ACCIDENT_HANDLING.ART_3,
      LAW_ACCIDENT_HANDLING.ART_10,
    ],
    riskLevel: hasInjuries ? 'high' : 'medium',
    nextSteps: [
      '依清單優先順序拍攝現場照片',
      '備份行車記錄器影片（若有）',
      '記錄目擊者聯絡資訊',
      '等待警方製作現場圖及調查',
    ],
    warnings,
    escalateToHuman: false,
    items,
  };
}
