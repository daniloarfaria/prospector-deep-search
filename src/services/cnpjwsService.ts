export async function fetchCNPJws(cnpj: string): Promise<any> {
  const clean = cnpj.replace(/\D/g, '');
  const res = await fetch(`/proxy/cnpjws/cnpj/${clean}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('CNPJ não encontrado ou indisponível.');
  return res.json();
}
