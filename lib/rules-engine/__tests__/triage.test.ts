import { describe, it, expect } from 'vitest';
import { triageAccident } from '../triage';
import type { TriageInput } from '../types';

const baseInput: TriageInput = {
  hasDeaths: false, hasInjuries: false, vehicleCount: 2, hasFire: false,
  hasHazmat: false, suspectedDUI: false, suspectedHitAndRun: false,
  hasMinor: false, hasForeignNational: false,
};

describe('triageAccident', () => {
  it('classifies A3 for property-only accidents', () => {
    const result = triageAccident(baseInput);
    expect(result.severity).toBe('A3_property_only');
    expect(result.riskLevel).toBe('low');
    expect(result.escalateToHuman).toBe(false);
  });

  it('classifies A2 for injury accidents', () => {
    const result = triageAccident({ ...baseInput, hasInjuries: true });
    expect(result.severity).toBe('A2_injury');
    expect(result.riskLevel).toBe('high');
    expect(result.escalateToHuman).toBe(true);
  });

  it('classifies A1 for fatal accidents', () => {
    const result = triageAccident({ ...baseInput, hasDeaths: true });
    expect(result.severity).toBe('A1_fatal');
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.escalateReason).toBeDefined();
  });

  it('escalates for suspected DUI regardless of injuries', () => {
    const result = triageAccident({ ...baseInput, suspectedDUI: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('dui');
  });

  it('escalates for suspected hit-and-run', () => {
    const result = triageAccident({ ...baseInput, suspectedHitAndRun: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('hit_and_run');
  });

  it('escalates for hazmat', () => {
    const result = triageAccident({ ...baseInput, hasHazmat: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('hazmat');
  });

  it('escalates for fire', () => {
    const result = triageAccident({ ...baseInput, hasFire: true });
    expect(result.riskLevel).toBe('critical');
    expect(result.escalateToHuman).toBe(true);
    expect(result.riskFlags).toContain('fire');
  });

  it('flags minor involvement', () => {
    const result = triageAccident({ ...baseInput, hasMinor: true });
    expect(result.riskFlags).toContain('minor');
  });

  it('flags foreign national involvement', () => {
    const result = triageAccident({ ...baseInput, hasForeignNational: true });
    expect(result.riskFlags).toContain('foreign_national');
  });

  it('includes law references', () => {
    const result = triageAccident(baseInput);
    expect(result.lawReferences.length).toBeGreaterThan(0);
  });
});
