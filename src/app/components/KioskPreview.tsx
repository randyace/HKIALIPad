import { useState } from 'react';
import { Tablet, ExternalLink, RotateCcw, Monitor } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const SUITES = [
  'CIP Suite 1', 'CIP Suite 2', 'CIP Suite 3',
  'CIP Suite 4', 'CIP Suite 5', 'CIP Suite 6',
  'Function Room',
  'Lobby 1', 'Lobby 2', 'Lobby 3', 'Lobby 4',
];

type Orientation = 'landscape' | 'portrait';

export function KioskPreview() {
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [selectedSuite, setSelectedSuite] = useState('CIP Suite 1');
  const [iframeKey, setIframeKey] = useState(0);

  const reload = () => setIframeKey(k => k + 1);

  const frameW = orientation === 'landscape' ? 860 : 540;
  const frameH = orientation === 'landscape' ? 580 : 760;

  return (
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tablet className="w-5 h-5 text-[#0f2942]" />
            <h1>Guest iPad Kiosk</h1>
          </div>
          <p className="text-sm text-gray-500">
            Live preview of the customer self-ordering interface displayed on suite iPads.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Orientation toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                orientation === 'landscape' ? 'bg-[#0f2942] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Landscape
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-l border-gray-200 ${
                orientation === 'portrait' ? 'bg-[#0f2942] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Tablet className="w-4 h-4" />
              Portrait
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={reload} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Reload
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.open('/kiosk', '_blank')} className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Screen
          </Button>
        </div>
      </div>

      {/* Suite selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 shrink-0">Preview suite:</span>
        {SUITES.map(s => (
          <button
            key={s}
            onClick={() => { setSelectedSuite(s); reload(); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedSuite === s
                ? 'bg-[#0f2942] text-white border-[#0f2942]'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Live — interactions work
        </Badge>
        <span>Staff re-assign PIN: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">1234</code></span>
      </div>

      {/* iPad device frame */}
      <div className="flex justify-center pt-2 pb-8">
        <div
          style={{ width: frameW + 48, height: frameH + 80 }}
          className="relative bg-[#1c1c1e] rounded-[2.5rem] shadow-2xl flex items-center justify-center shrink-0 transition-all duration-300"
        >
          {/* Camera pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-[#2c2c2e] rounded-full" />
          {/* Home bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#3a3a3c] rounded-full" />
          {/* Screen */}
          <div
            className="bg-black rounded-[1.25rem] overflow-hidden"
            style={{ width: frameW, height: frameH }}
          >
            <iframe
              key={iframeKey}
              src="/kiosk"
              title="Guest iPad Kiosk"
              style={{ width: frameW, height: frameH, border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
