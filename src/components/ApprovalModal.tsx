import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, ArrowRight, Clock, Plane, AlertTriangle, ChevronRight } from 'lucide-react';
import { ApprovalAction } from '../types';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: ApprovalAction;
  onApprove: () => void;
  onOpenAlternatives: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  approval,
  onApprove,
  onOpenAlternatives
}) => {
  const [timeLeft, setTimeLeft] = useState(approval.expiresInSeconds || 600);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-primary/20 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header with Human Authorization Boundary Badge */}
        <div className="px-6 py-4 border-b border-surface-variant bg-primary-fixed/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-primary">
                Human Authorization Boundary
              </span>
              <h3 className="text-sm font-bold text-on-surface">
                {approval.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-mono text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Flight Card Specification */}
          {approval.flightDetails && (
            <div className="p-4 rounded-xl border border-surface-variant bg-surface-container-low space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      British Airways {approval.flightDetails.flightNumber}
                    </h4>
                    <p className="text-xs text-secondary font-mono">
                      {approval.flightDetails.route} · {approval.flightDetails.aircraft}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-secondary block">Fare Delta</span>
                  <span className="text-base font-bold text-primary font-mono">
                    {approval.flightDetails.expeditedDelta}
                  </span>
                </div>
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-surface-container-lowest border border-surface-variant/70 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Departure</span>
                  <span className="font-semibold text-on-surface">{approval.flightDetails.departureTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Arrival</span>
                  <span className="font-semibold text-on-surface">{approval.flightDetails.arrivalTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Class</span>
                  <span className="font-semibold text-on-surface">{approval.flightDetails.cabin}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary block">Reserved Seat</span>
                  <span className="font-semibold text-primary font-mono">{approval.flightDetails.seat}</span>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-xs">
                <CheckCircle2 className="w-4 h-4 text-tertiary-container mt-0.5 shrink-0" />
                <span>
                  {approval.flightDetails.reclaimableNote} RELAY will automatically append this $84 receipt to the £520 statutory reimbursement filing.
                </span>
              </div>
            </div>
          )}

          {/* Rationale & Provenance */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Autonomous Recommendation Rationale
            </h5>
            <div className="p-3.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-xs text-secondary leading-relaxed space-y-2">
              <p className="text-on-surface font-medium">
                {approval.rationale}
              </p>
              <div className="pt-2 border-t border-surface-variant flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <span>Model Confidence: <strong className="text-tertiary-container">{approval.confidenceScore}</strong></span>
                <span>Provenance Token: <strong className="text-secondary">{approval.provenanceHash}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenAlternatives();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-surface-variant bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Review Alternatives</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Approve Action &amp; Rebook (+$84.00)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
