import React, { useState } from 'react';
import {
  Search, Loader2, AlertCircle, Phone, Mail, MapPin,
  Building2, Users, Briefcase, BadgeCheck,
} from 'lucide-react';
import { lookupCNPJCasaDados, CasaDadosEmpresa } from '../services/casaDadosService';
import { cn } from '../lib/utils';

function maskCNPJ(v: string) {
  return (v ?? '').replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskCEP(v: string) {
  return (v ?? '').replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
}

function whatsappLink(raw: string) {
  const c = raw.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=55${c}`;
}

function strSituacao(s: CasaDadosEmpresa['situacao_cadastral']): string {
  if (!s) return '';
  if (typeof s === 'string') return s;
  return s.situacao_atual ?? '';
}

function strPorte(p: CasaDadosEmpresa['porte_empresa']): string {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.descricao ?? '';
}

const SITUACAO_COLOR: Record<string, string> = {
  ATIVA:    'bg-green-100 text-green-700',
  BAIXADA:  'bg-red-100 text-red-700',
  SUSPENSA: 'bg-yellow-100 text-yellow-700',
  INAPTA:   'bg-orange-100 text-orange-700',
};

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
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  );
}

function EmpresaView({ data }: { data: CasaDadosEmpresa }) {
  const situacao = strSituacao(data.situacao_cadastral).toUpperCase();
  const badgeColor = SITUACAO_COLOR[situacao] ?? 'bg-gray-100 text-gray-600';
  const end = data.endereco ?? {};

  const phones = data.contato_telefonico ?? [];
  const emails = data.contato_email ?? [];

  return (
    <div className="space-y-4">

      {/* Identificação */}
      <div className="bg-white rounded-xl border border-border-subtle p-4">
        <SectionTitle icon={<Building2 className="w-4 h-4" />}>Identificação</SectionTitle>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="CNPJ"             value={maskCNPJ(data.cnpj ?? '')} />
          <Field label="Matriz / Filial"  value={data.matriz_filial} />
          <Field label="Razão Social"     value={data.razao_social} />
          <Field label="Nome Fantasia"    value={data.nome_fantasia} />
          <div>
            <dt className="text-[10px] text-text-slate font-bold uppercase tracking-wide">Situação</dt>
            <dd className="mt-0.5">
              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full uppercase', badgeColor)}>
                {situacao || '—'}
              </span>
            </dd>
          </div>
          <Field label="Data Abertura"   value={data.data_abertura?.split('T')[0]} />
          <Field label="Natureza Jurídica" value={data.descricao_natureza_juridica} />
          <Field label="Porte"           value={strPorte(data.porte_empresa)} />
          <Field label="Capital Social"
            value={data.capital_social != null ? `R$ ${Number(data.capital_social).toLocaleString('pt-BR')}` : null} />
          <Field label="MEI"             value={data.mei?.optante ? 'Sim' : 'Não'} />
          <Field label="Simples Nacional" value={data.simples?.optante ? 'Sim' : 'Não'} />
        </dl>
      </div>

      {/* Endereço */}
      {Object.keys(end).length > 0 && (
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <SectionTitle icon={<MapPin className="w-4 h-4" />}>Endereço</SectionTitle>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Logradouro"  value={[end.logradouro, end.numero].filter(Boolean).join(', ')} />
            <Field label="Complemento" value={end.complemento} />
            <Field label="Bairro"      value={end.bairro} />
            <Field label="CEP"         value={end.cep ? maskCEP(end.cep) : null} />
            <Field label="Município"   value={end.municipio} />
            <Field label="Estado"      value={end.uf} />
          </dl>
        </div>
      )}

      {/* Contato */}
      {(phones.length > 0 || emails.length > 0) && (
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <SectionTitle icon={<Phone className="w-4 h-4" />}>Contato</SectionTitle>
          <div className="space-y-2">
            {emails.map((e, i) => e.email && (
              <div key={i} className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${e.email}`} className="text-sm font-medium text-primary hover:underline break-all">
                  {e.email}
                </a>
                {e.valido && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">válido</span>
                )}
              </div>
            ))}
            {phones.map((p, i) => p.completo && (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${p.completo}`} className="text-sm font-medium text-text-dark">{p.completo}</a>
                <span className="text-[10px] text-text-slate">{p.tipo}</span>
                <a href={whatsappLink(p.completo)} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full hover:bg-green-200 transition-colors">
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CNAE */}
      {(data.atividade_principal || data.atividade_secundaria?.length) && (
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <SectionTitle icon={<Briefcase className="w-4 h-4" />}>Atividades</SectionTitle>
          {data.atividade_principal?.descricao && (
            <div className="mb-3">
              <dt className="text-[10px] text-text-slate font-bold uppercase mb-1">CNAE Principal</dt>
              <dd className="text-sm font-medium text-text-dark">
                <span className="font-mono text-[11px] text-text-slate mr-1">{data.atividade_principal.codigo}</span>
                {data.atividade_principal.descricao}
              </dd>
            </div>
          )}
          {data.atividade_secundaria && data.atividade_secundaria.length > 0 && (
            <div>
              <dt className="text-[10px] text-text-slate font-bold uppercase mb-1">
                CNAEs Secundários ({data.atividade_secundaria.length})
              </dt>
              <div className="space-y-1">
                {data.atividade_secundaria.map((a, i) => (
                  <dd key={i} className="text-sm text-text-dark">
                    <span className="font-mono text-[11px] text-text-slate mr-1">{a.codigo}</span>
                    {a.descricao}
                  </dd>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sócios */}
      {data.quadro_societario && data.quadro_societario.length > 0 && (
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <SectionTitle icon={<Users className="w-4 h-4" />}>
            Sócios ({data.quadro_societario.length})
          </SectionTitle>
          <div className="space-y-2">
            {data.quadro_societario.map((s, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-lg px-3 py-2 border border-border-subtle">
                <div className="text-sm font-bold text-text-dark">{s.nome}</div>
                <div className="text-[11px] text-text-slate mt-0.5">
                  {[s.qualificacao_socio, s.data_entrada_sociedade].filter(Boolean).join(' · ')}
                </div>
                {s.faixa_etaria_descricao && (
                  <div className="text-[10px] text-text-slate mt-0.5">{s.faixa_etaria_descricao}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simples / MEI */}
      <div className="bg-white rounded-xl border border-border-subtle p-4">
        <SectionTitle icon={<BadgeCheck className="w-4 h-4" />}>Simples Nacional & MEI</SectionTitle>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Simples Nacional" value={data.simples?.optante ? 'Optante' : 'Não optante'} />
          <Field label="MEI"              value={data.mei?.optante ? 'Optante' : 'Não optante'} />
        </dl>
      </div>
    </div>
  );
}

export function CasaDadosLookup() {
  const [cnpj, setCnpj] = useState('');
  const [data, setData] = useState<CasaDadosEmpresa | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleInput = (v: string) => setCnpj(maskCNPJ(v));

  const search = async () => {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return;
    setStatus('loading');
    setError('');
    setData(null);
    try {
      const result = await lookupCNPJCasaDados(clean);
      setData(result);
      setStatus('idle');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-text-dark mb-1">Casa dos Dados</h2>
        <p className="text-xs text-text-slate">
          Consulta completa por CNPJ — dados oficiais com contatos, sócios e CNAEs.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={cnpj}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="00.000.000/0000-00"
          className="flex-1 bg-white border-2 border-border-subtle rounded-xl px-4 py-3 text-base font-medium font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
        <button
          onClick={search}
          disabled={status === 'loading' || cnpj.replace(/\D/g, '').length !== 14}
          className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
        >
          {status === 'loading'
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <Search className="w-5 h-5" />}
          Consultar
        </button>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {data && <EmpresaView data={data} />}
    </div>
  );
}
