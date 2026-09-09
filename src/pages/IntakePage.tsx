import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Paperclip,
  ShieldCheck,
  Plane,
  FileText,
  Home,
  HeartPulse,
  Clock,
  ChevronRight,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { CaseData } from '../types';

interface IntakePageProps {
  onNavigate: (route: string) => void;
  onSubmitProblem: (statement: string, attachments: string[]) => void;
  activeCases: CaseData[];
}

export const IntakePage: React.FC<IntakePageProps> = ({
  onNavigate,
  onSubmitProblem,
  activeCases
}) => {
  const [problemStatement, setProblemStatement] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const presetTemplates = [
    {
      title: 'Flight Cancellation & Rebooking',
      subtitle: 'EU/UK261 compensation + hotel voucher',
      icon: Plane,
      prompt: 'My flight from New York to London was cancelled. I need to be rebooked on the earliest arrival, arrange a hotel voucher at Heathrow, and file full UK/EU261 statutory compensation.'
    },
    {
      title: 'Medical Out-of-Network Bill Dispute',
      subtitle: 'ERISA Section 503 legal appeal brief',
      icon: HeartPulse,
      prompt: 'Hospital billed $1,800 for outpatient surgery; insurance only covered $380 citing out-of-network anesthesiologist without consent. File an ERISA appeal under Section 503.'
    },
    {
      title: 'Security Deposit Withholding Return',
      subtitle: 'Refute wear-and-tear deductions with photos',
      icon: Home,
      prompt: 'Landlord improperly withheld $2,400 of my security deposit for normal wear-and-tear wall repaint. Draft demand letter under tenancy code and recover the funds.'
    },
    {
      title: 'Insurance Water Damage Claim',
      subtitle: 'Emergency mitigation & policy match',
      icon: FileText,
      prompt: 'A water pipe burst causing kitchen ceiling damage. I need emergency plumber invoices validated, coverage matched under State Farm policy clause 4b, and adjuster claim filed.'
    }
  ];

  const handleApplyTemplate = (text: string) => {
    setProblemStatement(text);
    if (!attachments.includes('airline_cancellation_notice.pdf')) {
      setAttachments(['airline_cancellation_notice.pdf']);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map((f: File) => f.name);
      setAttachments(prev => [...prev, ...fileNames]);
    }
  };

  const handleRemoveAttachment = (name: string) => {
    setAttachments(prev => prev.filter(item => item !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const statement = problemStatement.trim() ||
      'My flight from New York to London was cancelled. I need to be rebooked on the earliest arrival, arrange a hotel voucher, and file compensation.';
    onSubmitProblem(statement, attachments);
    onNavigate('/new-case');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Top Banner / Philosophy */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 border border-primary/20 text-primary text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>AUTONOMOUS LIFE-ADMINISTRATION</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
          Give AI the problem.<br />
          <span className="text-primary">Get back the outcome.</span>
        </h1>

        <p className="text-sm sm:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
          Describe any administrative problem in plain English. RELAY takes custody, deconstructs the constraints, coordinates systems, executes authorized work, and delivers verified results.
        </p>
      </div>

      {/* Main Interactive Intake Box */}
      <div
        className={`relative bg-surface-container-lowest rounded-2xl border transition-all shadow-sm ${
          isDragging
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-surface-variant hover:border-outline-variant'
        }`}
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).map((f: File) => f.name);
            setAttachments(prev => [...prev, ...files]);
          }
        }}
      >
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-variant/40">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Problem Intake &amp; Situation Deconstruction</span>
            </span>
            <span className="text-[11px] font-mono text-secondary">
              Pod: Autonomous Logistics Core
            </span>
          </div>

          {/* Text Area */}
          <textarea
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
            rows={5}
            placeholder="Describe the situation... (e.g., My British Airways flight BA112 from JFK to London was cancelled. I need to be rebooked on the earliest arrival tonight, arrange transit lodging at Heathrow, and submit full UK/EU261 compensation claim...)"
            className="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder-secondary/70 focus:outline-none resize-none leading-relaxed"
          />

          {/* Attachments Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {attachments.map(att => (
                <span
                  key={att}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-xs font-mono text-on-surface border border-surface-variant"
                >
                  <FileText className="w-3 h-3 text-secondary" />
                  <span className="truncate max-w-[200px]">{att}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att)}
                    className="ml-1 text-secondary hover:text-error text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Controls Bar: Upload Button, Context Badges, Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-surface-variant">
            {/* Attachment Button & Connected Integrations */}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-low hover:bg-surface-container text-xs font-medium text-secondary hover:text-on-surface cursor-pointer transition-colors">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach files or drag here</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="hidden lg:flex items-center gap-2 text-[11px] text-secondary font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                <span>3 Authority vaults connected</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs sm:text-sm font-bold hover:bg-primary-container active:scale-[0.99] transition-all shadow-md group"
            >
              <span>Let RELAY handle it</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>
      </div>

      {/* Preset Problem Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
            Or select a benchmark administration workflow
          </h2>
          <span className="text-[11px] font-mono text-secondary">
            Pre-configured execution blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {presetTemplates.map((template, idx) => {
            const Icon = template.icon;
            return (
              <button
                key={idx}
                onClick={() => handleApplyTemplate(template.prompt)}
                className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low text-left transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-fixed group-hover:text-primary-container transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-secondary leading-relaxed">
                    {template.subtitle}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-variant/40 flex items-center justify-between text-[10px] font-mono text-secondary group-hover:text-primary">
                  <span>Load blueprint</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Telemetry & Recent Pipeline Preview */}
      <div className="space-y-4 pt-4 border-t border-surface-variant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Currently Running In Your Operations Queue
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/cases')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all cases ({activeCases.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCases.slice(0, 3).map(item => (
            <div
              key={item.id}
              onClick={() => onNavigate(`/cases/${item.id}`)}
              className="p-4 rounded-xl border border-surface-variant bg-surface-container-lowest hover:border-outline-variant hover:shadow-sm transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">
                  Case #{item.caseNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.status === 'in_progress'
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : item.status === 'waiting_approval'
                      ? 'bg-error-container text-on-error-container'
                      : item.status === 'resolved'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-surface-container text-secondary'
                  }`}
                >
                  {item.statusLabel}
                </span>
              </div>

              <h4 className="text-xs font-bold text-on-surface line-clamp-1">
                {item.title}
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-secondary">
                  <span>{item.completedTasks} of {item.totalTasks} tasks complete</span>
                  <span>{item.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container transition-all"
                    style={{ width: `${item.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-variant flex items-center justify-between text-[11px]">
                <span className="text-secondary font-mono">{item.updatedAt}</span>
                <span className="font-semibold text-primary flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Architecture Seals */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-secondary">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-on-surface">Cryptographic Provenance &amp; Human Boundaries</h5>
            <p className="text-[11px] text-secondary mt-0.5">
              Financial disbursements and non-refundable bookings enforce mandatory human authorization checkpoints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Zero Unprompted Actions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-tertiary-container" />
            <span>Multi-Agent Consensus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
