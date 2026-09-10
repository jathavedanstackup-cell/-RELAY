import React, { useState, useEffect } from 'react';
import { RelayApiError, relayApi } from './services/api';
import { AuthUser, CaseData, CaseOutcome, DocumentItem, ConnectionItem, OutcomeItem } from './types';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { ApprovalModal } from './components/ApprovalModal';
import { AlternativeFlightsModal } from './components/AlternativeFlightsModal';
import { TelemetryJsonModal } from './components/TelemetryJsonModal';

import { IntakePage } from './pages/IntakePage';
import { NewCaseUnderstandingPage } from './pages/NewCaseUnderstandingPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { MyCasesPage } from './pages/MyCasesPage';
import { OutcomeDossierPage } from './pages/OutcomeDossierPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Current Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '' 
      ? window.location.pathname 
      : '/';
  });

  // Data Store State
  const [cases, setCases] = useState<CaseData[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [activeOutcome, setActiveOutcome] = useState<CaseOutcome | null>(null);

  // New Case Intake Input Cache
  const [intakeStatement, setIntakeStatement] = useState<string>('');
  const [intakeAttachments, setIntakeAttachments] = useState<string[]>([]);

  // Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [isAlternativesModalOpen, setIsAlternativesModalOpen] = useState<boolean>(false);
  const [isTelemetryJsonOpen, setIsTelemetryJsonOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewOutcomeItem, setPreviewOutcomeItem] = useState<OutcomeItem | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [planningCaseId, setPlanningCaseId] = useState<string | null>(null);

  useEffect(() => {
    relayApi.getCurrentUser()
      .then(user => setAuthUser(user))
      .catch(error => {
        if (!(error instanceof RelayApiError && error.status === 401)) {
          setAuthError(error instanceof Error ? error.message : 'RELAY could not resolve your session.');
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Initial Load from Service Layer
  useEffect(() => {
    if (!authUser) {
      setIsInitialLoading(false);
      return;
    }
    let cancelled = false;
    const initData = async () => {
      setIsInitialLoading(true);
      setErrorMessage(null);
      try {
        const [allCases, allDocs, allConns] = await Promise.all([
          relayApi.listCases(),
          relayApi.getDocuments(),
          relayApi.getConnections(),
        ]);
        if (cancelled) return;
        setCases(allCases);
        setDocuments(allDocs);
        setConnections(allConns);
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : 'RELAY could not load live data.');
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    };
    initData();
    return () => { cancelled = true; };
  }, [authUser]);

  // History / URL popstate synchronization
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract Route Matching
  const getRouteInfo = () => {
    const path = currentRoute.split('?')[0];

    if (path === '/' || path === '') return { type: 'intake' as const };
    if (path === '/new-case') return { type: 'new_case' as const };
    if (path === '/cases') return { type: 'cases' as const };
    if (path === '/documents') return { type: 'documents' as const };
    if (path === '/connections') return { type: 'connections' as const };
    if (path === '/settings') return { type: 'settings' as const };
    if (path === '/login') return { type: 'login' as const };
    if (path === '/register') return { type: 'register' as const };

    const outcomeMatch = path.match(/^\/cases\/([^/]+)\/outcome$/);
    if (outcomeMatch) {
      return { type: 'outcome' as const, caseId: outcomeMatch[1] };
    }

    const caseMatch = path.match(/^\/cases\/([^/]+)$/);
    if (caseMatch) {
      return { type: 'mission_control' as const, caseId: caseMatch[1] };
    }

    return { type: 'intake' as const };
  };

  const routeInfo = getRouteInfo();
  const isAuthRoute = routeInfo.type === 'login' || routeInfo.type === 'register';

  useEffect(() => {
    if (authLoading) return;
    if (!authUser && !isAuthRoute) navigateTo('/login');
    if (authUser && isAuthRoute) navigateTo('/');
  }, [authLoading, authUser, isAuthRoute]);

  // Active case for Mission Control
  const activeCaseId = (routeInfo.type === 'mission_control' || routeInfo.type === 'outcome')
    ? (routeInfo.caseId || '')
    : cases[0]?.id || '';
  const currentCase = cases.find(c => c.id === activeCaseId)
    || (routeInfo.type === 'mission_control' || routeInfo.type === 'outcome' ? null : cases[0] || null);

  useEffect(() => {
    if (!activeCaseId) {
      setActiveOutcome(null);
      return;
    }
    let cancelled = false;
    relayApi.getCaseOutcome(activeCaseId)
      .then(outcome => { if (!cancelled) setActiveOutcome(outcome); })
      .catch(() => { if (!cancelled) setActiveOutcome(null); });
    return () => { cancelled = true; };
  }, [activeCaseId]);

  const replaceCase = (updated: CaseData) => {
    setCases(prev => {
      const exists = prev.some(item => item.id === updated.id);
      return exists ? prev.map(item => item.id === updated.id ? updated : item) : [updated, ...prev];
    });
  };

  const runMutation = async (key: string, action: () => Promise<void>) => {
    if (busyAction) return;
    setBusyAction(key);
    setErrorMessage(null);
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'RELAY could not complete that action.');
    } finally {
      setBusyAction(null);
    }
  };

  // Global Action Handlers
  const handleProblemSubmit = (statement: string, attachments: string[]) => {
    setIntakeStatement(statement);
    setIntakeAttachments(attachments);
  };

  const handleLogout = async () => {
    try {
      await relayApi.logout();
    } finally {
      setAuthUser(null);
      navigateTo('/login');
    }
  };

  const handleLaunchExecution = async (objectives: string[]) => {
    await runMutation('create-case', async () => {
      const targetCase = planningCaseId
        ? await relayApi.getCase(planningCaseId)
        : await relayApi.createCase({
          problemStatement: intakeStatement || 'Flight cancellation and statutory compensation',
          attachments: intakeAttachments,
          objectives,
        });
      if (!targetCase) throw new Error('The case being planned is no longer available.');
      setPlanningCaseId(targetCase.id);
      const plannedCase = await relayApi.planCase(targetCase.id);
      replaceCase(plannedCase);
      setPlanningCaseId(null);
      navigateTo(`/cases/${plannedCase.id}`);
    });
  };

  const handleApproveAction = async (caseId: string, approvalId: string) => {
    await runMutation(`approve-${approvalId}`, async () => replaceCase(await relayApi.approveAction(caseId, approvalId)));
  };

  const handleRejectAction = async (caseId: string, approvalId: string) => {
    await runMutation(`reject-${approvalId}`, async () => replaceCase(await relayApi.rejectAction(caseId, approvalId)));
  };

  const handlePauseCase = async (caseId: string) => {
    await runMutation(`pause-${caseId}`, async () => replaceCase(await relayApi.pauseCase(caseId)));
  };

  const handleResumeCase = async (caseId: string) => {
    await runMutation(`resume-${caseId}`, async () => replaceCase(await relayApi.resumeCase(caseId)));
  };

  const handleRunAutonomous = async (caseId: string) => {
    await runMutation(`run-${caseId}`, async () => {
      const result = await relayApi.runAutonomousLoop(caseId);
      replaceCase(result.caseData);
    });
  };

  const handleExecuteTask = async (caseId: string, taskId: string) => {
    await runMutation(`execute-${taskId}`, async () => replaceCase(await relayApi.executeTask(caseId, taskId)));
  };

  const handleVerifyTask = async (caseId: string, taskId: string) => {
    await runMutation(`verify-${taskId}`, async () => replaceCase(await relayApi.verifyTask(caseId, taskId)));
  };

  const handleRecoverCase = async (caseId: string) => {
    await runMutation(`recover-${caseId}`, async () => replaceCase(await relayApi.recoverCase(caseId)));
  };

  const handleUploadDocument = async (file: { name: string; size: string }) => {
    await runMutation('upload-document', async () => {
      const newDoc = await relayApi.uploadDocument(file);
      setDocuments(prev => [newDoc, ...prev]);
    });
  };

  const handleToggleConnection = async (id: string) => {
    await runMutation(`connection-${id}`, async () => {
      const updated = await relayApi.toggleConnection(id);
      setConnections(prev => prev.map(c => (c.id === id ? updated : c)));
    });
  };

  // Nav Tab determination
  const getNavTab = () => {
    if (routeInfo.type === 'intake' || routeInfo.type === 'new_case') return 'intake';
    if (routeInfo.type === 'mission_control') return 'mission_control';
    if (routeInfo.type === 'cases') return 'cases';
    if (routeInfo.type === 'documents') return 'documents';
    if (routeInfo.type === 'connections') return 'connections';
    if (routeInfo.type === 'settings') return 'settings';
    return 'cases';
  };

  // Side bar determination
  const showSidebar = routeInfo.type === 'mission_control' ||
    routeInfo.type === 'cases' ||
    routeInfo.type === 'outcome' ||
    routeInfo.type === 'documents';

  const getSideSection = () => {
    if (routeInfo.type === 'mission_control') return 'mission_control';
    if (routeInfo.type === 'outcome') return 'audit';
    if (routeInfo.type === 'documents') return 'vault';
    if (currentRoute.includes('filter=waiting')) return 'approvals';
    return 'active_queue';
  };

  // Pending approvals count
  const pendingApprovalsCount = cases.filter(c => c.status === 'waiting_approval' || (c.approval && c.approval.status === 'pending')).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-secondary font-mono text-xs">
        Resolving RELAY session...
      </div>
    );
  }

  if (!authUser) {
    if (authError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
          <div className="space-y-3">
            <p className="text-sm text-error">{authError}</p>
            <button onClick={() => window.location.reload()} className="text-xs font-bold text-primary underline">Retry</button>
          </div>
        </div>
      );
    }
    return <AuthPage mode={routeInfo.type === 'register' ? 'register' : 'login'} onAuthenticated={user => { setAuthUser(user); navigateTo('/'); }} onNavigate={navigateTo} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
      {/* Sticky Top Navigation Bar */}
      <TopNavBar
        activeTab={getNavTab()}
        onNavigate={navigateTo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
        casesCount={cases.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Persistent Side Navigation for Operational views */}
        {showSidebar && (
          <SideNavBar
            currentSection={getSideSection()}
            onNavigate={navigateTo}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenTelemetry={() => setIsTelemetryJsonOpen(true)}
            activeCount={cases.filter(c => c.status === 'in_progress' || c.status === 'planning').length}
            approvalsCount={pendingApprovalsCount}
            documentsCount={documents.length}
          />
        )}

        {/* Content Wrapper */}
        <main
          className={`flex-1 transition-all ${
            showSidebar ? 'lg:pl-64' : ''
          }`}
        >
          {isInitialLoading && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-secondary">Loading live RELAY data...</div>
          )}
          {errorMessage && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/40 px-4 py-3 text-xs text-on-error-container">
                <span>{errorMessage}</span>
                <button onClick={() => window.location.reload()} className="font-bold underline">Retry</button>
              </div>
            </div>
          )}
          {routeInfo.type === 'intake' && (
            <IntakePage
              onNavigate={navigateTo}
              onSubmitProblem={handleProblemSubmit}
              activeCases={cases}
            />
          )}

          {routeInfo.type === 'new_case' && (
            <NewCaseUnderstandingPage
              problemStatement={intakeStatement}
              attachments={intakeAttachments}
              onNavigate={navigateTo}
              onLaunchExecution={handleLaunchExecution}
              isPlanning={busyAction === 'create-case'}
              planningError={errorMessage}
              onRetryPlanning={() => handleLaunchExecution([])}
            />
          )}

          {routeInfo.type === 'mission_control' && currentCase && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <MissionControlPage
                caseData={currentCase}
                onNavigate={navigateTo}
                onApproveAction={apprId => handleApproveAction(currentCase.id, apprId)}
                onRejectAction={apprId => handleRejectAction(currentCase.id, apprId)}
                onPauseCase={() => handlePauseCase(currentCase.id)}
                onResumeCase={() => handleResumeCase(currentCase.id)}
                onRunAutonomous={() => handleRunAutonomous(currentCase.id)}
                onExecuteTask={taskId => handleExecuteTask(currentCase.id, taskId)}
                onVerifyTask={taskId => handleVerifyTask(currentCase.id, taskId)}
                onRecoverCase={() => handleRecoverCase(currentCase.id)}
                isBusy={Boolean(busyAction)}
                onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
                onOpenAlternativesModal={() => setIsAlternativesModalOpen(true)}
                onOpenTelemetryJson={() => setIsTelemetryJsonOpen(true)}
                onOpenDocPreview={title => {
                  const doc = documents.find(d => d.filename.includes(title)) || documents[1] || documents[0];
                  setPreviewDoc(doc);
                }}
              />
            </div>
          )}

          {routeInfo.type === 'cases' && (
            <MyCasesPage
              cases={cases}
              onNavigate={navigateTo}
              onOpenApproval={cId => {
                const targetCase = cases.find(c => c.id === cId);
                if (targetCase && targetCase.approval) {
                  setIsApprovalModalOpen(true);
                } else {
                  navigateTo(`/cases/${cId}`);
                }
              }}
              initialFilter={currentRoute.includes('filter=waiting') ? 'waiting' : 'all'}
            />
          )}

          {routeInfo.type === 'outcome' && activeOutcome && (
            <OutcomeDossierPage
              outcome={activeOutcome}
              onNavigate={navigateTo}
              onOpenOutcomeModal={item => {
                setPreviewOutcomeItem(item);
              }}
            />
          )}

          {routeInfo.type === 'documents' && (
            <DocumentsPage
              documents={documents}
              onNavigate={navigateTo}
              onPreviewDocument={doc => setPreviewDoc(doc)}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {routeInfo.type === 'connections' && (
            <ConnectionsPage
              connections={connections}
              onToggleConnection={handleToggleConnection}
              onNavigate={navigateTo}
            />
          )}

          {routeInfo.type === 'settings' && (
            <SettingsPage onNavigate={navigateTo} />
          )}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Document & Evidence Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc || previewOutcomeItem)}
        onClose={() => {
          setPreviewDoc(null);
          setPreviewOutcomeItem(null);
        }}
        document={previewDoc}
        outcomeItem={previewOutcomeItem}
      />

      {/* Human Authorization Boundary Modal */}
      {currentCase?.approval && (
        <ApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          approval={currentCase.approval}
          onApprove={() => handleApproveAction(currentCase.id, currentCase.approval!.id)}
          onReject={() => handleRejectAction(currentCase.id, currentCase.approval!.id)}
          onOpenAlternatives={() => setIsAlternativesModalOpen(true)}
        />
      )}

      {/* Alternative Flights Modal */}
      <AlternativeFlightsModal
        isOpen={isAlternativesModalOpen}
        onClose={() => setIsAlternativesModalOpen(false)}
        onSelectFlight={(flightName, delta) => {
          if (currentCase?.approval?.flightDetails) {
            currentCase.approval.flightDetails.flightNumber = flightName.split(' ')[2] || flightName;
            currentCase.approval.flightDetails.expeditedDelta = delta;
          }
          setIsApprovalModalOpen(true);
        }}
      />

      {/* Telemetry JSON & Cryptographic Ledger Modal */}
      {currentCase && (
        <TelemetryJsonModal
          isOpen={isTelemetryJsonOpen}
          onClose={() => setIsTelemetryJsonOpen(false)}
          caseData={currentCase}
        />
      )}
    </div>
  );
}
