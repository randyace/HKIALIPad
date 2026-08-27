import { Plane, User, Utensils, Users, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface HistoricalGuest {
  id: number;
  name: string;
  type: 'VIP Passenger' | 'Non-Flying Guest';
  ageGroup: string;
  lastVisit: string;
  bookingNo: string;
  totalVisits: number;
  foodAllergies: string;
}

const HISTORICAL_GUESTS: HistoricalGuest[] = [
  { id: 1,  name: 'Mr John Smith',       type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-14', bookingNo: 'A-202602-000023', totalVisits: 18, foodAllergies: 'Shellfish, Peanuts' },
  { id: 2,  name: 'Mrs Mary Johnson',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-30', bookingNo: 'A-202601-000078', totalVisits: 12, foodAllergies: '' },
  { id: 3,  name: 'Miss Sarah Chen',     type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-05', bookingNo: 'A-202602-000011', totalVisits: 4,  foodAllergies: 'Dairy, Eggs' },
  { id: 4,  name: 'Mr David Lee',        type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-20', bookingNo: 'A-202512-000199', totalVisits: 7,  foodAllergies: 'Tree Nuts' },
  { id: 5,  name: 'Mrs Linda Brown',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-20', bookingNo: 'A-202602-000041', totalVisits: 9,  foodAllergies: 'Sesame' },
  { id: 6,  name: 'Mr Robert Wang',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-10', bookingNo: 'A-202601-000033', totalVisits: 31, foodAllergies: '' },
  { id: 7,  name: 'Mrs Emma Wilson',     type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-11-28', bookingNo: 'A-202511-000154', totalVisits: 5,  foodAllergies: 'Gluten' },
  { id: 8,  name: 'Miss Sophie Martin',  type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-03', bookingNo: 'A-202602-000007', totalVisits: 3,  foodAllergies: 'Peanuts, Tree Nuts' },
  { id: 9,  name: 'Mr James Taylor',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-22', bookingNo: 'A-202601-000091', totalVisits: 6,  foodAllergies: '' },
  { id: 10, name: 'Mr Kevin Zhang',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-18', bookingNo: 'A-202602-000055', totalVisits: 14, foodAllergies: '' },
  { id: 11, name: 'Mrs Olivia Harris',   type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-05', bookingNo: 'A-202512-000088', totalVisits: 2,  foodAllergies: 'Shellfish' },
  { id: 12, name: 'Miss Chloe Nguyen',   type: 'Non-Flying Guest', ageGroup: 'Infant (0-2 years)', lastVisit: '2026-01-15', bookingNo: 'A-202601-000044', totalVisits: 1,  foodAllergies: 'Dairy' },
  { id: 13, name: 'Mr Michael Brown',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-25', bookingNo: 'A-202602-000070', totalVisits: 22, foodAllergies: 'Soy, Wheat' },
  { id: 14, name: 'Mrs Lisa Taylor',     type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-10-30', bookingNo: 'A-202510-000210', totalVisits: 8,  foodAllergies: '' },
  { id: 15, name: 'Mr James Anderson',   type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-10', bookingNo: 'A-202602-000029', totalVisits: 16, foodAllergies: 'Peanuts' },
  { id: 16, name: 'Mrs Sophia Martinez', type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-08', bookingNo: 'A-202601-000012', totalVisits: 3,  foodAllergies: 'Mustard, Celery' },
  { id: 17, name: 'Mr Thomas Hughes',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-22', bookingNo: 'A-202602-000061', totalVisits: 40, foodAllergies: '' },
  { id: 18, name: 'Miss Grace Liu',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-12', bookingNo: 'A-202512-000133', totalVisits: 11, foodAllergies: 'Fish, Shellfish' },
  { id: 19, name: 'Mr William Park',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-27', bookingNo: 'A-202601-000067', totalVisits: 5,  foodAllergies: '' },
  { id: 20, name: 'Mrs Helen Yuen',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-01', bookingNo: 'A-202602-000003', totalVisits: 28, foodAllergies: 'Lactose' },
  { id: 21, name: 'Mr Aaron Chow',       type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-11-14', bookingNo: 'A-202511-000099', totalVisits: 9,  foodAllergies: '' },
  { id: 22, name: 'Miss Rachel Lam',     type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-17', bookingNo: 'A-202602-000048', totalVisits: 2,  foodAllergies: 'Egg, Peanuts' },
  { id: 23, name: 'Mr Daniel Ho',        type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-28', bookingNo: 'A-202602-000082', totalVisits: 7,  foodAllergies: 'Penicillin-related foods' },
  { id: 24, name: 'Mrs Catherine Wong',  type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-31', bookingNo: 'A-202512-000251', totalVisits: 19, foodAllergies: '' },
  { id: 25, name: 'Mr Lucas Ferreira',   type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-19', bookingNo: 'A-202601-000055', totalVisits: 1,  foodAllergies: 'Tree Nuts, Sesame' },
];

interface BookingGuestsSearcherProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function BookingGuestsSearcher({ open, onClose, searchQuery, setSearchQuery }: BookingGuestsSearcherProps) {
  const q = searchQuery.trim().toLowerCase();
  const results = q
    ? HISTORICAL_GUESTS.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.bookingNo.toLowerCase().includes(q) ||
        g.foodAllergies.toLowerCase().includes(q) ||
        g.ageGroup.toLowerCase().includes(q)
      )
    : HISTORICAL_GUESTS;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />Guests Searcher
          </DialogTitle>
          <DialogDescription>
            Search all past guests who have visited the HKIA VIP Lounge — VIP passengers and non-flying guests.
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, booking no., or food allergy…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-500">
            <Users className="w-3 h-3" />{HISTORICAL_GUESTS.length} total guests
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700">
            <Plane className="w-3 h-3" />{HISTORICAL_GUESTS.filter(g => g.type === 'VIP Passenger').length} VIP Passengers
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700">
            <User className="w-3 h-3" />{HISTORICAL_GUESTS.filter(g => g.type === 'Non-Flying Guest').length} Non-Flying Guests
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full text-red-600">
            <Utensils className="w-3 h-3" />{HISTORICAL_GUESTS.filter(g => g.foodAllergies).length} with allergies
          </span>
        </div>

        {/* Guest list */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No guests found matching "<span className="font-medium">{searchQuery}</span>"
            </div>
          ) : results.map(g => {
            const isVip = g.type === 'VIP Passenger';
            return (
              <div
                key={g.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${isVip ? 'border-purple-100 bg-purple-50/40' : 'border-blue-100 bg-blue-50/40'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isVip ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {isVip ? <Plane className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{g.name}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${isVip ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {g.type}
                    </span>
                    {g.totalVisits >= 10 && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Frequent Guest</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Last visit: <span className="text-gray-600">{g.lastVisit}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    Booking: <span className="font-mono text-gray-600">{g.bookingNo}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    {g.totalVisits} visit{g.totalVisits !== 1 ? 's' : ''}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 text-xs rounded px-2 py-1 ${g.foodAllergies ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
                    <Utensils className="w-3 h-3 shrink-0" />
                    {g.foodAllergies
                      ? <span><span className="font-medium">Allergies:</span> {g.foodAllergies}</span>
                      : <span>No food allergies recorded</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
