import { describe, it, expect } from 'vitest';
import { determineVehicleMove } from '../vehicle-move';
import type { VehicleMoveInput } from '../types';

describe('determineVehicleMove', () => {
  it('must move when no injury and vehicle can drive', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_move');
    expect(result.warnings.some(w => w.includes('罰'))).toBe(true);
  });

  it('may move when injury but both agree', () => {
    const result = determineVehicleMove({
      hasInjuries: true, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.moveDecision).toBe('may_move');
  });

  it('must not move when injury and parties disagree', () => {
    const result = determineVehicleMove({
      hasInjuries: true, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: false, roadType: 'general', hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_not_move');
  });

  it('must not move when there is a dispute', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: false, roadType: 'general', hasDispute: true,
    });
    expect(result.moveDecision).toBe('must_not_move');
  });

  it('wait for tow when vehicle cannot drive', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: false, vehicleCanDrive: false,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.moveDecision).toBe('wait_for_tow');
  });

  it('must not move for fatal accidents', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: true, vehicleCanDrive: true,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.moveDecision).toBe('must_not_move');
    expect(result.escalateToHuman).toBe(true);
  });

  it('always includes steps to mark and photograph before moving', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.nextSteps.some(s => s.includes('標繪') || s.includes('拍照'))).toBe(true);
  });

  it('includes law references', () => {
    const result = determineVehicleMove({
      hasInjuries: false, hasDeaths: false, vehicleCanDrive: true,
      bothPartiesAgreeToMove: true, roadType: 'general', hasDispute: false,
    });
    expect(result.lawReferences.length).toBeGreaterThan(0);
  });
});
