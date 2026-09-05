import type { StockHolding, MutualFundHolding, DebtHolding, StockCASMetadata } from './StocksTypes';
import { getSampleCASData } from '../../utils/casParser';

const baseline = getSampleCASData();

export const INITIAL_STOCKS: StockHolding[] = baseline.stocks;
export const DEMO_CAS_STOCKS: StockHolding[] = baseline.stocks;
export const DEMO_CAS_MUTUAL_FUNDS: MutualFundHolding[] = baseline.mutualFunds;
export const DEMO_CAS_DEBTS: DebtHolding[] = baseline.debts;
export const DEMO_STOCK_METADATA: StockCASMetadata = baseline.metadata;

