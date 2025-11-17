'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Welcome to ShopHub</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your premier destination for quality products at competitive prices
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <ShoppingCart className="w-5 h-5" />
                Shop Now
              </Button>
            </Link>
            {!user && (
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <ShoppingCart className="w-8 h-8 mb-2" />
              <CardTitle>Easy Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Browse our wide selection of products with advanced search and filtering.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2" />
              <CardTitle>Best Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get competitive pricing on all our premium products with regular discounts.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 mb-2" />
              <CardTitle>Secure Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your data is protected with JWT authentication and secure transactions.</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="mt-16 bg-card rounded-lg p-8 text-center border border-border">
            <h2 className="text-2xl font-bold mb-4">Ready to start shopping?</h2>
            <p className="text-muted-foreground mb-6">Join thousands of satisfied customers</p>
            <Link href="/register">
              <Button size="lg">Sign Up Today</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
