import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';
import { parseCASFile } from '../../utils/casParser';
import type { ParsedCASResult } from './StocksTypes';

interface UploadStockCASModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ParsedCASResult) => void;
}

export const UploadStockCASModal: React.FC<UploadStockCASModalProps> = ({
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
    const validExtensions = ['.pdf', '.json', '.csv', '.txt'];
    const lowerName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please upload a valid CAS file in PDF, JSON, TXT, or CSV format.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    // In India, most CDSL / NSDL / CAMS CAS PDFs are password encrypted
    if (lowerName.endsWith('.pdf')) {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please choose a CAS statement file to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedData = await parseCASFile(file, password.trim());
      onSuccess(parsedData);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse CAS statement';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#C3C6CE]/40 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 md:p-8 pb-2 flex items-start justify-between bg-gradient-to-b from-[#FBFCFD] to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '26px' }}>
                upload_file
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#00162A] tracking-tight">
                Upload CAS Statement
              </h2>
              <p className="text-xs text-[#707975] mt-1">
                Upload your CAMS (Consolidated Account Statement) to import your demat holdings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined select-none text-xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 md:px-8 md:pb-8 pt-2 overflow-y-auto space-y-5">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3
              ${isDragging
                ? 'border-[#006A65] bg-[#E6F4F1]/30 scale-[0.99]'
                : file
                ? 'border-[#006A65] bg-[#E6F4F1]/30'
                : 'border-[#C3C6CE]/60 hover:border-[#006A65] hover:bg-[#FBFCFD]'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json,.csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${file ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E6F4F1] text-[#006A65]'}`}>
              <span className="material-symbols-outlined select-none text-2xl">
                {file ? 'check_circle' : 'description'}
              </span>
            </div>

            <div className="space-y-1">
              {file ? (
                <div>
                  <p className="text-sm font-bold text-[#00162A] break-all">{file.name}</p>
                  <p className="text-xs text-[#707975]">
                    {(file.size / 1024).toFixed(1)} KB • Click to replace file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-[#00162A]">
                    Drag & Drop your CAS statement here
                  </p>
                  <p className="text-xs text-[#707975] mt-0.5">
                    Supports CAMS PDF only
                  </p>
                </div>
              )}
            </div>

            {/* <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F4F5] text-[#43474D]">PDF</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F4F5] text-[#43474D]">CSV</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F4F5] text-[#43474D]">JSON</span>
            </div> */}
          </div>

          {/* Password Prompt for PDF files */}
          {needsPassword && (
            <div className="p-4 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#00162A] flex items-center gap-1.5">
                  <span className="material-symbols-outlined select-none text-sm text-[#006A65]">lock</span>
                  <span>PDF Password (if encrypted)</span>
                </label>
                <span className="text-[10px] text-[#74777F] font-semibold">(Optional if unprotected)</span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. PAN (e.g. ABCDE1234F)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C3C6CE]/60 rounded-xl text-xs font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777F] hover:text-[#00162A]"
                >
                  <span className="material-symbols-outlined select-none text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-[#707975] leading-relaxed">
                Tip: CAS PDFs are typically password protected with your 10-character PAN in uppercase.
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFF8F7] border border-[#BA1A1A]/30 text-[#BA1A1A] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span className="material-symbols-outlined select-none text-base flex-shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}


          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <CancelButton onClick={onClose} disabled={isProcessing}>
              Cancel
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={!file || isProcessing}
              isSaving={isProcessing}
            >
              {isProcessing ? 'Processing Statement...' : 'Import Holdings'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
