export type AssetCategory =
  | 'Real Estate'
  | 'Crypto'
  | 'Bonds'
  | 'Gold & Metals'
  | 'Alternative'
  | 'Vehicles'
  | 'Other';

export interface OtherAssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory?: string;
  acquisitionDate?: string;
  costBasis: number;
  currentValuation: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;

  // Real Estate specific fields
  location?: string;
  propertyType?: 'Residential' | 'Commercial' | 'Plot / Land' | 'REIT' | 'Other';
  rentalIncome?: number; // Monthly rental income

  // Crypto specific fields
  cryptoSymbol?: string; // e.g. "BTC", "ETH"
  cryptoQuantity?: number;
  cryptoAvgPrice?: number;
  walletPlatform?: string; // e.g. "Hardware Cold Storage", "Binance", "CoinDCX"

  // Bonds / Fixed Income specific fields
  bondCouponRate?: number; // Annual coupon rate %
  bondMaturityDate?: string;
  bondIssuer?: string;
  bondPayoutFrequency?: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Cumulative';

  // Gold & Metals specific fields
  metalWeightGrams?: number;
  metalPurity?: string; // e.g. "24K (99.9%)", "22K"

  // General notes / custodian
  custodian?: string;
  notes?: string;
}

export interface AssetFormData {
  id?: string;
  name: string;
  category: AssetCategory;
  subCategory?: string;
  acquisitionDate?: string;
  costBasis: number;
  currentValuation: number;

  location?: string;
  propertyType?: 'Residential' | 'Commercial' | 'Plot / Land' | 'REIT' | 'Other';
  rentalIncome?: number;

  cryptoSymbol?: string;
  cryptoQuantity?: number;
  cryptoAvgPrice?: number;
  walletPlatform?: string;

  bondCouponRate?: number;
  bondMaturityDate?: string;
  bondIssuer?: string;
  bondPayoutFrequency?: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Cumulative';

  metalWeightGrams?: number;
  metalPurity?: string;

  custodian?: string;
  notes?: string;
}

export type CategoryFilter = 'ALL' | AssetCategory;

export type SortOption =
  | 'VALUE_DESC'
  | 'VALUE_ASC'
  | 'GAIN_DESC'
  | 'GAIN_ASC'
  | 'GAIN_PERCENT_DESC'
  | 'NAME_ASC';
