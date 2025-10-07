import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File | null, previewUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
  disabled = false,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        onAvatarChange(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full overflow-hidden 
          border-4 border-white/20 bg-white/10 backdrop-blur-sm
          ${!disabled ? 'cursor-pointer hover:border-white/40 transition-all duration-200' : 'cursor-default'}
          ${isDragOver ? 'border-primary-400 bg-primary-50/20' : ''}
        `}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Image preview ou placeholder */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            <User className={iconSizes[size]} />
          </div>
        )}

        {/* Overlay hover */}
        {!disabled && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-6 w-6 mx-auto mb-1" />
              <span className="text-xs font-medium">
                {previewUrl ? 'Changer' : 'Ajouter'}
              </span>
            </div>
          </div>
        )}

        {/* Bouton supprimer */}
        {previewUrl && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAvatar();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Zone de drop visible pour les petits avatars */}
      {!previewUrl && size === 'sm' && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Upload className="h-4 w-4 text-white/70" />
        </div>
      )}

      {/* Instructions */}
      {!disabled && size !== 'sm' && (
        <div className="mt-2 text-center">
          <p className="text-xs text-white/70">
            Cliquez ou glissez une image
          </p>
          <p className="text-xs text-white/50">
            JPG, PNG (max 5MB)
          </p>
        </div>
      )}
    </div>
  );
};
