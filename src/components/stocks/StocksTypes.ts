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
}

export interface StockCASMetadata {
  investorName: string;
  pan: string;
  depository: 'CDSL' | 'NSDL' | 'CAMS' | 'KFintech';
  dematAccountId?: string;
  statementPeriod: string;
  totalMarketValue?: number;
  totalInvestedValue: number;
  uploadedAt: string;
}
