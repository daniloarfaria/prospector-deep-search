export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  natureza_juridica: string;
  porte: string;
  capital_social: number;
  data_inicio_atividade: string;
  cnae_fiscal_descricao: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  email: string;
  qsa: Array<{ nome_socio: string; qualificacao_socio: string }>;
}

export async function fetchCNPJ(cnpj: string): Promise<CNPJData> {
  const clean = cnpj.replace(/\D/g, "");
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
  if (!res.ok) throw new Error("CNPJ não encontrado ou inválido.");
  return res.json();
}
