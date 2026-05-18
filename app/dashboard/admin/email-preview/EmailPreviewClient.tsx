'use client';

import { useState } from 'react';
import { EmailPreview } from '@/lib/email/preview-templates';
import { Mail, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface Props {
  templates: EmailPreview[];
}

export function EmailPreviewClient({ templates }: Props) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? '');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const selected = templates.find(t => t.id === selectedId);
  const categories = templates
    .map(t => t.category)
    .filter((cat, idx, arr) => arr.indexOf(cat) === idx);

  const toggleCategory = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  const copyHtml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 md:-m-6">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2530] flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#D05F27]" />
            <span className="font-semibold text-sm text-gray-800 dark:text-white">Correos del sistema</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{templates.length} plantillas</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map(cat => {
            const isOpen = !collapsed[cat];
            const items = templates.filter(t => t.category === cat);
            return (
              <div key={cat} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{cat}</span>
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {isOpen && items.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-2 ${
                      selectedId === t.id
                        ? 'border-[#D05F27] bg-orange-50 dark:bg-orange-950/30 text-[#D05F27] font-medium'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Solo visible para admins
          </span>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-[#0d1117]">

        {/* Top bar */}
        <div className="shrink-0 bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Asunto del correo</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{selected?.subject}</p>
          </div>
          <button
            onClick={copyHtml}
            title="Copiar HTML"
            className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 transition-colors"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copiado' : 'Copiar HTML'}
          </button>
        </div>

        {/* iframe preview */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto h-full min-h-[600px]">
            {selected && (
              <iframe
                key={selected.id}
                srcDoc={selected.html}
                title={`Preview: ${selected.label}`}
                className="w-full rounded-lg shadow-lg border-0 bg-white"
                style={{ height: '100%', minHeight: '700px' }}
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
