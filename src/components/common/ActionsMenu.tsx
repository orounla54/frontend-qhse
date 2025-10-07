import React from 'react';

type ActionsMenuProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'md';
};

const ActionsMenu: React.FC<ActionsMenuProps> = ({ onView, onEdit, onDelete, size = 'md' }) => {
  const btnClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1">
      {onView && (
        <button type="button" onClick={onView} className={`${btnClass} rounded border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700`} title="Voir">
          <span className="material-icons-outlined align-middle text-base">visibility</span>
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className={`${btnClass} rounded border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-200 dark:hover:bg-blue-900/20`} title="Modifier">
          <span className="material-icons-outlined align-middle text-base">edit</span>
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className={`${btnClass} rounded border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-200 dark:hover:bg-red-900/20`} title="Supprimer">
          <span className="material-icons-outlined align-middle text-base">delete</span>
        </button>
      )}
    </div>
  );
};

export default ActionsMenu;







