import React from 'react';
import { Plus, Search, Bell, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface TopNavBarProps {
  activeTab: 'intake' | 'cases' | 'documents' | 'connections' | 'settings' | 'mission_control';
  onNavigate: (route: string) => void;
  onOpenCommandPalette: () => void;
  pendingApprovalsCount?: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onNavigate,
  onOpenCommandPalette,
  pendingApprovalsCount = 1
}) => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 border-b border-surface-variant bg-surface-container-lowest/95 backdrop-blur-md">
      {/* Left Cluster: Logo, Subline & Nav Tabs */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container group-hover:scale-110 transition-transform"></span>
            <span className="text-xl font-bold tracking-tight text-primary">RELAY</span>
          </div>
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="text-[11px] text-secondary tracking-wide">
              Give AI the problem. Get back the outcome.
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav aria-label="Global Primary Navigation" className="hidden md:flex items-center gap-6 ml-2">
          <button
            onClick={() => onNavigate('/')}
            className={`pb-1 text-xs font-semibold transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'intake'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Intake</span>
          </button>

          <button
            onClick={() => onNavigate('/cases')}
            className={`pb-1 text-xs font-semibold transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'cases'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            <span>My Cases</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-secondary text-[10px] font-mono font-medium">
              4
            </span>
          </button>

          <button
            onClick={() => onNavigate('/cases/1048')}
            className={`pb-1 text-xs font-semibold transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'mission_control'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
            <span>Mission Control</span>
            {pendingApprovalsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary-container pulse-amber"></span>
            )}
          </button>

          <button
            onClick={() => onNavigate('/documents')}
            className={`pb-1 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'documents'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Documents
          </button>

          <button
            onClick={() => onNavigate('/connections')}
            className={`pb-1 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'connections'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Connections
          </button>

          <button
            onClick={() => onNavigate('/settings')}
            className={`pb-1 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Right Cluster: Command Palette, Status, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ⌘K Quick Action Input / Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-low text-secondary hover:text-on-surface hover:border-outline-variant transition-colors text-xs"
          type="button"
          title="Quick search or jump to case (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Action or Case ID</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-lowest border border-surface-variant text-[10px] font-mono font-medium text-secondary">
            ⌘K
          </kbd>
        </button>

        <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>

        {/* System Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container text-[11px] text-secondary">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
          <span className="font-mono text-xs">v4.2 Operational</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          aria-label="Notifications"
          onClick={() => onNavigate('/cases?filter=waiting')}
          className="p-2 rounded-xl text-secondary hover:bg-surface-container hover:text-on-surface transition-colors relative"
          title="Notifications & Approvals"
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>
          )}
        </button>

        {/* Global Settings Tune Button */}
        <button
          aria-label="Settings"
          onClick={() => onNavigate('/settings')}
          className="p-2 rounded-xl text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          title="Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Primary Action Button: New Case */}
        <button
          onClick={() => onNavigate('/')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:bg-primary transition-colors active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Case</span>
        </button>

        {/* Chief Operator Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-surface-variant">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center font-semibold text-xs text-on-surface cursor-pointer"
              title="Chief Operator (Sarah Jenkins)"
              onClick={() => onNavigate('/settings')}
            >
              CO
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary-container border-2 border-surface-container-lowest"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
