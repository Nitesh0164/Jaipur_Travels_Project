import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  accent:    'btn-accent',
  ghost:     'btn-ghost',
  danger:    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-semibold text-sm hover:bg-red-100 active:scale-[0.98] transition-all duration-150 cursor-pointer',
}
const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: '',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const Button = forwardRef(({ variant='primary', size='md', loading=false, disabled=false, icon, iconRight, className='', children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})
Button.displayName = 'Button'
export default Button
