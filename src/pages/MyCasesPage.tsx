import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CaseData } from '../types';

interface MyCasesPageProps {
  cases: CaseData[];
  onNavigate: (route: string) => void;
  onOpenApproval: (caseId: string) => void;
  initialFilter?: string;
}

export const MyCasesPage: React.FC<MyCasesPageProps> = ({
  cases,
  onNavigate,
  onOpenApproval,
  initialFilter = 'all'
}) => {
  const [filterTab, setFilterTab] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Filter cases
  const filteredCases = cases.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = c.title.toLowerCase().includes(q) ||
        c.caseNumber.includes(q) ||
        c.originalRequest.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    if (filterTab === 'active') return c.status === 'in_progress' || c.status === 'planning';
    if (filterTab === 'waiting') return c.status === 'waiting_approval';
    if (filterTab === 'attention') return c.status === 'needs_attention';
    if (filterTab === 'completed') return c.status === 'resolved';
    return true;
  });

  const waitingCount = cases.filter(c => c.status === 'waiting_approval').length;
  const activeCount = cases.filter(c => c.status === 'in_progress' || c.status === 'planning').length;
  const attentionCount = cases.filter(c => c.status === 'needs_attention').length;
  const resolvedCount = cases.filter(c => c.status === 'resolved').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              My Cases
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-mono font-bold text-secondary">
              {cases.length} Total Pipelines
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Autonomous operations directory. Delegated problem workflows and verified resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle demo empty state */}
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="text-[11px] font-mono text-secondary hover:text-on-surface underline"
            title="Toggle empty state view for preview"
          >
            {showEmptyState ? 'Exit Empty Preview' : 'Preview Empty State'}
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-surface-variant rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All ({cases.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === 'active'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab('waiting')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'waiting'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Waiting for you</span>
            {waitingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-[10px]">
                {waitingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('attention')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === 'attention'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Needs attention ({attentionCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === 'completed'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Completed ({resolvedCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter cases... (/)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-xs text-on-surface placeholder-secondary focus:outline-none focus:border-outline"
          />
        </div>
      </div>

      {/* Case List or Empty State */}
      {showEmptyState || filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-surface-variant bg-surface-container-lowest space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-secondary">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface">No cases in this queue</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Give RELAY any life-administration problem. We coordinate systems and deliver the verified outcome.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Case</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map(item => {
            const isWaiting = item.status === 'waiting_approval';
            const isResolved = item.status === 'resolved';
            const isAttention = item.status === 'needs_attention';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isWaiting
                    ? 'border-primary/40 bg-primary-fixed/5 hover:border-primary'
                    : isResolved
                    ? 'border-surface-variant bg-surface-container-lowest hover:border-outline-variant'
                    : 'border-surface-variant bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Case Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-primary">
                        Case #{item.caseNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isWaiting
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : isResolved
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : isAttention
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container text-secondary'
                        }`}
                      >
                        {item.statusLabel}
                      </span>
                      <span className="text-[11px] font-mono text-secondary">
                        Lead: {item.autonomousLead}
                      </span>
                    </div>

                    <h3
                      onClick={() => onNavigate(`/cases/${item.id}`)}
                      className="text-base font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                      {item.originalRequest}
                    </p>

                    {/* Progress strip if in progress */}
                    {!isResolved && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-36 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-container transition-all"
                            style={{ width: `${item.progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono text-secondary">
                          {item.completedTasks} of {item.totalTasks} tasks complete ({item.progressPercent}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Specific Action Trigger */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-secondary">
                      {item.updatedAt}
                    </span>

                    <div className="flex items-center gap-2">
                      {isWaiting ? (
                        <button
                          onClick={() => onOpenApproval(item.id)}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Review &amp; Authorize</span>
                        </button>
                      ) : isResolved ? (
                        <button
                          onClick={() => onNavigate(`/cases/${item.id}/outcome`)}
                          className="px-4 py-2 rounded-xl border border-tertiary-container bg-tertiary-fixed/30 text-on-tertiary-fixed text-xs font-bold hover:bg-tertiary-fixed transition-colors flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-tertiary-container" />
                          <span>View Resolution Dossier</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate(`/cases/${item.id}`)}
                          className="px-4 py-2 rounded-xl border border-surface-variant bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5"
                        >
                          <span>Open Mission Control</span>
                          <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
