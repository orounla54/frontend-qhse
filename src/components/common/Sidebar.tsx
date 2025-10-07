import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  AlertCircle, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle, 
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from './Button';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  currentPage: string;
  onPageChange: (pageId: string) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentPage,
  onPageChange,
  className,
  collapsed = false,
  onToggleCollapse,
  user,
  onLogout,
  onThemeToggle,
  isDarkMode = false
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = currentPage === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onPageChange(item.id);
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            isActive && "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
            !isActive && "text-gray-700 dark:text-gray-300",
            level > 0 && "ml-6",
            collapsed && "justify-center px-2"
          )}
        >
          <Icon 
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-colors duration-200",
              isActive && "text-primary-600 dark:text-primary-400",
              !isActive && "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            )} 
          />
          
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full dark:bg-primary-900 dark:text-primary-200">
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )} 
                />
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              QHSE
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onThemeToggle}
          className="w-full justify-start"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              {!collapsed && "Mode clair"}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              {!collapsed && "Mode sombre"}
            </>
          )}
        </Button>

        {/* User Info */}
        {user && !collapsed && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "Déconnexion"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 