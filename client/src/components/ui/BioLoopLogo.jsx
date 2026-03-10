export default function BioLoopLogo({ className = 'h-5 w-5', stroke = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M18 10c-7.8 4.6-13 13.1-13 22.8C5 47.3 16.7 59 31.2 59c14 0 25.5-10.9 26.2-24.7" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M45.5 11.2 56 9l-2.2 10.4" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32.6 23.2c-3.1 4.3-6.5 8.8-6.5 13.2 0 5.1 4 9.1 9.1 9.1s9.1-4 9.1-9.1c0-3.1-1.9-6.1-4.6-9.6-.9 2.6-2.6 4.2-4.7 4.2-2.8 0-4.7-2.9-2.4-7.8Z" fill={stroke} opacity="0.95" />
    </svg>
  )
}
