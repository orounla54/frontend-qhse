import React from 'react';
import { ModalProps } from './ModalMatierePremiere';

const ModalNonConformite: React.FC<ModalProps> = ({ isOpen, onClose, title = 'Non-Conformité' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>
        <div className="text-gray-600 dark:text-gray-300">Formulaire non-conformité à implémenter.</div>
      </div>
    </div>
  );
};

export default ModalNonConformite;


