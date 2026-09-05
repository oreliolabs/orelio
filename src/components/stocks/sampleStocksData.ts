import type { StockHolding, MutualFundHolding, DebtHolding, StockCASMetadata } from './StocksTypes';

export const INITIAL_STOCKS: StockHolding[] = [];
export const DEMO_CAS_STOCKS: StockHolding[] = [];
export const DEMO_CAS_MUTUAL_FUNDS: MutualFundHolding[] = [];
export const DEMO_CAS_DEBTS: DebtHolding[] = [];
export const DEMO_STOCK_METADATA: StockCASMetadata = {
  investorName: 'Demo User',
  pan: 'ABCDE1234F',
  depository: 'CDSL',
  statementPeriod: 'Current Period',
  totalMarketValue: 0,
  totalInvestedValue: 0,
  equityValue: 0,
  mutualFundsValue: 0,
  debtsValue: 0,
  uploadedAt: new Date().toISOString()
};

