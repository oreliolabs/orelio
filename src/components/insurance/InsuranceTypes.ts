export type PolicyType = 
  | 'Property Insurance' 
  | 'Life Insurance' 
  | 'Health Insurance' 
  | 'Motor Insurance' 
  | 'Term Insurance'
  | 'Travel Insurance';

export type PremiumFrequency = 'Annual' | 'Monthly' | 'Quarterly' | 'Half-Yearly';

export interface Policy {
  id: string;
  policyType: PolicyType;
  policyName: string;
  policyNumber?: string;
  provider?: string;
  sumInsured: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  startDate: number;
  expiryDate: number;
  memberId?: string;
}

export interface PolicyFormData {
  policyType: PolicyType;
  policyName: string;
  policyNumber?: string;
  provider?: string;
  sumInsured: string;
  premiumAmount: string;
  premiumFrequency: PremiumFrequency;
  startDate: string;
  expiryDate: string;
}
