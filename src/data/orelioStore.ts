import orelioDatabaseSeed from './orelio_database.json';
import type {
  OrelioDatabase,
  UserRecord,
  UserVaultData,
  UserProfile,
  UserSettings,
  SecurityConfig,
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
import { hashPassword, verifyPassword } from '../utils/crypto';

const STORAGE_KEY = 'orelio_database_v2';
const DEFAULT_USER_ID = 'usr-default';

// In-memory cache ensures fast lookups and support for non-browser/test runtimes
let memoryDatabase: OrelioDatabase | null = null;

function cloneSeed(): OrelioDatabase {
  return JSON.parse(JSON.stringify(orelioDatabaseSeed)) as OrelioDatabase;
}

function getActiveUserId(db: { activeUserId?: string; users?: Record<string, any> }): string {
  if (db.activeUserId && db.users && db.users[db.activeUserId]) {
    return db.activeUserId;
  }
  const firstId = db.users ? Object.keys(db.users)[0] : undefined;
  return firstId || db.activeUserId || DEFAULT_USER_ID;
}

function sanitizeVault(vault: UserVaultData, userProfile?: UserProfile): UserVaultData {
  let members = vault.familyMembers
    ? vault.familyMembers.map((m) => {
        const { age, ...rest } = m;
        return rest;
      })
    : [];

  if (members.length === 0 && userProfile) {
    const nameParts = (userProfile.name || 'User').trim().split(' ');
    members = [
      {
        id: '1',
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        role: 'Self',
        dob: userProfile.dob || '',
        gender: userProfile.gender || 'Other',
        isDependent: false
      }
    ];
  }

  return {
    ...vault,
    familyMembers: members,
    policies: vault.policies
      ? vault.policies.map((p) => ({
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
    notes: vault.notes
      ? vault.notes.map((n) => {
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

function sanitizeDatabase(db: OrelioDatabase): OrelioDatabase {
  const sanitizedUsers: Record<string, UserRecord> = {};

  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users)) {
    for (const [uid, userRecord] of Object.entries(db.users)) {
      if (!userRecord) continue;
      sanitizedUsers[uid] = {
        profile: userRecord.profile || {
          id: uid,
          name: 'User',
          email: '',
          currency: 'INR',
          currencySymbol: '₹',
          tier: 'STANDARD'
        },
        security: userRecord.security || {
          passwordHash: '',
          passwordHint: '',
          lastChanged: Date.now()
        },
        vault: sanitizeVault(userRecord.vault || createEmptyVault(userRecord.profile), userRecord.profile)
      };
    }
  } else if (Array.isArray(db.users)) {
    for (const user of db.users as any[]) {
      const legacyDb = db as any;
      const vault = legacyDb.userVaults?.[user.id] || createEmptyVault(user);
      sanitizedUsers[user.id] = {
        profile: user,
        security: {
          passwordHash: user.passwordHash || legacyDb.security?.passwordHash || '',
          passwordHint: user.passwordHint || legacyDb.security?.passwordHint || '',
          lastChanged: Date.now()
        },
        vault: sanitizeVault(vault, user)
      };
    }
  }

  const activeId = getActiveUserId({ activeUserId: db.activeUserId, users: sanitizedUsers });

  return {
    activeUserId: activeId,
    users: sanitizedUsers
  };
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
        const seed = cloneSeed();
        const merged: OrelioDatabase = {
          ...seed,
          ...parsed,
          users: {
            ...(seed.users || {}),
            ...(parsed.users && typeof parsed.users === 'object' && !Array.isArray(parsed.users) ? parsed.users : {})
          }
        };
        const sanitized = sanitizeDatabase(merged);
        memoryDatabase = sanitized;
        return sanitized;
      }
    } catch (err) {
      console.warn('[OrelioStore] Error reading localStorage, falling back to JSON seed:', err);
    }
  }

  const seed = sanitizeDatabase(cloneSeed());
  memoryDatabase = seed;
  return seed;
}

export function createEmptyVault(user?: UserProfile): UserVaultData {
  const nameParts = (user?.name || 'Self').trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  let dmyDob = '';
  if (user?.dob) {
    if (user.dob.includes('-')) {
      const [y, m, d] = user.dob.split('-');
      dmyDob = `${d}/${m}/${y}`;
    } else {
      dmyDob = user.dob;
    }
  }

  return {
    familyMembers: [
      {
        id: '1',
        firstName,
        lastName,
        role: 'Self',
        dob: dmyDob,
        gender: user?.gender || 'Female',
        isDependent: false
      }
    ],
    bankAccounts: [],
    deposits: [],
    stocks: [],
    mutualFunds: [],
    debtHoldings: [],
    stockMetadata: null,
    stockMetadatas: {},
    loans: [],
    policies: [],
    notes: [],
    settings: {
      privacyModeDefault: false,
      currency: user?.currency || 'INR',
      currencySymbol: user?.currencySymbol || '₹',
      theme: 'light'
    }
  };
}

export function getActiveUser(dbInput?: OrelioDatabase): UserRecord {
  const db = dbInput || getOrelioDatabase();
  const activeId = getActiveUserId(db);

  if (db.users && db.users[activeId]) {
    return db.users[activeId];
  }

  const fallbackUser: UserRecord = {
    profile: {
      id: activeId,
      name: 'User',
      email: '',
      currency: 'INR',
      currencySymbol: '₹',
      tier: 'STANDARD'
    },
    security: {
      passwordHash: '',
      passwordHint: '',
      lastChanged: Date.now()
    },
    vault: createEmptyVault()
  };

  if (!db.users || Array.isArray(db.users)) {
    db.users = {};
  }
  db.users[activeId] = fallbackUser;
  return fallbackUser;
}

export function getActiveVault(dbInput?: OrelioDatabase): UserVaultData {
  const user = getActiveUser(dbInput);
  if (!user.vault) {
    user.vault = createEmptyVault(user.profile);
  }
  return user.vault;
}

export function updateActiveVault(updater: (vault: UserVaultData) => UserVaultData): void {
  const db = getOrelioDatabase();
  const activeId = getActiveUserId(db);
  if (!db.users || Array.isArray(db.users)) {
    db.users = {};
  }
  if (!db.users[activeId]) {
    db.users[activeId] = getActiveUser(db);
  }
  const currentVault = db.users[activeId].vault || createEmptyVault(db.users[activeId].profile);
  db.users[activeId].vault = updater(currentVault);
  saveOrelioDatabase(db);
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

export function getAllUsers(): UserProfile[] {
  const db = getOrelioDatabase();
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users)) {
    const list = Object.values(db.users).map((u) => u.profile).filter(Boolean);
    if (list.length > 0) {
      return list;
    }
  } else if (Array.isArray(db.users) && (db.users as any).length > 0) {
    return db.users as any;
  }
  const defaultUser: UserProfile = {
    id: 'usr-default',
    name: 'User',
    email: 'user@orelio.vault',
    currency: 'INR',
    currencySymbol: '₹',
    tier: 'STANDARD'
  };
  return [defaultUser];
}

export function getUserProfile(): UserProfile {
  const db = getOrelioDatabase();
  const activeId = getActiveUserId(db);
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users) && db.users[activeId]) {
    return db.users[activeId].profile;
  }
  return {
    id: activeId,
    name: 'User',
    email: '',
    currency: 'INR',
    currencySymbol: '₹',
    tier: 'STANDARD'
  };
}

export function saveUserProfile(profile: UserProfile): void {
  const db = getOrelioDatabase();
  if (!db.users || Array.isArray(db.users)) {
    db.users = {};
  }
  if (!db.users[profile.id]) {
    db.users[profile.id] = {
      profile,
      security: {
        passwordHash: profile.passwordHash || '',
        passwordHint: profile.passwordHint || '',
        lastChanged: Date.now()
      },
      vault: createEmptyVault(profile)
    };
  } else {
    db.users[profile.id].profile = profile;
    if (profile.passwordHash) {
      if (!db.users[profile.id].security) {
        db.users[profile.id].security = { passwordHash: profile.passwordHash, passwordHint: profile.passwordHint || '' };
      } else {
        db.users[profile.id].security!.passwordHash = profile.passwordHash;
        if (profile.passwordHint !== undefined) {
          db.users[profile.id].security!.passwordHint = profile.passwordHint;
        }
      }
    }
  }
  saveOrelioDatabase(db);
}

export function setActiveUserId(userId: string): void {
  const db = getOrelioDatabase();
  db.activeUserId = userId;
  saveOrelioDatabase(db);
}

export function hasAnyUsers(): boolean {
  const db = getOrelioDatabase();
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users)) {
    return Object.keys(db.users).length > 0;
  }
  return Array.isArray(db.users) && (db.users as any).length > 0;
}

export async function createNewUser(params: {
  name: string;
  email: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  password?: string;
  passwordHint?: string;
  avatar?: string;
}): Promise<UserProfile> {
  const db = getOrelioDatabase();

  const hashedPassword = params.password ? await hashPassword(params.password) : '';
  const newUserId = `usr-${Date.now()}`;

  const newUser: UserProfile = {
    id: newUserId,
    name: params.name,
    email: params.email,
    dob: params.dob || '',
    gender: params.gender || 'Other',
    avatar: params.avatar || '',
    currency: 'INR',
    currencySymbol: '₹',
    tier: 'STANDARD',
    passwordHash: hashedPassword,
    passwordHint: params.passwordHint || ''
  };

  const newSecurity: SecurityConfig = {
    passwordHash: hashedPassword,
    passwordHint: params.passwordHint || '',
    lastChanged: Date.now()
  };

  const newVault = createEmptyVault(newUser);

  if (!db.users || Array.isArray(db.users)) {
    db.users = {};
  }

  db.users[newUserId] = {
    profile: newUser,
    security: newSecurity,
    vault: newVault
  };

  db.activeUserId = newUserId;

  saveOrelioDatabase(db);
  return newUser;
}

export function isPasswordSet(userId?: string): boolean {
  const db = getOrelioDatabase();
  const targetId = userId || db.activeUserId || Object.keys(db.users || {})[0];
  if (targetId && db.users && typeof db.users === 'object' && !Array.isArray(db.users) && db.users[targetId]) {
    const user = db.users[targetId];
    const hash = user.security?.passwordHash ?? user.profile?.passwordHash;
    return typeof hash === 'string' && hash.trim().length > 0;
  }
  const sec = getSecurityConfig();
  return typeof sec.passwordHash === 'string' && sec.passwordHash.trim().length > 0;
}

export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const db = getOrelioDatabase();
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users) && db.users[userId]) {
    const user = db.users[userId];
    const hash = user.security?.passwordHash || user.profile?.passwordHash;
    if (hash && hash.trim().length > 0) {
      return verifyPassword(password, hash);
    }
    return true; // No password configured for this user
  }
  const users = getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (target && target.passwordHash && target.passwordHash.trim().length > 0) {
    return verifyPassword(password, target.passwordHash);
  }
  if (!isPasswordSet()) {
    return true;
  }
  return verifyMasterPassword(password);
}

export function getUserSettings(): UserSettings {
  return getActiveVault().settings || {
    privacyModeDefault: false,
    currency: 'INR',
    currencySymbol: '₹',
    theme: 'light'
  };
}

export function saveUserSettings(settings: UserSettings): void {
  updateActiveVault((vault) => ({ ...vault, settings }));
}

export function getSecurityConfig(): SecurityConfig {
  const db = getOrelioDatabase();
  const activeId = getActiveUserId(db);
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users) && db.users[activeId]?.security) {
    return db.users[activeId].security!;
  }
  return {
    passwordHash: '5f3961209d482acecd35a444647c9490:bd9c21fe015b23d078efb6a2f5cda220c400b3b59db5bd87216964ae8b17f43c',
    passwordHint: 'Default: orelio123',
    lastChanged: 1788776000000
  };
}

export function saveSecurityConfig(security: SecurityConfig): void {
  const db = getOrelioDatabase();
  const activeId = getActiveUserId(db);
  if (db.users && typeof db.users === 'object' && !Array.isArray(db.users) && db.users[activeId]) {
    db.users[activeId].security = security;
    if (db.users[activeId].profile) {
      db.users[activeId].profile.passwordHash = security.passwordHash;
      db.users[activeId].profile.passwordHint = security.passwordHint;
    }
  }
  saveOrelioDatabase(db);
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
  const security = getSecurityConfig();
  if (!security.passwordHash || security.passwordHash.trim() === '') {
    return true;
  }
  return verifyPassword(password, security.passwordHash);
}

export async function updateMasterPassword(newPassword: string, hint?: string): Promise<void> {
  const newHash = await hashPassword(newPassword);
  const updated: SecurityConfig = {
    passwordHash: newHash,
    passwordHint: hint || undefined,
    lastChanged: Date.now()
  };
  saveSecurityConfig(updated);
}

export function getFamilyMembers(): FamilyMember[] {
  return getActiveVault().familyMembers || [];
}

export function saveFamilyMembers(members: FamilyMember[]): void {
  updateActiveVault((vault) => ({ ...vault, familyMembers: members }));
}

export function getBankAccounts(memberId?: string | 'all'): BankAccount[] {
  const accounts = getActiveVault().bankAccounts || [];
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
  updateActiveVault((vault) => {
    let updatedAccounts: BankAccount[];
    if (memberId && memberId !== 'all') {
      const others = (vault.bankAccounts || []).filter((a) => !matchesMember(a.memberId, memberId));
      updatedAccounts = [...others, ...accounts];
    } else {
      updatedAccounts = accounts;
    }
    return { ...vault, bankAccounts: updatedAccounts };
  });
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
  const deps = getActiveVault().deposits || [];
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

  updateActiveVault((vault) => {
    let updatedDeposits: Deposit[];
    if (memberId && memberId !== 'all') {
      const others = (vault.deposits || []).filter((d: any) => !matchesMember(d.memberId, memberId));
      updatedDeposits = [...others, ...cleanDeposits];
    } else {
      updatedDeposits = cleanDeposits;
    }
    return { ...vault, deposits: updatedDeposits };
  });
}

export function getStocks(memberId?: string | 'all'): StockHolding[] {
  const allStocks = getActiveVault().stocks || [];
  return allStocks.filter((s) => matchesMember(s.memberId, memberId));
}

export function saveStocks(stocks: StockHolding[], memberId?: string | 'all'): void {
  updateActiveVault((vault) => {
    let updatedStocks: StockHolding[];
    if (memberId && memberId !== 'all') {
      const others = (vault.stocks || []).filter((s) => !matchesMember(s.memberId, memberId));
      updatedStocks = [...others, ...stocks];
    } else {
      updatedStocks = stocks;
    }
    return { ...vault, stocks: updatedStocks };
  });
}

export function getStockMetadata(memberId?: string | 'all'): StockCASMetadata | null {
  const vault = getActiveVault() as any;
  const primaryId = getPrimaryMemberId();
  if (memberId && memberId !== 'all') {
    if (vault.stockMetadatas && vault.stockMetadatas[memberId]) {
      return vault.stockMetadatas[memberId];
    }
    const meta = vault.stockMetadata ?? null;
    if (meta && (meta.memberId || primaryId) === memberId) {
      return meta;
    }
    return null;
  }
  return vault.stockMetadata ?? null;
}

export function saveStockMetadata(metadata: StockCASMetadata | null, memberId?: string | 'all'): void {
  const primaryId = getPrimaryMemberId();
  const targetId = (!memberId || memberId === 'all') ? primaryId : memberId;
  const taggedMeta = metadata ? { ...metadata, memberId: targetId } : null;

  updateActiveVault((vault: any) => {
    if (!vault.stockMetadatas) vault.stockMetadatas = {};
    if (taggedMeta) {
      vault.stockMetadatas[targetId] = taggedMeta;
    } else {
      delete vault.stockMetadatas[targetId];
    }

    if (targetId === primaryId || !memberId || memberId === 'all') {
      vault.stockMetadata = taggedMeta;
    }
    return vault;
  });
}

export function getMutualFunds(memberId?: string | 'all'): MutualFundHolding[] {
  const allFunds = getActiveVault().mutualFunds || [];
  return allFunds.filter((m) => matchesMember(m.memberId, memberId));
}

export function saveMutualFunds(mutualFunds: MutualFundHolding[], memberId?: string | 'all'): void {
  updateActiveVault((vault) => {
    let updatedFunds: MutualFundHolding[];
    if (memberId && memberId !== 'all') {
      const others = (vault.mutualFunds || []).filter((m) => !matchesMember(m.memberId, memberId));
      updatedFunds = [...others, ...mutualFunds];
    } else {
      updatedFunds = mutualFunds;
    }
    return { ...vault, mutualFunds: updatedFunds };
  });
}

export function getDebtHoldings(memberId?: string | 'all'): DebtHolding[] {
  const allDebts = getActiveVault().debtHoldings || [];
  return allDebts.filter((d) => matchesMember(d.memberId, memberId));
}

export function saveDebtHoldings(debts: DebtHolding[], memberId?: string | 'all'): void {
  updateActiveVault((vault) => {
    let updatedDebts: DebtHolding[];
    if (memberId && memberId !== 'all') {
      const others = (vault.debtHoldings || []).filter((d) => !matchesMember(d.memberId, memberId));
      updatedDebts = [...others, ...debts];
    } else {
      updatedDebts = debts;
    }
    return { ...vault, debtHoldings: updatedDebts };
  });
}

export function getLoans(memberId?: string | 'all'): LoanItem[] {
  const allLoans = getActiveVault().loans || [];
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
  updateActiveVault((vault) => {
    let updatedLoans: LoanItem[];
    if (memberId && memberId !== 'all') {
      const others = (vault.loans || []).filter((l) => !matchesMember(l.memberId, memberId));
      updatedLoans = [...others, ...loans];
    } else {
      updatedLoans = loans;
    }
    return { ...vault, loans: updatedLoans };
  });
}

export function getPolicies(memberId?: string | 'all'): Policy[] {
  const policies = getActiveVault().policies || [];
  return policies
    .filter((p: any) => matchesMember(p.memberId, memberId))
    .map((p: any) => ({
      ...p,
      premiumAmount: typeof p.premiumAmount === 'number' ? p.premiumAmount : (typeof p.annualPremium === 'number' ? p.annualPremium : 0)
    }));
}

export function savePolicies(policies: Policy[], memberId?: string | 'all'): void {
  updateActiveVault((vault) => {
    let updatedPolicies: Policy[];
    if (memberId && memberId !== 'all') {
      const others = (vault.policies || []).filter((p: any) => !matchesMember(p.memberId, memberId));
      updatedPolicies = [...others, ...policies];
    } else {
      updatedPolicies = policies;
    }
    return { ...vault, policies: updatedPolicies };
  });
}

export function getNotes(memberId?: string | 'all'): Note[] {
  const allNotes = getActiveVault().notes || [];
  return allNotes.filter((n) => matchesMember(n.memberId, memberId));
}

export function saveNotes(notes: Note[], memberId?: string | 'all'): void {
  updateActiveVault((vault) => {
    let updatedNotes: Note[];
    if (memberId && memberId !== 'all') {
      const others = (vault.notes || []).filter((n) => !matchesMember(n.memberId, memberId));
      updatedNotes = [...others, ...notes];
    } else {
      updatedNotes = notes;
    }
    return { ...vault, notes: updatedNotes };
  });
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

  let yearGrowthAmount = '+₹ 0';
  let yearGrowthPercent = 0.0;

  if (netWorth > 0) {
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
    'Mortgage': '#6366F1',
    'Home Loan': '#4F46E5',
    'Personal Loan': '#EC4899',
    'Auto Loan': '#F59E0B',
    'Car Loan': '#F59E0B',
    'Education Loan': '#0D9488',
    'Credit Card': '#8B5CF6',
    'Other': '#9CA3AF'
  };

  const entries = Object.entries(groupTotals);
  const items = entries.map(([name, val]) => ({
    name,
    value: Math.round((val / totalLiabilities) * 100),
    color: colors[name] || '#6366F1'
  }));

  const sum = items.reduce((acc, i) => acc + i.value, 0);
  if (sum !== 100 && items.length > 0) {
    const diff = 100 - sum;
    const largest = items.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), items[0]);
    largest.value += diff;
  }

  return items;
}
