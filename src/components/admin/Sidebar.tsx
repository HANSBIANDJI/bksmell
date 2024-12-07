'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
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
  const pathname = usePathname();
  const { logout } = useAdmin();

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 w-full px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}