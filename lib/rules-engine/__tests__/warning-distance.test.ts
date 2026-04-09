import { describe, it, expect } from 'vitest';
import { calculateWarningDistance } from '../warning-distance';

describe('calculateWarningDistance', () => {
  it('returns 100m for highway', () => {
    const result = calculateWarningDistance({ roadType: 'highway', speedLimit: 110, weather: 'clear' });
    expect(result.decision).toBe('100');
    expect(result.riskLevel).toBe('high');
    expect(result.lawReferences.length).toBeGreaterThan(0);
    expect(result.escalateToHuman).toBe(false);
  });

  it('returns 80m for expressway', () => {
    const result = calculateWarningDistance({ roadType: 'expressway', speedLimit: 80, weather: 'clear' });
    expect(result.decision).toBe('80');
  });

  it('returns 80m for general road with speed limit > 60', () => {
    const result = calculateWarningDistance({ roadType: 'general', speedLimit: 70, weather: 'clear' });
    expect(result.decision).toBe('80');
  });

  it('returns 50m for speed limit 50-60', () => {
    const result = calculateWarningDistance({ roadType: 'general', speedLimit: 50, weather: 'clear' });
    expect(result.decision).toBe('50');
  });

  it('returns 30m for speed limit <= 50 on alley', () => {
    const result = calculateWarningDistance({ roadType: 'alley', speedLimit: 30, weather: 'clear' });
    expect(result.decision).toBe('30');
  });

  it('adds extra distance warning for rain', () => {
    const result = calculateWarningDistance({ roadType: 'general', speedLimit: 50, weather: 'rain' });
    expect(result.decision).toBe('50');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('增加');
  });

  it('adds extra distance warning for fog', () => {
    const result = calculateWarningDistance({ roadType: 'highway', speedLimit: 110, weather: 'fog' });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('adds extra distance warning for night', () => {
    const result = calculateWarningDistance({ roadType: 'general', speedLimit: 60, weather: 'night' });
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
