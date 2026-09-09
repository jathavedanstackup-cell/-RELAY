import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { CaseData } from '../types';

interface TelemetryJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseData;
}

export const TelemetryJsonModal: React.FC<TelemetryJsonModalProps> = ({
  isOpen,
  onClose,
  caseData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const telemetryPayload = {
    relay_version: 'v4.2.0-autonomous',
    case_id: caseData.id,
    case_number: caseData.caseNumber,
    timestamp: new Date().toISOString(),
    autonomous_lead: caseData.autonomousLead,
    execution_pipeline: {
      status: caseData.status,
      stages: caseData.stages,
      progress_percent: caseData.progressPercent
    },
    active_agent_telemetry: {
      current_action: caseData.currentAction,
      provenance_chain: caseData.provenanceChain,
      ground_truth: caseData.groundTruth,
      connected_authority_seals: caseData.connectedSeals
    },
    cryptographic_integrity: {
      merkle_root: '0x8f4e22a8901c90a1b5592881902919aa782910bc8821094',
      ecdsa_signature: 'MEQCID19a...88b2091ca2',
      algorithm: 'secp256k1/sha256'
    }
  };

  const jsonString = JSON.stringify(telemetryPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Autonomous Agent Telemetry</h3>
              <p className="text-[11px] text-secondary font-mono">Case #{caseData.caseNumber} • Raw Ledger State</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-surface-variant bg-surface-container text-xs font-mono text-secondary hover:text-on-surface transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-tertiary-container" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto bg-[#1b1b1e] text-emerald-400 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap selection:bg-emerald-800 selection:text-white">
            {jsonString}
          </pre>
        </div>

        <div className="px-6 py-3 bg-surface-container-low border-t border-surface-variant flex items-center justify-between text-[11px] font-mono text-secondary">
          <span>All telemetry events cryptographically sealed</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-surface-container text-on-surface font-sans text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
