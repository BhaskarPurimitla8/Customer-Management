export default function ConfirmDialog({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {description ? <div className="modal-desc">{description}</div> : null}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
