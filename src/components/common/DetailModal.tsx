import React from 'react';

type DetailModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, title = 'Détails', onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 my-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>
        <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200 text-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;


