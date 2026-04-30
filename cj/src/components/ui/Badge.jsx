const COLORS = {
  Heritage:    'bg-amber-100 text-amber-800',
  Food:        'bg-orange-100 text-orange-800',
  Cafes:       'bg-emerald-100 text-emerald-800',
  Cafe:        'bg-emerald-100 text-emerald-800',
  Shopping:    'bg-pink-100 text-pink-800',
  'Hidden Gems': 'bg-violet-100 text-violet-800',
  'Hidden Gem':  'bg-violet-100 text-violet-800',
  Nature:      'bg-green-100 text-green-800',
  Photography: 'bg-blue-100 text-blue-800',
  Museum:      'bg-indigo-100 text-indigo-800',
  UNESCO:      'bg-yellow-100 text-yellow-800',
  'Must-see':  'bg-red-100 text-red-700',
  Free:        'bg-teal-100 text-teal-700',
  default:     'bg-gray-100 text-gray-600',
}

export default function Badge({ label, className = '' }) {
  const color = COLORS[label] ?? COLORS.default
  return (
    <span className={`badge ${color} ${className}`}>{label}</span>
  )
}
