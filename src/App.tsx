/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import confetti from "canvas-confetti";
import { motion } from "motion/react";

import { Lead, SearchConfig, SearchProgress } from "./types";
import { SearchControls } from "./components/SearchControls";
import { LeadTable } from "./components/LeadTable";
import { GridVisualizer } from "./components/GridVisualizer";
import { generateGrid, formatNumber, cn } from "./lib/utils";
import { geocodeCity, findLeadsInGrid } from "./services/prospectorService";

const INITIAL_PROGRESS: SearchProgress = {
  totalFound: 0,
  totalRaw: 0,
  withEmail: 0,
  currentGridPoint: 0,
  totalGridPoints: 0,
  status: "idle",
  message: "Pronto para iniciar prospecção",
};

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<SearchConfig>({
    niche: "Escritórios de Advocacia",
    city: "São Paulo, SP",
    radiusKm: 10,
    gridStepKm: 2,
    deepExtract: true,
    model: "gemini-3-flash-preview",
  });

  const [progress, setProgress] = useState<SearchProgress>(INITIAL_PROGRESS);
  const stopRef = useRef(false);

  const handleStart = async () => {
    if (!config.niche || !config.city) return;

    stopRef.current = false;
    setLeads([]);
    setProgress({
      ...INITIAL_PROGRESS,
      status: "searching",
      message: "Geocodificando cidade...",
    });

    try {
      const center = await geocodeCity(config.city);

      if (stopRef.current) return;

      const points = generateGrid(center.lat, center.lng, config.radiusKm, config.gridStepKm);

      setProgress(p => ({
        ...p,
        totalGridPoints: points.length,
        message: `Iniciando varredura em ${points.length} pontos...`,
      }));

      const seenIds = new Set<string>();
      const allLeads: Lead[] = [];
      let totalRaw = 0;

      for (let i = 0; i < points.length; i++) {
        if (stopRef.current) break;

        setProgress(p => ({
          ...p,
          currentGridPoint: i,
          currentCoord: points[i],
          message: `Escaneando quadrante ${i + 1}/${points.length}...`,
        }));

        if (i > 0) await new Promise(r => setTimeout(r, 1000));

        if (stopRef.current) break;

        await findLeadsInGrid(config, points[i], (newLeads) => {
          totalRaw += newLeads.length;
          const uniqueNew = newLeads.filter(l => {
            if (seenIds.has(l.id)) return false;
            seenIds.add(l.id);
            return true;
          });

          if (uniqueNew.length > 0) {
            allLeads.push(...uniqueNew);
            setLeads([...allLeads]);
            setProgress(p => ({
              ...p,
              totalFound: allLeads.length,
              totalRaw,
              withEmail: allLeads.filter(l => l.emails && l.emails.length > 0).length,
            }));
          }
        });
      }

      const wasStopped = stopRef.current;
      setProgress(p => ({
        ...p,
        status: wasStopped ? "idle" : "completed",
        message: wasStopped
          ? `Interrompido. ${allLeads.length} leads salvos.`
          : `Prospecção finalizada. ${allLeads.length} leads encontrados.`,
      }));

      if (!wasStopped && allLeads.length > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (error) {
      console.error(error);
      setProgress(p => ({ ...p, status: "error", message: "Ocorreu um erro. Verifique a API key." }));
    }
  };

  const handleStop = () => {
    stopRef.current = true;
    setProgress(p => ({ ...p, message: "Interrompendo..." }));
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(leads.map(l => ({
      Nome: l.name,
      Telefone: l.phone,
      Email: l.emails?.join(", ") || "",
      Website: l.website,
      Instagram: l.socials?.instagram || "",
      Facebook: l.socials?.facebook || "",
      Endereço: l.address,
      Categoria: l.category,
      Rating: l.rating,
      Reviews: l.reviews,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `leads_${config.niche.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
  };

  const progressPct = progress.totalGridPoints > 0
    ? Math.round(((progress.currentGridPoint + 1) / progress.totalGridPoints) * 100)
    : 0;

  const coordLabel = progress.currentCoord
    ? `Coord: ${progress.currentCoord.lat.toFixed(3)}, ${progress.currentCoord.lng.toFixed(3)}`
    : "Coord: —";

  return (
    <div className="h-screen flex flex-col font-sans">
      <header className="h-16 bg-linear-to-r from-[#4F46E5] to-[#7C3AED] shadow-md px-6 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl tracking-tighter">PROSPECTOR</span>
          <span className="bg-white/20 text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wider">v2.4 DeepScan</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="opacity-70">Status:</span>
            <span className={cn("font-bold", progress.status === 'searching' ? "text-green-300 animate-pulse" : "text-white")}>
              {progress.status === 'searching' ? "Running Grid Scan" : "Idle"}
            </span>
          </div>
          {progress.status === 'searching' && (
            <div className="font-mono text-xs hidden sm:block">
              {coordLabel}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[260px] bg-sidebar border-r border-border-subtle shrink-0">
          <SearchControls
            config={config}
            onChange={setConfig}
            onStart={handleStart}
            onStop={handleStop}
            onExport={handleExport}
            isSearching={progress.status === 'searching'}
            hasLeads={leads.length > 0}
          />
        </aside>

        <main className="flex-1 p-5 overflow-auto bg-main-bg grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5 content-start">
          <section className="bg-white rounded-xl border border-border-subtle p-4 shadow-xs flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-text-dark">Monitor de Coordenadas (Grid)</h3>
              <span className="text-text-slate text-xs">
                {progress.totalGridPoints > 0 ? `${progress.currentGridPoint + 1}/${progress.totalGridPoints}` : "—"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#F1F5F9] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{formatNumber(progress.totalFound)}</div>
                <div className="text-[10px] text-text-slate font-bold uppercase">Encontrados</div>
              </div>
              <div className="bg-[#F1F5F9] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">
                  {progress.totalRaw > 0 ? progress.totalRaw - progress.totalFound : 0}
                </div>
                <div className="text-[10px] text-text-slate font-bold uppercase">Duplicados</div>
              </div>
              <div className="bg-[#F1F5F9] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{progress.withEmail}</div>
                <div className="text-[10px] text-text-slate font-bold uppercase">Com Email</div>
              </div>
            </div>

            <GridVisualizer
              points={progress.totalGridPoints > 0 ? Array(progress.totalGridPoints).fill(null) : []}
              currentIdx={progress.currentGridPoint}
            />

            <div className="mt-4 text-[11px] text-text-slate font-mono border-t border-border-subtle pt-3">
              {progress.message}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border-subtle shadow-xs flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-base font-bold text-text-dark">Lead Stream (Live)</h3>
              <button
                onClick={handleExport}
                disabled={leads.length === 0}
                className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-30 transition-all flex items-center gap-2"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <LeadTable leads={leads} />
            </div>
          </section>
        </main>
      </div>

      <footer className="h-12 bg-white border-t border-border-subtle px-6 flex items-center gap-4 shrink-0">
        <div className="text-xs font-semibold whitespace-nowrap min-w-[150px]">
          Progresso Total: {progressPct}%
        </div>
        <div className="flex-1 h-2 bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            className="h-full bg-linear-to-r from-primary to-success"
          />
        </div>
        <div className="text-xs text-text-slate hidden md:block">
          {progress.status === 'searching'
            ? `Est. restante: ${Math.ceil((progress.totalGridPoints - progress.currentGridPoint) * 1.5)}m`
            : progress.message}
        </div>
      </footer>
    </div>
  );
}
