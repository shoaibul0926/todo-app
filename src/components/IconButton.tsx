import type { ReactNode } from 'react'

interface Props {
  label: string
  on?: boolean
  onClick: () => void
  children: ReactNode
  [dataAttr: `data-${string}`]: string | undefined
}

export function IconButton({ label, on = false, onClick, children, ...data }: Props) {
  return (
    <button type="button" className={`icon-btn${on ? ' on' : ''}`} title={label} aria-label={label} onClick={onClick} {...data}>
      {children}
    </button>
  )
}
