import React from 'react';
import { X, Plane, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface AlternativeFlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlight: (flightName: string, delta: string) => void;
}

export const AlternativeFlightsModal: React.FC<AlternativeFlightsModalProps> = ({
  isOpen,
  onClose,
  onSelectFlight
}) => {
  if (!isOpen) return null;

  const alternatives = [
    {
      id: 'alt-1',
      flightNumber: 'British Airways BA178',
      departure: '20:40 Tonight (JFK)',
      arrival: '08:45 AM GMT (LHR)',
      aircraft: 'Boeing 777-300ER',
      cabin: 'World Traveller Plus (Seat 14B)',
      fareDelta: '+$84.00',
      arrivalVariance: '+3h 15m slippage',
      recommended: true,
      tag: 'RELAY Recommended',
      reason: 'Arrives before 10:00 AM stakeholder sync. Seat reserved.'
    },
    {
      id: 'alt-2',
      flightNumber: 'Virgin Atlantic VS26',
      departure: '21:30 Tonight (JFK)',
      arrival: '09:35 AM GMT (LHR)',
      aircraft: 'Airbus A350-1000',
      cabin: 'Premium Economy (Seat 22C)',
      fareDelta: '+$140.00',
      arrivalVariance: '+4h 05m slippage',
      recommended: false,
      tag: 'Alternative Carrier',
      reason: 'Tight arrival margin for 10:00 AM meeting.'
    },
    {
      id: 'alt-3',
      flightNumber: 'British Airways BA182',
      departure: '02:10 AM Tomorrow (JFK)',
      arrival: '14:15 PM GMT (LHR)',
      aircraft: 'Boeing 787-9 Dreamliner',
      cabin: 'Club World (Seat 08A)',
      fareDelta: '$0.00 base exchange',
      arrivalVariance: '+8h 45m slippage',
      recommended: false,
      tag: 'Zero Fare Delta',
      reason: 'Misses 10:00 AM London summit; requires rescheduling meeting.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Available Trans-Atlantic Alternatives</h3>
              <p className="text-[11px] text-secondary font-mono">
                Filtered across 14 flights on British Airways, Virgin Atlantic &amp; American Airlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {alternatives.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.recommended
                  ? 'border-primary/50 bg-primary-fixed/10 ring-1 ring-primary/20'
                  : 'border-surface-variant bg-surface-container-low hover:border-outline-variant'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">{item.flightNumber}</span>
                  {item.recommended && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-mono font-bold">
                      {item.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-secondary">{item.arrivalVariance}</span>
                  <span className="text-sm font-mono font-bold text-primary">{item.fareDelta}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-secondary font-mono mb-3">
                <div>
                  <span className="text-[10px] text-secondary/70 block">Departure</span>
                  <span className="text-on-surface">{item.departure}</span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary/70 block">Arrival</span>
                  <span className="text-on-surface">{item.arrival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-secondary/70 block">Cabin</span>
                  <span className="text-on-surface">{item.cabin}</span>
                </div>
              </div>

              <p className="text-[11px] text-secondary mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{item.reason}</span>
              </p>

              <button
                onClick={() => {
                  onSelectFlight(item.flightNumber, item.fareDelta);
                  onClose();
                }}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  item.recommended
                    ? 'bg-primary text-on-primary hover:bg-primary-container'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Select this flight ({item.fareDelta})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-surface-variant flex items-center justify-between">
          <span className="text-[11px] font-mono text-secondary">
            Flight inventory holds valid for 15 minutes via Direct NDC API
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container text-secondary text-xs font-semibold hover:text-on-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
