import { describe, it, expect } from 'bun:test';
import { detectCategory, extractAMC, parseCASText } from '../casParser';
import { SAMPLE_SCHEMES, SAMPLE_CAS_METADATA } from '../sampleCASData';

describe('casParser and Mutual Funds Logic', () => {
  it('correctly detects fund categories from scheme names', () => {
    expect(detectCategory('Parag Parikh Flexi Cap Fund - Direct Plan - Growth').category).toBe('Equity');
    expect(detectCategory('Nippon India Small Cap Fund - Growth').category).toBe('Equity');
    expect(detectCategory('Mirae Asset ELSS Tax Saver Fund - Direct Plan').category).toBe('ELSS');
    expect(detectCategory('ICICI Prudential Balanced Advantage Fund - Direct Plan').category).toBe('Hybrid');
    expect(detectCategory('SBI Liquid Fund - Regular Plan - Growth').category).toBe('Liquid');
    expect(detectCategory('HDFC Corporate Bond Fund - Direct Plan').category).toBe('Debt');
    expect(detectCategory('UTI Nifty 50 Index Fund - Direct Plan').category).toBe('Index');
  });

  it('correctly identifies AMCs from scheme names', () => {
    expect(extractAMC('Parag Parikh Flexi Cap Fund')).toBe('Parag Parikh Mutual Fund');
    expect(extractAMC('HDFC Top 100 Fund')).toBe('HDFC Mutual Fund');
    expect(extractAMC('Nippon India Small Cap Fund')).toBe('Nippon India Mutual Fund');
    expect(extractAMC('ICICI Prudential Balanced Advantage Fund')).toBe('ICICI Prudential Mutual Fund');
  });

  it('parses structured CAMS CAS text', () => {
    const rawCasText = `
Computer Age Management Services Limited
Consolidated Account Statement
Statement Period: 01-Apr-2023 to 31-Aug-2024
Alexander Bloom
PAN: AAAPB1234K
Email: a.bloom@example.com

Folio No: 12849182/91
Parag Parikh Flexi Cap Fund - Direct Plan - Growth
ISIN: INF846K01164
Closing Unit Balance: 1,420.485
NAV on 30-Aug-2024: INR 84.52
Cost Value: INR 8,50,000.00
Valuation on 30-Aug-2024: INR 12,00,593.92

Folio No: 9102847291
Nippon India Small Cap Fund - Direct Plan - Growth
ISIN: INF204K01844
Closing Unit Balance: 3,840.120
NAV on 30-Aug-2024: INR 168.40
Cost Value: INR 4,20,000.00
Valuation on 30-Aug-2024: INR 6,46,676.21
    `;

    const result = parseCASText(rawCasText, 'test_cams_cas.pdf');

    expect(result.success).toBe(true);
    expect(result.schemes.length).toBe(2);
    expect(result.metadata?.pan).toBe('AAAPB****K');
    expect(result.metadata?.investorName).toBe('Alexander Bloom');

    const fund1 = result.schemes[0];
    expect(fund1.folioNumber).toBe('12849182/91');
    expect(fund1.units).toBe(1420.485);
    expect(fund1.nav).toBe(84.52);
    expect(fund1.investedAmount).toBe(850000);
    expect(fund1.currentValue).toBe(1200594);
    expect(fund1.unrealizedGain).toBe(350594);
    expect(fund1.category).toBe('Equity');
  });

  it('sample data contains rich valid schemes', () => {
    expect(SAMPLE_SCHEMES.length).toBeGreaterThanOrEqual(6);
    expect(SAMPLE_CAS_METADATA.investorName).toBe('Alexander Bloom');

    const totalCurrent = SAMPLE_SCHEMES.reduce((acc, s) => acc + s.currentValue, 0);
    const totalInvested = SAMPLE_SCHEMES.reduce((acc, s) => acc + s.investedAmount, 0);
    expect(totalCurrent).toBeGreaterThan(totalInvested);
  });
});
