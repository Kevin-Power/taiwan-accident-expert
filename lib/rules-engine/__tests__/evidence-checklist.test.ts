import { describe, it, expect } from 'vitest';
import { generateEvidenceChecklist } from '../evidence-checklist';
import type { EvidenceChecklistInput } from '../types';

const baseInput: EvidenceChecklistInput = {
  roadType: 'general', vehicleTypes: ['car', 'car'], hasTrafficSignal: true,
  hasSurveillance: false, hasDashcam: true, hasSkidMarks: false,
  weather: 'clear', isNight: false, hasInjuries: false,
};

describe('generateEvidenceChecklist', () => {
  it('includes base checklist items for all accidents', () => {
    const result = generateEvidenceChecklist(baseInput);
    const categories = result.items.map(i => i.category);
    expect(categories).toContain('scene_overview');
    expect(categories).toContain('collision_point');
    expect(categories).toContain('plate');
    expect(categories).toContain('vehicle_damage');
  });

  it('includes signal item when traffic signal present', () => {
    const result = generateEvidenceChecklist(baseInput);
    expect(result.items.some(i => i.category === 'signal')).toBe(true);
  });

  it('excludes signal item when no traffic signal', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasTrafficSignal: false });
    expect(result.items.some(i => i.category === 'signal')).toBe(false);
  });

  it('includes surveillance item when surveillance present', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasSurveillance: true });
    expect(result.items.some(i => i.category === 'surveillance')).toBe(true);
  });

  it('includes skid marks when present', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasSkidMarks: true });
    expect(result.items.some(i => i.category === 'skid_marks')).toBe(true);
  });

  it('includes injury photos when injuries exist', () => {
    const result = generateEvidenceChecklist({ ...baseInput, hasInjuries: true });
    expect(result.items.some(i => i.category === 'injury')).toBe(true);
  });

  it('adds dashcam reminder when dashcam present', () => {
    const result = generateEvidenceChecklist(baseInput);
    expect(result.warnings.some(w => w.includes('行車記錄器'))).toBe(true);
  });

  it('items are sorted by priority', () => {
    const result = generateEvidenceChecklist({
      ...baseInput, hasSkidMarks: true, hasSurveillance: true, hasInjuries: true,
    });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].priority).toBeGreaterThanOrEqual(result.items[i - 1].priority);
    }
  });
});
