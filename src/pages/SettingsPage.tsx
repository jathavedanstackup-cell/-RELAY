import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  Bell,
  Lock,
  User,
  CheckCircle2,
  DollarSign,
  Save,
  Terminal,
  Database
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [maxAutoDelta, setMaxAutoDelta] = useState('0');
  const [require2FA, setRequire2FA] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDossier, setEmailDossier] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-surface-variant">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          System Settings &amp; Governance
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Configure autonomous boundaries, consequential thresholds, and cryptographic verification policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Principal Profile */}
        <div className="p-6 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <User className="w-4 h-4 text-primary" />
            <span>Principal Operator Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-secondary block mb-1">Full Legal Name</label>
              <input
                type="text"
                defaultValue="Sarah Jenkins"
                className="w-full p-2.5 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface font-sans"
              />
            </div>
            <div>
              <label className="text-secondary block mb-1">Primary Communications Email</label>
              <input
                type="email"
                defaultValue="sarah.jenkins@relay-ops.io"
                className="w-full p-2.5 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface font-sans"
              />
            </div>
          </div>
        </div>

        {/* Autonomous Execution Boundaries */}
        <div className="p-6 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Autonomous Execution Boundaries &amp; Thresholds</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-variant">
              <div>
                <h4 className="font-bold text-on-surface">Maximum Auto-Approved Financial Delta</h4>
                <p className="text-secondary text-[11px] mt-0.5">
                  Any booking fee or price difference above this amount triggers a mandatory Human Authorization Boundary card.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-secondary">$</span>
                <input
                  type="number"
                  value={maxAutoDelta}
                  onChange={e => setMaxAutoDelta(e.target.value)}
                  className="w-20 p-2 rounded-lg border border-surface-variant bg-surface-container-lowest font-mono font-bold text-center text-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-variant">
              <div>
                <h4 className="font-bold text-on-surface">Mandatory Legal Signature Boundary</h4>
                <p className="text-secondary text-[11px] mt-0.5">
                  Always require explicit user signature authorization before submitting ERISA, CAA, or court filings.
                </p>
              </div>
              <input
                type="checkbox"
                checked={require2FA}
                onChange={e => setRequire2FA(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="p-6 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Bell className="w-4 h-4 text-primary" />
            <span>Notification &amp; Escalation Channels</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div>
                <span className="font-bold text-on-surface">SMS Urgent Authorization Alerts</span>
                <p className="text-[11px] text-secondary">Send 1-click mobile authorization link when an action is expiring.</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div>
                <span className="font-bold text-on-surface">Deliver Outcome Dossier PDF via Email</span>
                <p className="text-[11px] text-secondary">Automatically dispatch complete cryptographic report upon resolution.</p>
              </div>
              <input
                type="checkbox"
                checked={emailDossier}
                onChange={e => setEmailDossier(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Cryptographic Ledger & Data Retention */}
        <div className="p-6 rounded-2xl border border-surface-variant bg-surface-container-lowest space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-secondary">
            <Database className="w-4 h-4 text-primary" />
            <span>Data Vault &amp; Audit Retention</span>
          </div>
          <p className="text-secondary leading-relaxed">
            All case runs, tool invocations, and authority tokens are sealed using SHA-256 Merkle proofs. Data is retained according to statutory limitation periods (7 years for airline and financial claims).
          </p>
          <div className="p-3 rounded-lg bg-surface-container-low font-mono text-[11px] text-secondary">
            <span>Current Ledger Root: </span>
            <strong className="text-on-surface">0x8f4e22a8901c90a1b5592881902919aa782910bc8821094</strong>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-bold text-tertiary-container flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated &amp; policy updated</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-secondary">Changes take effect immediately on active pods</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Policies</span>
          </button>
        </div>
      </form>
    </div>
  );
};
