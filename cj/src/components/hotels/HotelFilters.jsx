import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Star, Calendar, Users, Home as HomeIcon, RotateCcw, Zap } from 'lucide-react';

const AREAS = [
  'All Areas', 'MI Road', 'Bani Park', 'C-Scheme', 'Vaishali Nagar',
  'Malviya Nagar', 'Tonk Road', 'Amer Road', 'Sindhi Camp',
  'Mansarovar', 'Near Airport', 'Civil Lines', 'Johari Bazaar',
];

export default function HotelFilters({ filters, onChange, onSearch, onSearchLive, onReset, loading }) {
  const handle = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };
  const handleNum = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value === '' ? '' : Number(value) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-2xl p-5 mb-8"
    >
      <div className="flex flex-col gap-5">

        {/* Row 1 — Text + Area + Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <input
              type="text" name="searchText"
              placeholder="Hotel name…"
              value={filters.searchText || ''}
              onChange={handle}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <select
              name="area" value={filters.area || 'All Areas'}
              onChange={handle}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="relative flex items-center gap-2 sm:col-span-2 lg:col-span-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <input
              type="number" name="budgetMin" placeholder="Min ₹"
              value={filters.budgetMin || ''}
              onChange={handleNum}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="text-ink-muted flex-shrink-0">–</span>
            <input
              type="number" name="budgetMax" placeholder="Max ₹"
              value={filters.budgetMax || ''}
              onChange={handleNum}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Row 2 — Dates + Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border/60">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <input
              type="date" name="checkIn"
              value={filters.checkIn || ''}
              onChange={handle}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <input
              type="date" name="checkOut"
              value={filters.checkOut || ''}
              onChange={handle}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
              <input
                type="number" name="adults" min="1" title="Adults"
                value={filters.adults || 2}
                onChange={handleNum}
                className="w-full pl-9 pr-2 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="relative w-full">
              <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
              <input
                type="number" name="rooms" min="1" title="Rooms"
                value={filters.rooms || 1}
                onChange={handleNum}
                className="w-full pl-9 pr-2 py-2.5 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={15} />
            <select
              name="rating" value={filters.rating || ''}
              onChange={handle}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Any Rating</option>
              <option value="9">9+ Excellent</option>
              <option value="8">8+ Very Good</option>
              <option value="7">7+ Good</option>
              <option value="6">6+ Pleasant</option>
            </select>
          </div>
        </div>

        {/* Row 3 — Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                         bg-primary hover:bg-primary-dark
                         shadow-md shadow-primary/10 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching…' : (
                <>
                  <Search size={16} />
                  Search Hotels
                </>
              )}
            </button>
            <button
              onClick={onSearchLive}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-emerald-500 to-emerald-600
                         hover:from-emerald-600 hover:to-emerald-700
                         shadow-lg shadow-emerald-500/20 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Zap size={16} className="fill-white" />
              Check Live Prices
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
