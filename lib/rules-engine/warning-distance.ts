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
