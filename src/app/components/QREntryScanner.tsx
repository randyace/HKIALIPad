import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  X,
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plane,
  Users,
  Clock,
  CreditCard,
  Building2,
  AlertTriangle,
  ScanLine,
} from 'lucide-react';

// ── Types shared with BookingSchedules ───────────────────────────────────────
type BookingStatus =
  | 'Confirmed'
  | 'Approved'
  | 'Pending for Approval'
  | 'Pending for Review'
  | 'Cancelled'
  | 'Rejected'
  | 'No-show';

interface ScheduleBooking {
  id: number;
  bookingNo: string;
  guestName: string;
  accountNo: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  flightNo: string;
  flightTime: string;
  numberOfGuests: number;
  status: BookingStatus;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  paymentMode: 'Upfront' | 'On-Credit';
  amount: string;
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<BookingStatus, string> = {
  'Confirmed':           'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Approved':            'bg-blue-100   text-blue-800   border border-blue-200',
  'Pending for Approval':'bg-amber-100  text-amber-800  border border-amber-200',
  'Pending for Review':  'bg-orange-100 text-orange-800 border border-orange-200',
  'Cancelled':           'bg-gray-100   text-gray-800   border border-gray-200',
  'Rejected':            'bg-red-100    text-red-800    border border-red-200',
  'No-show':             'bg-rose-100   text-rose-800   border border-rose-200',
};

// Entry is allowed only for these statuses
const ENTRY_ALLOWED: BookingStatus[] = ['Confirmed', 'Approved'];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Scan result states ────────────────────────────────────────────────────────
type ScanState = 'idle' | 'scanning' | 'found' | 'not-found' | 'entry-granted' | 'entry-denied';

export interface QREntryScannerProps {
  open?: boolean;
  onScan?: (bookingNo: string) => void;
  onClose?: () => void;
  onCheckIn?: (bookingId: number) => void;
}

export function QREntryScanner({ open = false, onScan, onClose, onCheckIn }: QREntryScannerProps) {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const rafRef         = useRef<number | null>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);

  const [scanState,    setScanState]    = useState<ScanState>('idle');
  const [camError,     setCamError]     = useState<string | null>(null);
  const [foundBooking, setFoundBooking] = useState<ScheduleBooking | null>(null);
  const [lastRawQR,    setLastRawQR]    = useState<string>('');
  const [scannerReady, setScannerReady] = useState(false);
  const [facingMode,   setFacingMode]   = useState<'environment' | 'user'>('environment');
  const [entryNote,    setEntryNote]    = useState('');
  const [scanLinePos,  setScanLinePos]  = useState(0);

  // Animate scan line
  useEffect(() => {
    if (scanState !== 'scanning') return;
    let pos = 0;
    let dir = 1;
    const interval = setInterval(() => {
      pos += dir * 1.5;
      if (pos >= 100) dir = -1;
      if (pos <= 0)   dir = 1;
      setScanLinePos(pos);
    }, 16);
    return () => clearInterval(interval);
  }, [scanState]);

  // Start camera
  const startCamera = useCallback(async (facing: 'environment' | 'user' = facingMode) => {
    setCamError(null);
    setScannerReady(false);
    setScanState('scanning');

    try {
      // stop previous stream
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScannerReady(true);
        scheduleFrame();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCamError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Unable to access camera. Make sure no other app is using it.'
      );
      setScanState('idle');
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Decode one video frame
  const scheduleFrame = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        scheduleFrame();
        return;
      }

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) { scheduleFrame(); return; }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data !== lastRawQR) {
        handleQRDetected(code.data);
      } else {
        scheduleFrame();
      }
    });
  }, [lastRawQR, onScan]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQRDetected = useCallback((raw: string) => {
    setLastRawQR(raw);
    stopCamera(false); // keep video alive for bg blur

    // Look up booking by booking number or booking ID embedded in QR
    const trimmed = raw.trim();
    if (onScan) onScan(trimmed);
  }, [onScan]);

  const stopCamera = useCallback((fullStop = true) => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (fullStop) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setScannerReady(false);
      setScanState('idle');
    }
  }, []);

  // Open/close lifecycle
  useEffect(() => {
    if (open) {
      setScanState('idle');
      setFoundBooking(null);
      setLastRawQR('');
      setCamError(null);
      setEntryNote('');
    } else {
      stopCamera(true);
      setScanState('idle');
      setFoundBooking(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => stopCamera(true), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setFoundBooking(null);
    setLastRawQR('');
    setEntryNote('');
    setScanState('scanning');
    scheduleFrame();
  };

  const handleGrantEntry = () => setScanState('entry-granted');
  const handleDenyEntry  = () => setScanState('entry-denied');

  const handleFlipCamera = () => {
    const next: 'environment' | 'user' = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const handleClose = () => {
    stopCamera(true);
    onClose?.();
  };

  if (!open) return null;

  const isEntryAllowed = foundBooking && ENTRY_ALLOWED.includes(foundBooking.status);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-[#0f2942]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm">QR Entry Scanner</p>
              <p className="text-white/60 text-xs">Scan guest booking QR code for lounge entry</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ IDLE state: prompt to start ══ */}
          {scanState === 'idle' && (
            <div className="flex flex-col items-center justify-center gap-5 py-12 px-6">
              {camError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 w-full">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{camError}</span>
                </div>
              )}
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                <Camera className="w-10 h-10 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-700 mb-1">Ready to scan</p>
                <p className="text-xs text-gray-400">
                  Point the camera at the guest's booking QR code to verify entry.
                </p>
              </div>
              <Button
                className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white gap-2 px-6"
                onClick={() => startCamera(facingMode)}
              >
                <Camera className="w-4 h-4" />
                Open Camera
              </Button>
            </div>
          )}

          {/* ══ SCANNING state: camera viewfinder ══ */}
          {scanState === 'scanning' && (
            <div className="relative bg-black">
              {/* Video element */}
              <video
                ref={videoRef}
                className="w-full block"
                style={{ maxHeight: 320, objectFit: 'cover' }}
                playsInline
                muted
              />

              {/* Hidden canvas for QR processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay with scanning frame */}
              {scannerReady && (
                <div
                  ref={overlayRef}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {/* Dark vignette */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Scanning frame */}
                  <div className="relative z-10 w-52 h-52">
                    {/* Corner brackets */}
                    {[
                      'top-0 left-0 border-t-2 border-l-2 rounded-tl',
                      'top-0 right-0 border-t-2 border-r-2 rounded-tr',
                      'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
                      'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={`absolute w-6 h-6 border-white ${cls}`}
                      />
                    ))}

                    {/* Animated scan line */}
                    <div
                      className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_2px_rgba(52,211,153,0.7)] pointer-events-none z-20"
                      style={{ top: `${scanLinePos}%` }}
                    />
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="bg-black/60 text-white/90 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <ScanLine className="w-3 h-3" />
                      Align QR code within frame
                    </span>
                  </div>
                </div>
              )}

              {/* Loading overlay before camera ready */}
              {!scannerReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Starting camera…</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ FOUND state: booking info ══ */}
          {(scanState === 'found' || scanState === 'entry-granted' || scanState === 'entry-denied') && foundBooking && (
            <div className="px-5 py-5 space-y-4">

              {/* Entry result banner */}
              {scanState === 'entry-granted' && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-800 text-sm">Entry Granted</p>
                    <p className="text-emerald-600 text-xs">{entryNote || 'Guest has been admitted to the lounge.'}</p>
                  </div>
                </div>
              )}
              {scanState === 'entry-denied' && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm">Entry Denied</p>
                    <p className="text-red-600 text-xs">{entryNote || 'Guest has been turned away.'}</p>
                  </div>
                </div>
              )}

              {/* Booking no + status */}
              {scanState === 'found' && !isEntryAllowed && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>
                    This booking status is <strong>{foundBooking.status}</strong>. Entry is only permitted for Confirmed or Approved bookings.
                  </span>
                </div>
              )}

              {/* Guest card */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border">
                <div className="w-10 h-10 rounded-full bg-[#0f2942] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">
                    {foundBooking.guestName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{foundBooking.guestName}</p>
                  <p className="text-xs text-gray-500">{foundBooking.accountNo}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{foundBooking.accountType}</span>
                  </div>
                </div>
                <Badge className={STATUS_BADGE[foundBooking.status]}>
                  {foundBooking.status}
                </Badge>
              </div>

              {/* Booking info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Booking No.</label>
                  <p className="font-mono text-blue-700 text-xs">{foundBooking.bookingNo}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Venue</label>
                  <p className="text-gray-800">{foundBooking.venue}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Date</label>
                  <p className="text-gray-800 text-xs">{formatDate(foundBooking.date)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </label>
                  <p className="text-gray-800">{foundBooking.startTime} – {foundBooking.endTime}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Users className="w-3 h-3" /> Guests
                  </label>
                  <p className="text-gray-800">{foundBooking.numberOfGuests} pax</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Plane className="w-3 h-3" /> Flight
                  </label>
                  <p className="text-gray-800">{foundBooking.flightNo} · {foundBooking.flightTime}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment
                  </label>
                  <p className="text-gray-800">{foundBooking.paymentMode}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Amount</label>
                  <p className="text-gray-800">{foundBooking.amount}</p>
                </div>
              </div>

              {/* Note field for pending decisions */}
              {scanState === 'found' && (
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Note (optional)</label>
                  <textarea
                    value={entryNote}
                    onChange={e => setEntryNote(e.target.value)}
                    placeholder="Add an entry note…"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* ══ NOT FOUND state ══ */}
          {scanState === 'not-found' && (
            <div className="flex flex-col items-center gap-4 py-10 px-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-700 mb-1">Booking Not Found</p>
                <p className="text-xs text-gray-400">
                  No matching booking found for this QR code.<br />
                  Please check the booking number or try again.
                </p>
                {lastRawQR && (
                  <p className="mt-2 font-mono text-xs text-gray-400 bg-gray-100 rounded px-2 py-1 inline-block break-all">
                    {lastRawQR}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between gap-2">

          {/* Left: scan again / flip camera */}
          <div className="flex gap-2">
            {(scanState === 'found' || scanState === 'not-found' || scanState === 'entry-granted' || scanState === 'entry-denied') && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleReset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Scan Again
              </Button>
            )}
            {scanState === 'scanning' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleFlipCamera}
              >
                <CameraOff className="w-3.5 h-3.5" />
                Flip Camera
              </Button>
            )}
          </div>

          {/* Right: contextual actions */}
          <div className="flex gap-2">
            {scanState === 'idle' && (
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            )}

            {scanState === 'scanning' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { stopCamera(true); }}
              >
                Stop Camera
              </Button>
            )}

            {scanState === 'found' && (
              <>
                {onViewDetail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClose();
                      onViewDetail(foundBooking!.id);
                    }}
                  >
                    View Details
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5"
                  disabled={!isEntryAllowed}
                  onClick={handleDenyEntry}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Deny
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  disabled={!isEntryAllowed}
                  onClick={handleGrantEntry}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Grant Entry
                </Button>
              </>
            )}

            {(scanState === 'not-found' || scanState === 'entry-granted' || scanState === 'entry-denied') && (
              <Button
                size="sm"
                className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
                onClick={handleClose}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}