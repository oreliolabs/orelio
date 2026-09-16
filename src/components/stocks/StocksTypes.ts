export type AssetType = 'EQUITY' | 'MUTUAL_FUND' | 'DEBT';

export interface StockHolding {
  id: string;
  symbol: string;
  companyName: string;
  isin?: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
  investedValue: number;
  sector?: string;
  dematAccount?: string; // e.g. 'Groww', 'Zerodha'
  assetType?: 'EQUITY';
  memberId?: string;
}

export interface MutualFundHolding {
  id: string;
  schemeName: string;
  amc?: string;
  isin: string;
  folioNumber?: string;
  units: number;
  nav: number;
  marketValue: number;
  investedValue?: number;
  category?: string; // e.g. 'Index Fund', 'Mid Cap Fund', 'ETF'
  dematAccount?: string; // e.g. 'Zerodha'
  assetType?: 'MUTUAL_FUND';
  memberId?: string;
}

export interface DebtHolding {
  id: string;
  issuer: string;
  isin: string;
  quantity: number;
  faceValue: number;
  marketPrice: number;
  marketValue: number;
  interestRate?: string;
  maturityDate?: string;
  dematAccount?: string; // e.g. 'Fourdegreewater'
  assetType?: 'DEBT';
  memberId?: string;
}

export interface DematAccountSummary {
  dpName: string;
  dpId: string;
  clientId: string;
  boId?: string;
  depository: 'CDSL' | 'NSDL';
  isinCount: number;
  totalValue: number;
  nominees?: string[];
  status?: string;
}

export interface StockCASMetadata {
  investorName: string;
  pan: string;
  casId?: string;
  depository: 'CDSL' | 'NSDL' | 'CAMS' | 'KFintech';
  dematAccountId?: string;
  statementPeriod: string;
  totalMarketValue?: number;
  totalInvestedValue: number;
  equityValue?: number;
  mutualFundsValue?: number;
  debtsValue?: number;
  dematAccounts?: DematAccountSummary[];
  uploadedAt: string;
  memberId?: string;
}

export interface ParsedCASResult {
  metadata: StockCASMetadata;
  stocks: StockHolding[];
  mutualFunds: MutualFundHolding[];
  debts: DebtHolding[];
  allHoldings: (StockHolding | MutualFundHolding | DebtHolding)[];
}
