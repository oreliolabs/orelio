import type { StockHolding, StockCASMetadata } from '../components/stocks/StocksTypes';
import type { Policy, PolicyType, PremiumFrequency } from '../components/insurance/InsuranceTypes';

export type { StockHolding, StockCASMetadata };
export type { Policy, PolicyType, PremiumFrequency };

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  currencySymbol: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  dob: string;
  age: number;
  isDependent: boolean;
  gender: 'Male' | 'Female' | 'Other';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  balance: number;
  lastUpdated: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Deposit {
  id: string;
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  accountNumber: string;
  interestRate: number;
  currentValue: number;
  principalOrMonthly: number;
  startDate?: string;
  maturityDate: string;
  tenureYears?: number;
  tenureMonths?: number;
  daysRemaining?: number;
  progressPercent?: number;
  status: 'active' | 'matured';
  maturedDate?: string;
  nominee?: string;
}

export interface LoanItem {
  id: string;
  type: string;
  nickname: string;
  provider: string;
  accountNumber: string;
  totalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  startDate: string;
  nextEmiDate: string;
  monthlyEmi: number;
  repaymentProgressPercent?: number;
  status: 'active' | 'closed';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  accentColor: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface OverviewMetrics {
  netWorth: number;
  netWorthDisplay: string;
  yearGrowthAmount: string;
  yearGrowthPercent: number;
}

export interface OrelioDatabase {
  userProfile: UserProfile;
  familyMembers: FamilyMember[];
  bankAccounts: BankAccount[];
  deposits: Deposit[];
  stocks: StockHolding[];
  stockMetadata: StockCASMetadata;
  loans: LoanItem[];
  policies: Policy[];
  notes: Note[];
  assetAllocation: ChartDataItem[];
  liabilityAllocation: ChartDataItem[];
  overviewMetrics: OverviewMetrics;
}
