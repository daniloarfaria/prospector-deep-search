export interface WhoisContact {
  role: string;
  name: string;
  org: string;
  email: string;
  phone: string;
}

export interface WhoisResult {
  domain: string;
  status: string[];
  created: string;
  expires: string;
  contacts: WhoisContact[];
}

export interface OpenCNPJResult {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  email: string;
  telefone: string;
  situacao: string;
  socios: Array<{ nome: string; qualificacao: string }>;
}

function extractVcard(vcardArray: any[]): Partial<WhoisContact> {
  if (!Array.isArray(vcardArray) || vcardArray[0] !== 'vcard') return {};
  const fields = vcardArray[1] as any[][];
  const get = (key: string) => fields.find(f => f[0] === key)?.[3] ?? '';
  const tel = get('tel').toString().replace('tel:', '').replace(/[^\d+]/g, '');
  return { name: get('fn'), org: get('org'), email: get('email'), phone: tel };
}

export async function fetchWhoisDomain(rawDomain: string): Promise<WhoisResult> {
  const domain = rawDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();

  if (!domain.endsWith('.br')) {
    throw new Error('Apenas domínios .br são indexados pelo registro.br');
  }

  const res = await fetch(`/proxy/rdap/domain/${domain}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Domínio não encontrado no registro.br');

  const data = await res.json();

  const contacts: WhoisContact[] = (data.entities ?? []).map((entity: any) => {
    const vcard = extractVcard(entity.vcardArray ?? []);
    return {
      role: (entity.roles ?? []).join(', '),
      name: vcard.name ?? '',
      org: vcard.org ?? '',
      email: vcard.email ?? '',
      phone: vcard.phone ?? '',
    };
  });

  return {
    domain: data.ldhName ?? domain,
    status: (data.status ?? []).map(String),
    created: data.events?.find((e: any) => e.eventAction === 'registration')?.eventDate ?? '',
    expires: data.events?.find((e: any) => e.eventAction === 'expiration')?.eventDate ?? '',
    contacts,
  };
}

export async function fetchOpenCNPJ(cnpj: string): Promise<OpenCNPJResult> {
  const clean = cnpj.replace(/\D/g, '');
  const res = await fetch(`/proxy/opencnpj/cnpj/${clean}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('CNPJ não encontrado no OpenCNPJ');
  const data = await res.json();

  return {
    cnpj: data.cnpj ?? clean,
    razao_social: data.razao_social ?? data.nome ?? '',
    nome_fantasia: data.nome_fantasia ?? '',
    email: data.email ?? data.estabelecimento?.email ?? '',
    telefone: data.telefone ?? data.estabelecimento?.telefone1 ?? '',
    situacao: data.situacao_cadastral ?? data.situacao ?? '',
    socios: (data.qsa ?? data.socios ?? []).map((s: any) => ({
      nome: s.nome_socio ?? s.nome ?? '',
      qualificacao: s.qualificacao_socio ?? s.qualificacao ?? '',
    })),
  };
}
