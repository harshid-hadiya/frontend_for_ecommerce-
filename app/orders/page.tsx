'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface OrderItem {
  orderId: number;
  total: number;
  createdAt: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { user, token } = useAuth();
  const router = useRouter();

  const fetchOrders = async (date?: string) => {
    try {
      setIsLoading(true);
      const queryString = date ? `?date=${date}` : '';
      const data = await apiCall(`/orders/${user?.id}${queryString}`, 'GET', undefined, token);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, token, router]);

  const handleDateFilter = () => {
    if (selectedDate) {
      fetchOrders(selectedDate);
    } else {
      fetchOrders();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">Please login to view your orders</p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const groupedOrders = orders.reduce((acc: Record<number, OrderItem[]>, order) => {
    if (!acc[order.orderId]) {
      acc[order.orderId] = [];
    }
    acc[order.orderId].push(order);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Your Orders</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Date Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Button onClick={handleDateFilter}>
                <Calendar className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate('');
                  fetchOrders();
                }}
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        {Object.keys(groupedOrders).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-6">No orders found</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([orderId, items]) => (
              <Card key={orderId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{orderId}</CardTitle>
                      <CardDescription>
                        {new Date(items[0].createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{items[0].total.toFixed(2)}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between pb-4 border-b border-border last:border-0">
                        <div>
                          <p className="font-semibold">Product ID: {item.productId}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × ₹{item.priceAtPurchase.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
