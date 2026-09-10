import React, { useState } from 'react';
import {
  Search,
  Upload,
  FileText,
  ShieldCheck,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsPageProps {
  documents: DocumentItem[];
  onNavigate: (route: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onUploadDocument: (file: { name: string; size: string }) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  documents,
  onNavigate,
  onPreviewDocument,
  onUploadDocument
}) => {
  const [search, setSearch] = useState('');
  const [caseFilter, setCaseFilter] = useState<string>('all');

  const filtered = documents.filter(doc => {
    if (caseFilter !== 'all' && doc.caseId !== caseFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return doc.filename.toLowerCase().includes(q) ||
        doc.caseNumber.toLowerCase().includes(q) ||
        doc.evidenceRelevance.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const sizeStr = `${(f.size / 1024).toFixed(0)} KB`;
      onUploadDocument({ name: f.name, size: sizeStr });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Knowledge &amp; Evidence Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-mono font-bold text-secondary">
              {documents.length} Backend Documents
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Documents currently exposed by the RELAY backend.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload unavailable</span>
            <input
              type="file"
              onChange={handleFileInput}
              disabled
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={caseFilter}
            onChange={e => setCaseFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-xs text-on-surface font-medium focus:outline-none"
          >
            <option value="all">All Cases</option>
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artifacts, hashes, or filings..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-xs text-on-surface placeholder-secondary focus:outline-none focus:border-outline"
          />
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-surface-variant text-[11px] font-mono text-secondary uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Artifact &amp; Document</th>
                <th className="px-4 py-3">Case Association</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Integrity State</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/40">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-on-surface truncate max-w-xs">{doc.filename}</p>
                        <p className="text-[11px] text-secondary font-mono truncate max-w-sm">{doc.evidenceRelevance}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => doc.caseId && onNavigate(`/cases/${doc.caseId}`)}
                      disabled={!doc.caseId}
                      className="font-mono font-bold text-primary hover:underline"
                    >
                      {doc.caseNumber}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-secondary font-mono">
                    {doc.fileType}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-mono font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.processingState.toUpperCase()}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-secondary font-mono text-[11px]">
                    {doc.date}
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => onPreviewDocument(doc)}
                      className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Preview Artifact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      disabled
                      title="Download unavailable from the current backend contract"
                      className="p-1.5 rounded-lg text-secondary/50 cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
