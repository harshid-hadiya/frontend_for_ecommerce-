'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, Home, Settings } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string): string => {
    return pathname === path
      ? 'bg-accent text-accent-foreground'
      : 'hover:bg-accent hover:text-accent-foreground';
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-xl p-2 rounded-md ${isActive('/')}`}
          >
            <Home className="w-6 h-6" />
            ShopHub
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm">Welcome, {user.name}</span>

                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${isActive('/admin')}`}
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}

                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative gap-2 ${isActive('/cart')}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {items.length > 0 && (
                      <span className="absolute top-0 right-0 bg-destructive text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isActive('/orders')}
                  >
                    Orders
                  </Button>
                </Link>

                {user.role === 'admin' && (
                  <Link href="/reports">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isActive('/reports')}
                    >
                      Reports
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="default" size="sm" className={isActive('/login')}>
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className={isActive('/register')}>
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
