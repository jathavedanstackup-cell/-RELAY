import React from 'react';
import {
  LayoutDashboard,
  Clock,
  ShieldAlert,
  Activity,
  FolderLock,
  FileCheck2,
  Terminal,
  HelpCircle,
  Settings as SettingsIcon
} from 'lucide-react';

interface SideNavBarProps {
  currentSection: 'mission_control' | 'active_queue' | 'approvals' | 'telemetry' | 'vault' | 'audit' | 'settings';
  onNavigate: (route: string) => void;
  onOpenCommandPalette: () => void;
  onOpenTelemetry?: () => void;
  activeCount?: number;
  approvalsCount?: number;
  documentsCount?: number;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentSection,
  onNavigate,
  onOpenCommandPalette,
  onOpenTelemetry,
  activeCount = 4,
  approvalsCount = 1,
  documentsCount = 12
}) => {
  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 hidden lg:flex flex-col justify-between p-4 border-r border-surface-variant bg-surface-container-lowest z-40">
      <div className="flex flex-col gap-5">
        {/* Header Engine Status */}
        <div className="px-2.5 py-2 rounded-xl border border-surface-variant bg-surface-container-low flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-on-surface truncate">RELAY Core</p>
            <p className="text-[10px] font-mono text-secondary truncate">Autonomous v4.2 • Operational</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {/* Mission Control */}
          <button
            onClick={() => onNavigate('/cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'mission_control'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Mission Control</span>
            </div>
            {currentSection === 'mission_control' && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            )}
          </button>

          {/* Active Queue */}
          <button
            onClick={() => onNavigate('/cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'active_queue'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>Active Queue</span>
            </div>
            <span className="text-[10px] font-mono bg-surface-container-high px-1.5 py-0.5 rounded text-secondary">
              {activeCount}
            </span>
          </button>

          {/* Approvals Required */}
          <button
            onClick={() => onNavigate('/cases?filter=waiting')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'approvals'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Approvals Required</span>
            </div>
            {approvalsCount > 0 && (
              <span className="text-[10px] font-mono bg-primary-fixed text-on-primary-fixed font-semibold px-1.5 py-0.5 rounded">
                {approvalsCount}
              </span>
            )}
          </button>

          {/* Agent Telemetry */}
          <button
            onClick={() => {
              if (onOpenTelemetry) onOpenTelemetry();
              else onNavigate('/cases');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'telemetry'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Agent Telemetry</span>
          </button>

          {/* Knowledge Vault */}
          <button
            onClick={() => onNavigate('/documents')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'vault'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderLock className="w-4 h-4" />
              <span>Knowledge Vault</span>
            </div>
            <span className="text-[10px] font-mono text-secondary">
              {documentsCount}
            </span>
          </button>

          {/* Audit & Proofs */}
          <button
            onClick={() => onNavigate('/cases')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentSection === 'audit'
                ? 'bg-surface-container text-primary'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Audit & Proofs</span>
          </button>
        </nav>

        {/* Quick Command Prompt Box */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-surface-variant rounded-xl text-secondary hover:text-on-surface hover:border-outline hover:bg-surface-container-low text-xs font-medium transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Command Prompt</span>
          <kbd className="text-[10px] font-mono bg-surface-container px-1 py-0.5 rounded text-secondary border border-surface-variant">⌘K</kbd>
        </button>
      </div>

      {/* Footer Cluster */}
      <div className="pt-4 border-t border-surface-variant flex flex-col gap-1">
        <button
          onClick={() => onNavigate('/settings')}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container-low text-xs font-medium transition-colors w-full text-left"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Documentation</span>
        </button>
        <button
          onClick={() => onNavigate('/settings')}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container-low text-xs font-medium transition-colors w-full text-left"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Telemetry Heartbeat Pill */}
        <div className="mt-3 px-3 py-2 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-variant/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
            <span className="text-[10px] font-mono text-on-surface-variant font-medium">Agent v4.8 Active</span>
          </div>
          <span className="text-[10px] font-mono text-secondary">124ms</span>
        </div>
      </div>
    </aside>
  );
};
