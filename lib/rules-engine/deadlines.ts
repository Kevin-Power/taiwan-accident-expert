import { addDays, addMonths, addYears, differenceInCalendarDays } from 'date-fns';
import type { DeadlinesInput, Reminder, ReminderType, RuleResult } from './types';
import {
  LAW_ACCIDENT_HANDLING,
  LAW_APPRAISAL,
  LAW_COMPULSORY_INSURANCE,
} from './constants';

export interface DeadlinesResult extends RuleResult {
  reminders: Reminder[];
}

function getUrgency(daysRemaining: number): Reminder['urgency'] {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 3) return 'urgent';
  if (daysRemaining <= 14) return 'upcoming';
  return 'normal';
}

function makeReminder(
  type: ReminderType,
  dueDate: Date,
  now: Date,
  description: string,
  lawReference: Reminder['lawReference'],
): Reminder {
  const daysRemaining = differenceInCalendarDays(dueDate, now);
  return {
    type,
    dueDate,
    daysRemaining,
    urgency: getUrgency(daysRemaining),
    description,
    lawReference,
  };
}

export function calculateDeadlines(input: DeadlinesInput): DeadlinesResult {
  const { accidentDate, severity, policeArrived, appraisalReceivedDate, knowledgeOfDamageDate } = input;
  const now = new Date();
  const reminders: Reminder[] = [];

  // 7-day scene diagram and 30-day analysis report — only when police arrived
  if (policeArrived) {
    reminders.push(
      makeReminder(
        'scene_diagram_7d',
        addDays(accidentDate, 7),
        now,
        '事故發生7日後可向警察機關申請現場圖及現場照片',
        LAW_ACCIDENT_HANDLING.ART_13,
      ),
    );
    reminders.push(
      makeReminder(
        'analysis_report_30d',
        addDays(accidentDate, 30),
        now,
        '事故發生30日後可向警察機關申請道路交通事故初步分析研判表',
        LAW_ACCIDENT_HANDLING.ART_13,
      ),
    );
  }

  // 6-month appraisal deadline — always
  reminders.push(
    makeReminder(
      'appraisal_6m',
      addMonths(accidentDate, 6),
      now,
      '距肇事日期逾六個月原則不受理鑑定申請，請儘速申請',
      LAW_APPRAISAL.ART_3,
    ),
  );

  // 30-day review deadline — only when appraisal received
  if (appraisalReceivedDate) {
    reminders.push(
      makeReminder(
        'review_30d',
        addDays(appraisalReceivedDate, 30),
        now,
        '收受鑑定書翌日起30日內可申請覆議，以一次為限',
        LAW_APPRAISAL.ART_10,
      ),
    );
  }

  // Insurance prescription deadlines — A1/A2 only
  if (severity === 'A1_fatal' || severity === 'A2_injury') {
    if (knowledgeOfDamageDate) {
      reminders.push(
        makeReminder(
          'compulsory_insurance_2y',
          addYears(knowledgeOfDamageDate, 2),
          now,
          '自知有損害發生及保險人時起2年內須向強制險保險人請求給付',
          LAW_COMPULSORY_INSURANCE.ART_14,
        ),
      );
    }

    reminders.push(
      makeReminder(
        'compulsory_insurance_10y',
        addYears(accidentDate, 10),
        now,
        '自汽車交通事故發生時起逾10年強制險請求權絕對消滅',
        LAW_COMPULSORY_INSURANCE.ART_14,
      ),
    );
  }

  // Sort reminders by dueDate ascending
  reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const hasOverdue = reminders.some(r => r.urgency === 'overdue');
  const hasUrgent = reminders.some(r => r.urgency === 'urgent');

  return {
    decision: hasOverdue
      ? '部分期限已逾期，請立即確認處理狀況'
      : hasUrgent
      ? '部分期限即將到期（3日內），請儘速處理'
      : '期限提醒已計算完成',
    explanation:
      '依道路交通事故處理辦法、車輛行車事故鑑定及覆議作業辦法及強制汽車責任保險法，計算各項法定期限。',
    lawReferences: [
      LAW_ACCIDENT_HANDLING.ART_13,
      LAW_APPRAISAL.ART_3,
      LAW_APPRAISAL.ART_10,
      LAW_COMPULSORY_INSURANCE.ART_14,
    ],
    riskLevel: hasOverdue ? 'critical' : hasUrgent ? 'high' : 'low',
    nextSteps: reminders
      .filter(r => r.urgency !== 'overdue')
      .map(r => `【${r.daysRemaining}天後】${r.description}`),
    warnings: reminders
      .filter(r => r.urgency === 'overdue')
      .map(r => `【逾期${Math.abs(r.daysRemaining)}天】${r.description}`),
    escalateToHuman: hasOverdue,
    escalateReason: hasOverdue
      ? '存在已逾期之法定期限，建議諮詢律師評估補救方案'
      : undefined,
    reminders,
  };
}
