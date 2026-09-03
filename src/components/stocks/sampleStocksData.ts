import type { StockHolding, StockCASMetadata } from './StocksTypes';

export const INITIAL_STOCKS: StockHolding[] = [
  {
    id: 'stock-1',
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd.',
    isin: 'INE040A01034',
    quantity: 120,
    currentPrice: 1680,
    marketValue: 201600,
    investedValue: 182400,
    sector: 'Banking & Financials'
  },
  {
    id: 'stock-2',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries',
    isin: 'INE002A01018',
    quantity: 80,
    currentPrice: 2930,
    marketValue: 234400,
    investedValue: 192800,
    sector: 'Energy & Conglomerate'
  },
  {
    id: 'stock-3',
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services',
    isin: 'INE467B01029',
    quantity: 40,
    currentPrice: 4120,
    marketValue: 164800,
    investedValue: 154000,
    sector: 'Information Technology'
  }
];

export const DEMO_CAS_STOCKS: StockHolding[] = [
  ...INITIAL_STOCKS,
  {
    id: 'stock-4',
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    isin: 'INE009A01021',
    quantity: 150,
    currentPrice: 1820,
    marketValue: 273000,
    investedValue: 228000,
    sector: 'Information Technology'
  },
  {
    id: 'stock-5',
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd.',
    isin: 'INE090A01021',
    quantity: 200,
    currentPrice: 1240,
    marketValue: 248000,
    investedValue: 198000,
    sector: 'Banking & Financials'
  },
  {
    id: 'stock-6',
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Ltd.',
    isin: 'INE397D01024',
    quantity: 110,
    currentPrice: 1560,
    marketValue: 171600,
    investedValue: 132000,
    sector: 'Telecommunications'
  },
  {
    id: 'stock-7',
    symbol: 'LT',
    companyName: 'Larsen & Toubro Ltd.',
    isin: 'INE018A01030',
    quantity: 65,
    currentPrice: 3650,
    marketValue: 237250,
    investedValue: 188500,
    sector: 'Infrastructure & Capital Goods'
  }
];

export const DEMO_STOCK_METADATA: StockCASMetadata = {
  investorName: 'Sejal Kore',
  pan: 'ABCDE1234F',
  depository: 'CDSL',
  dematAccountId: '1208160098765432',
  statementPeriod: 'April 2025 - March 2026',
  totalMarketValue: 1530650,
  totalInvestedValue: 1275700,
  uploadedAt: new Date().toISOString()
};
