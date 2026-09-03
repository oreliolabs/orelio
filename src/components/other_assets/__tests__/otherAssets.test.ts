import { describe, it, expect } from 'bun:test';
import { SAMPLE_OTHER_ASSETS } from '../sampleOtherAssets';
import type { OtherAssetItem } from '../OtherAssetsTypes';

describe('Other Assets Portfolio Calculations', () => {
  it('sample assets contain rich valid multi-asset items', () => {
    expect(SAMPLE_OTHER_ASSETS.length).toBeGreaterThanOrEqual(7);

    const categories = new Set(SAMPLE_OTHER_ASSETS.map((a) => a.category));
    expect(categories.has('Real Estate')).toBe(true);
    expect(categories.has('Crypto')).toBe(true);
    expect(categories.has('Bonds')).toBe(true);
    expect(categories.has('Gold & Metals')).toBe(true);
    expect(categories.has('Alternative')).toBe(true);
  });

  it('calculates total portfolio valuation and appreciation correctly', () => {
    const totalValuation = SAMPLE_OTHER_ASSETS.reduce((sum, a) => sum + a.currentValuation, 0);
    const totalCost = SAMPLE_OTHER_ASSETS.reduce((sum, a) => sum + a.costBasis, 0);
    const totalGain = totalValuation - totalCost;

    expect(totalValuation).toBeGreaterThan(totalCost);
    expect(totalGain).toBeGreaterThan(0);

    // Each asset unrealized gain calculation test
    SAMPLE_OTHER_ASSETS.forEach((asset: OtherAssetItem) => {
      const expectedGain = asset.currentValuation - asset.costBasis;
      expect(asset.unrealizedGain).toBe(expectedGain);

      const expectedGainPercent = Number(((expectedGain / asset.costBasis) * 100).toFixed(2));
      expect(asset.unrealizedGainPercent).toBeCloseTo(expectedGainPercent, 1);
    });
  });

  it('aggregates passive cashflow yield from rental income and bond coupons', () => {
    let monthlyRental = 0;
    let annualCoupons = 0;

    SAMPLE_OTHER_ASSETS.forEach((asset: OtherAssetItem) => {
      if (asset.rentalIncome) {
        monthlyRental += asset.rentalIncome;
      }
      if (asset.bondCouponRate) {
        annualCoupons += (asset.currentValuation * asset.bondCouponRate) / 100;
      }
    });

    const totalMonthlyCashflow = monthlyRental + Math.round(annualCoupons / 12);
    expect(monthlyRental).toBe(85000 + 95000); // 1,80,000
    expect(totalMonthlyCashflow).toBeGreaterThan(180000);
  });
});
