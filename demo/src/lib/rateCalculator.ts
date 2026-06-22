import { UWParams, TierRates } from './types';

export function calculateMultiplier(uw: UWParams): number {
  return uw.bucket * uw.af * (1 + uw.comm) * uw.rf;
}

export function calculateBilledRates(base: TierRates, uw: UWParams): TierRates {
  const mult = calculateMultiplier(uw);
  return {
    eo: Number((base.eo * mult).toFixed(2)),
    es: Number((base.es * mult).toFixed(2)),
    ec: Number((base.ec * mult).toFixed(2)),
    ef: Number((base.ef * mult).toFixed(2)),
  };
}

export function calculateContribution(billed: number, erPct: number): { er: number; ee: number } {
  const er = Number((billed * erPct / 100).toFixed(2));
  const ee = Number((billed - er).toFixed(2));
  return { er, ee };
}

export function calculatePPD(eeMonthly: number, annualDeductions: number = 24): number {
  return Number((eeMonthly * 12 / annualDeductions).toFixed(2));
}
