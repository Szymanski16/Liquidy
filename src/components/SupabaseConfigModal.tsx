import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Code2,
  Trash2,
  HardDrive
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlScript';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  clearStoredSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabase';
import { LiquidWithReviews } from '../types';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseActive: boolean;
  liquids: LiquidWithReviews[];
  onRefreshData: () => Promise<void>;
  onExportJson: () => void;
  onImportJson: (jsonContent: string) => Promise<void>;
  onResetDemoData: () => Promise<void>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  isSupabaseActive,
  onRefreshData,
  onExportJson,
  onImportJson,
  onResetDemoData,
  onShowToast,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    onShowToast('Skopiowano skrypt SQL do schowka! Wklej go w Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Wprowadź zarówno Project URL jak i Anon Key z Supabase.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      saveStoredSupabaseConfig(url.trim(), anonKey.trim());
      await onRefreshData();
      onShowToast('Połączono z bazą Supabase! Dane będą synchronizowane.', 'success');
    }
  };

  const handleDisconnect = async () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    await onRefreshData();
    onShowToast('Przełączono w Tryb Lokalny Demo (localStorage).', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImportError('');
        const content = event.target?.result as string;
        await onImportJson(content);
        onShowToast('Baza danych została pomyślnie zaimportowana!', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setImportError(`Błąd importu pliku JSON: ${msg}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = async () => {
    if (window.confirm('Czy na pewno chcesz przywrócić domyślne dane demo? Nadpisze to lokalne recenzje.')) {
      await onResetDemoData();
      onShowToast('Przywrócono początkowe dane demo!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-modal rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Konfiguracja Połączenia i Baza Danych
              </h2>
              <p className="text-xs text-slate-400">
                Supabase (Chmura dla całej ekipy) lub Tryb Lokalny Demo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Active Mode Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isSupabaseActive 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {isSupabaseActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isSupabaseActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>
              <div>
                <strong className="text-sm font-bold block text-white">
                  {isSupabaseActive ? 'Połączono z chmurą Supabase' : 'Tryb Lokalny Demo (localStorage)'}
                </strong>
                <span className="text-xs text-slate-300">
                  {isSupabaseActive 
                    ? 'Wszystkie oceny zapisują się w chmurze i są widoczne dla całej ekipy w czasie rzeczywistym.' 
                    : 'Aplikacja działa w 100% offline w Twojej przeglądarce. Podepnij Supabase, by dzielić oceny ze znajomymi.'}
                </span>
              </div>
            </div>

            {isSupabaseActive && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 shrink-0"
              >
                Rozłącz
              </button>
            )}
          </div>

          {/* SECTION 1: SUPABASE CREDENTIALS FORM */}
          <form onSubmit={handleTestAndSave} className="space-y-4 p-4 rounded-2xl bg-dark-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                1. Dane Twojego Projektu Supabase
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Otwórz Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://twoj-projekt.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isTesting}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isTesting ? 'Sprawdzanie bazy...' : 'Zapisz i Połącz z Supabase'}</span>
              </button>
            </div>
          </form>

          {/* SECTION 2: SQL SCRIPT GENERATOR */}
          <div className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  2. Gotowy Skrypt SQL do Bazy
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Tworzy tabele `liquids`, `reviews`, bucket `liquid-images` i uprawnienia RLS
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  copiedSql
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30'
                }`}
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Skopiowano!' : 'Kopiuj Skrypt SQL'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowSqlPreview(!showSqlPreview)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {showSqlPreview ? 'Ukryj podgląd SQL' : 'Pokaż podgląd kodu SQL'}
              </button>
              <span className="text-[10px] text-slate-500">
                Wklej w: Supabase Dashboard → SQL Editor → New Query → Run
              </span>
            </div>

            {showSqlPreview && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 scrollbar-thin">
                {SUPABASE_SQL_SCRIPT}
              </pre>
            )}
          </div>

          {/* SECTION 3: BACKUP / JSON EXPORT & IMPORT */}
          <div className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" />
              3. Kopia Zapasowa (JSON Export / Import)
            </span>

            {importError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {importError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Export */}
              <button
                type="button"
                onClick={onExportJson}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Eksportuj (.json)</span>
              </button>

              {/* Import */}
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-violet-400" />
                <span>Wgraj z pliku</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Reset to demo */}
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 hover:border-rose-500/30 border border-slate-800 text-rose-300 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Resetuj do Demo</span>
              </button>
            </div>
          </div>

          {/* Close Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Zamknij okno
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
