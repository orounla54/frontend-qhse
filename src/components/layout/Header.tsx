import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeaderProps {
  title?: string;
  notifications?: number;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "QHSE Management", 
  notifications = 0,
  userName = "Utilisateur"
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Actions utilisateur */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications > 0 && (
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
              >
                {notifications > 99 ? '99+' : notifications}
              </Badge>
            )}
          </Button>

          {/* Menu utilisateur */}
          <div className="relative group">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{userName}</span>
            </Button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
