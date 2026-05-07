import React, { useState } from "react";
import { MapPin, Phone, Mail, Users, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { fetchCNPJ, CNPJData } from "../services/cnpjService";
import { cn } from "../lib/utils";

function maskCNPJ(value: string) {
  return value.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPhone(ddd: string) {
  if (!ddd) return null;
  const clean = ddd.replace(/\D/g, "");
  if (clean.length === 10) return `(${clean.slice(0,2)}) ${clean.slice(2,6)}-${clean.slice(6)}`;
  if (clean.length === 11) return `(${clean.slice(0,2)}) ${clean.slice(2,7)}-${clean.slice(7)}`;
  return ddd;
}

const SITUACAO_STYLE: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  BAIXADA: "bg-red-100 text-red-700",
  SUSPENSA: "bg-yellow-100 text-yellow-700",
  INAPTA: "bg-orange-100 text-orange-700",
};

export function CNPJLookup() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<CNPJData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setInput(masked);
    const clean = masked.replace(/\D/g, "");
    if (clean.length === 14) {
      setStatus("loading");
      setData(null);
      setErrorMsg("");
      try {
        setData(await fetchCNPJ(clean));
        setStatus("idle");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Erro ao buscar CNPJ.");
      }
    } else {
      setData(null);
      setStatus("idle");
    }
  };

  const situacaoStyle = data ? (SITUACAO_STYLE[data.situacao_cadastral] ?? "bg-gray-100 text-gray-600") : "";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-text-dark mb-1">Receita Federal — BrasilAPI</h2>
        <p className="text-xs text-text-slate">Digite o CNPJ — busca automática ao completar</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="00.000.000/0000-00"
          className="w-full bg-white border-2 border-border-subtle rounded-xl px-5 py-4 text-2xl font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
        />
        {status === "loading" && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
        {status === "error" && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />}
        {data && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black text-text-dark leading-tight">{data.razao_social}</div>
                {data.nome_fantasia && <div className="text-sm text-text-slate font-medium mt-0.5">"{data.nome_fantasia}"</div>}
              </div>
              <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0", situacaoStyle)}>
                {data.situacao_cadastral}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
              <div><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">CNPJ</dt><dd className="text-sm font-mono font-bold">{maskCNPJ(data.cnpj)}</dd></div>
              <div><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">Abertura</dt><dd className="text-sm font-bold">{data.data_inicio_atividade}</dd></div>
              <div><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">Porte</dt><dd className="text-sm font-bold">{data.porte}</dd></div>
              <div><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">Capital Social</dt><dd className="text-sm font-bold">{formatCurrency(data.capital_social)}</dd></div>
              <div className="col-span-2"><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">Atividade Principal</dt><dd className="text-sm font-medium">{data.cnae_fiscal_descricao}</dd></div>
              <div className="col-span-2"><dt className="text-[10px] text-text-slate font-bold uppercase mb-0.5">Natureza Jurídica</dt><dd className="text-sm font-medium">{data.natureza_juridica}</dd></div>
            </dl>
          </div>

          <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-text-dark text-sm">
              <MapPin className="w-4 h-4 text-primary" /> Endereço
            </div>
            <p className="text-sm text-text-dark">{data.logradouro}, {data.numero}{data.complemento && ` — ${data.complemento}`}</p>
            <p className="text-sm text-text-slate">{data.bairro} — {data.municipio}/{data.uf} · CEP {data.cep}</p>
          </div>

          {(data.ddd_telefone_1 || data.ddd_telefone_2 || data.email) && (
            <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-dark text-sm mb-1">
                <Phone className="w-4 h-4 text-primary" /> Contato
              </div>
              {formatPhone(data.ddd_telefone_1) && <p className="text-sm font-medium">{formatPhone(data.ddd_telefone_1)}</p>}
              {formatPhone(data.ddd_telefone_2) && <p className="text-sm font-medium">{formatPhone(data.ddd_telefone_2)}</p>}
              {data.email && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Mail className="w-3.5 h-3.5" /> {data.email}
                </div>
              )}
            </div>
          )}

          {data.qsa?.length > 0 && (
            <div className="bg-white border border-border-subtle rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-dark text-sm mb-1">
                <Users className="w-4 h-4 text-primary" /> Quadro Societário
              </div>
              {data.qsa.map((socio, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-border-subtle last:border-0">
                  <span className="font-medium text-text-dark">{socio.nome_socio}</span>
                  <span className="text-[11px] text-text-slate font-medium">{socio.qualificacao_socio}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
