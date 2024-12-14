import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    href: '/admin/dashboard',
    title: 'Tableau de bord',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    title: 'Produits',
    icon: Package,
  },
  {
    href: '/admin/orders',
    title: 'Commandes',
    icon: ShoppingCart,
  },
  {
    href: '/admin/settings',
    title: 'Paramètres',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAdmin();

  return (
    <div className="flex h-screen w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              currentPath === item.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  );
}