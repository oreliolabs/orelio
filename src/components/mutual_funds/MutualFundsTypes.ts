export type MutualFundCategory = 'Equity' | 'Debt' | 'Hybrid' | 'ELSS' | 'Liquid' | 'Index' | 'Other';

export interface FundTransaction {
  id: string;
  date: string;
  type: 'PURCHASE' | 'SIP' | 'REDEMPTION' | 'SWITCH_IN' | 'SWITCH_OUT' | 'DIVIDEND' | 'OTHER';
  amount: number;
  units: number;
  nav: number;
  unitBalance: number;
}

export interface MutualFundScheme {
  id: string;
  schemeName: string;
  amc: string;
  folioNumber: string;
  category: MutualFundCategory;
  subCategory?: string;
  isin?: string;
  units: number;
  nav: number;
  navDate: string;
  investedAmount: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  sipAmount?: number;
  sipActive?: boolean;
  advisor?: string;
  planType?: 'Direct' | 'Regular';
  dividendOption?: 'Growth' | 'IDCW';
  transactions?: FundTransaction[];
}

export interface CASStatementMetadata {
  investorName: string;
  email?: string;
  mobile?: string;
  pan?: string;
  statementPeriod: string;
  casType: 'CAMS' | 'KFintech' | 'CDSL' | 'NSDL' | 'MFCentral' | 'Manual';
  uploadedAt: string;
  fileName: string;
  totalFolios: number;
  totalSchemes: number;
}

export interface FundFormData {
  id?: string;
  schemeName: string;
  amc: string;
  folioNumber: string;
  category: MutualFundCategory;
  subCategory?: string;
  isin?: string;
  units: number;
  nav: number;
  navDate?: string;
  investedAmount: number;
  sipAmount?: number;
  sipActive?: boolean;
  planType?: 'Direct' | 'Regular';
  dividendOption?: 'Growth' | 'IDCW';
}

export type CategoryFilter = 'ALL' | MutualFundCategory;

export type SortOption =
  | 'VALUE_DESC'
  | 'VALUE_ASC'
  | 'GAIN_DESC'
  | 'GAIN_ASC'
  | 'GAIN_PERCENT_DESC'
  | 'NAME_ASC';
