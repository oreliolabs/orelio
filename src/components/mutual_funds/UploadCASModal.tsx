import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';
import { parseCASPdfFile, parseCASJsonFile, parseCASCSVFile } from './casParser';
import { SAMPLE_CAS_METADATA, SAMPLE_SCHEMES } from './sampleCASData';
import type { MutualFundScheme, CASStatementMetadata } from './MutualFundsTypes';

interface UploadCASModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { schemes: MutualFundScheme[]; metadata: CASStatementMetadata }) => void;
}

export const UploadCASModal: React.FC<UploadCASModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFile(null);
      setPassword('');
      setNeedsPassword(false);
      setIsProcessing(false);
      setErrorMessage(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    const validExtensions = ['.pdf', '.json', '.csv'];
    const lowerName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please upload a valid CAS file in PDF, JSON, or CSV format.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    // If PDF, prepare for possible password prompt
    if (lowerName.endsWith('.pdf')) {
      // In India, most CAMS/KFintech CAS PDFs are encrypted by default
      setNeedsPassword(true);
    } else {
      setNeedsPassword(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleProcessFile = async () => {
    if (!file) {
      setErrorMessage('Please choose or drop a CAS statement file.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      let result;

      if (fileNameLower.endsWith('.pdf')) {
        result = await parseCASPdfFile(file, password.trim());
      } else if (fileNameLower.endsWith('.json')) {
        result = await parseCASJsonFile(file);
      } else if (fileNameLower.endsWith('.csv')) {
        result = await parseCASCSVFile(file);
      } else {
        throw new Error('Unsupported file format.');
      }

      if (!result.success) {
        if (result.isPasswordProtected) {
          setNeedsPassword(true);
          setErrorMessage(result.error || 'Password required to decrypt this statement.');
        } else {
          setErrorMessage(result.error || 'Failed to extract mutual funds data.');
        }
        setIsProcessing(false);
        return;
      }

      if (result.schemes.length === 0) {
        setErrorMessage('No mutual fund folios could be detected in this file.');
        setIsProcessing(false);
        return;
      }

      const metadata: CASStatementMetadata = result.metadata || {
        investorName: 'Investor',
        statementPeriod: 'Latest',
        casType: 'CAMS',
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        totalFolios: new Set(result.schemes.map((s) => s.folioNumber)).size,
        totalSchemes: result.schemes.length
      };

      onSuccess({
        schemes: result.schemes,
        metadata
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while parsing the CAS statement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess({
        schemes: SAMPLE_SCHEMES,
        metadata: {
          ...SAMPLE_CAS_METADATA,
          uploadedAt: new Date().toISOString()
        }
      });
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full screen backdrop overlay */}
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-[#C3C6CE]/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-5 pb-4 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '22px' }}>
                upload_file
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#00162A] tracking-tight">Upload CAS Statement</h2>
              <p className="text-xs text-[#707975] font-medium">Sync CAMS, KFintech, or MFCentral statement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
          >
            <span className="material-symbols-outlined select-none">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 no-scrollbar">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-start gap-3 text-[#BA1A1A]">
              <span className="material-symbols-outlined select-none text-xl flex-shrink-0 mt-0.5">
                error
              </span>
              <div className="text-xs font-semibold leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200
              ${isDragging
                ? 'border-[#006A65] bg-[#E6F4F1]/40 scale-[1.01]'
                : file
                  ? 'border-[#006A65]/60 bg-[#FBFCFD]'
                  : 'border-[#C3C6CE]/60 hover:border-[#006A65] bg-[#FBFCFD] hover:bg-[#F2F4F5]/60'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center transition-transform hover:scale-110">
                <span className="material-symbols-outlined select-none" style={{ fontSize: '28px' }}>
                  {file ? 'description' : 'cloud_upload'}
                </span>
              </div>

              {file ? (
                <div className="space-y-1">
                  <span className="block text-sm font-bold text-[#00162A] break-all">
                    {file.name}
                  </span>
                  <span className="block text-xs font-semibold text-[#006A65]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="block text-sm font-bold text-[#00162A]">
                    Drag & Drop your CAS Statement or <span className="text-[#006A65] underline underline-offset-2">Browse</span>
                  </span>
                  <span className="block text-xs font-medium text-[#74777F]">
                    Supports official CAMS / KFintech / MFCentral PDF, JSON, or CSV
                  </span>
                </div>
              )}
            </div>

            {/* Formats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-[#C3C6CE]/20">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider">
                PDF (ENCRYPTED / OPEN)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider">
                MFCENTRAL JSON
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider">
                CAS CSV
              </span>
            </div>
          </div>

          {/* Password Section for Encrypted PDFs */}
          {(needsPassword || file?.name.toLowerCase().endsWith('.pdf')) && (
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  PDF PASSWORD (IF ENCRYPTED)
                </label>
                <span className="text-[10px] font-semibold text-[#006A65]">
                  Usually PAN (uppercase) or DOB (DDMMYYYY)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. ABCDE1234F or 15021980"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777F] hover:text-[#00162A] transition-colors"
                >
                  <span className="material-symbols-outlined select-none text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-[#74777F] leading-snug">
                Your file is parsed completely inside your browser locally. No password or financial statement leaves your device.
              </p>
            </div>
          )}

          {/* Quick Demo Option */}
          <div className="p-4 rounded-2xl bg-[#E6F4F1]/50 border border-[#006A65]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#006A65] uppercase tracking-wider">
                <span className="material-symbols-outlined select-none text-sm">
                  auto_awesome
                </span>
                <span>Want to test immediately?</span>
              </div>
              <p className="text-xs text-[#43474D]">
                Load sample CAS data with top Indian funds across Equity, Debt & Hybrid.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-white border border-[#006A65]/30 text-xs font-bold text-[#006A65] hover:bg-[#006A65] hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <span className="material-symbols-outlined select-none text-sm">
                bolt
              </span>
              <span>Load Sample CAS</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 bg-white flex-shrink-0">
          <CancelButton onClick={onClose} />
          <SaveButton
            onClick={handleProcessFile}
            isSaving={isProcessing}
            disabled={!file}
          >
            {isProcessing ? 'Parsing Statement...' : 'Import Portfolio'}
          </SaveButton>
        </div>
      </div>
    </div>,
    document.body
  );
};
