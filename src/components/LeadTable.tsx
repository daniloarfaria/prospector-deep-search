/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, Globe, Phone, MapPin, Mail, Instagram, Facebook } from "lucide-react";
import { Lead } from "../types";
import { cn } from "../lib/utils";

interface LeadTableProps {
  leads: Lead[];
}

export function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-text-slate text-sm font-medium">Aguardando dados de prospecção...</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead className="bg-[#F8FAFC] sticky top-0">
        <tr className="border-b border-border-subtle">
          <th className="text-left py-3 px-4 text-text-slate font-bold uppercase text-[10px]">Empresa</th>
          <th className="text-left py-3 px-4 text-text-slate font-bold uppercase text-[10px]">Contato</th>
          <th className="text-left py-3 px-4 text-text-slate font-bold uppercase text-[10px]">Rating</th>
          <th className="text-left py-3 px-4 text-text-slate font-bold uppercase text-[10px]">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F1F5F9]">
        {leads.map((lead) => (
          <tr key={lead.id} className="hover:bg-main-bg transition-colors group">
            <td className="py-3 px-4">
              <div className="font-bold text-text-dark">{lead.name}</div>
              <div className="text-[11px] text-text-slate">{lead.category}</div>
            </td>
            <td className="py-3 px-4">
              <div className="font-medium text-text-dark">{lead.phone}</div>
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[11px] truncate block max-w-[150px]">
                  {lead.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-1 font-bold text-text-dark">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {lead.rating}
                <span className="font-normal text-text-slate text-[11px]">({lead.reviews})</span>
              </div>
            </td>
            <td className="py-3 px-4">
              <div className="flex flex-wrap gap-1">
                {lead.claimed ? (
                  <span className="bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Reivindicada</span>
                ) : (
                  <span className="bg-[#F1F5F9] text-text-slate text-[10px] font-bold px-2 py-0.5 rounded uppercase">Não Reiv.</span>
                )}
                {lead.emails && lead.emails.length > 0 && (
                  <span className="bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Email Extraído</span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
