import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleClose = () => {
    onClose();
    // Reset to login mode when closing
    setTimeout(() => setMode('login'), 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md"
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 pt-12">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onClose={handleClose}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
