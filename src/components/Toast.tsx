import './Toast.css'

export interface ToastData {
  message: string
  undo: () => void
}

interface Props {
  toast: ToastData | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: Props) {
  return (
    <div className="toast" role="status" hidden={!toast}>
      <span>{toast?.message}</span>
      <button
        type="button"
        onClick={() => {
          toast?.undo()
          onDismiss()
        }}
      >
        Undo
      </button>
    </div>
  )
}
