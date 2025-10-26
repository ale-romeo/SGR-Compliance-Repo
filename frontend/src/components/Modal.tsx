import { useEffect, useState } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  widthClass?: string // e.g., 'max-w-lg'
}

export default function Modal({ open, onClose, title, children, widthClass = 'max-w-2xl' }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!open) return
    setMounted(true)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // lock scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      setMounted(false)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${widthClass} mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {title ? (
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">
              <span aria-hidden>✕</span>
            </button>
          </div>
        ) : null}
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
