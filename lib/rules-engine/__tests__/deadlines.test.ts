import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDeadlines } from '../deadlines';
import type { DeadlinesInput } from '../types';

describe('calculateDeadlines', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-09T10:00:00+08:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates 7-day scene diagram deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only', policeArrived: true,
    });
    const sevenDay = result.reminders.find(r => r.type === 'scene_diagram_7d');
    expect(sevenDay).toBeDefined();
    expect(sevenDay!.daysRemaining).toBe(7);
  });

  it('calculates 30-day analysis report deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only', policeArrived: true,
    });
    const thirtyDay = result.reminders.find(r => r.type === 'analysis_report_30d');
    expect(thirtyDay).toBeDefined();
    expect(thirtyDay!.daysRemaining).toBe(30);
  });

  it('calculates 6-month appraisal deadline', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
    });
    const sixMonth = result.reminders.find(r => r.type === 'appraisal_6m');
    expect(sixMonth).toBeDefined();
  });

  it('calculates review deadline when appraisal received', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-01-01T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
      appraisalReceivedDate: new Date('2026-04-01T08:00:00+08:00'),
    });
    const review = result.reminders.find(r => r.type === 'review_30d');
    expect(review).toBeDefined();
    expect(review!.daysRemaining).toBeLessThanOrEqual(30);
  });

  it('does not include review deadline when no appraisal received', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
    });
    const review = result.reminders.find(r => r.type === 'review_30d');
    expect(review).toBeUndefined();
  });

  it('calculates 2-year insurance prescription', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
      knowledgeOfDamageDate: new Date('2026-04-09T08:00:00+08:00'),
    });
    const twoYear = result.reminders.find(r => r.type === 'compulsory_insurance_2y');
    expect(twoYear).toBeDefined();
  });

  it('calculates 10-year absolute insurance prescription', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
    });
    const tenYear = result.reminders.find(r => r.type === 'compulsory_insurance_10y');
    expect(tenYear).toBeDefined();
  });

  it('marks overdue reminders correctly', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2025-01-01T08:00:00+08:00'),
      severity: 'A2_injury', policeArrived: true,
    });
    const sevenDay = result.reminders.find(r => r.type === 'scene_diagram_7d');
    expect(sevenDay!.urgency).toBe('overdue');
    expect(sevenDay!.daysRemaining).toBeLessThan(0);
  });

  it('skips 7d and 30d reminders when police did not arrive', () => {
    const result = calculateDeadlines({
      accidentDate: new Date('2026-04-09T08:00:00+08:00'),
      severity: 'A3_property_only', policeArrived: false,
    });
    expect(result.reminders.find(r => r.type === 'scene_diagram_7d')).toBeUndefined();
    expect(result.reminders.find(r => r.type === 'analysis_report_30d')).toBeUndefined();
  });
});
