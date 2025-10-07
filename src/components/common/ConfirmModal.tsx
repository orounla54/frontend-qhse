import React from 'react'

type ConfirmModalProps = {
  isOpen: boolean
  title?: string
  message?: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirmation',
  message = 'Voulez-vous continuer ?',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {message && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




