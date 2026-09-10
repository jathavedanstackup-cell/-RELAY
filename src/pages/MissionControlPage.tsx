import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Plane,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Calendar,
  CreditCard,
  Building,
  FileText,
  Activity,
  ChevronDown,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { CaseData, ApprovalAction } from '../types';

interface MissionControlPageProps {
  caseData: CaseData;
  onNavigate: (route: string) => void;
  onApproveAction: (approvalId: string) => void;
  onRejectAction: (approvalId: string) => void;
  onPauseCase: () => void;
  onResumeCase: () => void;
  onRunAutonomous: () => void;
  onExecuteTask: (taskId: string) => void;
  onVerifyTask: (taskId: string) => void;
  onRecoverCase: () => void;
  isBusy: boolean;
  onOpenApprovalModal: () => void;
  onOpenAlternativesModal: () => void;
  onOpenTelemetryJson: () => void;
  onOpenDocPreview: (docTitle: string) => void;
}

export const MissionControlPage: React.FC<MissionControlPageProps> = ({
  caseData,
  onNavigate,
  onApproveAction,
  onRejectAction,
  onPauseCase,
  onResumeCase,
  onRunAutonomous,
  onExecuteTask,
  onVerifyTask,
  onRecoverCase,
  isBusy,
  onOpenApprovalModal,
  onOpenAlternativesModal,
  onOpenTelemetryJson,
  onOpenDocPreview
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const isPaused = caseData.status === 'paused';
  const approval = caseData.approval;
  const isApproved = approval?.status === 'approved';
  const verificationState = caseData.verificationState || 'NEEDS_ATTENTION';
  const activeActivity = caseData.activityFeed.find(activity => activity.status === 'active');
  const currentTask = caseData.tasks.find(task => ['in_progress', 'queued', 'pending_approval'].includes(task.status));
  const headerState = caseData.dossierReady || verificationState === 'VERIFIED'
    ? 'VERIFIED OUTCOME'
    : approval?.status === 'pending'
      ? 'WAITING FOR YOUR APPROVAL'
      : verificationState === 'READY_FOR_NEXT_STEP'
        ? 'READY FOR NEXT STEP'
        : caseData.status === 'planning' && caseData.activityFeed.some(activity => activity.agentName.toLowerCase().includes('recovery'))
          ? 'REPLANNING'
          : caseData.status === 'needs_attention'
            ? 'RECOVERY REQUIRED'
            : verificationState;
  const headerStage = caseData.stages.find(stage => stage.status === 'active') || caseData.stages.find(stage => stage.status === 'pending');
  const headerAgent = headerState === 'VERIFIED OUTCOME'
    ? caseData.activityFeed.find(activity => activity.agentName.toLowerCase().includes('verification'))?.agentName
    : approval?.status === 'pending'
      ? 'Human Authorization Boundary'
      : activeActivity?.agentName;
  const headerAction = headerState === 'VERIFIED OUTCOME'
    ? caseData.verificationSummary
    : approval?.status === 'pending'
      ? approval.title
      : activeActivity?.description || currentTask?.title;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Breadcrumb & Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-secondary">
            <button onClick={() => onNavigate('/cases')} className="hover:text-on-surface">Cases</button>
            <span>/</span>
            <span className="text-primary font-bold">Case #{caseData.caseNumber}</span>
            <span>/</span>
            <span className="hidden md:inline text-secondary truncate max-w-xs">{caseData.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              Mission Control
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                isPaused
                  ? 'bg-surface-container-high text-secondary'
                  : isApproved
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-primary-fixed text-on-primary-fixed'
              }`}
            >
                {isPaused ? 'PAUSED' : headerState}
            </span>
            <span className="text-xs font-mono text-secondary hidden sm:inline">
              Lead: {caseData.autonomousLead}
            </span>
          </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-secondary min-w-0">
            {headerStage && <span>{headerStage.label}</span>}
            {headerAgent && <span>Agent: <strong className="text-on-surface font-normal">{headerAgent}</strong></span>}
            {headerAction && <span className="min-w-0 truncate max-w-full">Next: <strong className="text-on-surface font-normal">{headerAction}</strong></span>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRunAutonomous}
            disabled={isBusy || isPaused}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isBusy ? 'Working...' : 'Run Autonomous Loop'}</span>
          </button>
          <button
            onClick={onRecoverCase}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-low text-secondary text-xs font-semibold disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recover</span>
          </button>
          {isPaused ? (
            <button
              onClick={onResumeCase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-tertiary-container bg-tertiary-fixed/40 text-on-tertiary-fixed text-xs font-semibold hover:bg-tertiary-fixed transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Work</span>
            </button>
          ) : (
            <button
              onClick={onPauseCase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-low text-secondary hover:text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Execution</span>
            </button>
          )}

          <button
            onClick={() => onNavigate(`/cases/${caseData.id}/outcome`)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>View Outcome Dossier</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Progress Stepper Bar (5 Stages) */}
      <div className="p-4 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {caseData.stages.map((stage, idx) => {
            const isDone = stage.status === 'completed' || (isApproved && idx < 4);
            const isActive = stage.status === 'active' && !isApproved;
            return (
              <div
                key={stage.stage}
                className={`p-2.5 rounded-xl border transition-all ${
                  isDone
                    ? 'border-tertiary/20 bg-tertiary-fixed/15 text-on-surface'
                    : isActive
                    ? 'border-primary/40 bg-primary-fixed/20 text-on-surface'
                    : 'border-surface-variant/40 bg-surface-container-low text-secondary'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">
                    {stage.label}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-tertiary-container" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-primary-container pulse-amber"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-variant"></span>
                  )}
                </div>
                <p className="text-[11px] font-medium truncate">
                  {stage.summary}
                </p>
                {stage.timestamp && (
                  <span className="text-[10px] font-mono text-secondary block mt-0.5">
                    {stage.timestamp}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Authorization Boundary Card (Highlight when pending) */}
      {approval && !isApproved && (
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-primary/30 bg-primary-fixed/10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                    Human Authorization Boundary
                  </span>
                </div>
                <h3 className="text-base font-bold text-on-surface">
                  {approval.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAlternativesModal}
                disabled={!approval.flightDetails}
                title={!approval.flightDetails ? 'Alternatives are unavailable from the current backend contract' : 'Review alternatives'}
                className="px-3.5 py-1.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Alternatives
              </button>
              <button
                onClick={() => onApproveAction(approval.id)}
                disabled={isBusy}
                className="px-5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Approve Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onRejectAction(approval.id)}
                disabled={isBusy}
                className="px-3.5 py-1.5 rounded-xl border border-error/30 text-error text-xs font-semibold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Flight Details Specifications */}
          {approval.flightDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-primary/20 text-xs">
              <div>
                <span className="text-[10px] font-mono text-secondary block">Flight / Carrier</span>
                <span className="font-bold text-on-surface">{approval.flightDetails.flightNumber} · British Airways</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-secondary block">Route &amp; Times</span>
                <span className="font-bold text-on-surface">{approval.flightDetails.route} (20:40 → 08:45)</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-secondary block">Cabin &amp; Seat</span>
                <span className="font-bold text-on-surface">{approval.flightDetails.cabin} · Seat {approval.flightDetails.seat}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-secondary block">Fare Delta</span>
                <span className="font-bold text-primary font-mono">{approval.flightDetails.expeditedDelta} (Reclaimable)</span>
              </div>
            </div>
          )}

          <p className="text-xs text-secondary leading-relaxed">
            <strong className="text-on-surface">Rationale:</strong> {approval.rationale}{' '}
            <span className="font-mono text-[11px] text-tertiary-container font-semibold">
              Confidence: {approval.confidenceScore}
            </span>
          </p>
        </div>
      )}

      {/* If Approved, show Confirmed Authorization Banner */}
      {isApproved && (
        <div className="p-4 rounded-2xl border border-tertiary/30 bg-tertiary-fixed/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">Action Authorized</h4>
              <p className="text-[11px] text-secondary font-mono">
                Backend approval recorded. External outcome remains unverified until evidence confirms it.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-secondary">No artifact returned by backend</span>
        </div>
      )}

      {/* Live Agent Telemetry Banner */}
      <div className="p-3.5 rounded-xl border border-surface-variant bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container pulse-amber shrink-0"></span>
          <span className="font-semibold text-on-surface truncate">
            {caseData.currentAction?.description || 'No active agent action reported.'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-secondary text-[11px] shrink-0">
          <span>Agent: <strong className="text-on-surface font-normal">{caseData.currentAction?.agentName || 'Unavailable'}</strong></span>
          <span>Elapsed: <strong>{caseData.currentAction?.elapsed || 'Unavailable'}</strong></span>
          <span>Latency: <strong className="text-tertiary-container">{caseData.currentAction?.latency || 'Unavailable'}</strong></span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Tasks & Provenance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Deconstructed Situation Plan (Tasks) */}
          <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Deconstructed Situation Plan
                </h2>
                <p className="text-xs text-on-surface font-semibold mt-0.5">
                  {caseData.tasks.length} backend task{caseData.tasks.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-[11px] font-mono text-secondary">
                Autonomous Lead: {caseData.autonomousLead}
              </span>
            </div>

            <div className="space-y-3">
              {caseData.tasks.map(task => {
                const isExpanded = expandedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-surface-variant bg-surface-container-lowest hover:border-outline-variant transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            task.status === 'completed'
                              ? 'bg-tertiary-container'
                              : task.status === 'hold_confirmed'
                              ? 'bg-tertiary-container'
                              : task.status === 'pending_approval'
                              ? 'bg-primary-container pulse-amber'
                              : 'bg-secondary'
                          }`}
                        ></span>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-secondary line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              task.badgeType === 'primary'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : task.badgeType === 'tertiary'
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                : 'bg-surface-container text-secondary'
                            }`}
                          >
                            {task.badge}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-secondary transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-surface-variant/40 bg-surface-container-low text-xs space-y-3">
                        <p className="text-secondary leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-variant/50 text-[11px] font-mono">
                          <span className="text-secondary">Sub-protocol: Direct NDC Orchestration</span>
                          {task.actionRequired && !isApproved && (
                            <button
                              onClick={onOpenApprovalModal}
                              className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container"
                            >
                              Authorize Action
                            </button>
                          )}
                          {task.status === 'queued' && (
                            <button
                              onClick={() => onExecuteTask(task.id)}
                              disabled={isBusy}
                              className="px-3 py-1 rounded-lg border border-primary text-primary text-xs font-bold disabled:opacity-50"
                            >
                              Execute Task
                            </button>
                          )}
                          {task.status === 'completed' && (
                            <button
                              onClick={() => onVerifyTask(task.id)}
                              disabled={isBusy}
                              className="px-3 py-1 rounded-lg border border-tertiary-container text-tertiary-container text-xs font-bold disabled:opacity-50"
                            >
                              Verify Task
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autonomous Provenance Chain */}
          <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Autonomous Provenance Chain
                </h2>
                <p className="text-xs text-on-surface font-semibold mt-0.5">
                  Verifiable Decision Tree &amp; Evidence
                </p>
              </div>
              <span className="text-[10px] font-mono text-tertiary-container font-semibold">
                SHA-256 Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {caseData.provenanceChain.map(node => (
                <div
                  key={node.id}
                  className="p-3.5 rounded-xl border border-surface-variant bg-surface-container-low space-y-1 text-xs"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-secondary block">
                    {node.label}
                  </span>
                  <p className="font-bold text-on-surface">{node.value}</p>
                  <p className="text-[11px] text-secondary font-mono">{node.subValue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Target Outcomes & Financial Recovery Balance */}
          <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Target Outcomes &amp; Financial Balance
              </h2>
              <span className="text-[11px] font-mono text-secondary">
                Statutory Net Recovery
              </span>
            </div>

            {/* Financial Bento */}
            {caseData.financialBalance && (
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-surface-container-low border border-surface-variant text-center">
                <div>
                  <span className="text-[10px] font-mono text-secondary block">EU261 Recovery</span>
                  <span className="text-sm sm:text-base font-bold text-tertiary-container font-mono">
                    {caseData.financialBalance.recoveryAmount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Expedited Delta</span>
                  <span className="text-sm sm:text-base font-bold text-primary font-mono">
                    -{caseData.financialBalance.fareDelta}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Net Financial Benefit</span>
                  <span className="text-sm sm:text-base font-bold text-tertiary-container font-mono">
                    {caseData.financialBalance.netBenefit}
                  </span>
                </div>
              </div>
            )}

            {/* Outcomes Checklist */}
            <div className="space-y-2 text-xs">
              {caseData.targetOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 py-1 text-secondary">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      item.completed || isApproved
                        ? 'text-tertiary-container'
                        : 'text-surface-variant'
                    }`}
                  />
                  <span className={item.completed || isApproved ? 'text-on-surface font-medium' : ''}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Ground Truth & Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ground Truth & Credentials Card */}
          <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Ground Truth &amp; Credentials
              </h2>
              <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-secondary">
                Verified Vault
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-surface-variant/40">
                <span className="text-secondary">Passenger</span>
                <span className="font-bold text-on-surface">{caseData.groundTruth.passenger}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/40">
                <span className="text-secondary">Segment</span>
                <span className="font-bold text-on-surface">{caseData.groundTruth.route}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/40">
                <span className="text-secondary">Original Booking</span>
                <span className="font-bold text-error">{caseData.groundTruth.originalPnr}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-secondary">Travel Class</span>
                <span className="font-bold text-on-surface">{caseData.groundTruth.travelClass}</span>
              </div>
            </div>

            {/* Connected Seals */}
            <div className="pt-2 border-t border-surface-variant space-y-2">
              <span className="text-[10px] font-mono uppercase text-secondary block">
                Connected Integration Seals
              </span>
              <div className="space-y-1.5">
                {caseData.connectedSeals.map((seal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        {seal.icon}
                      </span>
                      <span className="text-[11px] font-medium text-on-surface">{seal.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-tertiary-container font-semibold capitalize">
                      {seal.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Activity Feed (Provenance Log) */}
          <div className="p-5 rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Agent Activity Feed
                </h2>
                <p className="text-[11px] text-secondary mt-0.5">Real-time sub-routine events</p>
              </div>
              <button
                onClick={onOpenTelemetryJson}
                className="text-[10px] font-mono text-primary hover:underline"
              >
                Raw Telemetry JSON
              </button>
            </div>

            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-surface-variant">
              {caseData.activityFeed.map((act, idx) => (
                <div key={act.id} className="relative flex items-start gap-3 pl-7 text-xs">
                  <span className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-primary-container -translate-x-1/2"></span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{act.agentName}</span>
                      <span className="text-[10px] font-mono text-secondary">{act.timeString}</span>
                    </div>
                    <p className="text-secondary leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-surface-variant">
              <button
                onClick={onOpenTelemetryJson}
                className="w-full py-2 rounded-xl border border-dashed border-surface-variant bg-surface-container-low hover:bg-surface-container text-xs font-mono text-secondary hover:text-on-surface transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Inspect Cryptographic Ledger Block</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
