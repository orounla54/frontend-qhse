import React from 'react'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface ActionButtonsProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ActionButtons({ onView, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <button 
        onClick={onView}
        className="text-teal-600 hover:text-teal-900 dark:hover:text-teal-400"
        title="Voir"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button 
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
        title="Modifier"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button 
        onClick={onDelete}
        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
        title="Supprimer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
