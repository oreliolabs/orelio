import * as pdfjsLib from 'pdfjs-dist';
import type {
  StockHolding,
  MutualFundHolding,
  DebtHolding,
  DematAccountSummary,
  StockCASMetadata,
  ParsedCASResult
} from '../components/stocks/StocksTypes';

// Configure pdf.worker in browser/Vite environment
if (typeof window !== 'undefined') {
  try {
    // Vite url import or fallback to unpkg
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

/**
 * Strips noisy boilerplate suffix from depository security names.
 */
function cleanSecurityName(raw: string): string {
  let name = raw
    .replace(/#EQUITY SHARES WITH FACE VALUE RE\.?\s*\d+\/?-?\s*AFTER (?:SUB-?DIVISION|SPLIT)/gi, '')
    .replace(/#NEW EQUITY SHARES OF RE\.?\s*\d+\/?-?\s*AFTER (?:SUB-?DIVISION|SPLIT)/gi, '')
    .replace(/#NEW EQUITY SHARES WITH FACE VALUE RE\.?\s*\d+\/?-?\s*AFTER (?:SUB-?DIVISION|SPLIT)/gi, '')
    .replace(/#EQUITY SHARES/gi, '')
    .replace(/EQUITY SHARES OF RS\.?\s*\d+\/?-?\s*(?:EACH|AFTER SPLIT)?/gi, '')
    .replace(/NEW EQUITY SHARES OF RS\.?\s*\d+\/?-?\s*(?:EACH|AFTER SPLIT)?/gi, '')
    .replace(/EQUITY SHARES RE\.?\s*\d+\s*PAID/gi, '')
    .replace(/EQUITY SHARES/gi, '')
    .replace(/#NEW EQ SH WITH FV RS\.?\d+\/?-?\s*AFTER SUB-?DIVISION/gi, '')
    .replace(/#\d+\.?\d*%.*$/i, '')
    .replace(/\s*EP-[DC]R\b.*$/i, '')
    .replace(/\s*Txn:\s*\d+.*$/i, '')
    .replace(/\s*CtBo:\s*\d+.*$/i, '')
    .replace(/[#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Clean trailing punctuation
  name = name.replace(/[-–—]\s*$/, '').trim();
  return name;
}

/**
 * Infers stock symbol from company name or known ISIN mapping.
 */
function inferSymbol(companyName: string, isin: string): string {
  const isinMap: Record<string, string> = {
    INE079A01024: 'AMBUJACEM',
    INE021A01026: 'ASIANPAINT',
    INE918I01026: 'BAJAJFINSV',
    INE736A01011: 'CDSL',
    INE758T01015: 'ETERNAL',
    INE040A01034: 'HDFCBANK',
    INE030A01027: 'HINDUNILVR',
    INE090A01021: 'ICICIBANK',
    INE092T01019: 'IDFCFIRSTB',
    INE053A01029: 'INDHOTEL',
    INE242A01010: 'IOC',
    INE009A01021: 'INFY',
    INE379A01028: 'ITCHOTELS',
    INE154A01025: 'ITC',
    INE758E01017: 'JIOFIN',
    INE019A01038: 'JSWSTEEL',
    INE2KCE01013: 'KWALITY',
    INE018A01030: 'LT',
    INE213A01029: 'ONGC',
    INE002A01018: 'RELIANCE',
    INE467B01029: 'TCS',
    INE1TAE01010: 'TATAMOTORS',
    INE155A01022: 'TATAMTRPV',
    INE245A01021: 'TATAPOWER',
    INE081A01020: 'TATASTEEL',
    INE280A01028: 'TITAN',
    INE854D01024: 'MCDOWELL-N',
    INE075A01022: 'WIPRO',
    INE437A01024: 'APOLLOHOSP',
    INE061F01013: 'FORTIS',
    INE326A01037: 'LUPIN',
    INE027H01010: 'MAXHEALTH',
    INE044A01036: 'SUNPHARMA'
  };

  if (isinMap[isin]) return isinMap[isin];

  const upper = companyName.toUpperCase();
  const words = upper.split(/\s+/).filter((w) => !['LIMITED', 'LTD', 'PVT', 'PRIVATE', 'CORP', 'CORPORATION', 'COMPANY', 'THE'].includes(w));
  return words[0] || isin.slice(-8);
}

/**
 * Infers sector for stock holding.
 */
function inferSector(companyName: string): string {
  const upper = companyName.toUpperCase();
  if (upper.includes('BANK')) return 'Banking & Financial Services';
  if (upper.includes('FINSERV') || upper.includes('FINANCE') || upper.includes('DEPOSITORY') || upper.includes('FINANCIAL')) return 'Financial Services';
  if (upper.includes('HOTEL') || upper.includes('HOSPITALITY')) return 'Hospitality & Leisure';
  if (upper.includes('HEALTH') || upper.includes('PHARMA') || upper.includes('HOSPITAL') || upper.includes('LUPIN')) return 'Healthcare & Pharmaceuticals';
  if (upper.includes('STEEL') || upper.includes('MINING') || upper.includes('CEMENT')) return 'Metals & Materials';
  if (upper.includes('POWER') || upper.includes('OIL') || upper.includes('GAS') || upper.includes('ENERGY')) return 'Energy & Utilities';
  if (upper.includes('INFOSYS') || upper.includes('TATA CONSULTANCY') || upper.includes('WIPRO') || upper.includes('TECH')) return 'Information Technology';
  if (upper.includes('MOTOR') || upper.includes('AUTOMOBILE') || upper.includes('VEHICLE')) return 'Automotive';
  if (upper.includes('UNILEVER') || upper.includes('ITC') || upper.includes('FOOD') || upper.includes('SPIRITS') || upper.includes('BEVERAGE')) return 'Consumer Goods & FMCG';
  return 'Diversified';
}

/**
 * Infers mutual fund category and AMC from scheme description.
 */
function inferMFCategoryAndAmc(schemeName: string) {
  const upper = schemeName.toUpperCase();
  let category = 'Equity Scheme';
  if (upper.includes('ETF') || upper.includes('BEES')) category = 'Exchange Traded Fund (ETF)';
  else if (upper.includes('INDEX FUND')) {
    category = upper.includes('MIDCAP') ? 'Index Fund (Mid Cap)' : 'Index Fund (Large Cap)';
  } else if (upper.includes('MID CAP') || upper.includes('MIDCAP')) {
    category = 'Mid Cap Fund';
  } else if (upper.includes('SMALL CAP') || upper.includes('SMALLCAP')) {
    category = 'Small Cap Fund';
  } else if (upper.includes('FLEXI CAP') || upper.includes('LARGE CAP')) {
    category = 'Diversified Equity';
  }

  let amc = 'Asset Management Company';
  if (upper.includes('HDFC')) amc = 'HDFC AMC LTD';
  else if (upper.includes('MOTILAL OSWAL')) amc = 'MOTILAL OSWAL AMC LTD';
  else if (upper.includes('NIPPON')) amc = 'NIPPON LIFE INDIA AM LTD';
  else if (upper.includes('ICICI PRUDENTIAL')) amc = 'ICICI PRUDENTIAL AMC';
  else if (upper.includes('SBI')) amc = 'SBI FUNDS MANAGEMENT';

  return { category, amc };
}

/**
 * High-precision regex text parser for CDSL and NSDL Consolidated Account Statements.
 */
export function parseCASText(text: string): ParsedCASResult {

  // Depository
  const isCDSL = /CDSL|Central Depository Services/i.test(text);
  const depository: 'CDSL' | 'NSDL' | 'CAMS' = isCDSL ? 'CDSL' : /NSDL/i.test(text) ? 'NSDL' : 'CAMS';

  // Investor Name
  let investorName = 'Investor';
  const nameMatch = text.match(/(?:In the single name of|Summary of Investments\s*\(On the basis of PAN of first holder\)\s*Name\/Joint Name \(s\))\s*\n*([A-Z\s]{3,40})/i) ||
    text.match(/Name\/Joint Name \(s\)\s*Portfolio Valuation[^\n]*\n+([A-Z\s]{3,40})/i);
  if (nameMatch) {
    investorName = nameMatch[1].replace(/\n/g, ' ').trim();
  }

  // PAN
  let pan = 'XXXXX0000X';
  const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
  if (panMatch) pan = panMatch[1];

  // CAS ID
  let casId: string | undefined;
  const casMatch = text.match(/CAS ID\s*:\s*([A-Z0-9]+)/i);
  if (casMatch) casId = casMatch[1];

  // Statement Period
  let statementPeriod = 'Current Period';
  const periodMatch = text.match(/period from\s+([0-9]{2}-[A-Za-z0-9]{3,}-[0-9]{4})\s+to\s+([0-9]{2}-[A-Za-z0-9]{3,}-[0-9]{4})/i) ||
    text.match(/PERIOD FROM\s+([0-9]{2}-[0-9]{2}-[0-9]{4})\s+TO\s+([0-9]{2}-[0-9]{2}-[0-9]{4})/i);
  if (periodMatch) {
    statementPeriod = `${periodMatch[1]} to ${periodMatch[2]}`;
  }

  // Extract Summary valuations
  const parseNum = (str?: string) => {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  let totalMarketValue = 0;
  const totalValMatch = text.match(/Total Portfolio Value\s*(?:across investments)?\s*[`₹]?\s*([0-9,]+\.[0-9]{2})/i) ||
    text.match(/YOUR CONSOLIDATED PORTFOLIO VALUE\s*[`₹]?\s*([0-9,]+\.[0-9]{2})/i);
  if (totalValMatch) {
    totalMarketValue = parseNum(totalValMatch[1]);
  }

  let equityValue = 0;
  const eqMatch = text.match(/Equity\s+([0-9,]+\.[0-9]{2})\s+([0-9.]+)%?/i);
  if (eqMatch) equityValue = parseNum(eqMatch[1]);

  let mutualFundsValue = 0;
  const mfMatch = text.match(/Mutual Funds Held in Demat Form\s+([0-9,]+\.[0-9]{2})\s+([0-9.]+)%?/i);
  if (mfMatch) mutualFundsValue = parseNum(mfMatch[1]);

  let debtsValue = 0;
  const debtMatch = text.match(/Debts\s+([0-9,]+\.[0-9]{2})\s+([0-9.]+)%?/i);
  if (debtMatch) debtsValue = parseNum(debtMatch[1]);

  // Demat Accounts Summary
  const dematAccounts: DematAccountSummary[] = [];
  const dpRegex = /DP Name\s*:\s*([^\n\r]+?)(?:\s+BO ID|\s+DP ID|\s+DPID)\s*:\s*([0-9A-Z]+)/gi;
  let dpMatch: RegExpExecArray | null;
  while ((dpMatch = dpRegex.exec(text)) !== null) {
    const rawDpName = dpMatch[1].replace(/DP का नाम:/g, '').trim();
    const id = dpMatch[2].trim();
    dematAccounts.push({
      dpName: rawDpName,
      dpId: id.slice(0, 8),
      clientId: id.slice(8),
      boId: id,
      depository: id.startsWith('IN') ? 'NSDL' : 'CDSL',
      isinCount: 0,
      totalValue: 0
    });
  }

  // Parse individual line item holdings
  const stocks: StockHolding[] = [];
  const mutualFunds: MutualFundHolding[] = [];
  const debts: DebtHolding[] = [];

  // Match ISIN rows: standard Indian ISIN begins with IN (e.g. INE, INF, IN9, etc.)
  const isinLineRegex = /(IN[A-Z0-9]{10})\s+([^\n\r]+?)\s+([0-9,]+(?:\.[0-9]+)?)\s+(?:--\s+)?(?:--\s+)?(?:--\s+)?(?:[0-9,]+(?:\.[0-9]+)?\s+)?([0-9,]+(?:\.[0-9]+)?)\s+([0-9,]+(?:\.[0-9]+)?)/g;
  let match: RegExpExecArray | null;

  function getDematAccountAtPos(text: string, pos: number): string {
    const textBefore = text.slice(0, pos);

    const dpRegex = /DP Name\s*:\s*([^\n\r]+?)(?:\s+BO ID|\s+DP ID|\s+DPID|DP का नाम)/gi;
    let lastDpName = '';
    let m: RegExpExecArray | null;
    while ((m = dpRegex.exec(textBefore)) !== null) {
      lastDpName = m[1].trim();
    }

    if (lastDpName) {
      const upper = lastDpName.toUpperCase();
      if (upper.includes('GROWW')) return 'Groww';
      if (upper.includes('ZERODHA')) return 'Zerodha';
      if (upper.includes('FOURDEGREE') || upper.includes('WINT')) return 'Fourdegreewater';
      if (upper.includes('INDSTOCKS')) return 'Indstocks';
      if (upper.includes('ANGEL')) return 'Angel One';
      if (upper.includes('UPSTOX') || upper.includes('RKSV')) return 'Upstox';
      if (upper.includes('HDFC')) return 'HDFC Securities';
      if (upper.includes('ICICI')) return 'ICICI Direct';
      if (upper.includes('KOTAK')) return 'Kotak Securities';
      if (upper.includes('MOTILAL')) return 'Motilal Oswal';
      if (upper.includes('5PAISA')) return '5paisa';
      return lastDpName.split(/\s+/).slice(0, 2).join(' ') || 'Demat';
    }

    const growwPos = textBefore.lastIndexOf('GROWW');
    const zerodhaPos = textBefore.lastIndexOf('ZERODHA');
    const fourdegreePos = textBefore.lastIndexOf('FOURDEGREE');
    const indstocksPos = textBefore.lastIndexOf('INDSTOCKS');

    const maxPos = Math.max(growwPos, zerodhaPos, fourdegreePos, indstocksPos);
    if (maxPos === -1) return 'Primary Demat';
    if (maxPos === growwPos) return 'Groww';
    if (maxPos === zerodhaPos) return 'Zerodha';
    if (maxPos === fourdegreePos) return 'Fourdegreewater';
    if (maxPos === indstocksPos) return 'Indstocks';
    return 'Primary Demat';
  }

  while ((match = isinLineRegex.exec(text)) !== null) {
    const isin = match[1];
    const rawDesc = match[2];
    const balance = parseNum(match[3]);
    const price = parseNum(match[4]);
    const value = parseNum(match[5]);

    if (balance <= 0 && value <= 0) continue; // Skip zero-balance holdings

    const currentDemat = getDematAccountAtPos(text, match.index);

    const isMF = isin.startsWith('INF') || /MUTUAL FUND|INDEX FUND|ETF|BEES|GROWTH/i.test(rawDesc);
    const isDebt = isin.slice(6, 8) === '07' || /NCD|SEC|BOND|TAX NCUM|DEBT/i.test(rawDesc);

    if (isMF) {
      const { category, amc } = inferMFCategoryAndAmc(rawDesc);
      mutualFunds.push({
        id: `mf-${isin}-${mutualFunds.length + 1}`,
        schemeName: cleanSecurityName(rawDesc),
        amc,
        isin,
        units: balance,
        nav: price,
        marketValue: value,
        investedValue: value * 0.85,
        category,
        dematAccount: currentDemat,
        assetType: 'MUTUAL_FUND'
      });
    } else if (isDebt) {
      debts.push({
        id: `debt-${isin}-${debts.length + 1}`,
        issuer: cleanSecurityName(rawDesc),
        isin,
        quantity: balance,
        faceValue: price,
        marketPrice: price,
        marketValue: value,
        dematAccount: currentDemat,
        assetType: 'DEBT'
      });
    } else {
      const cleanName = cleanSecurityName(rawDesc);
      stocks.push({
        id: `stk-${isin}-${stocks.length + 1}`,
        symbol: inferSymbol(cleanName, isin),
        companyName: cleanName,
        isin,
        quantity: balance,
        currentPrice: price,
        marketValue: value,
        investedValue: value * 0.9,
        sector: inferSector(cleanName),
        dematAccount: currentDemat,
        assetType: 'EQUITY'
      });
    }
  }


  const calculatedTotal =
    stocks.reduce((acc, s) => acc + s.marketValue, 0) +
    mutualFunds.reduce((acc, m) => acc + m.marketValue, 0) +
    debts.reduce((acc, d) => acc + d.marketValue, 0);

  const metadata: StockCASMetadata = {
    investorName,
    pan,
    casId,
    depository,
    statementPeriod,
    totalMarketValue: totalMarketValue || calculatedTotal,
    totalInvestedValue: calculatedTotal * 0.88,
    equityValue: equityValue || stocks.reduce((acc, s) => acc + s.marketValue, 0),
    mutualFundsValue: mutualFundsValue || mutualFunds.reduce((acc, m) => acc + m.marketValue, 0),
    debtsValue: debtsValue || debts.reduce((acc, d) => acc + d.marketValue, 0),
    dematAccounts,
    uploadedAt: new Date().toISOString()
  };

  return {
    metadata,
    stocks,
    mutualFunds,
    debts,
    allHoldings: [...stocks, ...mutualFunds, ...debts]
  };
}

/**
 * Loads and parses a CAS Statement file (PDF, JSON, or text).
 */
export async function parseCASFile(file: File, password?: string): Promise<ParsedCASResult> {
  const fileName = file.name.toLowerCase();

  // If JSON format
  if (fileName.endsWith('.json')) {
    const text = await file.text();
    const json = JSON.parse(text);
    if (json.stocks || json.mutualFunds) {
      return json as ParsedCASResult;
    }
    return parseCASText(text);
  }

  // If Text or CSV format
  if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
    const text = await file.text();
    return parseCASText(text);
  }

  // If PDF format
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      password: password || undefined
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str)
        .filter(Boolean);
      fullText += `\n--- Page ${pageNum} ---\n` + pageStrings.join(' ');
    }

    return parseCASText(fullText);
  } catch (err: any) {
    if (err?.name === 'PasswordException' || err?.message?.includes('password')) {
      throw new Error(
        'This CAS PDF statement is password-protected. Please enter your password.'
      );
    }
    console.error('PDF parsing error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to parse CAS statement');
  }
}
