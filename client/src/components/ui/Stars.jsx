export default function Stars({ value = 0, onChange, size = 24, readonly = false }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          style={{ fontSize: size, filter: star <= value ? 'none' : 'grayscale(100%) opacity(0.3)', color: '#a78bfa' }}>
          ★
        </button>
      ))}
    </div>
  )
}
