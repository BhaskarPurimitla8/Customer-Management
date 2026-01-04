import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onClose?.(), 2500)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="close">×</button>
    </div>
  )
}
