"use client";
import { useState } from "react";
import { usePreview } from "./portal-shell";
import type { ReportKind } from "./pdf-export";
import s from "./portal.module.css";
export function PdfDownload({ kind = "application", label = "Download application PDF", plain = false }: { kind?: ReportKind; label?: string; plain?: boolean }) {
  const { draft, notice } = usePreview(); const [busy, setBusy] = useState(false);
  async function download() { setBusy(true); try { const { downloadDraftPdf } = await import("./pdf-export"); await downloadDraftPdf(draft, kind); } catch { notice("PDF could not be downloaded", "Please check your connection and try again. Your draft is still available in this session."); } finally { setBusy(false); } }
  return <button type="button" disabled={busy} className={plain ? undefined : s.secondary} onClick={download}>{busy ? "Preparing PDF…" : label}</button>;
}
