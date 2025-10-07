import React from 'react';
import { 
  Home, 
  FileText, 
  AlertTriangle, 
  Shield, 
  GraduationCap, 
  CheckCircle, 
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Audits', icon: FileText, href: '/audits', badge: '5' },
  { label: 'Incidents', icon: AlertTriangle, href: '/incidents', badge: '3' },
  { label: 'Risques', icon: Shield, href: '/risques', badge: '12' },
  { label: 'Formations', icon: GraduationCap, href: '/formations', badge: '8' },
  { label: 'Conformité', icon: CheckCircle, href: '/conformite', badge: '15' },
  { label: 'Statistiques', icon: BarChart3, href: '/stats' },
  { label: 'Configuration', icon: Settings, href: '/config' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  return (
    <aside className={cn(
      "bg-gray-900 text-white transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          {isOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-lg font-semibold">QHSE</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors duration-200",
                    "hover:bg-gray-800 hover:text-blue-400",
                    "text-gray-300"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle button */}
        {onToggle && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              <div className={cn(
                "w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
