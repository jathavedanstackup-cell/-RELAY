import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Clock, FolderLock, Settings, ShieldAlert, Sparkles } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'intake',
      category: 'Workflows',
      title: 'Submit New Problem to RELAY',
      subtitle: 'Open problem intake and delegate to autonomous engine',
      icon: Sparkles,
      action: () => onNavigate('/')
    },
    {
      id: 'approvals',
      category: 'Navigation',
      title: 'Approvals Required (1 pending)',
      subtitle: 'Review consequential authorization checkpoints',
      icon: ShieldAlert,
      action: () => onNavigate('/cases?filter=waiting')
    },
    {
      id: 'cases',
      category: 'Navigation',
      title: 'View All Active Cases',
      subtitle: 'Case directory and life-administration queue',
      icon: Clock,
      action: () => onNavigate('/cases')
    },
    {
      id: 'docs',
      category: 'Navigation',
      title: 'Open Documents & Evidence Vault',
      subtitle: 'Access backend-provided documents and evidence',
      icon: FolderLock,
      action: () => onNavigate('/documents')
    },
    {
      id: 'settings',
      category: 'Navigation',
      title: 'System Settings & Autonomous Thresholds',
      subtitle: 'Configure consequential limits and notification rules',
      icon: Settings,
      action: () => onNavigate('/settings')
    }
  ];

  const filteredCommands = query.trim() === ''
    ? commands
    : commands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant overflow-hidden">
        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-surface-variant bg-surface-container-low">
          <Search className="w-4 h-4 text-secondary mr-3" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cases, commands, or enter a case id..."
            className="w-full bg-transparent text-sm text-on-surface placeholder-secondary focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-on-surface rounded-lg hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-surface-variant/30">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-secondary text-xs">
              No matching cases or commands found.
            </div>
          ) : (
            filteredCommands.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-fixed group-hover:text-primary-container transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono text-secondary px-1.5 py-0.2 rounded bg-surface-container">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary mt-0.5">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-secondary group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-surface-variant flex items-center justify-between text-[11px] text-secondary">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono bg-surface-container px-1 rounded">↑</kbd> <kbd className="font-mono bg-surface-container px-1 rounded">↓</kbd></span>
            <span>Select: <kbd className="font-mono bg-surface-container px-1 rounded">↵</kbd></span>
          </div>
          <span className="font-mono text-[10px]">RELAY Autonomous Core v4.2</span>
        </div>
      </div>
    </div>
  );
};
