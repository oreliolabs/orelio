import type { MutualFundScheme, CASStatementMetadata } from './MutualFundsTypes';

export const SAMPLE_CAS_METADATA: CASStatementMetadata = {
  investorName: 'Alexander Bloom',
  email: 'a.bloom@oreliocorp.com',
  mobile: '+91 98200 *****',
  pan: 'AAAPB****K',
  statementPeriod: '01-Apr-2022 to 31-Aug-2024',
  casType: 'CAMS',
  uploadedAt: new Date().toISOString(),
  fileName: 'CAMS_Consolidated_Account_Statement.pdf',
  totalFolios: 5,
  totalSchemes: 6
};

export const SAMPLE_SCHEMES: MutualFundScheme[] = [
  {
    id: 'mf-1',
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    amc: 'PPFAS Mutual Fund',
    folioNumber: '12849182/91',
    category: 'Equity',
    subCategory: 'Flexi Cap',
    isin: 'INF846K01164',
    units: 1420.485,
    nav: 84.52,
    navDate: '30-Aug-2024',
    investedAmount: 850000,
    currentValue: 1200593.92,
    unrealizedGain: 350593.92,
    unrealizedGainPercent: 41.25,
    sipAmount: 15000,
    sipActive: true,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-1-1',
        date: '10-Aug-2024',
        type: 'SIP',
        amount: 15000,
        units: 177.47,
        nav: 84.52,
        unitBalance: 1420.485
      },
      {
        id: 'tx-1-2',
        date: '10-Jul-2024',
        type: 'SIP',
        amount: 15000,
        units: 181.16,
        nav: 82.80,
        unitBalance: 1243.015
      },
      {
        id: 'tx-1-3',
        date: '10-Jun-2024',
        type: 'SIP',
        amount: 15000,
        units: 187.97,
        nav: 79.80,
        unitBalance: 1061.855
      },
      {
        id: 'tx-1-4',
        date: '15-May-2023',
        type: 'PURCHASE',
        amount: 400000,
        units: 615.38,
        nav: 65.00,
        unitBalance: 873.885
      }
    ]
  },
  {
    id: 'mf-2',
    schemeName: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    amc: 'Nippon India Mutual Fund',
    folioNumber: '9102847291',
    category: 'Equity',
    subCategory: 'Small Cap',
    isin: 'INF204K01844',
    units: 3840.120,
    nav: 168.40,
    navDate: '30-Aug-2024',
    investedAmount: 420000,
    currentValue: 646676.21,
    unrealizedGain: 226676.21,
    unrealizedGainPercent: 53.97,
    sipAmount: 10000,
    sipActive: true,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-2-1',
        date: '05-Aug-2024',
        type: 'SIP',
        amount: 10000,
        units: 59.38,
        nav: 168.40,
        unitBalance: 3840.120
      },
      {
        id: 'tx-2-2',
        date: '05-Jul-2024',
        type: 'SIP',
        amount: 10000,
        units: 61.73,
        nav: 162.00,
        unitBalance: 3780.740
      }
    ]
  },
  {
    id: 'mf-3',
    schemeName: 'HDFC Top 100 Fund - Direct Plan - Growth',
    amc: 'HDFC Mutual Fund',
    folioNumber: '29481028/44',
    category: 'Equity',
    subCategory: 'Large Cap',
    isin: 'INF179K01BE2',
    units: 512.600,
    nav: 1050.25,
    navDate: '30-Aug-2024',
    investedAmount: 400000,
    currentValue: 538358.15,
    unrealizedGain: 138358.15,
    unrealizedGainPercent: 34.59,
    sipAmount: 5000,
    sipActive: true,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-3-1',
        date: '12-Aug-2024',
        type: 'SIP',
        amount: 5000,
        units: 4.76,
        nav: 1050.25,
        unitBalance: 512.600
      }
    ]
  },
  {
    id: 'mf-4',
    schemeName: 'ICICI Prudential Balanced Advantage Fund - Direct Plan - Growth',
    amc: 'ICICI Prudential Mutual Fund',
    folioNumber: '7729104819',
    category: 'Hybrid',
    subCategory: 'Dynamic Asset Allocation',
    isin: 'INF109K01Z48',
    units: 6510.220,
    nav: 74.80,
    navDate: '30-Aug-2024',
    investedAmount: 400000,
    currentValue: 486964.46,
    unrealizedGain: 86964.46,
    unrealizedGainPercent: 21.74,
    sipAmount: 5000,
    sipActive: true,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-4-1',
        date: '18-Aug-2024',
        type: 'SIP',
        amount: 5000,
        units: 66.84,
        nav: 74.80,
        unitBalance: 6510.220
      }
    ]
  },
  {
    id: 'mf-5',
    schemeName: 'Mirae Asset ELSS Tax Saver Fund - Direct Plan - Growth',
    amc: 'Mirae Asset Mutual Fund',
    folioNumber: '8829104812',
    category: 'ELSS',
    subCategory: 'Tax Saver ELSS',
    isin: 'INF769K01DF8',
    units: 2450.800,
    nav: 52.18,
    navDate: '30-Aug-2024',
    investedAmount: 100000,
    currentValue: 127882.74,
    unrealizedGain: 27882.74,
    unrealizedGainPercent: 27.88,
    sipAmount: 0,
    sipActive: false,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-5-1',
        date: '28-Mar-2023',
        type: 'PURCHASE',
        amount: 100000,
        units: 2450.800,
        nav: 40.80,
        unitBalance: 2450.800
      }
    ]
  },
  {
    id: 'mf-6',
    schemeName: 'SBI Liquid Fund - Direct Plan - Growth',
    amc: 'SBI Mutual Fund',
    folioNumber: '3381904712',
    category: 'Liquid',
    subCategory: 'Liquid Fund',
    isin: 'INF200K01VA0',
    units: 125.410,
    nav: 3845.60,
    navDate: '30-Aug-2024',
    investedAmount: 450000,
    currentValue: 482276.70,
    unrealizedGain: 32276.70,
    unrealizedGainPercent: 7.17,
    sipAmount: 0,
    sipActive: false,
    planType: 'Direct',
    dividendOption: 'Growth',
    advisor: 'DIRECT',
    transactions: [
      {
        id: 'tx-6-1',
        date: '10-Nov-2023',
        type: 'PURCHASE',
        amount: 450000,
        units: 125.410,
        nav: 3588.23,
        unitBalance: 125.410
      }
    ]
  }
];
