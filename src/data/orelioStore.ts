import orelioDatabaseSeed from './orelio_database.json';
import type {
  OrelioDatabase,
  UserProfile,
  UserSettings,
  FamilyMember,
  BankAccount,
  Deposit,
  StockHolding,
  StockCASMetadata,
  LoanItem,
  Policy,
  Note,
  ChartDataItem,
  OverviewMetrics
} from './types';

const STORAGE_KEY = 'orelio_database_v1';

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
    notes: db.notes
      ? db.notes.map((n) => {
          const { accentColor, ...rest } = n;
          return rest;
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
  return getOrelioDatabase().familyMembers;
}

export function saveFamilyMembers(members: FamilyMember[]): void {
  const db = { ...getOrelioDatabase(), familyMembers: members };
  saveOrelioDatabase(db);
}

export function getBankAccounts(): BankAccount[] {
  const accounts = getOrelioDatabase().bankAccounts || [];
  return accounts.map((acc) => {
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

export function saveBankAccounts(accounts: BankAccount[]): void {
  const db = { ...getOrelioDatabase(), bankAccounts: accounts };
  saveOrelioDatabase(db);
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

export function getDeposits(): Deposit[] {
  const deps = getOrelioDatabase().deposits || [];
  const now = Date.now();
  let hasAutoMatured = false;

  const resolved: Deposit[] = deps.map((d: any) => {
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
    saveDeposits(resolved);
  }

  return resolved;
}

export function saveDeposits(deposits: Deposit[]): void {
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
  const db = { ...getOrelioDatabase(), deposits: cleanDeposits };
  saveOrelioDatabase(db);
}

export function getStocks(): StockHolding[] {
  return getOrelioDatabase().stocks;
}

export function saveStocks(stocks: StockHolding[]): void {
  const db = { ...getOrelioDatabase(), stocks: stocks };
  saveOrelioDatabase(db);
}

export function getStockMetadata(): StockCASMetadata {
  return getOrelioDatabase().stockMetadata;
}

export function saveStockMetadata(metadata: StockCASMetadata): void {
  const db = { ...getOrelioDatabase(), stockMetadata: metadata };
  saveOrelioDatabase(db);
}

export function getLoans(): LoanItem[] {
  return getOrelioDatabase().loans.map((loan) => ({
    ...loan,
    // Coerce legacy string dates to epoch ms
    startDate: typeof loan.startDate === 'string'
      ? (() => { const s = loan.startDate as unknown as string; return new Date(s + (s.includes('T') ? '' : 'T00:00:00Z')).getTime(); })()
      : loan.startDate,
    nextEmiDate: typeof loan.nextEmiDate === 'string'
      ? new Date((loan.nextEmiDate as string) + 'T00:00:00Z').getTime() || Date.now()
      : loan.nextEmiDate,
  }));
}

export function saveLoans(loans: LoanItem[]): void {
  const db = { ...getOrelioDatabase(), loans: loans };
  saveOrelioDatabase(db);
}

export function getPolicies(): Policy[] {
  const policies = getOrelioDatabase().policies || [];
  return policies.map((p: any) => ({
    ...p,
    premiumAmount: typeof p.premiumAmount === 'number' ? p.premiumAmount : (typeof p.annualPremium === 'number' ? p.annualPremium : 0)
  }));
}

export function savePolicies(policies: Policy[]): void {
  const db = { ...getOrelioDatabase(), policies: policies };
  saveOrelioDatabase(db);
}

export function getNotes(): Note[] {
  return getOrelioDatabase().notes;
}

export function saveNotes(notes: Note[]): void {
  const db = { ...getOrelioDatabase(), notes: notes };
  saveOrelioDatabase(db);
}

export function getAssetAllocation(): ChartDataItem[] {
  return getOrelioDatabase().assetAllocation;
}

export function getLiabilityAllocation(): ChartDataItem[] {
  return getOrelioDatabase().liabilityAllocation;
}

export function getOverviewMetrics(): OverviewMetrics {
  return getOrelioDatabase().overviewMetrics;
}
