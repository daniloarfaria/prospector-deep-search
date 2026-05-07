/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SearchConfig } from "../types";
import { cn } from "../lib/utils";

interface SearchControlsProps {
  config: SearchConfig;
  onChange: (config: SearchConfig) => void;
  onStart: () => void;
  onStop: () => void;
  onExport: () => void;
  isSearching: boolean;
  hasLeads: boolean;
}

export function SearchControls({ config, onChange, onStart, onStop, onExport, isSearching, hasLeads }: SearchControlsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : (type === 'number' ? parseFloat(value) : value);
    onChange({ ...config, [name]: val });
  };

  return (
    <div className="bg-sidebar p-6 flex flex-col gap-6 h-full border-r border-border-subtle">
      <div className="space-y-4 flex-1">

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-slate uppercase tracking-wider">Nicho de Prospecção</label>
          <input
            name="niche"
            type="text"
            value={config.niche}
            onChange={handleChange}
            placeholder="Ex: Dentistas, Restaurantes..."
            className="w-full bg-[#F8FAFC] border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-slate uppercase tracking-wider">Cidade / UF</label>
          <input
            name="city"
            type="text"
            value={config.city}
            onChange={handleChange}
            placeholder="Ex: São Paulo, SP"
            className="w-full bg-[#F8FAFC] border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-slate uppercase tracking-wider">Raio de Busca (KM)</label>
          <select
            name="radiusKm"
            value={config.radiusKm}
            onChange={handleChange}
            className="w-full bg-[#F8FAFC] border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value={5}>5 KM</option>
            <option value={10}>10 KM (Deep Scan)</option>
            <option value={25}>25 KM (Massive)</option>
            <option value={50}>50 KM (Regional)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-slate uppercase tracking-wider">Passo da Grade (KM)</label>
          <select
            name="gridStepKm"
            value={config.gridStepKm}
            onChange={handleChange}
            className="w-full bg-[#F8FAFC] border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value={1}>1 KM (Ultra Denso)</option>
            <option value={2}>2 KM (Denso)</option>
            <option value={5}>5 KM (Padrão)</option>
            <option value={10}>10 KM (Amplo)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-slate uppercase tracking-wider">Modelo de IA</label>
          <select
            name="model"
            value={config.model}
            onChange={handleChange}
            className="w-full bg-[#F8FAFC] border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="gemini-3-flash-preview">Gemini 3 Flash (Rápido)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Alta Qualidade)</option>
            <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Velocidade)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="deepExtract"
              type="checkbox"
              checked={config.deepExtract}
              onChange={handleChange}
              className="w-5 h-5 rounded-md border-border-subtle text-primary focus:ring-primary transition-all cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-dark">Deep Scraping IA</span>
              <span className="text-[10px] text-text-slate font-medium uppercase tracking-tighter">Extrair Emails & Socials</span>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-border-subtle mt-auto">
        {isSearching ? (
          <button
            onClick={onStop}
            className="w-full py-3.5 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all"
          >
            Interromper Extração
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            Iniciar Prospecção
          </button>
        )}
        <button
          onClick={onExport}
          disabled={!hasLeads}
          className={cn(
            "w-full py-3 bg-[#F1F5F9] text-text-slate rounded-xl text-xs font-bold transition-all",
            !hasLeads ? "opacity-60 cursor-not-allowed" : "hover:bg-[#E2E8F0] active:scale-95"
          )}
        >
          Exportar .XLSX
        </button>
      </div>
    </div>
  );
}
