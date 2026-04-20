// utils/formatCurrency.js
export const fmt = (n, symbol='₹') => `${symbol}${Number(n).toLocaleString('en-IN')}`
export const fmtK = (n) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`
