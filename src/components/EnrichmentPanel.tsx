import React, { useState } from 'react';
import { Globe, Search, User, Phone, Mail, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchWhoisDomain, fetchOpenCNPJ, WhoisResult, OpenCNPJResult } from '../services/enrichmentService';
import { cn } from '../lib/utils';

interface Props {
  cnpj: string;
  website?: string;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

function Badge({ label }: { label: string }) {
  return (
    <span className="bg-[#EEF2FF] text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
      {label}
    </span>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <div>
        <span className="text-[10px] text-text-slate font-bold uppercase block">{label}</span>
        <span className="font-medium text-text-dark break-all">{value}</span>
      </div>
    </div>
  );
}

export function EnrichmentPanel({ cnpj, website }: Props) {
  const [whoisStatus, setWhoisStatus] = useState<Status>('idle');
  const [whoisData, setWhoisData] = useState<WhoisResult | null>(null);
  const [whoisError, setWhoisError] = useState('');
  const [domainInput, setDomainInput] = useState(website ?? '');
  const [whoisOpen, setWhoisOpen] = useState(false);

  const [cnpjStatus, setCnpjStatus] = useState<Status>('idle');
  const [cnpjData, setCnpjData] = useState<OpenCNPJResult | null>(null);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjOpen, setCnpjOpen] = useState(false);

  const handleWhois = async () => {
    if (!domainInput) return;
    setWhoisStatus('loading');
    setWhoisData(null);
    setWhoisError('');
    try {
      const result = await fetchWhoisDomain(domainInput);
      setWhoisData(result);
      setWhoisStatus('done');
      setWhoisOpen(true);
    } catch (e: any) {
      setWhoisError(e.message);
      setWhoisStatus('error');
    }
  };

  const handleOpenCNPJ = async () => {
    setCnpjStatus('loading');
    setCnpjData(null);
    setCnpjError('');
    try {
      const result = await fetchOpenCNPJ(cnpj);
      setCnpjData(result);
      setCnpjStatus('done');
      setCnpjOpen(true);
    } catch (e: any) {
      setCnpjError(e.message);
      setCnpjStatus('error');
    }
  };

  return (
    <div className="space-y-3">
      {/* WHOIS registro.br */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-text-dark">WHOIS registro.br</span>
            <Badge label="Sócios & Contatos" />
          </div>
          <button
            onClick={() => whoisData && setWhoisOpen(o => !o)}
            className="text-text-slate hover:text-text-dark transition-colors"
          >
            {whoisOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={e => setDomainInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWhois()}
              placeholder="empresa.com.br"
              className="flex-1 bg-[#F8FAFC] border border-border-subtle rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
            <button
              onClick={handleWhois}
              disabled={whoisStatus === 'loading'}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {whoisStatus === 'loading'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />}
              Buscar
            </button>
          </div>

          {whoisStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {whoisError}
            </div>
          )}

          {whoisData && whoisOpen && (
            <div className="space-y-3 pt-1 border-t border-border-subtle">
              <div className="flex gap-2 flex-wrap">
                {whoisData.status.map(s => (
                  <span key={s} className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{s}</span>
                ))}
                {whoisData.expires && (
                  <span className="text-[11px] text-text-slate font-medium">
                    Expira: {new Date(whoisData.expires).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              {whoisData.contacts.map((c, i) => (
                <div key={i} className="bg-[#F8FAFC] rounded-lg p-3 space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase">{c.role}</span>
                  <Row icon={<User className="w-3.5 h-3.5" />} label="Nome" value={c.name || c.org} />
                  <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={c.email} />
                  <Row icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={c.phone} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OpenCNPJ */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-text-dark">OpenCNPJ</span>
            <Badge label="Telefone & Email" />
          </div>
          <button
            onClick={() => cnpjData && setCnpjOpen(o => !o)}
            className="text-text-slate hover:text-text-dark transition-colors"
          >
            {cnpjOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-4 pb-4">
          {cnpjStatus === 'idle' && (
            <button
              onClick={handleOpenCNPJ}
              className="w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-text-slate text-xs font-bold rounded-lg transition-all"
            >
              Buscar contatos no OpenCNPJ
            </button>
          )}

          {cnpjStatus === 'loading' && (
            <div className="flex items-center gap-2 text-text-slate text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Consultando OpenCNPJ...
            </div>
          )}

          {cnpjStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {cnpjError}
            </div>
          )}

          {cnpjData && cnpjOpen && (
            <div className="space-y-2 pt-1 border-t border-border-subtle">
              <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={cnpjData.email} />
              <Row icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={cnpjData.telefone} />
              {cnpjData.socios.length > 0 && (
                <div>
                  <span className="text-[10px] text-text-slate font-bold uppercase block mb-1">Sócios</span>
                  {cnpjData.socios.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-border-subtle last:border-0">
                      <span className="font-medium text-text-dark">{s.nome}</span>
                      <span className="text-[11px] text-text-slate">{s.qualificacao}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
