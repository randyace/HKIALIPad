import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  ArrowLeft, Copy, CheckCheck, FileDown, Search,
  FileSpreadsheet, QrCode, Package,
  Clock, CheckCircle2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ── QR Code renderer (canvas-based, no external lib needed via DOM API) ────────
async function renderQRToCanvas(text: string, size = 200): Promise<HTMLCanvasElement> {
  const QRCode = (await import('qrcode')).default;
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: { dark: '#0f2942', light: '#ffffff' },
  });
  return canvas;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface GeneratedCodesData {
  prefix: string;
  codes: string[];
  companyName?: string;
  purchaseCategory?: 'Corporate' | 'Agency';
  mode: 'generate' | 'view';
}

export interface PromoCodeGeneratedPageProps {
  data?: GeneratedCodesData;
  isLoading?: boolean;
  onBack?: () => void;
}

// ── Mock: deterministically mark some codes as used with timestamps ────────────
const MOCK_USE_TIMESTAMPS = [
  '2025-01-22 09:14', '2025-01-23 11:05', '2025-01-24 14:33', '2025-01-25 08:47',
  '2025-01-25 16:02', '2025-01-26 10:28', '2025-01-27 13:55', '2025-01-28 09:31',
  '2025-02-01 08:19', '2025-02-02 11:37', '2025-02-03 14:52', '2025-02-04 10:08',
  '2025-02-05 13:26', '2025-02-06 09:43', '2025-02-07 16:11', '2025-02-08 08:55',
];

function buildUsedMap(codes: string[]): Map<number, string> {
  const map = new Map<number, string>();
  codes.forEach((_, idx) => {
    if (idx % 5 === 0 || idx % 5 === 2) {
      map.set(idx, MOCK_USE_TIMESTAMPS[idx % MOCK_USE_TIMESTAMPS.length]);
    }
  });
  return map;
}

// ── Single QR preview card ─────────────────────────────────────────────────────
function QRCard({ code, size = 80, used = false }: { code: string; size?: number; used?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        if (canvasRef.current && !cancelled) {
          await QRCode.toCanvas(canvasRef.current, code, {
            width: size,
            margin: 1,
            color: used
              ? { dark: '#9ca3af', light: '#f9fafb' }
              : { dark: '#0f2942', light: '#ffffff' },
          });
        }
      } catch (e) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [code, size, used]);
  return <canvas ref={canvasRef} width={size} height={size} className={`rounded ${used ? 'opacity-50' : ''}`} />;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function PromoCodeGeneratedPage({ data: dataProp, onBack = () => {} }: PromoCodeGeneratedPageProps = {}) {
  const data: GeneratedCodesData = dataProp ?? {
    prefix: 'DEMO',
    codes: Array.from({ length: 20 }, (_, i) => `DEMO-${String(i + 1).padStart(6, '0')}`),
    companyName: 'Demo Company',
    purchaseCategory: 'Corporate',
    mode: 'generate',
  };

  const { prefix, codes, companyName, purchaseCategory, mode } = data;

  const [search, setSearch]               = useState('');
  const [copiedIdx, setCopiedIdx]         = useState<number | null>(null);
  const [pdfLoading, setPdfLoading]       = useState(false);
  const [zipLoading, setZipLoading]       = useState(false);
  const [csvLoading, setCsvLoading]       = useState(false);
  const [showQR, setShowQR]               = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const usedMap = useMemo(() => buildUsedMap(codes), [codes]);
  const usedCount      = usedMap.size;
  const availableCount = codes.length - usedCount;

  const filtered = codes
    .map((code, idx) => ({ code, idx, usedAt: usedMap.get(idx) }))
    .filter(({ code, usedAt }) => {
      const matchSearch = !search || code.toLowerCase().includes(search.toLowerCase());
      const matchAvail  = !showAvailableOnly || usedAt === undefined;
      return matchSearch && matchAvail;
    });

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n')).catch(() => {});
    toast.success('All codes copied to clipboard!');
  };

  const handleDownloadExcel = () => {
    setCsvLoading(true);
    const rows = [
      ['#', 'Promo Code', 'Prefix', 'Company', 'Status', 'Used At'],
      ...codes.map((c, i) => [
        i + 1, c, prefix, companyName ?? '',
        usedMap.has(i) ? 'Used' : 'Available',
        usedMap.get(i) ?? '',
      ]),
    ];
    const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promo-codes-${prefix}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setCsvLoading(false);
    toast.success('Excel / CSV file downloaded!');
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const QRCode = (await import('qrcode')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 14;
      const cols = 3;
      const qrSize = 40;
      const cellW = (pageW - margin * 2) / cols;
      const cellH = qrSize + 18;

      doc.setFillColor(15, 41, 66);
      doc.rect(0, 0, pageW, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('HKIA VIP Lounge — Promo Code Batch', margin, 10);
      doc.setFontSize(8);
      doc.text(`Prefix: ${prefix}  |  Total: ${codes.length}  |  Generated: ${new Date().toLocaleDateString('en-HK')}`, margin, 14.5);
      if (companyName) doc.text(`Company: ${companyName}`, pageW - margin - 60, 10, { align: 'left' });
      doc.setTextColor(30, 30, 30);

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const col = i % cols;
        if (i > 0 && col === 0 && Math.floor(i / cols) > 0 && Math.floor(i / cols) % Math.floor((pageH - margin * 2 - 20) / cellH) === 0) {
          doc.addPage();
          doc.setFillColor(15, 41, 66);
          doc.rect(0, 0, pageW, 16, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text('HKIA VIP Lounge — Promo Code Batch (continued)', margin, 10);
          doc.setFontSize(8);
          doc.text(`Prefix: ${prefix}  |  Total: ${codes.length}`, margin, 14.5);
          doc.setTextColor(30, 30, 30);
        }
        const isUsed = usedMap.has(i);
        const rowInPage = Math.floor(i / cols) % Math.floor((pageH - margin * 2 - 20) / cellH);
        const x = margin + col * cellW;
        const y = margin + 14 + rowInPage * cellH + 4;
        const dataUrl = await QRCode.toDataURL(code, {
          width: 200, margin: 1,
          color: isUsed ? { dark: '#9ca3af', light: '#f9fafb' } : { dark: '#0f2942', light: '#ffffff' },
        });
        doc.setFillColor(isUsed ? 243 : 248, isUsed ? 244 : 250, isUsed ? 246 : 252);
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(x + 1, y - 2, cellW - 2, cellH, 2, 2, 'FD');
        const qrX = x + (cellW - qrSize) / 2;
        doc.addImage(dataUrl, 'PNG', qrX, y, qrSize, qrSize);
        doc.setFontSize(7);
        doc.setTextColor(isUsed ? 156 : 15, isUsed ? 163 : 41, isUsed ? 175 : 66);
        doc.text(code, x + cellW / 2, y + qrSize + 4, { align: 'center' });
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        const usedAt = usedMap.get(i);
        doc.text(usedAt ? `USED: ${usedAt}` : `#${i + 1} — Available`, x + cellW / 2, y + qrSize + 8, { align: 'center' });
        doc.setTextColor(30, 30, 30);
      }
      doc.save(`promo-codes-${prefix}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`PDF downloaded with ${codes.length} QR codes!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPNGZip = async () => {
    setZipLoading(true);
    try {
      const JSZip  = (await import('jszip')).default;
      const QRCode = (await import('qrcode')).default;
      const zip = new JSZip();
      const folder = zip.folder(`promo-qrcodes-${prefix}`)!;
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const isUsed = usedMap.has(i);
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, code, {
          width: 400, margin: 2,
          color: isUsed ? { dark: '#9ca3af', light: '#f9fafb' } : { dark: '#0f2942', light: '#ffffff' },
        });
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width  = 400;
        labelCanvas.height = 460;
        const ctx = labelCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 460);
        ctx.drawImage(canvas, 0, 0);
        ctx.fillStyle = isUsed ? '#9ca3af' : '#0f2942';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(code, 200, 424);
        ctx.fillStyle = '#999999';
        ctx.font = '13px sans-serif';
        const usedAt = usedMap.get(i);
        ctx.fillText(usedAt ? `USED: ${usedAt}` : `#${i + 1} — Available`, 200, 448);
        const blob: Blob = await new Promise(resolve => labelCanvas.toBlob(b => resolve(b!), 'image/png'));
        const arrayBuf = await blob.arrayBuffer();
        folder.file(`${code}.png`, arrayBuf);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promo-qrcodes-${prefix}-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`ZIP downloaded with ${codes.length} QR PNG files!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP. Please try again.');
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-[#0f2942] px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white text-base font-semibold">
              {mode === 'view' ? 'View Promo Code Batch' : 'Codes Generated Successfully'}
            </h2>
            <p className="text-blue-200 text-xs">
              {codes.length} unique codes · Prefix: <span className="font-mono">{prefix}</span>
              {companyName && ` · ${companyName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={handleDownloadExcel} disabled={csvLoading}>
            <FileSpreadsheet className="w-4 h-4" />
            {csvLoading ? 'Downloading…' : 'Download Excel'}
          </Button>
          <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={handleDownloadPDF} disabled={pdfLoading}>
            <FileDown className="w-4 h-4" />
            {pdfLoading ? 'Generating PDF…' : 'Download PDF (with QR)'}
          </Button>
          <Button size="sm" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={handleDownloadPNGZip} disabled={zipLoading}>
            <Package className="w-4 h-4" />
            {zipLoading ? 'Zipping…' : 'Download PNG ZIP'}
          </Button>
        </div>
      </div>

      {/* VIP notification banner */}
      {purchaseCategory && mode === 'generate' && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-3 shrink-0">
          <CheckCheck className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            <span className="font-medium">VIP Account Creation Request Sent.</span>{' '}
            VIP accounts creation request is sent to the VIP Lounge team.
          </p>
        </div>
      )}

      {/* Summary strip */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-6 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Total</span>
          <Badge className="bg-[#0f2942] text-white">{codes.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-gray-600">Available</span>
          <Badge className="bg-emerald-100 text-emerald-700">{availableCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Used</span>
          <Badge className="bg-gray-200 text-gray-600">{usedCount}</Badge>
        </div>
        {companyName && (
          <div className="text-sm text-gray-600">
            Company: <span className="font-medium text-gray-900">{companyName}</span>
          </div>
        )}
        <div className="text-sm text-gray-600">
          Prefix: <span className="font-mono font-medium text-[#0f2942]">{prefix}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAvailableOnly(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              showAvailableOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-700'
            }`}
          >
            {showAvailableOnly ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Available codes only
          </button>
          <button
            onClick={() => setShowQR(q => !q)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide QR Codes' : 'Show QR Codes'}
          </button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopyAll}>
            <Copy className="w-3.5 h-3.5" />
            Copy All
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-6 py-3 bg-white border-b shrink-0">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search codes…"
            className="pl-9"
          />
        </div>
        {(search || showAvailableOnly) && (
          <p className="text-xs text-gray-500 mt-1">
            {filtered.length} of {codes.length} codes{showAvailableOnly ? ' (available only)' : ''}{search ? ` match "${search}"` : ''}
          </p>
        )}
      </div>

      {/* Codes grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {showQR ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map(({ code, idx, usedAt }) => (
              <div
                key={idx}
                className={`group flex flex-col items-center gap-1 p-3 border rounded-xl transition-all cursor-pointer ${
                  usedAt
                    ? 'bg-gray-50 border-gray-200 opacity-70'
                    : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                }`}
                onClick={() => !usedAt && handleCopy(code, idx)}
                title={usedAt ? `Used at ${usedAt}` : 'Click to copy'}
              >
                <QRCard code={code} size={80} used={!!usedAt} />
                <span className={`text-xs font-mono text-center break-all leading-tight ${usedAt ? 'text-gray-400' : 'text-[#0f2942]'}`}>{code}</span>
                {usedAt ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
                      <Clock className="w-2.5 h-2.5" /> Used
                    </span>
                    <span className="text-[9px] text-gray-400">{usedAt}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-600">Available</span>
                )}
                {!usedAt && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIdx === idx
                      ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filtered.map(({ code, idx, usedAt }) => (
              <div
                key={idx}
                className={`group flex items-center justify-between gap-1 px-3 py-2 border rounded-lg font-mono text-sm transition-colors cursor-pointer ${
                  usedAt
                    ? 'bg-gray-50 border-gray-200 text-gray-400'
                    : 'bg-white border-gray-200 text-[#0f2942] hover:bg-emerald-50 hover:border-emerald-300'
                }`}
                onClick={() => !usedAt && handleCopy(code, idx)}
                title={usedAt ? `Used at ${usedAt}` : 'Click to copy'}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-xs">{code}</span>
                  {usedAt ? (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                      {usedAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600">Available</span>
                  )}
                </div>
                <div className="shrink-0">
                  {usedAt ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" title="Already used" />
                  ) : copiedIdx === idx ? (
                    <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No codes match your current filters.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-6 py-3 flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-500">
          Showing {filtered.length} of {codes.length} codes
          {showAvailableOnly && ` · available only`}
          {search && ` matching "${search}"`}
        </p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Form
        </Button>
      </div>
    </div>
  );
}
