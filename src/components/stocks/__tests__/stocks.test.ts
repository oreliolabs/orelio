import { describe, it, expect } from 'bun:test';
import { INITIAL_STOCKS, DEMO_CAS_STOCKS, DEMO_STOCK_METADATA } from '../sampleStocksData';
import type { StockHolding } from '../StocksTypes';

describe('Stocks & Mutual Funds Calculations', () => {
  it('loads valid initial stock holdings', () => {
    expect(INITIAL_STOCKS.length).toBe(3);
    const hdfc = INITIAL_STOCKS.find((s) => s.symbol === 'HDFCBANK');
    expect(hdfc).toBeDefined();
    expect(hdfc?.quantity).toBe(120);
    expect(hdfc?.currentPrice).toBe(1680);
    expect(hdfc?.marketValue).toBe(201600);
  });

  it('calculates portfolio market value and invested capital correctly', () => {
    const totalMarketValue = DEMO_CAS_STOCKS.reduce((sum, s: StockHolding) => sum + s.marketValue, 0);
    const totalInvested = DEMO_CAS_STOCKS.reduce((sum, s: StockHolding) => sum + s.investedValue, 0);

    expect(totalMarketValue).toBeGreaterThan(totalInvested);
    const returnPct = ((totalMarketValue - totalInvested) / totalInvested) * 100;
    expect(returnPct).toBeGreaterThan(0);
  });

  it('has valid demat statement demo metadata', () => {
    expect(DEMO_STOCK_METADATA.depository).toBe('CDSL');
    expect(DEMO_STOCK_METADATA.pan).toBe('ABCDE1234F');
    expect(DEMO_STOCK_METADATA.totalMarketValue).toBeGreaterThan(0);
  });
});
