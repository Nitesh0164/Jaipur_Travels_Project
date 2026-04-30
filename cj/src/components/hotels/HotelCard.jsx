import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import PriceBadge from './PriceBadge';

export default function HotelCard({ hotel, onClick }) {
  // LiveHotelResult uses `price`/`vendor`; legacy DB hotels use `priceMin`/`cheapestVendor`
  const price      = hotel.price      ?? hotel.priceMin  ?? null;
  const price2     = hotel.price2     ?? hotel.priceMax  ?? null;
  const vendor     = hotel.vendor     ?? hotel.cheapestVendor ?? null;
  const ratingRaw  = hotel.rating;
  // MakCorps rating is 0–10; DB rating is 0–5. Normalise display to one decimal.
  const ratingDisplay = ratingRaw != null ? Number(ratingRaw).toFixed(1) : null;

  const amenities  = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-2xl shadow-sm border border-border overflow-hidden
                 cursor-pointer flex flex-col h-full
                 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
      onClick={() => onClick && onClick(hotel)}
    >
      {/* Image / gradient fallback */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-indigo-50 to-primary/10 flex-shrink-0">
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="1.2"
                 className="text-primary/30">
              <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/>
              <path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>
            </svg>
          </div>
        )}

        {/* Rating badge */}
        {ratingDisplay && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-ink px-2 py-1 rounded-lg
                          text-xs font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {ratingDisplay}
          </div>
        )}

        {/* Price type badge */}
        <div className="absolute top-3 right-3">
          {hotel.priceType === 'LIVE' ? (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white shadow"
            >
              LIVE
            </motion.span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-400 text-white shadow">
              EST
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-ink leading-snug line-clamp-2 mb-1">
          {hotel.name}
        </h3>

        {hotel.address && (
          <div className="flex items-start text-ink-muted text-xs mb-3 line-clamp-2">
            <MapPin size={12} className="mr-1 mt-0.5 flex-shrink-0" />
            {hotel.address}
          </div>
        )}

        {/* Amenities preview (only for DB hotels that have amenities) */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="flex items-center text-[10px] text-ink-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                <CheckCircle2 size={9} className="mr-1 text-emerald-500" />
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Vendor comparison */}
        {vendor && (
          <div className="text-[11px] text-ink-muted mb-3">
            Best price via <span className="font-semibold text-ink">{vendor}</span>
            {hotel.vendor2 && price2 && (
              <span className="ml-2 text-ink-muted/70">
                · {hotel.vendor2}: ₹{Number(price2).toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Price block pinned to bottom */}
        <div className="mt-auto pt-3 border-t border-border">
          <PriceBadge
            priceType={hotel.priceType}
            price={price}
            priceMin={hotel.priceMin}
            priceMax={hotel.priceMax}
            currency={hotel.currency || 'INR'}
            vendor={vendor}
          />
        </div>
      </div>
    </motion.div>
  );
}
