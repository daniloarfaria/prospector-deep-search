export interface CasaDadosEmpresa {
  cnpj: string;
  cnpj_raiz?: string;
  razao_social: string;
  nome_fantasia?: string;
  matriz_filial?: string;
  situacao_cadastral?: { situacao_atual?: string; motivo?: string; data?: string } | string;
  data_abertura?: string;
  descricao_natureza_juridica?: string;
  porte_empresa?: { descricao?: string } | string;
  capital_social?: number;
  atividade_principal?: { codigo?: string; descricao?: string };
  atividade_secundaria?: { codigo?: string; descricao?: string }[];
  endereco?: {
    logradouro?: string; numero?: string; complemento?: string;
    bairro?: string; municipio?: string; uf?: string; cep?: string;
  };
  quadro_societario?: { nome?: string; qualificacao_socio?: string; data_entrada_sociedade?: string; faixa_etaria_descricao?: string }[];
  contato_telefonico?: { completo?: string; ddd?: string; numero?: string; tipo?: string }[];
  contato_email?: { email?: string; valido?: boolean }[];
  mei?: { optante?: boolean };
  simples?: { optante?: boolean };
  [key: string]: any;
}

export async function lookupCNPJCasaDados(cnpj: string): Promise<CasaDadosEmpresa> {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) throw new Error('CNPJ deve ter 14 dígitos.');

  const res = await fetch(`/proxy/casadados/v4/cnpj/${clean}`, {
    headers: { Accept: 'application/json' },
  });

  if (res.status === 403) throw new Error('Acesso negado (403). Verifique se CASA_DADOS_API_KEY está configurada no .env.');
  if (res.status === 404) throw new Error('CNPJ não encontrado.');
  if (!res.ok) throw new Error(`Erro ${res.status} ao consultar Casa dos Dados.`);

  return res.json();
}
