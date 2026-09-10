import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ExternalLink,
  Plus,
  Power
} from 'lucide-react';
import { ConnectionItem } from '../types';

interface ConnectionsPageProps {
  connections: ConnectionItem[];
  onToggleConnection: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({
  connections,
  onToggleConnection,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Travel & Airlines', 'Calendar & Comms', 'Financial & Cards', 'Hospitality', 'Government & Legal'];

  const filtered = activeCategory === 'all'
    ? connections
    : connections.filter(c => c.category === activeCategory);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Connected Authority Vaults
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-mono font-bold">
              {connections.filter(c => c.status === 'connected').length} Active Links
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            RELAY interacts with external systems on your behalf. Authorized credentials allow autonomous verification, hold placements, and statutory duty claims.
          </p>
        </div>

        <button
          disabled
          title="Provider creation is unavailable from the current backend contract"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container text-secondary rounded-xl text-xs font-bold cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New Service</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap capitalize ${
              activeCategory === cat
                ? 'bg-surface-container-highest border-outline-variant text-on-surface'
                : 'border-surface-variant bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            {cat === 'all' ? 'All Authorities' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(conn => {
          const isConnected = conn.status === 'connected';
          const isAttention = conn.status === 'needs_attention';

          return (
            <div
              key={conn.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isConnected
                  ? 'border-surface-variant bg-surface-container-lowest'
                  : isAttention
                  ? 'border-error/40 bg-error-container/10'
                  : 'border-dashed border-surface-variant bg-surface-container-low/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">{conn.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{conn.name}</h4>
                      <span className="text-[11px] font-mono text-secondary">{conn.category}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isConnected
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : isAttention
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {isConnected ? 'CONNECTED' : isAttention ? 'NEEDS 2FA' : 'AVAILABLE'}
                  </span>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  {conn.description}
                </p>

                {/* Permissions List */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/50 space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] text-secondary uppercase tracking-wider block">
                    Granted Permissions
                  </span>
                  {conn.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-secondary">
                      <CheckCircle2 className="w-3 h-3 text-tertiary-container shrink-0" />
                      <span className="text-on-surface truncate">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-surface-variant flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-secondary">
                  {conn.lastSynced ? `Synced: ${conn.lastSynced}` : 'Not connected'}
                </span>

                <button
                  onClick={() => onToggleConnection(conn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isConnected
                      ? 'border border-surface-variant bg-surface-container hover:bg-surface-container-high text-secondary hover:text-error'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
