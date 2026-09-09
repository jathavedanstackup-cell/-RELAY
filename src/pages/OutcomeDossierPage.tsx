import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Share2,
  ArrowRight,
  ExternalLink,
  FileText,
  Clock,
  DollarSign,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles,
  Plane,
  Building,
  Scale,
  MessageSquare
} from 'lucide-react';
import { CaseOutcome, OutcomeItem } from '../types';

interface OutcomeDossierPageProps {
  outcome: CaseOutcome;
  onNavigate: (route: string) => void;
  onOpenOutcomeModal: (item: OutcomeItem) => void;
}

export const OutcomeDossierPage: React.FC<OutcomeDossierPageProps> = ({
  outcome,
  onNavigate,
  onOpenOutcomeModal
}) => {
  const getDocumentIcon = (type: OutcomeItem['documentType']) => {
    switch (type) {
      case 'ticket':
        return Plane;
      case 'voucher':
        return Building;
      case 'claim':
        return Scale;
      case 'comms':
        return MessageSquare;
      default:
        return FileText;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Breadcrumbs & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-secondary">
            <button onClick={() => onNavigate('/cases')} className="hover:text-on-surface">Cases</button>
            <span>/</span>
            <button onClick={() => onNavigate(`/cases/${outcome.caseId}`)} className="hover:text-on-surface">
              Case #{outcome.caseId}
            </button>
            <span>/</span>
            <span className="text-tertiary-container font-bold">Outcome Dossier</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Case Resolution Dossier
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RESOLVED</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting signed PDF resolution dossier with cryptographic proofs...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Dossier (PDF)</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Another Case</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Complete Tracker */}
      <div className="p-3.5 rounded-2xl border border-tertiary/20 bg-tertiary-fixed/10 flex items-center justify-between overflow-x-auto text-xs font-mono">
        {['1. UNDERSTAND', '2. PLAN', '3. EXECUTE', '4. VERIFY', '5. RESOLVED'].map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 px-2 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-tertiary-container shrink-0" />
            <span className="font-bold text-on-surface">{step}</span>
            {idx < 4 && <span className="text-secondary/50 mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Hero Banner: Your Problem is Handled */}
      <div className="p-6 sm:p-8 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-tertiary-container">
            <ShieldCheck className="w-4 h-4" />
            <span>OPERATIONAL MISSION COMPLETE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            {outcome.headline}
          </h2>
          <p className="text-sm sm:text-base text-secondary max-w-3xl leading-relaxed">
            {outcome.supportingText}
          </p>
        </div>

        <div className="pt-3 border-t border-surface-variant flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-secondary">
          <span>Master Provenance Ledger: <strong className="text-on-surface">{outcome.masterLedgerHash}</strong></span>
          <span className="text-tertiary-container font-semibold">{outcome.resolvedAt}</span>
        </div>
      </div>

      {/* Bento Grid Metrics (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Financial Benefit */}
        <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
            Net Financial Benefit
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-tertiary-container font-mono">
            {outcome.metrics.netFinancialBenefit}
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            {outcome.metrics.netBenefitSubtext}
          </p>
        </div>

        {/* Time Saved */}
        <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
            Time Saved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-on-surface font-mono">
            {outcome.metrics.timeSaved}
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            {outcome.metrics.timeSavedSubtext}
          </p>
        </div>

        {/* Schedule Slippage */}
        <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
            Schedule Slippage
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">
            {outcome.metrics.scheduleSlippage}
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            {outcome.metrics.scheduleSlippageSubtext}
          </p>
        </div>

        {/* Security & Proof */}
        <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
            Security &amp; Proof
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-on-surface font-mono">
            {outcome.metrics.artifactsCount} Artifacts
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            {outcome.metrics.artifactsSubtext}
          </p>
        </div>
      </div>

      {/* Executed Solutions & Verified Results (4 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Executed Solutions &amp; Verified Results
            </h3>
            <p className="text-sm font-bold text-on-surface mt-0.5">
              4 of 4 Delegated Workstreams Fulfilled
            </p>
          </div>
          <span className="text-xs font-mono text-tertiary-container font-semibold">
            100% Cryptographic Match
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcome.outcomes.map(item => {
            const Icon = getDocumentIcon(item.documentType);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-4 flex flex-col justify-between hover:border-outline-variant transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-secondary">
                        {item.code}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-tertiary-container font-mono">
                      {item.statusDetail}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-on-surface">
                    {item.title}
                  </h4>

                  <p className="text-xs text-secondary leading-relaxed">
                    {item.secondaryDetail}
                  </p>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-variant/50 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-secondary">{item.artifactLabel}</span>
                      <span className="font-bold text-on-surface">{item.artifactValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">{item.verificationLabel}</span>
                      <span className="text-tertiary-container font-semibold">{item.verificationValue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-variant flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-secondary">{item.footerHash}</span>
                  <button
                    onClick={() => onOpenOutcomeModal(item)}
                    className="font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>{item.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cryptographic Chain of Custody Proofs */}
      <div className="p-6 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Cryptographic Verification &amp; Chain of Custody
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Sealed digital signatures &amp; third-party authority tokens
            </p>
          </div>
          <span className="text-[10px] font-mono text-tertiary-container font-semibold">
            Zero Discrepancies
          </span>
        </div>

        <div className="space-y-2.5">
          {outcome.verificationProofs.map(proof => (
            <div
              key={proof.id}
              className="p-3.5 rounded-xl border border-surface-variant bg-surface-container-low flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {proof.icon}
                </span>
                <div>
                  <h5 className="font-bold text-on-surface">{proof.title}</h5>
                  <p className="text-[11px] font-mono text-secondary">{proof.verificationText}</p>
                </div>
              </div>

              {proof.downloadable && (
                <button
                  onClick={() => alert(`Downloading verified artifact: ${proof.title}`)}
                  className="px-3 py-1 rounded-lg border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container font-mono text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Proof</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Dock */}
      <div className="p-4 rounded-2xl border border-surface-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/cases')}
            className="px-4 py-2 rounded-xl border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface text-xs font-semibold"
          >
            ← Back to My Cases
          </button>
          <button
            onClick={() => onNavigate('/documents')}
            className="px-4 py-2 rounded-xl border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface text-xs font-semibold"
          >
            Inspect in Knowledge Vault
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Shareable URL copied to clipboard: https://relay.ai/dossier/1048-verified')}
            className="px-3.5 py-2 rounded-xl border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Report</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container"
          >
            Delegate New Problem
          </button>
        </div>
      </div>
    </div>
  );
};
