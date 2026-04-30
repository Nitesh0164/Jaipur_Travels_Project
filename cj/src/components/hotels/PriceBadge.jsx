import React from 'react';
import { motion } from 'framer-motion';

/**
 * Works with both LiveHotelResult (price/vendor) and legacy DB shapes (priceMin/cheapestVendor).
 */
export default function PriceBadge({ priceType, price, priceMin, priceMax, currency, vendor, cheapestVendor }) {
  const isLive        = priceType === 'LIVE';
  const isEstimated   = priceType === 'ESTIMATED';
  const isUnavailable = priceType === 'UNAVAILABLE' || (!isLive && !isEstimated);

  // Resolve price & vendor from either shape
  const displayPrice  = price  ?? priceMin  ?? null;
  const displayVendor = vendor ?? cheapestVendor ?? null;

  const cur = currency || 'INR';
  const sym = cur === 'INR' ? '₹' : cur;

  let priceText = 'Price on request';
  if (displayPrice != null) {
    const p = Number(displayPrice);
    if (!isNaN(p)) {
      priceText = `${sym}${p.toLocaleString()} / night`;
      if (priceMax && Number(priceMax) > p) {
        priceText = `${sym}${p.toLocaleString()} – ${sym}${Number(priceMax).toLocaleString()} / night`;
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-base font-bold text-ink">{priceText}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        {isLive && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                       bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Live Price
          </motion.span>
        )}
        {isEstimated && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                           bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Estimated
          </span>
        )}
        {isUnavailable && !isLive && !isEstimated && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                           bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
            Unavailable
          </span>
        )}

        {isLive && displayVendor && (
          <span className="text-[10px] text-ink-muted">
            via <span className="font-medium text-primary">{displayVendor}</span>
          </span>
        )}
      </div>
    </div>
  );
}
