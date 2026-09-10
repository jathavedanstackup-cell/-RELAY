import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Paperclip,
  FileText,
  AlertTriangle,
  Layers,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface NewCaseUnderstandingPageProps {
  problemStatement: string;
  attachments: string[];
  onNavigate: (route: string) => void;
  onLaunchExecution: (objectives: string[]) => void | Promise<void>;
  isPlanning: boolean;
  planningError: string | null;
  onRetryPlanning: () => void;
}

export const NewCaseUnderstandingPage: React.FC<NewCaseUnderstandingPageProps> = ({
  problemStatement,
  attachments,
  onNavigate,
  onLaunchExecution,
  isPlanning,
  planningError,
  onRetryPlanning
}) => {
  const [objectives, setObjectives] = useState<string[]>([
    'Secure confirmed rebooking on earliest trans-Atlantic flight (JFK → LHR)',
    'Obtain Heathrow airport transit hotel voucher under carrier statutory duty of care',
    'Assemble and file formal UK/EU261 £520 compensation claim with Civil Aviation Authority',
    'Reschedule London meeting calendar blocks and dispatch emergency SMS updates'
  ]);

  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddObjective = () => {
    if (newObjectiveText.trim()) {
      setObjectives(prev => [...prev, newObjectiveText.trim()]);
      setNewObjectiveText('');
      setIsAdding(false);
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (isPlanning) return;
    onLaunchExecution(objectives);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Intake</span>
        </button>

        <span className="text-[11px] font-mono text-secondary">
          Pipeline: Case Initialization • Stage 1 Deconstruction
        </span>
      </div>

      {/* Main Headline */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed/50 text-on-tertiary-fixed text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-tertiary-container" />
          <span>SITUATION DECONSTRUCTED &amp; VERIFIED</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          RELAY understood your problem.
        </h1>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">
          Review the autonomous execution blueprint before delegating work to operations pods. You retain full veto power and authorization thresholds.
        </p>
      </div>

      {/* Situation Summary Card */}
      <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Problem Statement Ingested</span>
          </span>
          <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-secondary">
            User Authorized
          </span>
        </div>
        <p className="text-sm text-on-surface font-medium leading-relaxed italic">
          "{problemStatement || 'My flight from New York to London was cancelled. I need to be rebooked on the earliest arrival, arrange a hotel voucher at Heathrow, and file full statutory compensation.'}"
        </p>

        {/* Identified Constraints */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-variant/50">
            <span className="text-[10px] text-secondary block">Origin / Dest</span>
            <span className="font-bold text-on-surface">JFK → LHR</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-variant/50">
            <span className="text-[10px] text-secondary block">Arrival Constraint</span>
            <span className="font-bold text-on-surface">&lt; 10:00 AM GMT</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-variant/50">
            <span className="text-[10px] text-secondary block">Statutory Section</span>
            <span className="font-bold text-primary font-mono">UK/EU261 (£520)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-variant/50">
            <span className="text-[10px] text-secondary block">Lodging Right</span>
            <span className="font-bold text-tertiary-container">Duty of Care</span>
          </div>
        </div>
      </div>

      {/* Target Objectives / Outcomes Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Target Outcomes &amp; Delegated Workstreams</h2>
            <p className="text-xs text-secondary">RELAY will not mark this case resolved until each target outcome is verified.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add outcome</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {objectives.map((obj, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-surface-variant bg-surface-container-lowest flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-medium text-on-surface">
                  {obj}
                </span>
              </div>
              <button
                onClick={() => handleRemoveObjective(idx)}
                className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Remove objective"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {isAdding && (
            <div className="p-3 rounded-xl border border-primary bg-surface-container-lowest flex items-center gap-2">
              <input
                type="text"
                value={newObjectiveText}
                onChange={e => setNewObjectiveText(e.target.value)}
                placeholder="Enter additional outcome or constraint..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-on-surface"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddObjective();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <button
                onClick={handleAddObjective}
                className="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 text-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connected Vault Seals & Consequential Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected Authorities */}
        <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-low space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
            <ShieldCheck className="w-4 h-4 text-tertiary-container" />
            <span>Authorized Authority Integrations</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-secondary">
            <div className="flex items-center justify-between">
              <span>• British Airways Executive Club</span>
              <span className="text-tertiary-container font-semibold">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Google Workspace Calendar</span>
              <span className="text-tertiary-container font-semibold">Synced</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Chase Sapphire Reserve</span>
              <span className="text-tertiary-container font-semibold">Connected</span>
            </div>
          </div>
        </div>

        {/* Human Boundary Policy */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary-fixed/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <AlertTriangle className="w-4 h-4" />
            <span>Human Authorization Boundary</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Any binding ticket exchange with a non-zero financial delta or statutory release will pause execution and present a 1-click authorization card on your Mission Control dashboard.
          </p>
        </div>
      </div>

      {/* Action Launch Bar */}
      <div className="pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-secondary font-mono">
          <Clock className="w-4 h-4" />
          <span>{isPlanning ? 'RELAY is planning…' : 'Estimated execution duration: 4 minutes 20 seconds'}</span>
        </div>

        <div className="w-full sm:w-auto flex flex-col items-stretch gap-2">
          {planningError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/40 px-3 py-2 text-xs text-on-error-container">
              <span>{planningError}</span>
              <button onClick={onRetryPlanning} disabled={isPlanning} className="font-bold underline disabled:opacity-50">
                Retry planning
              </button>
            </div>
          )}
          <button
            onClick={handleStart}
            disabled={isPlanning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-wait"
          >
            <span>{isPlanning ? 'Planning…' : 'Start Execution → Launch Mission Control'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
