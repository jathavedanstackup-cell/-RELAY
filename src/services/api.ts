import {
  ActivityEvent,
  AuthUser,
  ApprovalAction,
  CaseData,
  CaseOutcome,
  ConnectionItem,
  DocumentItem,
  Task,
} from '../types';

const API_BASE_URL = (((import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL) || '/api/v1').replace(/\/$/, '');
type JsonObject = Record<string, unknown>;
let csrfToken: string | null = null;

export class RelayApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'RelayApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const method = (init.method || 'GET').toUpperCase();
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) {
      const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include' });
      const csrfPayload = await csrfResponse.json() as { csrf_token?: string };
      csrfToken = csrfPayload.csrf_token || null;
    }
    if (csrfToken) headers.set('X-CSRFToken', csrfToken);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new RelayApiError(`Unable to reach RELAY at ${API_BASE_URL}. Check that the backend is running.`);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!response.ok) {
    const detail = typeof payload === 'object' && payload !== null
      ? (payload as JsonObject).detail || (payload as JsonObject).message
      : payload;
    const message = typeof detail === 'string' ? detail : '';
    throw new RelayApiError(
      message.includes('Traceback')
        ? `RELAY request failed (${response.status}). Check the backend logs for details.`
        : message || `RELAY request failed (${response.status}).`,
      response.status,
    );
  }
  return payload as T;
}

interface BackendObjective { id: number; title: string; description: string; position: number; completed: boolean; }
interface BackendTask { id: number; title: string; description: string; status: string; position: number; requires_approval: boolean; completed_at: string | null; }
interface BackendCaseList { id: number; title: string; problem_statement: string; status: string; created_at: string; updated_at: string; }
interface BackendCaseDetail extends BackendCaseList { objectives: BackendObjective[]; tasks: BackendTask[]; }
interface BackendActivity { id: number; agent_name: string; event_type: string; message: string; metadata: JsonObject; created_at: string; }
interface BackendApproval { id: number; title: string; description: string; requested_action: JsonObject; rationale: string; status: 'pending' | 'approved' | 'rejected' | 'expired'; requested_at: string; resolved_at: string | null; }
interface BackendOutcome { id: number; summary: string; status: 'pending' | 'partial' | 'resolved' | 'failed'; results: unknown[]; verified: boolean; resolved_at: string | null; }
interface BackendDocument { id: number; filename: string; document_type: string; storage_key: string; mime_type: string; size_bytes: number; processing_status: string; created_at: string; }
interface BackendConnection { id: number; name: string; category: string; status: 'connected' | 'not_connected' | 'needs_attention'; icon: string; description: string; permissions: string[]; last_synced: string | null; created_at: string; }
interface BackendCaseCreate { id: number; title: string; problem_statement: string; status: string; }

export interface AutonomousRunResult { case_id: number; status: string; executed_tasks: JsonObject[]; verifications: JsonObject[]; next_task_id: number | null; message: string; }

const unavailable = 'Unavailable';
function formatDate(value: string | null | undefined): string { return value ? new Date(value).toLocaleString() : unavailable; }
function statusLabel(status: string): string { return status.replace(/_/g, ' ').toUpperCase(); }

function mapTaskStatus(status: string): Task['status'] {
  if (status === 'waiting_approval') return 'pending_approval';
  if (status === 'waiting_external') return 'waiting_external';
  if (status === 'failed') return 'failed';
  return status as Task['status'];
}

function mapTask(task: BackendTask): Task {
  const mappedStatus = mapTaskStatus(task.status);
  return {
    id: String(task.id),
    title: task.title,
    description: task.description || unavailable,
    status: mappedStatus,
    badge: statusLabel(task.status),
    badgeType: mappedStatus === 'pending_approval' ? 'primary' : mappedStatus === 'completed' ? 'tertiary' : 'secondary',
    actionRequired: task.requires_approval && mappedStatus === 'pending_approval',
    timestamp: task.completed_at ? formatDate(task.completed_at) : undefined,
  };
}

function mapApproval(caseId: number, approval: BackendApproval): ApprovalAction {
  const action = approval.requested_action || {};
  return {
    id: String(approval.id),
    caseId: String(caseId),
    taskId: typeof action.task_id === 'number' ? String(action.task_id) : undefined,
    title: approval.title,
    subTitle: approval.description || 'Human Authorization Boundary',
    expiresInSeconds: 0,
    rationale: approval.rationale || unavailable,
    confidenceScore: unavailable,
    provenanceHash: unavailable,
    status: approval.status,
  };
}

function mapActivity(event: BackendActivity): ActivityEvent {
  return {
    id: String(event.id),
    agentName: event.agent_name || 'RELAY Agent',
    timeString: formatDate(event.created_at),
    description: event.message,
    status: event.event_type.includes('failed') ? 'pending' : event.event_type.includes('started') ? 'active' : 'success',
  };
}

function mapOutcome(caseId: number, title: string, outcome: BackendOutcome | null): CaseOutcome | null {
  if (!outcome) return null;
  const results = outcome.results.filter((result): result is JsonObject => typeof result === 'object' && result !== null);
  return {
    caseId: String(caseId),
    title,
    status: outcome.status,
    resolvedAt: formatDate(outcome.resolved_at),
    headline: outcome.verified ? 'Verified outcome available.' : 'The case is not externally verified yet.',
    supportingText: outcome.summary || unavailable,
    masterLedgerHash: unavailable,
    metrics: {
      netFinancialBenefit: unavailable,
      netBenefitSubtext: unavailable,
      timeSaved: unavailable,
      timeSavedSubtext: unavailable,
      scheduleSlippage: unavailable,
      scheduleSlippageSubtext: unavailable,
      artifactsCount: 0,
      artifactsSubtext: 'No artifact count is exposed by the backend outcome contract.',
    },
    outcomes: results.map((result, index) => ({
      id: `result-${index}`,
      title: `Task ${String(result.task_id ?? unavailable)}`,
      code: String(result.verdict ?? unavailable),
      primaryDetail: String(result.verdict ?? unavailable),
      statusDetail: `Verified evidence count: ${String(result.verified_evidence_count ?? 0)}`,
      secondaryDetail: outcome.summary || unavailable,
      artifactLabel: 'Evidence:',
      artifactValue: String(result.verified_evidence_count ?? 0),
      verificationLabel: 'Verification:',
      verificationValue: String(result.verdict ?? unavailable),
      footerHash: unavailable,
      ctaText: 'View Result',
      documentType: 'claim',
    })),
    verificationProofs: [],
    verified: outcome.verified,
    verificationSummary: outcome.summary,
  };
}

function mapStages(detail: BackendCaseDetail, outcome: BackendOutcome | null) {
  const hasTasks = detail.tasks.length > 0;
  const hasActiveTask = detail.tasks.some(task => ['queued', 'in_progress', 'waiting_approval', 'waiting_external'].includes(task.status));
  const allTasksComplete = hasTasks && detail.tasks.every(task => task.status === 'completed');
  return [
    { stage: 'understand' as const, label: '1. UNDERSTAND', status: 'completed' as const, summary: 'Case received from the RELAY intake.' },
    { stage: 'plan' as const, label: '2. PLAN', status: detail.status === 'planning' && !hasTasks ? 'active' as const : hasTasks ? 'completed' as const : 'pending' as const, summary: hasTasks ? `${detail.objectives.length} objectives and ${detail.tasks.length} tasks loaded.` : 'Planning has not produced tasks yet.' },
    { stage: 'execute' as const, label: '3. EXECUTE', status: allTasksComplete ? 'completed' as const : hasActiveTask ? 'active' as const : 'pending' as const, summary: `${detail.tasks.filter(task => task.status === 'completed').length} of ${detail.tasks.length} tasks complete.` },
    { stage: 'verify' as const, label: '4. VERIFY', status: outcome?.verified ? 'completed' as const : outcome ? 'active' as const : 'pending' as const, summary: outcome?.summary || 'No verification result is available.' },
    { stage: 'resolved' as const, label: '5. RESOLVED', status: outcome?.verified ? 'completed' as const : 'pending' as const, summary: outcome?.verified ? 'Backend outcome is verified.' : 'Resolution is not verified.' },
  ];
}

function mapCase(detail: BackendCaseDetail, activities: BackendActivity[], approvals: BackendApproval[], outcome: BackendOutcome | null): CaseData {
  const tasks = detail.tasks.map(mapTask);
  const pendingApproval = approvals.find(approval => approval.status === 'pending');
  const latestActivity = activities[0];
  const verificationResult = outcome?.results.find(result => typeof result === 'object' && result !== null) as JsonObject | undefined;
  const verificationState = outcome?.verified
    ? 'VERIFIED'
    : typeof verificationResult?.verdict === 'string' ? verificationResult.verdict as CaseData['verificationState'] : undefined;
  const mappedCaseStatus = outcome?.verified ? 'resolved' : detail.status as CaseData['status'];
  return {
    id: String(detail.id),
    caseNumber: String(detail.id),
    title: detail.title,
    originalRequest: detail.problem_statement,
    status: mappedCaseStatus,
    statusLabel: statusLabel(mappedCaseStatus),
    updatedAt: formatDate(detail.updated_at),
    autonomousLead: latestActivity?.agent_name || 'RELAY Orchestrator',
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    progressPercent: tasks.length ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0,
    stages: mapStages(detail, outcome),
    currentAction: latestActivity ? { description: latestActivity.message, agentName: latestActivity.agent_name || 'RELAY Agent', elapsed: unavailable, latency: unavailable, nonce: unavailable } : undefined,
    approval: pendingApproval ? mapApproval(detail.id, pendingApproval) : undefined,
    tasks,
    provenanceChain: [],
    targetOutcomes: detail.objectives.map(objective => ({ text: objective.title, completed: objective.completed })),
    groundTruth: { passenger: unavailable, route: unavailable, originalPnr: unavailable, travelClass: unavailable },
    connectedSeals: [],
    activityFeed: activities.map(mapActivity),
    documentsCount: 0,
    dossierReady: Boolean(outcome?.verified),
    verificationState,
    verificationSummary: outcome?.summary,
    evidenceCount: typeof verificationResult?.verified_evidence_count === 'number' ? verificationResult.verified_evidence_count : 0,
  };
}

async function loadCase(caseId: string): Promise<CaseData> {
  const numericId = Number(caseId);
  if (!Number.isInteger(numericId)) throw new RelayApiError(`Invalid case id: ${caseId}`);
  const [detail, activities, approvals, outcome] = await Promise.all([
    request<BackendCaseDetail>(`/cases/${numericId}`),
    request<BackendActivity[]>(`/cases/${numericId}/activity`),
    request<BackendApproval[]>(`/cases/${numericId}/approvals`),
    request<BackendOutcome | null>(`/cases/${numericId}/outcome`),
  ]);
  return mapCase(detail, activities, approvals, outcome);
}

function mapDocument(document: BackendDocument): DocumentItem {
  return { id: String(document.id), filename: document.filename, fileType: document.document_type || document.mime_type || 'Document', caseId: '', caseNumber: unavailable, caseTitle: unavailable, date: formatDate(document.created_at), size: document.size_bytes ? `${document.size_bytes} bytes` : unavailable, processingState: document.processing_status === 'verified' ? 'verified' : 'processing', evidenceRelevance: unavailable };
}

function mapConnection(connection: BackendConnection): ConnectionItem {
  return { id: String(connection.id), name: connection.name, category: connection.category as ConnectionItem['category'], status: connection.status, icon: connection.icon, description: connection.description, lastSynced: connection.last_synced ? formatDate(connection.last_synced) : undefined, permissions: connection.permissions };
}

class RelayApiService {
  async getCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>('/auth/me');
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const user = await request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return user;
  }

  async register(email: string, password: string, confirmPassword: string): Promise<AuthUser> {
    const user = await request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
    });
    return user;
  }

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' });
    csrfToken = null;
  }

  async listCases(): Promise<CaseData[]> {
    const cases = await request<BackendCaseList[]>('/cases');
    return Promise.all(cases.map(caseItem => loadCase(String(caseItem.id))));
  }

  async getCase(id: string): Promise<CaseData | null> {
    try { return await loadCase(id); } catch (error) { if (error instanceof RelayApiError && error.status === 404) return null; throw error; }
  }

  async createCase(input: { problemStatement: string; attachments?: string[]; objectives?: string[] }): Promise<CaseData> {
    const title = input.problemStatement.trim().slice(0, 255) || 'RELAY case';
    const created = await request<BackendCaseCreate>('/cases', { method: 'POST', body: JSON.stringify({ title, problem_statement: input.problemStatement, objectives: (input.objectives || []).map(objective => ({ title: objective, description: '' })) }) });
    return loadCase(String(created.id));
  }

  async planCase(caseId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/plan`, { method: 'POST' }); return loadCase(caseId); }
  async runAutonomousLoop(caseId: string): Promise<{ caseData: CaseData; result: AutonomousRunResult }> { const result = await request<AutonomousRunResult>(`/cases/${Number(caseId)}/run`, { method: 'POST' }); return { result, caseData: await loadCase(caseId) }; }
  async executeTask(caseId: string, taskId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/tasks/${Number(taskId)}/execute`, { method: 'POST' }); return loadCase(caseId); }
  async verifyTask(caseId: string, taskId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/tasks/${Number(taskId)}/verify`, { method: 'POST' }); return loadCase(caseId); }
  async recoverCase(caseId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/recover`, { method: 'POST' }); return loadCase(caseId); }

  async getCaseActivity(caseId: string): Promise<ActivityEvent[]> { const events = await request<BackendActivity[]>(`/cases/${Number(caseId)}/activity`); return events.map(mapActivity); }
  async getCaseTasks(caseId: string): Promise<Task[]> { const tasks = await request<BackendTask[]>(`/cases/${Number(caseId)}/tasks`); return tasks.map(mapTask); }
  async getCaseOutcome(caseId: string): Promise<CaseOutcome | null> { const [detail, outcome] = await Promise.all([request<BackendCaseDetail>(`/cases/${Number(caseId)}`), request<BackendOutcome | null>(`/cases/${Number(caseId)}/outcome`)]); return mapOutcome(Number(caseId), detail.title, outcome); }

  async approveAction(caseId: string, approvalId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/approvals/${Number(approvalId)}/approve`, { method: 'POST' }); return loadCase(caseId); }
  async rejectAction(caseId: string, approvalId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/approvals/${Number(approvalId)}/reject`, { method: 'POST' }); return loadCase(caseId); }
  async pauseCase(caseId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/pause`, { method: 'POST' }); return loadCase(caseId); }
  async resumeCase(caseId: string): Promise<CaseData> { await request(`/cases/${Number(caseId)}/resume`, { method: 'POST' }); return loadCase(caseId); }

  async getDocuments(): Promise<DocumentItem[]> { const documents = await request<BackendDocument[]>('/documents'); return documents.map(mapDocument); }
  async uploadDocument(_file: { name: string; size: string }): Promise<DocumentItem> { throw new RelayApiError('Document upload is unavailable: the current backend endpoint does not accept file data or a case id.'); }
  async getConnections(): Promise<ConnectionItem[]> { const connections = await request<BackendConnection[]>('/connections'); return connections.map(mapConnection); }
  async toggleConnection(id: string): Promise<ConnectionItem> { const connection = await request<BackendConnection>(`/connections/${Number(id)}/toggle`, { method: 'POST' }); return mapConnection(connection); }
}

export const relayApi = new RelayApiService();