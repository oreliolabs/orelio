import type {
  StockHolding,
  MutualFundHolding,
  DebtHolding,
  DematAccountSummary,
  StockCASMetadata,
  ParsedCASResult
} from '../components/stocks/StocksTypes';
import type { Policy, PolicyType, PremiumFrequency } from '../components/insurance/InsuranceTypes';

export type {
  StockHolding,
  MutualFundHolding,
  DebtHolding,
  DematAccountSummary,
  StockCASMetadata,
  ParsedCASResult
};
export type { Policy, PolicyType, PremiumFrequency };

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  currencySymbol: string;
  avatar?: string;
  tier?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  passwordHash?: string;
  passwordHint?: string;
}

export interface UserSettings {
  privacyModeDefault: boolean;
  currency: string;
  currencySymbol: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  dob: string;
  age?: number;
  isDependent: boolean;
  gender: 'Male' | 'Female' | 'Other';
  avatarColor?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  balance: number;
  lastUpdated: number;
  accountNumber: string;
  ifscCode: string;
  memberId?: string;
}

export interface Deposit {
  id: string;
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  depositNumber: string;
  interestRate: number;
  currentValue: number;
  principalOrMonthly: number;
  startDate?: number;
  maturityDate: number;
  tenureYears?: number;
  tenureMonths?: number;
  daysRemaining?: number;
  progressPercent?: number;
  status: 'active' | 'matured';
  maturedDate?: number;
  nominee?: string;
  memberId?: string;
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
  startDate: number;
  nextEmiDate: number;
  monthlyEmi: number;
  repaymentProgressPercent?: number;
  status: 'active' | 'closed';
  memberId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: number;
  accentColor?: string;
  memberId?: string;
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

export interface SecurityConfig {
  passwordHash: string;
  passwordHint?: string;
  lastChanged?: number;
}

export interface UserVaultData {
  familyMembers: FamilyMember[];
  bankAccounts: BankAccount[];
  deposits: Deposit[];
  stocks: StockHolding[];
  mutualFunds?: MutualFundHolding[];
  debtHoldings?: DebtHolding[];
  stockMetadata?: StockCASMetadata | null;
  stockMetadatas?: Record<string, any>;
  loans: LoanItem[];
  policies: Policy[];
  notes: Note[];
  settings?: UserSettings;
}

export interface UserRecord {
  profile: UserProfile;
  security?: SecurityConfig;
  vault: UserVaultData;
}

export interface OrelioDatabase {
  activeUserId: string;
  users: Record<string, UserRecord>;
}
