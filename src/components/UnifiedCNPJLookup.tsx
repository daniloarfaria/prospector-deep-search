import React, { useState } from 'react';
import {
  Loader2, AlertCircle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, MapPin, Phone, Mail, Users, Briefcase, Building2, BadgeCheck,
} from 'lucide-react';
import { fetchCNPJ, CNPJData } from '../services/cnpjService';
import { fetchCNPJws } from '../services/cnpjwsService';
import { lookupCNPJCasaDados, CasaDadosEmpresa } from '../services/casaDadosService';
import { cn } from '../lib/utils';

// ── ErrorBoundary ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactComponent = React.Component as any;

class ErrorBoundary extends ReactComponent {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : 'Erro inesperado' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao exibir dados: {this.state.message}
        </div>
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).props.children;
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

function maskCNPJ(v: string) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskCEP(v: string) {
  return v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
}

function fmtPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const c = raw.replace(/\D/g, '');
  if (c.length === 10) return `(${c.slice(0,2)}) ${c.slice(2,6)}-${c.slice(6)}`;
  if (c.length === 11) return `(${c.slice(0,2)}) ${c.slice(2,7)}-${c.slice(7)}`;
  return raw;
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
}

function strVal(v: unknown): string | null {
  if (v === null || v === undefined || v === '' || v === 'null') return null;
  if (typeof v === 'object' && v !== null) {
    if ('descricao' in v) return String((v as any).descricao);
    if ('nome' in v) return String((v as any).nome);
    return null;
  }
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  return String(v);
}

function whatsappLink(raw: string) {
  return `https://api.whatsapp.com/send?phone=55${raw.replace(/\D/g, '')}`;
}

function errMsg(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string') return reason;
  return 'Erro desconhecido';
}

const SITUACAO_COLOR: Record<string, string> = {
  ATIVA: 'bg-green-100 text-green-700',
  ATIVA_: 'bg-green-100 text-green-700',
  BAIXADA: 'bg-red-100 text-red-700',
  SUSPENSA: 'bg-yellow-100 text-yellow-700',
  INAPTA: 'bg-orange-100 text-orange-700',
};

function situacaoBadge(s: string) {
  return SITUACAO_COLOR[s.toUpperCase()] ?? 'bg-gray-100 text-gray-600';
}

// ── UI atoms ──────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value || value.trim() === '') return null;
  return (
    <div>
      <dt className="text-[10px] text-text-slate font-bold uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-text-dark break-all">{value}</dd>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-text-dark border-b border-border-subtle pb-2 mb-3">
      <span className="text-primary">{icon}</span>{children}
    </div>
  );
}

function PhoneRow({ raw }: { raw: string }) {
  const fmt = fmtPhone(raw);
  if (!fmt) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Phone className="w-4 h-4 text-primary shrink-0" />
      <a href={`tel:${raw}`} className="text-sm font-medium text-text-dark">{fmt}</a>
      <a href={whatsappLink(raw)} target="_blank" rel="noreferrer"
        className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full hover:bg-green-200 transition-colors">
        WhatsApp
      </a>
    </div>
  );
}

// ── source card ───────────────────────────────────────────────────────────────

type SrcStatus = 'idle' | 'loading' | 'done' | 'error';

function SourceCard({
  name, badge, status, error, open, onToggle, children,
}: {
  name: string; badge: string; status: SrcStatus; error: string;
  open: boolean; onToggle: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-[#FAFAFA] transition-colors"
      >
        <div className="flex items-center gap-2">
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
          {status === 'done'    && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
          {status === 'error'   && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {status === 'idle'    && <div className="w-4 h-4 rounded-full border-2 border-border-subtle shrink-0" />}
          <span className="text-sm font-bold text-text-dark">{name}</span>
          <span className="bg-[#EEF2FF] text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{badge}</span>
        </div>
        {status === 'done' && (
          open
            ? <ChevronUp className="w-4 h-4 text-text-slate shrink-0" />
            : <ChevronDown className="w-4 h-4 text-text-slate shrink-0" />
        )}
      </button>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border-t border-red-200 px-4 py-3 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      {status === 'done' && open && children && (
        <div className="border-t border-border-subtle p-4 space-y-4">{children}</div>
      )}
    </div>
  );
}

// ── BrasilAPI view ────────────────────────────────────────────────────────────

function BrasilView({ data }: { data: CNPJData }) {
  const situacao = String(data.situacao_cadastral ?? '').toUpperCase();
  const phone1 = fmtPhone(data.ddd_telefone_1);
  const phone2 = fmtPhone(data.ddd_telefone_2);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-black text-text-dark">{data.razao_social}</div>
          {data.nome_fantasia && <div className="text-xs text-text-slate mt-0.5">"{data.nome_fantasia}"</div>}
        </div>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0', situacaoBadge(situacao))}>
          {situacao || '—'}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Field label="CNPJ"              value={maskCNPJ(data.cnpj ?? '')} />
        <Field label="Abertura"          value={data.data_inicio_atividade} />
        <Field label="Porte"             value={data.porte} />
        <Field label="Capital Social"    value={fmtCurrency(data.capital_social)} />
        <Field label="Natureza Jurídica" value={data.natureza_juridica} />
        <div className="col-span-2"><Field label="Atividade Principal" value={data.cnae_fiscal_descricao} /></div>
      </dl>

      <div>
        <SectionTitle icon={<MapPin className="w-4 h-4" />}>Endereço</SectionTitle>
        <p className="text-sm text-text-dark">
          {[data.logradouro, data.numero, data.complemento].filter(Boolean).join(', ')}
        </p>
        <p className="text-sm text-text-slate">{data.bairro} — {data.municipio}/{data.uf} · CEP {data.cep}</p>
      </div>

      {(phone1 || phone2 || data.email) && (
        <div>
          <SectionTitle icon={<Phone className="w-4 h-4" />}>Contato</SectionTitle>
          <div className="space-y-2">
            {phone1 && <PhoneRow raw={data.ddd_telefone_1} />}
            {phone2 && <PhoneRow raw={data.ddd_telefone_2} />}
            {data.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${data.email}`} className="text-sm font-medium text-primary hover:underline">{data.email}</a>
              </div>
            )}
          </div>
        </div>
      )}

      {(data.qsa?.length ?? 0) > 0 && (
        <div>
          <SectionTitle icon={<Users className="w-4 h-4" />}>Quadro Societário</SectionTitle>
          <div className="space-y-1">
            {data.qsa.map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border-subtle last:border-0">
                <span className="font-medium text-text-dark">{s.nome_socio}</span>
                <span className="text-[11px] text-text-slate">{s.qualificacao_socio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── CNPJ.ws view ─────────────────────────────────────────────────────────────

function CNPJwsView({ data }: { data: any }) {
  const est = data?.estabelecimento ?? {};
  const situacao = String(est?.situacao_cadastral ?? '').toUpperCase();
  const p1 = fmtPhone([est?.ddd1, est?.telefone1].filter(Boolean).join(''));
  const p2 = fmtPhone([est?.ddd2, est?.telefone2].filter(Boolean).join(''));

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-black text-text-dark">{data.razao_social}</div>
          {strVal(est?.nome_fantasia) && <div className="text-xs text-text-slate mt-0.5">"{strVal(est.nome_fantasia)}"</div>}
        </div>
        {situacao && (
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0', situacaoBadge(situacao))}>
            {situacao}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Field label="Abertura"          value={strVal(est?.data_inicio_atividade)} />
        <Field label="Porte"             value={strVal(data.porte)} />
        <Field label="Capital Social"    value={data.capital_social ? `R$ ${Number(data.capital_social).toLocaleString('pt-BR')}` : null} />
        <Field label="Natureza Jurídica" value={strVal(data.natureza_juridica)} />
        <Field label="Motivo Situação"   value={strVal(est?.motivo_situacao_cadastral)} />
        <Field label="Atualizado em"     value={strVal(data.atualizado_em)?.split('T')[0] ?? null} />
      </dl>

      {est?.atividade_principal && (
        <div>
          <SectionTitle icon={<Briefcase className="w-4 h-4" />}>Atividades</SectionTitle>
          <Field label="Principal" value={strVal(est.atividade_principal)} />
          {Array.isArray(est?.atividades_secundarias) && est.atividades_secundarias.length > 0 && (
            <div className="mt-2">
              <dt className="text-[10px] text-text-slate font-bold uppercase mb-1">
                Secundárias ({est.atividades_secundarias.length})
              </dt>
              {est.atividades_secundarias.slice(0, 5).map((a: any, i: number) => (
                <dd key={i} className="text-sm text-text-dark">{strVal(a)}</dd>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <SectionTitle icon={<MapPin className="w-4 h-4" />}>Endereço</SectionTitle>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Logradouro"
            value={[strVal(est?.tipo_logradouro), strVal(est?.logradouro), strVal(est?.numero)].filter(Boolean).join(' ') || null} />
          <Field label="Complemento" value={strVal(est?.complemento)} />
          <Field label="Bairro"      value={strVal(est?.bairro)} />
          <Field label="CEP"         value={est?.cep ? maskCEP(String(est.cep)) : null} />
          <Field label="Município"   value={strVal(est?.municipio)} />
          <Field label="Estado"      value={strVal(est?.estado)} />
        </dl>
      </div>

      {(est?.email || p1 || p2) && (
        <div>
          <SectionTitle icon={<Phone className="w-4 h-4" />}>Contato</SectionTitle>
          <div className="space-y-2">
            {est?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${est.email}`} className="text-sm font-medium text-primary hover:underline">{est.email}</a>
              </div>
            )}
            {p1 && <PhoneRow raw={[est?.ddd1, est?.telefone1].filter(Boolean).join('')} />}
            {p2 && <PhoneRow raw={[est?.ddd2, est?.telefone2].filter(Boolean).join('')} />}
          </div>
        </div>
      )}

      {data.simples && (
        <div>
          <SectionTitle icon={<BadgeCheck className="w-4 h-4" />}>Simples Nacional & MEI</SectionTitle>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Simples" value={strVal(data.simples.simples)} />
            <Field label="MEI"     value={strVal(data.simples.mei)} />
          </dl>
        </div>
      )}

      {Array.isArray(data.socios) && data.socios.length > 0 && (
        <div>
          <SectionTitle icon={<Users className="w-4 h-4" />}>Sócios ({data.socios.length})</SectionTitle>
          <div className="space-y-2">
            {data.socios.map((s: any, i: number) => (
              <div key={i} className="bg-[#F8FAFC] rounded-lg px-3 py-2 border border-border-subtle">
                <div className="text-sm font-bold text-text-dark">{s.nome}</div>
                <div className="text-[11px] text-text-slate">
                  {[strVal(s.qualificacao_socio), s.data_entrada].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Casa dos Dados view ───────────────────────────────────────────────────────

function CasaDadosView({ data }: { data: CasaDadosEmpresa }) {
  const situacaoRaw = typeof data.situacao_cadastral === 'string'
    ? data.situacao_cadastral
    : (data.situacao_cadastral as any)?.situacao_atual ?? '';
  const situacao = String(situacaoRaw).toUpperCase();
  const end = data.endereco ?? {};
  const phones = Array.isArray(data.contato_telefonico) ? data.contato_telefonico : [];
  const emails = Array.isArray(data.contato_email) ? data.contato_email : [];
  const porteStr = typeof data.porte_empresa === 'string'
    ? data.porte_empresa
    : (data.porte_empresa as any)?.descricao ?? '';

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-black text-text-dark">{data.razao_social}</div>
          {data.nome_fantasia && <div className="text-xs text-text-slate mt-0.5">"{data.nome_fantasia}"</div>}
        </div>
        {situacao && (
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0', situacaoBadge(situacao))}>
            {situacao}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Field label="Matriz / Filial"   value={data.matriz_filial} />
        <Field label="Abertura"          value={data.data_abertura?.split('T')[0]} />
        <Field label="Porte"             value={porteStr || null} />
        <Field label="Capital Social"
          value={data.capital_social != null ? `R$ ${Number(data.capital_social).toLocaleString('pt-BR')}` : null} />
        <Field label="Natureza Jurídica" value={data.descricao_natureza_juridica} />
        <Field label="MEI"               value={data.mei?.optante ? 'Sim' : 'Não'} />
      </dl>

      {Object.keys(end).length > 0 && (
        <div>
          <SectionTitle icon={<MapPin className="w-4 h-4" />}>Endereço</SectionTitle>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Logradouro"
              value={[end.logradouro, end.numero].filter(Boolean).join(', ') || null} />
            <Field label="Complemento" value={end.complemento} />
            <Field label="Bairro"      value={end.bairro} />
            <Field label="CEP"         value={end.cep ? maskCEP(end.cep) : null} />
            <Field label="Município"   value={end.municipio} />
            <Field label="Estado"      value={end.uf} />
          </dl>
        </div>
      )}

      {(phones.length > 0 || emails.length > 0) && (
        <div>
          <SectionTitle icon={<Phone className="w-4 h-4" />}>Contato</SectionTitle>
          <div className="space-y-2">
            {emails.map((e, i) => e?.email ? (
              <div key={i} className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${e.email}`} className="text-sm font-medium text-primary hover:underline">{e.email}</a>
                {e.valido && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">válido</span>
                )}
              </div>
            ) : null)}
            {phones.map((p, i) => p?.completo ? <div key={i}><PhoneRow raw={p.completo} /></div> : null)}
          </div>
        </div>
      )}

      {(data.atividade_principal?.descricao || (Array.isArray(data.atividade_secundaria) && data.atividade_secundaria.length > 0)) && (
        <div>
          <SectionTitle icon={<Briefcase className="w-4 h-4" />}>Atividades</SectionTitle>
          {data.atividade_principal?.descricao && (
            <div className="mb-2">
              <dt className="text-[10px] text-text-slate font-bold uppercase mb-1">Principal</dt>
              <dd className="text-sm text-text-dark">
                <span className="font-mono text-[11px] text-text-slate mr-1">{data.atividade_principal.codigo}</span>
                {data.atividade_principal.descricao}
              </dd>
            </div>
          )}
          {Array.isArray(data.atividade_secundaria) && data.atividade_secundaria.length > 0 && (
            <div>
              <dt className="text-[10px] text-text-slate font-bold uppercase mb-1">
                Secundárias ({data.atividade_secundaria.length})
              </dt>
              {data.atividade_secundaria.slice(0, 5).map((a, i) => (
                <dd key={i} className="text-sm text-text-dark">
                  <span className="font-mono text-[11px] text-text-slate mr-1">{a.codigo}</span>{a.descricao}
                </dd>
              ))}
            </div>
          )}
        </div>
      )}

      {Array.isArray(data.quadro_societario) && data.quadro_societario.length > 0 && (
        <div>
          <SectionTitle icon={<Users className="w-4 h-4" />}>Sócios ({data.quadro_societario.length})</SectionTitle>
          <div className="space-y-2">
            {data.quadro_societario.map((s, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-lg px-3 py-2 border border-border-subtle">
                <div className="text-sm font-bold text-text-dark">{s.nome}</div>
                <div className="text-[11px] text-text-slate">
                  {[s.qualificacao_socio, s.data_entrada_sociedade].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

type SrcState<T> = { status: SrcStatus; data: T | null; error: string; open: boolean };

function initSrc<T>(): SrcState<T> {
  return { status: 'idle', data: null, error: '', open: false };
}

export function UnifiedCNPJLookup() {
  const [input, setInput] = useState('');
  const [brasil, setBrasil] = useState<SrcState<CNPJData>>(initSrc);
  const [cnpjws, setCnpjws] = useState<SrcState<any>>(initSrc);
  const [casa,   setCasa]   = useState<SrcState<CasaDadosEmpresa>>(initSrc);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setInput(masked);
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 14) fire(clean);
  };

  const fire = async (clean: string) => {
    setBrasil({ status: 'loading', data: null, error: '', open: false });
    setCnpjws({ status: 'loading', data: null, error: '', open: false });
    setCasa(   { status: 'loading', data: null, error: '', open: false });

    try {
      const [r1, r2, r3] = await Promise.allSettled([
        fetchCNPJ(clean),
        fetchCNPJws(clean),
        lookupCNPJCasaDados(clean),
      ]);

      setBrasil(r1.status === 'fulfilled'
        ? { status: 'done',  data: r1.value,  error: '', open: true }
        : { status: 'error', data: null, error: errMsg(r1.reason), open: false });

      setCnpjws(r2.status === 'fulfilled'
        ? { status: 'done',  data: r2.value,  error: '', open: true }
        : { status: 'error', data: null, error: errMsg(r2.reason), open: false });

      setCasa(r3.status === 'fulfilled'
        ? { status: 'done',  data: r3.value,  error: '', open: true }
        : { status: 'error', data: null, error: errMsg(r3.reason), open: false });
    } catch (err) {
      const msg = errMsg(err);
      setBrasil({ status: 'error', data: null, error: msg, open: false });
      setCnpjws({ status: 'error', data: null, error: msg, open: false });
      setCasa(  { status: 'error', data: null, error: msg, open: false });
    }
  };

  const searching = brasil.status === 'loading';
  const hasResults = brasil.status !== 'idle' || cnpjws.status !== 'idle' || casa.status !== 'idle';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-text-dark mb-1">Consulta de CNPJ</h2>
        <p className="text-xs text-text-slate">
          Busca automática em 3 fontes — BrasilAPI, CNPJ.ws e Casa dos Dados
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="00.000.000/0000-00"
          className="w-full bg-white border-2 border-border-subtle rounded-xl px-5 py-4 text-2xl font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
        />
        {searching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
        )}
      </div>

      {hasResults && (
        <div className="space-y-3">
          <SourceCard
            name="BrasilAPI — Receita Federal" badge="Dados Oficiais"
            status={brasil.status} error={brasil.error}
            open={brasil.open} onToggle={() => setBrasil(s => ({ ...s, open: !s.open }))}
          >
            <ErrorBoundary>
              {brasil.data ? <BrasilView data={brasil.data} /> : null}
            </ErrorBoundary>
          </SourceCard>

          <SourceCard
            name="CNPJ.ws" badge="Sócios & Simples"
            status={cnpjws.status} error={cnpjws.error}
            open={cnpjws.open} onToggle={() => setCnpjws((s: SrcState<any>) => ({ ...s, open: !s.open }))}
          >
            <ErrorBoundary>
              {cnpjws.data ? <CNPJwsView data={cnpjws.data} /> : null}
            </ErrorBoundary>
          </SourceCard>

          <SourceCard
            name="Casa dos Dados" badge="Contatos Validados"
            status={casa.status} error={casa.error}
            open={casa.open} onToggle={() => setCasa((s: SrcState<CasaDadosEmpresa>) => ({ ...s, open: !s.open }))}
          >
            <ErrorBoundary>
              {casa.data ? <CasaDadosView data={casa.data} /> : null}
            </ErrorBoundary>
          </SourceCard>
        </div>
      )}
    </div>
  );
}
