import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BedDouble, Info, TrendingUp, Layers, Globe } from 'lucide-react';
import { useHotelsStore } from '../store/useHotelsStore';
import HotelCard from '../components/hotels/HotelCard';
import HotelFilters from '../components/hotels/HotelFilters';
import HotelSkeleton from '../components/hotels/HotelSkeleton';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function HotelsPage() {
  const {
    hotels, loading, error, warning,
    totalHotelCount, totalPagesFetched, totalResultsReturned,
    filters, setFilters, searchLive, fetchDbHotels, searchDbHotels, clearError, resetFilters,
  } = useHotelsStore();

  // Load DB hotels on mount
  useEffect(() => {
    if (hotels.length === 0 && !loading) {
      fetchDbHotels();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => searchDbHotels();
  const handleLiveSearch = () => searchLive();

  const handleReset = () => {
    resetFilters();
    fetchDbHotels();
  };

  return (
    <div className="min-h-screen bg-surface pb-20">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative pt-24 pb-16 px-4 overflow-hidden bg-gradient-to-b from-primary/10 to-surface">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-full
                        bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full
                        bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60
                            backdrop-blur border border-white shadow-sm mb-5">
              <BedDouble size={15} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Jaipur Hotel Search</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-4 leading-tight">
              Find Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Perfect Stay
              </span>
              {' '}in Jaipur
            </h1>

            <p className="text-lg text-ink-muted max-w-2xl mx-auto mb-8">
              Browse our curated list of local hotels, or check live prices from multiple platforms.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Layers,    label: 'Curated Local Database' },
                { icon: Globe,     label: 'Optional Live Prices' },
                { icon: TrendingUp, label: 'Estimated Pricing' },
              ].map(({ icon: Icon, label }) => (
                <span key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70
                             backdrop-blur border border-white text-xs font-semibold text-ink shadow-sm">
                  <Icon size={13} className="text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main container ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

        {/* Filters */}
        <HotelFilters
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onSearchLive={handleLiveSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl
                       flex items-start gap-3 text-red-800"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </motion.div>
        )}

        {/* Warning (degraded / partial results) */}
        {warning && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl
                       flex items-start gap-3 text-amber-800"
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{warning}</p>
            <button onClick={clearError} className="text-amber-400 hover:text-amber-600 text-lg leading-none">×</button>
          </motion.div>
        )}

        {/* Results metadata bar */}
        {!loading && hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <h2 className="text-xl font-bold text-ink">
              {totalResultsReturned || hotels.length} Hotels Found
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              {totalHotelCount > 0 && (
                <>
                  <span>🏨 {totalHotelCount.toLocaleString()} total in Jaipur</span>
                  <span>·</span>
                </>
              )}
              {totalPagesFetched > 0 && (
                <>
                  <span>📄 {totalPagesFetched} pages fetched</span>
                  <span>·</span>
                </>
              )}
              <span className="font-semibold text-emerald-600">⚡ Live Prices</span>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <HotelSkeleton />
        ) : hotels.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {hotels.map((hotel, i) => (
              <motion.div key={hotel.sourceHotelId || hotel.id || i} variants={fadeUp}>
                <HotelCard hotel={hotel} />
              </motion.div>
            ))}
          </motion.div>
        ) : !error && !warning ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center bg-white rounded-2xl border border-border shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
              <BedDouble size={30} className="text-ink-muted" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">No hotels found</h3>
            <p className="text-ink-muted mb-6 max-w-sm mx-auto text-sm">
              No results found in our database. Try adjusting your search filters or try checking live prices.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl
                           hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Search Again
              </button>
              <button
                onClick={handleLiveSearch}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-xl
                           hover:from-emerald-600 hover:to-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
              >
                Check Live Prices
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
