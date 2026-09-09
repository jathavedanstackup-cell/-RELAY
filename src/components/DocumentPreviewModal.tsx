import React from 'react';
import { X, Download, ShieldCheck, FileText, CheckCircle2, ExternalLink, Printer } from 'lucide-react';
import { DocumentItem, OutcomeItem } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentItem | null;
  outcomeItem?: OutcomeItem | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  outcomeItem
}) => {
  if (!isOpen) return null;

  const title = outcomeItem?.title || document?.filename || 'Document Preview';
  const subtitle = outcomeItem?.secondaryDetail || document?.evidenceRelevance || 'Verified Artifact';
  const signature = document?.signature || outcomeItem?.footerHash || 'SHA-256: 8f4e..c90a1b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface truncate max-w-md">{title}</h3>
              <p className="text-[11px] text-secondary font-mono flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-tertiary-container" />
                <span>Verified by RELAY Autonomous Provenance Engine</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Downloading official cryptographic verification PDF package...');
              }}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Download Artifact"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Certificate Badge */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">Integrity Seal</span>
              <p className="text-xs font-mono font-medium text-on-surface">{signature}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-mono text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              VERIFIED
            </span>
          </div>

          {/* Rendered Document View */}
          <div className="p-6 rounded-xl border border-surface-variant bg-white text-neutral-900 shadow-sm font-sans space-y-5">
            <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-primary">RELAY EVIDENCE DOSSIER</span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">CASE #1048</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Autonomous Life-Administration System • Certified Artifact</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400">Timestamp: 10:44:12 EST</span>
                <p className="text-xs font-semibold text-neutral-800">Direct Authority API Token</p>
              </div>
            </div>

            {/* Document Content Details */}
            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <p className="font-medium text-neutral-900">
                {subtitle}
              </p>
              
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-lg text-[11px] font-mono">
                <div>
                  <span className="text-neutral-500 block">Passenger / Principal:</span>
                  <span className="font-bold text-neutral-800">Sarah Jenkins</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Booking Reference / PNR:</span>
                  <span className="font-bold text-primary">#X99KLR (BA178)</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Travel Segment:</span>
                  <span className="text-neutral-800">JFK (New York) → LHR (London)</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Status:</span>
                  <span className="text-emerald-700 font-bold">Confirmed &amp; Ticketed</span>
                </div>
              </div>

              {document?.previewSnippet && (
                <div className="p-3 bg-neutral-900 text-neutral-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto">
                  {document.previewSnippet}
                </div>
              )}

              <p className="text-[11px] text-neutral-500">
                This document was generated and filed under autonomous operational authority.
                All signatures, NDC flight tokens, and statutory filings are permanently logged
                to the immutable case audit ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-surface-variant flex items-center justify-between">
          <span className="text-[11px] text-secondary font-mono">Chain of Custody ID: #CC-1048-91024</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
