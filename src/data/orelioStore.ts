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
  return getOrelioDatabase().bankAccounts;
}

export function saveBankAccounts(accounts: BankAccount[]): void {
  const db = { ...getOrelioDatabase(), bankAccounts: accounts };
  saveOrelioDatabase(db);
}

export function getDeposits(): Deposit[] {
  return getOrelioDatabase().deposits;
}

export function saveDeposits(deposits: Deposit[]): void {
  const db = { ...getOrelioDatabase(), deposits: deposits };
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
  return getOrelioDatabase().loans;
}

export function saveLoans(loans: LoanItem[]): void {
  const db = { ...getOrelioDatabase(), loans: loans };
  saveOrelioDatabase(db);
}

export function getPolicies(): Policy[] {
  return getOrelioDatabase().policies;
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
