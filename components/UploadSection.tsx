"use client";

import { useState } from "react";
import { Upload, FileText, Database } from "lucide-react";
import { processCSV, processPDF, loadSampleData } from "@/app/actions";

interface UploadSectionProps {
  onData: (rows: any[]) => void;
}

export default function UploadSection({ onData }: UploadSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let rows;
      if (ext === "csv") {
        const text = await file.text();
        rows = await processCSV(text);
      } else if (ext === "pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        rows = await processPDF(buffer);
      } else if (ext === "xlsx" || ext === "xls") {
        alert("Excel files: please export as CSV first.");
        setLoading(false);
        return;
      } else {
        alert("Unsupported file type.");
        setLoading(false);
        return;
      }
      onData(rows);
    } catch (err: any) {
      alert(err.message || "Parsing failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSample() {
    setLoading(true);
    try {
      const rows = await loadSampleData();
      onData(rows);
    } catch (err: any) {
      alert(err.message || "Failed to load sample.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-cyan-400">Upload Statement</h2>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/40 px-6 py-3 text-sm hover:border-cyan-400 transition-colors">
        <Upload className="h-4 w-4" />
        {loading ? "Processing..." : "Click to upload CSV / PDF"}
        <input type="file" accept=".csv,.pdf" className="hidden" onChange={handleFile} disabled={loading} />
      </label>
      <div className="flex gap-3">
        <button
          onClick={handleSample}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Load Sample CSV
        </button>
      </div>
    </div>
  );
}
