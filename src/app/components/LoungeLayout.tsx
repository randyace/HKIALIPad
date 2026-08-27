/**
 * LoungeLayout.tsx — Pure presentational component.
 *
 * Rules:
 *  - Zero business state  (suites array comes entirely from props)
 *  - All mutations reported via typed callbacks
 *  - Drag UI state (which suite is mid-drag, pixel offset) is allowed as
 *    transient interaction state — it has no business meaning until Save
 *  - Default props fall back to mockLoungeLayoutData (fixture pattern)
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { GripVertical } from 'lucide-react';
import { mockLoungeLayoutData } from './__fixtures__/LoungeLayout.mocks';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface LoungeLayoutSuite {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface LoungeLayoutProps {
  /** Full list of suites with their current positions */
  suites?: LoungeLayoutSuite[];
  /**
   * Called after every successful drop with the affected suite id and its
   * new pixel position. Parent may use this for optimistic updates or logs.
   */
  onSuitePositionChange?: (suiteId: string, newPosition: { x: number; y: number }) => void;
  /**
   * Called when the user clicks "Save Layout". Receives the full updated
   * suites array so the parent / API layer can persist it.
   */
  onSaveLayout?: (suites: LoungeLayoutSuite[]) => void;
  /** Called when the user clicks "Reset to Default". */
  onResetLayout?: () => void;
}

// ─── Transient drag state type (internal only) ────────────────────────────────

interface DragState {
  suite: LoungeLayoutSuite;
  offsetX: number;
  offsetY: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoungeLayout({
  suites: suitesProp,
  onSuitePositionChange = () => {},
  onSaveLayout          = () => {},
  onResetLayout         = () => {},
}: LoungeLayoutProps) {
  // Initialise from prop; falls back to mock when no prop provided
  const initialSuites = suitesProp ?? mockLoungeLayoutData.suites ?? [];

  /**
   * Local working copy of suite positions — pure interaction state.
   * Updated on every drop; committed to parent via onSaveLayout on Save click.
   * Initialised from props; re-initialised when parent changes the prop.
   */
  const [suites, setSuites]     = useState<LoungeLayoutSuite[]>(initialSuites);
  const [drag, setDrag]         = useState<DragState | null>(null);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, suite: LoungeLayoutSuite) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDrag({
      suite,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!drag) return;

    const container = e.currentTarget as HTMLElement;
    const rect      = container.getBoundingClientRect();

    const newX = Math.max(
      0,
      Math.min(e.clientX - rect.left - drag.offsetX, rect.width  - drag.suite.size.width),
    );
    const newY = Math.max(
      0,
      Math.min(e.clientY - rect.top  - drag.offsetY, rect.height - drag.suite.size.height),
    );

    const newPosition = { x: newX, y: newY };

    setSuites(prev =>
      prev.map(s => s.id === drag.suite.id ? { ...s, position: newPosition } : s),
    );
    onSuitePositionChange(drag.suite.id, newPosition);
    setDrag(null);
  };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleSave  = () => onSaveLayout(suites);
  const handleReset = () => {
    setSuites(suitesProp ?? mockLoungeLayoutData.suites ?? []);
    onResetLayout();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Manage Lounge Layout Plan</h1>
        <p className="text-gray-600">Configure and manage suite positions on the floor plan</p>
      </div>

      {/* Interactive Floor Plan */}
      <Card className="p-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative bg-gray-50 rounded-lg"
          style={{ height: '600px' }}
        >
          {/* Layout title */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg text-gray-700 pointer-events-none">
            HKIA VIP Lounge — Floor Plan
          </div>

          {/* Entrance marker */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-100 text-blue-700 rounded border-2 border-blue-300 pointer-events-none">
            Entrance ↓
          </div>

          {/* Draggable suite tiles */}
          {suites.map((suite) => (
            <div
              key={suite.id}
              draggable
              onDragStart={(e) => handleDragStart(e, suite)}
              className={`absolute border-2 border-gray-300 bg-white rounded-lg flex flex-col items-center justify-center p-2 cursor-move hover:shadow-lg hover:border-blue-400 transition-all ${
                drag?.suite.id === suite.id ? 'opacity-50' : 'opacity-100'
              }`}
              style={{
                left:   `${suite.position.x}px`,
                top:    `${suite.position.y}px`,
                width:  `${suite.size.width}px`,
                height: `${suite.size.height}px`,
              }}
            >
              <GripVertical className="w-4 h-4 text-gray-400 mb-1" />
              <div className="text-sm font-medium text-gray-700 text-center">{suite.name}</div>
            </div>
          ))}

          {/* Static common-area labels */}
          <div className="absolute right-8 top-[50px] px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded text-sm text-blue-700 pointer-events-none">
            Reception
          </div>
          <div className="absolute right-8 top-[120px] px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded text-sm text-purple-700 pointer-events-none">
            Dining Area
          </div>
          <div className="absolute left-8 bottom-[100px] px-3 py-2 bg-indigo-50 border-2 border-indigo-200 rounded text-sm text-indigo-700 pointer-events-none">
            Restrooms
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          Save Layout
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
