import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { fetchCNPJws } from '../services/cnpjwsService';

function maskCNPJ(value: string) {
  return value.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function val(v: any): string | null {
  if (v === null || v === undefined || v === '' || v === 'null') return null;
  if (typeof v === 'object' && 'descricao' in v) return v.descricao;
  if (typeof v === 'object' && 'nome' in v) return v.nome;
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  return String(v);
}

function Field({ label, value }: { label: string; value: any }) {
  const v = val(value);
  if (!v) return null;
  return (
    <div>
      <dt className="text-[10px] text-text-slate font-bold uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-text-dark break-all">{v}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-black text-text-dark border-b border-border-subtle pb-2">{title}</h3>
      <dl className="grid grid-cols-2 gap-3">{children}</dl>
    </div>
  );
}

const SITUACAO_COLOR: Record<string, string> = {
  Ativa: 'bg-green-100 text-green-700',
  Baixada: 'bg-red-100 text-red-700',
  Suspensa: 'bg-yellow-100 text-yellow-700',
  Inapta: 'bg-orange-100 text-orange-700',
};

export function CNPJwsLookup() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setInput(masked);
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 14) {
      setStatus('loading');
      setData(null);
      setError('');
      try {
        setData(await fetchCNPJws(clean));
        setStatus('idle');
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    } else {
      setData(null);
      setStatus('idle');
    }
  };

  const est = data?.estabelecimento;
  const situacaoColor = SITUACAO_COLOR[est?.situacao_cadastral] ?? 'bg-gray-100 text-gray-600';

  const phone = (ddd: string, num: string) => {
    if (!ddd || !num) return null;
    const clean = (ddd + num).replace(/\D/g, '');
    if (clean.length === 10) return `(${clean.slice(0,2)}) ${clean.slice(2,6)}-${clean.slice(6)}`;
    if (clean.length === 11) return `(${clean.slice(0,2)}) ${clean.slice(2,7)}-${clean.slice(7)}`;
    return `${ddd} ${num}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-text-dark mb-1">CNPJ.ws — Dados Completos</h2>
        <p className="text-xs text-text-slate">Sócios, Simples Nacional, MEI, contatos e atividades</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="00.000.000/0000-00"
          className="w-full bg-white border-2 border-border-subtle rounded-xl px-5 py-4 text-2xl font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
        />
        {status === 'loading' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
        {status === 'error' && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />}
        {data && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Cabeçalho */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black text-text-dark">{data.razao_social}</div>
                {val(est?.nome_fantasia) && (
                  <div className="text-sm text-text-slate mt-0.5">"{val(est.nome_fantasia)}"</div>
                )}
              </div>
              {est?.situacao_cadastral && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${situacaoColor}`}>
                  {est.situacao_cadastral}
                </span>
              )}
            </div>
          </div>

          {/* Dados da Empresa */}
          <Section title="Empresa">
            <Field label="CNPJ" value={maskCNPJ(data.cnpj ?? '')} />
            <Field label="Abertura" value={est?.data_inicio_atividade} />
            <Field label="Porte" value={data.porte} />
            <Field label="Natureza Jurídica" value={data.natureza_juridica} />
            <Field label="Capital Social" value={data.capital_social ? `R$ ${Number(data.capital_social).toLocaleString('pt-BR')}` : null} />
            <Field label="Resp. Qualificação" value={data.qualificacao_do_responsavel} />
            <Field label="Situação" value={est?.situacao_cadastral} />
            <Field label="Data Situação" value={est?.data_situacao_cadastral} />
            <Field label="Motivo Situação" value={est?.motivo_situacao_cadastral} />
            <Field label="Situação Especial" value={est?.situacao_especial} />
            <Field label="Data Sit. Especial" value={est?.data_situacao_especial} />
            <Field label="Atualizado em" value={data.atualizado_em} />
          </Section>

          {/* Atividades */}
          <Section title="Atividades">
            <div className="col-span-2">
              <Field label="Atividade Principal" value={est?.atividade_principal} />
            </div>
            {est?.atividades_secundarias?.length > 0 && (
              <div className="col-span-2 space-y-1">
                <dt className="text-[10px] text-text-slate font-bold uppercase">Atividades Secundárias</dt>
                {est.atividades_secundarias.map((a: any, i: number) => (
                  <dd key={i} className="text-sm text-text-dark">{val(a)}</dd>
                ))}
              </div>
            )}
          </Section>

          {/* Contato */}
          <Section title="Contato & Endereço">
            <Field label="Email" value={est?.email} />
            <Field label="Telefone 1" value={phone(est?.ddd1, est?.telefone1)} />
            <Field label="Telefone 2" value={phone(est?.ddd2, est?.telefone2)} />
            <Field label="Fax" value={phone(est?.ddd_fax, est?.fax)} />
            <div className="col-span-2">
              <Field
                label="Endereço"
                value={[est?.tipo_logradouro, est?.logradouro, est?.numero, est?.complemento].filter(Boolean).join(' ')}
              />
            </div>
            <Field label="Bairro" value={est?.bairro} />
            <Field label="CEP" value={est?.cep} />
            <Field label="Município" value={est?.municipio} />
            <Field label="Estado" value={est?.estado} />
            <Field label="País" value={est?.pais} />
          </Section>

          {/* Inscrições Estaduais */}
          {est?.inscricoes_estaduais?.length > 0 && (
            <Section title="Inscrições Estaduais">
              {est.inscricoes_estaduais.map((ie: any, i: number) => (
                <React.Fragment key={i}>
                  <Field label="Estado" value={ie.estado} />
                  <Field label="Inscrição" value={ie.inscricao_estadual} />
                  <Field label="Ativo" value={ie.ativo} />
                  <Field label="Atualizado" value={ie.atualizado_em} />
                </React.Fragment>
              ))}
            </Section>
          )}

          {/* Simples / MEI */}
          {data.simples && (
            <Section title="Simples Nacional & MEI">
              <Field label="Optante Simples" value={data.simples.simples} />
              <Field label="Opção Simples" value={data.simples.data_opcao_simples} />
              <Field label="Exclusão Simples" value={data.simples.data_exclusao_simples} />
              <Field label="MEI" value={data.simples.mei} />
              <Field label="Opção MEI" value={data.simples.data_opcao_mei} />
              <Field label="Exclusão MEI" value={data.simples.data_exclusao_mei} />
              <Field label="Atualizado em" value={data.simples.atualizado_em} />
            </Section>
          )}

          {/* Sócios */}
          {data.socios?.length > 0 && (
            <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-black text-text-dark border-b border-border-subtle pb-2">
                Quadro Societário ({data.socios.length})
              </h3>
              {data.socios.map((s: any, i: number) => (
                <div key={i} className="bg-[#F8FAFC] rounded-lg p-3 space-y-2 border border-border-subtle">
                  <dl className="grid grid-cols-2 gap-2">
                    <Field label="Nome" value={s.nome} />
                    <Field label="Tipo" value={s.tipo} />
                    <Field label="Qualificação" value={s.qualificacao_socio} />
                    <Field label="Entrada" value={s.data_entrada} />
                    <Field label="Faixa Etária" value={s.faixa_etaria} />
                    <Field label="País" value={s.pais} />
                    <Field label="Representante" value={s.nome_representante_legal} />
                    <Field label="CPF/CNPJ" value={s.cpf_cnpj_socio} />
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
