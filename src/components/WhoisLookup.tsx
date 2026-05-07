import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, Server } from 'lucide-react';

function extractVcard(vcardArray: any[]): Record<string, string> {
  if (!Array.isArray(vcardArray) || vcardArray[0] !== 'vcard') return {};
  const out: Record<string, string> = {};
  for (const entry of (vcardArray[1] as any[][])) {
    const key = String(entry[0]);
    const raw = entry[3];
    if (raw && key !== 'version') {
      out[key] = String(raw).replace(/^tel:/, '');
    }
  }
  return out;
}

function extractEvents(events: any[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const ev of (events ?? [])) {
    if (ev?.eventDate) {
      out[ev.eventAction] = new Date(ev.eventDate).toLocaleDateString('pt-BR');
    }
  }
  return out;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] text-text-slate font-bold uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-text-dark break-all">{value}</dd>
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  registrant:     'Titular / Registrante',
  administrative: 'Administrativo',
  technical:      'Contato Técnico',
  billing:        'Financeiro',
  abuse:          'Abuse',
  noc:            'NOC',
};

export function WhoisLookup() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const search = async () => {
    const domain = input.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
    if (!domain) return;
    if (!domain.endsWith('.br')) {
      setError('Registro.br indexa apenas domínios .br');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setData(null);
    setError('');
    try {
      const res = await fetch(`/proxy/rdap/domain/${domain}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Domínio não encontrado.');
      setData(await res.json());
      setStatus('idle');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  // ── helpers ──────────────────────────────────────────────
  const domainEvents = extractEvents(data?.events ?? []);

  // pega o registrante para mostrar no cabeçalho do domínio
  const registrant = data?.entities?.find((e: any) => e.roles?.includes('registrant'));
  const registrantVcard = extractVcard(registrant?.vcardArray ?? []);
  const registrantDoc = (registrant?.publicIds ?? []).find(
    (p: any) => p.type === 'cnpj' || p.type === 'cpf'
  );

  // SACI vem em remarks
  const saci = data?.remarks
    ?.find((r: any) => r.title?.toLowerCase() === 'saci')
    ?.description?.[0];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-text-dark mb-1">WHOIS — registro.br</h2>
        <p className="text-xs text-text-slate">Pesquise domínios .br — titular, documento, contatos e DNS</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="empresa.com.br"
          className="flex-1 bg-white border-2 border-border-subtle rounded-xl px-4 py-3 text-lg font-mono font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
        />
        <button
          onClick={search}
          disabled={status === 'loading'}
          className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">

          {/* ── Domínio ── */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-text-dark">{data.ldhName ?? data.unicodeName ?? input}</span>
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            </div>

            {data.status?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.status.map((s: string) => (
                  <span key={s} className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{s}</span>
                ))}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3">
              <Field label="Titular"             value={registrantVcard['fn']} />
              <Field label="Documento"           value={registrantDoc ? `${registrantDoc.type.toUpperCase()} ${registrantDoc.identifier}` : null} />
              <Field label="Responsável"         value={registrantVcard['fn']} />
              <Field label="País"                value={registrantVcard['country-name']} />
              <Field label="Contato do Titular"  value={registrant?.handle} />
              <Field label="Contato Técnico"
                value={data.entities?.find((e: any) => e.roles?.includes('technical'))?.handle} />
              <Field label="SACI"    value={saci} />
              <Field label="Criado"  value={domainEvents['registration']} />
              <Field label="Expiração" value={domainEvents['expiration']} />
              <Field label="Alterado"  value={domainEvents['last changed']} />
            </dl>
          </div>

          {/* ── Nameservers ── */}
          {data.nameservers?.length > 0 && (
            <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-text-dark">
                <Server className="w-4 h-4 text-primary" /> Servidores DNS
              </div>
              <div className="space-y-2">
                {data.nameservers.map((ns: any) => {
                  const nsEvents = extractEvents(ns.events ?? []);
                  return (
                    <div key={ns.ldhName} className="bg-[#F8FAFC] rounded-lg px-3 py-2 border border-border-subtle">
                      <div className="text-sm font-mono font-bold text-text-dark">{ns.ldhName}</div>
                      {nsEvents['last changed'] && (
                        <div className="text-[11px] text-text-slate mt-0.5">Último OK: {nsEvents['last changed']}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Entidades / Contatos ── */}
          {data.entities?.map((entity: any, i: number) => {
            const vcard  = extractVcard(entity.vcardArray ?? []);
            const evts   = extractEvents(entity.events ?? []);
            const pubIds: Array<{ type: string; identifier: string }> = entity.publicIds ?? [];
            const roles  = (entity.roles ?? []).map((r: string) => ROLE_LABEL[r] ?? r).join(' · ');
            const hasData = Object.keys(vcard).length || pubIds.length;
            if (!hasData) return null;

            return (
              <div key={i} className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{roles}</span>
                  {entity.handle && (
                    <span className="text-[10px] font-mono bg-[#F1F5F9] text-text-slate px-2 py-0.5 rounded">
                      ID: {entity.handle}
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Nome"       value={vcard['fn']} />
                  <Field label="Organização" value={vcard['org']} />
                  {pubIds.map((pid, j) => (
                    <React.Fragment key={j}>
                      <Field label={pid.type.toUpperCase()} value={pid.identifier} />
                    </React.Fragment>
                  ))}
                  <Field label="Email"    value={vcard['email']} />
                  <Field label="Telefone" value={vcard['tel']} />
                  <Field label="País"     value={vcard['country-name']} />
                  <Field label="Criado"   value={evts['registration']} />
                  <Field label="Alterado" value={evts['last changed']} />
                  {Object.entries(vcard)
                    .filter(([k]) => !['fn','org','email','tel','country-name','version'].includes(k))
                    .map(([k, v]) => (
                      <React.Fragment key={k}>
                        <Field label={k} value={v} />
                      </React.Fragment>
                    ))}
                </dl>

                {/* Sub-entidades */}
                {entity.entities?.map((sub: any, j: number) => {
                  const sv = extractVcard(sub.vcardArray ?? []);
                  const se = extractEvents(sub.events ?? []);
                  if (!Object.keys(sv).length) return null;
                  const sr = (sub.roles ?? []).map((r: string) => ROLE_LABEL[r] ?? r).join(' · ');
                  return (
                    <div key={j} className="bg-[#F8FAFC] rounded-lg p-3 space-y-2 border border-border-subtle mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-slate uppercase">{sr}</span>
                        {sub.handle && (
                          <span className="text-[10px] font-mono bg-white text-text-slate px-2 py-0.5 rounded border border-border-subtle">
                            ID: {sub.handle}
                          </span>
                        )}
                      </div>
                      <dl className="grid grid-cols-2 gap-2">
                        <Field label="Nome"     value={sv['fn']} />
                        <Field label="Email"    value={sv['email']} />
                        <Field label="Telefone" value={sv['tel']} />
                        <Field label="País"     value={sv['country-name']} />
                        <Field label="Criado"   value={se['registration']} />
                        <Field label="Alterado" value={se['last changed']} />
                      </dl>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
