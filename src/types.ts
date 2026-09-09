/**
 * RELAY Data Model & Integration Contract
 * 
 * Designed to mirror future Django REST API serializations:
 * User, Case, Objective, Task, AgentRun, AgentStep, ToolAction,
 * Evidence, Document, Approval, Outcome, ActivityEvent, Connection
 */

export type CaseStatus = 
  | 'draft'
  | 'planning'
  | 'in_progress'
  | 'waiting_approval'
  | 'needs_attention'
  | 'paused'
  | 'verified'
  | 'resolved'
  | 'failed';

export type TaskStatus = 
  | 'queued'
  | 'staged'
  | 'in_progress'
  | 'pending_approval'
  | 'hold_confirmed'
  | 'completed'
  | 'blocked';

export type LifecycleStage = 
  | 'understand'
  | 'plan'
  | 'execute'
  | 'verify'
  | 'resolved';

export interface StageProgress {
  stage: LifecycleStage;
  label: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
  timestamp?: string;
  summary: string;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  initials: string;
  role: string;
}

export interface Objective {
  id: string;
  text: string;
  completed: boolean;
  required: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: 'high' | 'normal' | 'low';
  badge?: string;
  badgeType?: 'primary' | 'tertiary' | 'secondary' | 'error' | 'outline';
  actionRequired?: boolean;
  timestamp?: string;
  artifactRef?: string;
}

export interface ApprovalAction {
  id: string;
  caseId: string;
  title: string;
  subTitle: string;
  expiresInSeconds: number;
  flightDetails?: {
    flightNumber: string;
    route: string;
    departureTime: string;
    arrivalTime: string;
    aircraft: string;
    cabin: string;
    seat: string;
    baseFare: string;
    expeditedDelta: string;
    reclaimableNote: string;
  };
  claimDetails?: {
    discrepancyAmount: string;
    insurerPayout: string;
    statutorySection: string;
  };
  rationale: string;
  confidenceScore: string;
  provenanceHash: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export interface ProvenanceNode {
  id: string;
  label: string;
  value: string;
  subValue: string;
}

export interface ActivityEvent {
  id: string;
  agentName: string;
  timeString: string;
  description: string;
  blockNumber?: string;
  status?: 'success' | 'active' | 'pending';
}

export interface OutcomeItem {
  id: string;
  title: string;
  code: string;
  primaryDetail: string;
  statusDetail: string;
  secondaryDetail: string;
  artifactLabel: string;
  artifactValue: string;
  verificationLabel: string;
  verificationValue: string;
  footerHash: string;
  ctaText: string;
  documentType: 'ticket' | 'voucher' | 'claim' | 'comms';
}

export interface CaseOutcome {
  caseId: string;
  title: string;
  status: 'resolved';
  resolvedAt: string;
  headline: string;
  supportingText: string;
  masterLedgerHash: string;
  metrics: {
    netFinancialBenefit: string;
    netBenefitSubtext: string;
    timeSaved: string;
    timeSavedSubtext: string;
    scheduleSlippage: string;
    scheduleSlippageSubtext: string;
    artifactsCount: number;
    artifactsSubtext: string;
  };
  outcomes: OutcomeItem[];
  verificationProofs: {
    id: string;
    title: string;
    type: string;
    verificationText: string;
    icon: string;
    downloadable?: boolean;
  }[];
}

export interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  originalRequest: string;
  status: CaseStatus;
  statusLabel: string;
  updatedAt: string;
  autonomousLead: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  stages: StageProgress[];
  currentAction?: {
    description: string;
    agentName: string;
    elapsed: string;
    latency: string;
    nonce: string;
  };
  approval?: ApprovalAction;
  tasks: Task[];
  provenanceChain: ProvenanceNode[];
  targetOutcomes: {
    text: string;
    completed: boolean;
  }[];
  financialBalance?: {
    recoveryAmount: string;
    fareDelta: string;
    netBenefit: string;
  };
  groundTruth: {
    passenger: string;
    route: string;
    originalPnr: string;
    travelClass: string;
  };
  connectedSeals: {
    name: string;
    icon: string;
    status: 'verified' | 'synced' | 'connected';
  }[];
  activityFeed: ActivityEvent[];
  documentsCount: number;
  dossierReady?: boolean;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  date: string;
  size: string;
  processingState: 'verified' | 'processing' | 'staged' | 'archived';
  evidenceRelevance: string;
  signature?: string;
  previewSnippet?: string;
}

export interface ConnectionItem {
  id: string;
  name: string;
  category: 'Travel & Airlines' | 'Calendar & Comms' | 'Financial & Cards' | 'Government & Legal' | 'Hospitality';
  status: 'connected' | 'not_connected' | 'needs_attention';
  icon: string;
  description: string;
  lastSynced?: string;
  permissions: string[];
}
