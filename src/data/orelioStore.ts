import orelioDatabaseSeed from './orelio_database.json';
import type {
  OrelioDatabase,
  UserProfile,
  UserSettings,
  FamilyMember,
  BankAccount,
  Deposit,
  StockHolding,
  MutualFundHolding,
  DebtHolding,
  StockCASMetadata,
  LoanItem,
  Policy,
  Note,
  ChartDataItem,
  OverviewMetrics
} from './types';

const STORAGE_KEY = 'orelio_database_v2';

// In-memory cache ensures fast lookups and support for non-browser/test runtimes
let memoryDatabase: OrelioDatabase | null = null;

function cloneSeed(): OrelioDatabase {
  return JSON.parse(JSON.stringify(orelioDatabaseSeed)) as OrelioDatabase;
}

/**
 * Loads the current database.
 * Uses cached updates from memory or localStorage if available,
 * otherwise falls back directly to the source of truth JSON file.
 */
export function getOrelioDatabase(): OrelioDatabase {
  if (memoryDatabase) {
    return memoryDatabase;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: OrelioDatabase = {
          ...cloneSeed(),
          ...parsed
        };
        if (merged.notes) {
          merged.notes = merged.notes.map((n) => ({
            ...n,
            lastUpdated:
              typeof n.lastUpdated === 'number'
                ? n.lastUpdated
                : typeof n.lastUpdated === 'string' && !isNaN(Date.parse(n.lastUpdated))
                ? new Date(n.lastUpdated).getTime()
                : Date.now()
          }));
        }
        if (merged.policies) {
          merged.policies = merged.policies.map((p) => ({
            ...p,
            startDate:
              typeof p.startDate === 'number'
                ? p.startDate
                : typeof p.startDate === 'string' && !isNaN(Date.parse(p.startDate))
                ? new Date(p.startDate).getTime()
                : Date.now(),
            expiryDate:
              typeof p.expiryDate === 'number'
                ? p.expiryDate
                : typeof p.expiryDate === 'string' && !isNaN(Date.parse(p.expiryDate))
                ? new Date(p.expiryDate).getTime()
                : Date.now()
          }));
        }
        memoryDatabase = merged;
        return merged;
      }
    } catch (err) {
      console.warn('[OrelioStore] Error reading localStorage, falling back to JSON seed:', err);
    }
  }

  const seed = cloneSeed();
  memoryDatabase = seed;
  return seed;
}

function sanitizeDatabase(db: OrelioDatabase): OrelioDatabase {
  return {
    ...db,
    familyMembers: db.familyMembers
      ? db.familyMembers.map((m) => {
          const { age, ...rest } = m;
          return rest;
        })
      : [],
    policies: db.policies
      ? db.policies.map((p) => ({
          ...p,
          startDate:
            typeof p.startDate === 'number'
              ? p.startDate
              : typeof p.startDate === 'string' && !isNaN(Date.parse(p.startDate))
              ? new Date(p.startDate).getTime()
              : Date.now(),
          expiryDate:
            typeof p.expiryDate === 'number'
              ? p.expiryDate
              : typeof p.expiryDate === 'string' && !isNaN(Date.parse(p.expiryDate))
              ? new Date(p.expiryDate).getTime()
              : Date.now()
        }))
      : [],
    notes: db.notes
      ? db.notes.map((n) => {
          const { accentColor, ...rest } = n;
          const lastUpdated =
            typeof rest.lastUpdated === 'number'
              ? rest.lastUpdated
              : typeof rest.lastUpdated === 'string' && !isNaN(Date.parse(rest.lastUpdated))
              ? new Date(rest.lastUpdated).getTime()
              : Date.now();
          return {
            ...rest,
            lastUpdated
          };
        })
      : []
  };
}

/**
 * Persists the entire database to memory and localStorage.
 */
export function saveOrelioDatabase(db: OrelioDatabase): void {
  const sanitized = sanitizeDatabase(db);
  memoryDatabase = sanitized;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.error('[OrelioStore] Failed to save to localStorage:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('orelio_db_updated', { detail: sanitized }));
    } catch {}
  }

  // Persist directly to orelio_database.json via Vite dev server middleware
  if (typeof fetch !== 'undefined') {
    fetch('/api/save-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitized, null, 2)
    }).catch(() => {});
  }
}

/**
 * Resets the active database back to the source-of-truth JSON file.
 */
export function resetToDatabaseDefaults(): OrelioDatabase {
  const seed = cloneSeed();
  memoryDatabase = seed;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {}
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('orelio_db_updated', { detail: seed }));
    } catch {}
  }

  if (typeof fetch !== 'undefined') {
    fetch('/api/save-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(seed, null, 2)
    }).catch(() => {});
  }

  return seed;
}

// ----------------------------------------------------
// Entity-Specific Getters & Setters
// ----------------------------------------------------

export function getPrimaryMemberId(): string {
  const members = getFamilyMembers();
  const selfMember = members.find((m) => m.role && m.role.toLowerCase() === 'self');
  return selfMember?.id || members[0]?.id || '1';
}

function matchesMember(itemMemberId?: string, targetMemberId?: string | 'all'): boolean {
  if (!targetMemberId || targetMemberId === 'all') return true;
  const primaryId = getPrimaryMemberId();
  return (itemMemberId || primaryId) === targetMemberId;
}

export function getUserProfile(): UserProfile {
  return getOrelioDatabase().userProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  const db = { ...getOrelioDatabase(), userProfile: profile };
  saveOrelioDatabase(db);
}

export function getUserSettings(): UserSettings {
  return getOrelioDatabase().settings || {
    privacyModeDefault: false,
    currency: 'INR',
    currencySymbol: '₹',
    theme: 'light'
  };
}

export function saveUserSettings(settings: UserSettings): void {
  const db = { ...getOrelioDatabase(), settings };
  saveOrelioDatabase(db);
}

export function getFamilyMembers(): FamilyMember[] {
  return getOrelioDatabase().familyMembers || [];
}

export function saveFamilyMembers(members: FamilyMember[]): void {
  const db = { ...getOrelioDatabase(), familyMembers: members };
  saveOrelioDatabase(db);
}

export function getBankAccounts(memberId?: string | 'all'): BankAccount[] {
  const accounts = getOrelioDatabase().bankAccounts || [];
  return accounts
    .filter((acc) => matchesMember(acc.memberId, memberId))
    .map((acc) => {
      let lastUpdated = acc.lastUpdated as unknown;
      if (typeof lastUpdated === 'string') {
        const parsed = Date.parse(lastUpdated);
        lastUpdated = !isNaN(parsed) ? parsed : 1788503400000;
      }
      return {
        ...acc,
        lastUpdated: Number(lastUpdated) || 1788503400000
      };
    });
}

export function saveBankAccounts(accounts: BankAccount[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedAccounts: BankAccount[];
  if (memberId && memberId !== 'all') {
    const others = (db.bankAccounts || []).filter((a) => !matchesMember(a.memberId, memberId));
    updatedAccounts = [...others, ...accounts];
  } else {
    updatedAccounts = accounts;
  }
  saveOrelioDatabase({ ...db, bankAccounts: updatedAccounts });
}

function parseDepositDateToEpoch(val: unknown): number | undefined {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && val.trim()) {
    const s = val.trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/').map(Number);
      return Date.UTC(y, m - 1, d);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s + 'T00:00:00Z').getTime();
    }
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
}

export function getDeposits(memberId?: string | 'all'): Deposit[] {
  const deps = getOrelioDatabase().deposits || [];
  const now = Date.now();
  let hasAutoMatured = false;

  const resolved: Deposit[] = deps
    .filter((d: any) => matchesMember(d.memberId, memberId))
    .map((d: any) => {
      const { daysRemaining, progressPercent, accountNumber, ...rest } = d;
      const startEpoch = parseDepositDateToEpoch(d.startDate);
      const maturityEpoch = parseDepositDateToEpoch(d.maturityDate) ?? now;
      const isPastMaturity = maturityEpoch <= now;
      const status: 'active' | 'matured' = (isPastMaturity || d.status === 'matured') ? 'matured' : 'active';
      const maturedDate = status === 'matured'
        ? (parseDepositDateToEpoch(d.maturedDate) ?? maturityEpoch)
        : undefined;

      if (isPastMaturity && d.status !== 'matured') {
        hasAutoMatured = true;
      }

      return {
        ...rest,
        depositNumber: d.depositNumber || d.accountNumber || '',
        startDate: startEpoch,
        maturityDate: maturityEpoch,
        status,
        ...(maturedDate !== undefined ? { maturedDate } : {})
      };
    });

  if (hasAutoMatured) {
    saveDeposits(resolved, memberId);
  }

  return resolved;
}

export function saveDeposits(deposits: Deposit[], memberId?: string | 'all'): void {
  const now = Date.now();
  const cleanDeposits = deposits.map((d: any) => {
    const { daysRemaining, progressPercent, accountNumber, ...rest } = d;
    const startEpoch = parseDepositDateToEpoch(d.startDate);
    const maturityEpoch = parseDepositDateToEpoch(d.maturityDate) ?? now;
    const isPastMaturity = maturityEpoch <= now;
    const status: 'active' | 'matured' = (isPastMaturity || d.status === 'matured') ? 'matured' : 'active';
    const maturedDate = status === 'matured'
      ? (parseDepositDateToEpoch(d.maturedDate) ?? maturityEpoch)
      : undefined;

    return {
      ...rest,
      depositNumber: d.depositNumber || d.accountNumber || '',
      startDate: startEpoch,
      maturityDate: maturityEpoch,
      status,
      ...(maturedDate !== undefined ? { maturedDate } : {})
    };
  });

  const db = getOrelioDatabase();
  let updatedDeposits: Deposit[];
  if (memberId && memberId !== 'all') {
    const others = (db.deposits || []).filter((d: any) => !matchesMember(d.memberId, memberId));
    updatedDeposits = [...others, ...cleanDeposits];
  } else {
    updatedDeposits = cleanDeposits;
  }

  saveOrelioDatabase({ ...db, deposits: updatedDeposits });
}

export function getStocks(memberId?: string | 'all'): StockHolding[] {
  const allStocks = getOrelioDatabase().stocks || [];
  return allStocks.filter((s) => matchesMember(s.memberId, memberId));
}

export function saveStocks(stocks: StockHolding[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedStocks: StockHolding[];
  if (memberId && memberId !== 'all') {
    const others = (db.stocks || []).filter((s) => !matchesMember(s.memberId, memberId));
    updatedStocks = [...others, ...stocks];
  } else {
    updatedStocks = stocks;
  }
  saveOrelioDatabase({ ...db, stocks: updatedStocks });
}

export function getStockMetadata(memberId?: string | 'all'): StockCASMetadata | null {
  const db = getOrelioDatabase() as any;
  const primaryId = getPrimaryMemberId();
  if (memberId && memberId !== 'all') {
    if (db.stockMetadatas && db.stockMetadatas[memberId]) {
      return db.stockMetadatas[memberId];
    }
    const meta = db.stockMetadata ?? null;
    if (meta && (meta.memberId || primaryId) === memberId) {
      return meta;
    }
    return null;
  }
  return db.stockMetadata ?? null;
}

export function saveStockMetadata(metadata: StockCASMetadata | null, memberId?: string | 'all'): void {
  const db = getOrelioDatabase() as any;
  const primaryId = getPrimaryMemberId();
  const targetId = (!memberId || memberId === 'all') ? primaryId : memberId;
  const taggedMeta = metadata ? { ...metadata, memberId: targetId } : null;

  if (!db.stockMetadatas) db.stockMetadatas = {};
  if (taggedMeta) {
    db.stockMetadatas[targetId] = taggedMeta;
  } else {
    delete db.stockMetadatas[targetId];
  }

  if (targetId === primaryId || !memberId || memberId === 'all') {
    db.stockMetadata = taggedMeta;
  }

  saveOrelioDatabase(db);
}

export function getMutualFunds(memberId?: string | 'all'): MutualFundHolding[] {
  const allFunds = getOrelioDatabase().mutualFunds || [];
  return allFunds.filter((m) => matchesMember(m.memberId, memberId));
}

export function saveMutualFunds(mutualFunds: MutualFundHolding[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedFunds: MutualFundHolding[];
  if (memberId && memberId !== 'all') {
    const others = (db.mutualFunds || []).filter((m) => !matchesMember(m.memberId, memberId));
    updatedFunds = [...others, ...mutualFunds];
  } else {
    updatedFunds = mutualFunds;
  }
  saveOrelioDatabase({ ...db, mutualFunds: updatedFunds });
}

export function getDebtHoldings(memberId?: string | 'all'): DebtHolding[] {
  const allDebts = getOrelioDatabase().debtHoldings || [];
  return allDebts.filter((d) => matchesMember(d.memberId, memberId));
}

export function saveDebtHoldings(debts: DebtHolding[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedDebts: DebtHolding[];
  if (memberId && memberId !== 'all') {
    const others = (db.debtHoldings || []).filter((d) => !matchesMember(d.memberId, memberId));
    updatedDebts = [...others, ...debts];
  } else {
    updatedDebts = debts;
  }
  saveOrelioDatabase({ ...db, debtHoldings: updatedDebts });
}

export function getLoans(memberId?: string | 'all'): LoanItem[] {
  const allLoans = getOrelioDatabase().loans || [];
  return allLoans
    .filter((loan) => matchesMember(loan.memberId, memberId))
    .map((loan) => ({
      ...loan,
      startDate: typeof loan.startDate === 'string'
        ? (() => { const s = loan.startDate as unknown as string; return new Date(s + (s.includes('T') ? '' : 'T00:00:00Z')).getTime(); })()
        : loan.startDate,
      nextEmiDate: typeof loan.nextEmiDate === 'string'
        ? new Date((loan.nextEmiDate as string) + 'T00:00:00Z').getTime() || Date.now()
        : loan.nextEmiDate
    }));
}

export function saveLoans(loans: LoanItem[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedLoans: LoanItem[];
  if (memberId && memberId !== 'all') {
    const others = (db.loans || []).filter((l) => !matchesMember(l.memberId, memberId));
    updatedLoans = [...others, ...loans];
  } else {
    updatedLoans = loans;
  }
  saveOrelioDatabase({ ...db, loans: updatedLoans });
}

export function getPolicies(memberId?: string | 'all'): Policy[] {
  const policies = getOrelioDatabase().policies || [];
  return policies
    .filter((p: any) => matchesMember(p.memberId, memberId))
    .map((p: any) => ({
      ...p,
      premiumAmount: typeof p.premiumAmount === 'number' ? p.premiumAmount : (typeof p.annualPremium === 'number' ? p.annualPremium : 0)
    }));
}

export function savePolicies(policies: Policy[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedPolicies: Policy[];
  if (memberId && memberId !== 'all') {
    const others = (db.policies || []).filter((p: any) => !matchesMember(p.memberId, memberId));
    updatedPolicies = [...others, ...policies];
  } else {
    updatedPolicies = policies;
  }
  saveOrelioDatabase({ ...db, policies: updatedPolicies });
}

export function getNotes(memberId?: string | 'all'): Note[] {
  const allNotes = getOrelioDatabase().notes || [];
  return allNotes.filter((n) => matchesMember(n.memberId, memberId));
}

export function saveNotes(notes: Note[], memberId?: string | 'all'): void {
  const db = getOrelioDatabase();
  let updatedNotes: Note[];
  if (memberId && memberId !== 'all') {
    const others = (db.notes || []).filter((n) => !matchesMember(n.memberId, memberId));
    updatedNotes = [...others, ...notes];
  } else {
    updatedNotes = notes;
  }
  saveOrelioDatabase({ ...db, notes: updatedNotes });
}

function formatIndianCurrencyCompact(num: number): string {
  if (num >= 10000000) {
    const val = (num / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹ ${val} Cr`;
  }
  if (num >= 100000) {
    const val = (num / 100000).toFixed(1).replace(/\.?0+$/, '');
    return `₹ ${val} L`;
  }
  if (num >= 1000) {
    return `₹ ${(num / 1000).toFixed(0)}k`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

export function getOverviewMetrics(memberId?: string | 'all'): OverviewMetrics {
  const stocks = getStocks(memberId);
  const mfs = getMutualFunds(memberId);
  const debts = getDebtHoldings(memberId);
  const bankAccounts = getBankAccounts(memberId);
  const deposits = getDeposits(memberId);
  const loans = getLoans(memberId);

  const marketLinked = stocks.reduce((acc, s) => acc + s.marketValue, 0) +
                       mfs.reduce((acc, m) => acc + m.marketValue, 0) +
                       debts.reduce((acc, d) => acc + d.marketValue, 0);
  const cash = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const fixedIncome = deposits
    .filter((d) => d.status === 'active')
    .reduce((acc, d) => acc + (d.currentValue || d.principalOrMonthly || 0), 0);

  const totalAssets = marketLinked + cash + fixedIncome;
  const totalLiabilities = loans.reduce((acc, l) => acc + (l.outstandingBalance || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const netWorthDisplay = formatIndianCurrencyCompact(netWorth);

  let yearGrowthAmount = '+₹ 18.2 L';
  let yearGrowthPercent = 14.2;

  if (memberId && memberId !== 'all') {
    const growthEst = Math.round(netWorth * 0.12);
    yearGrowthAmount = `+${formatIndianCurrencyCompact(growthEst)}`;
    yearGrowthPercent = 12.0;
  }

  return {
    netWorth,
    netWorthDisplay,
    yearGrowthAmount,
    yearGrowthPercent
  };
}

export function getAssetAllocation(memberId?: string | 'all'): ChartDataItem[] {
  const stocks = getStocks(memberId);
  const mfs = getMutualFunds(memberId);
  const debts = getDebtHoldings(memberId);
  const deposits = getDeposits(memberId);
  const accounts = getBankAccounts(memberId);

  const stocksVal = stocks.reduce((acc, s) => acc + s.marketValue, 0);
  const mfsVal = mfs.reduce((acc, m) => acc + m.marketValue, 0);
  const debtsVal = debts.reduce((acc, d) => acc + d.marketValue, 0);
  const fdsVal = deposits.reduce((acc, d) => acc + (d.currentValue || d.principalOrMonthly || 0), 0);
  const cashVal = accounts.reduce((acc, a) => acc + a.balance, 0);

  const total = stocksVal + mfsVal + debtsVal + fdsVal + cashVal;
  if (total <= 0) {
    return [
      { name: 'Stocks', value: 0, color: '#0284C7' },
      { name: 'Mutual Funds', value: 0, color: '#4F46E5' },
      { name: 'Fixed Deposits', value: 0, color: '#0D9488' },
      { name: 'Cash', value: 0, color: '#F59E0B' },
      { name: 'Bonds', value: 0, color: '#0F766E' }
    ];
  }

  const sPct = Math.round((stocksVal / total) * 100);
  const mPct = Math.round((mfsVal / total) * 100);
  const fPct = Math.round((fdsVal / total) * 100);
  const cPct = Math.round((cashVal / total) * 100);
  const bPct = Math.max(0, 100 - (sPct + mPct + fPct + cPct));

  return [
    { name: 'Stocks', value: sPct, color: '#0284C7' },
    { name: 'Bonds', value: bPct, color: '#0F766E' },
    { name: 'Fixed Deposits', value: fPct, color: '#0D9488' },
    { name: 'Mutual Funds', value: mPct, color: '#4F46E5' },
    { name: 'Cash', value: cPct, color: '#F59E0B' }
  ];
}

export function getLiabilityAllocation(memberId?: string | 'all'): ChartDataItem[] {
  const loans = getLoans(memberId);
  if (loans.length === 0) {
    return [
      { name: 'No Active Loans', value: 100, color: '#10B981' }
    ];
  }
  const totalLiabilities = loans.reduce((acc, l) => acc + (l.outstandingBalance || 0), 0);
  if (totalLiabilities <= 0) {
    return [
      { name: 'No Active Loans', value: 100, color: '#10B981' }
    ];
  }

  const groupTotals: Record<string, number> = {};
  loans.forEach((l) => {
    const t = l.type || 'Other';
    groupTotals[t] = (groupTotals[t] || 0) + (l.outstandingBalance || 0);
  });

  const colors: Record<string, string> = {
    'Home Loan': '#DC2626',
    'Car Loan': '#F59E0B',
    'Personal Loan': '#4F46E5',
    'Education Loan': '#0D9488',
    'Other': '#9CA3AF'
  };

  return Object.entries(groupTotals).map(([name, val]) => ({
    name,
    value: Math.round((val / totalLiabilities) * 100),
    color: colors[name] || '#6366F1'
  }));
}
