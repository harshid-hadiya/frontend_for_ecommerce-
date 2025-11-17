'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/lib/api';

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface TopCustomer {
  name: string;
  orders: number;
  spent: number;
}

interface CategorySales {
  category: string;
  totalSales: number;
  itemsSold: number;
  avgPrice: number;
}

export default function ReportsPage() {
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiCall('/products/dashboard', 'GET', undefined, token);
        console.log(data);

        if (!data) throw new Error('Empty response from server');

        const parsedDaily: DailyRevenue[] = (data.dailyRevenue || []).map((item: any) => {
          const revenueRaw = item.revenue ?? item.revenueAmount ?? '';
          const revenueNum =
            typeof revenueRaw === 'string'
              ? parseFloat(revenueRaw.replace(/[^\d.-]/g, '')) || 0
              : Number(revenueRaw) || 0;
          return {
            date: item.date,
            revenue: revenueNum,
          };
        });
        setDailyRevenue(parsedDaily);

        const parsedTop: TopCustomer[] = (data.topCustomers || []).map((c: any) => {
          const spentRaw = c.spent ?? c.totalSpent ?? '';
          const spentNum =
            typeof spentRaw === 'string'
              ? parseFloat(spentRaw.replace(/[^\d.-]/g, '')) || 0
              : Number(spentRaw) || 0;
          return {
            name: c.name ?? c.userName ?? 'Unknown',
            orders: Number(c.orders ?? c.totalOrders ?? c.orderCount ?? 0),
            spent: spentNum,
          };
        });
        setTopCustomers(parsedTop);

        const parsedCategory: CategorySales[] = (data.categorySales || []).map((cat: any) => {
          const totalRaw = cat.totalSales ?? cat.total ?? '';
          const totalNum =
            typeof totalRaw === 'string'
              ? parseFloat(totalRaw.replace(/[^\d.-]/g, '')) || 0
              : Number(totalRaw) || 0;

          const items = Number(cat.itemsSold ?? cat.itemCount ?? cat.items ?? 0);
          const avgRaw = cat.avgPrice ?? (items ? (totalNum / items) : 0);
          const avgNum =
            typeof avgRaw === 'string'
              ? parseFloat(avgRaw.replace(/[^\d.-]/g, '')) || 0
              : Number(avgRaw) || 0;

          return {
            category: cat.category,
            totalSales: totalNum,
            itemsSold: items,
            avgPrice: avgNum,
          };
        });
        setCategorySales(parsedCategory);
      } catch (err: any) {
        console.error('Reports fetch error:', err);
        setError(err?.message || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchReports();
  }, [user, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">Please login to view reports</p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Reports & Analytics</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (SQL)</CardTitle>
              <CardDescription>Revenue aggregation by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyRevenue.length === 0 && <div>No data</div>}
                {dailyRevenue.map(item => (
                  <div key={item.date} className="flex justify-between items-center pb-4 border-b last:border-0">
                    <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="text-lg font-bold text-primary">₹{item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers (SQL)</CardTitle>
              <CardDescription>Best spending customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.length === 0 && <div>No data</div>}
                {topCustomers.map(customer => (
                  <div key={customer.name} className="pb-4 border-b last:border-0">
                    <p className="font-semibold">{customer.name}</p>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Orders: {customer.orders}</span>
                      <span className="font-semibold text-foreground">₹{customer.spent.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sales by Category (MongoDB)</CardTitle>
              <CardDescription>Product category performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-right p-4 font-semibold">Total Sales</th>
                      <th className="text-right p-4 font-semibold">Items Sold</th>
                      <th className="text-right p-4 font-semibold">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySales.length === 0 && (
                      <tr><td className="p-4" colSpan={4}>No data</td></tr>
                    )}
                    {categorySales.map(category => (
                      <tr key={category.category} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">{category.category}</td>
                        <td className="text-right p-4 font-semibold">₹{category.totalSales.toFixed(2)}</td>
                        <td className="text-right p-4">{category.itemsSold}</td>
                        <td className="text-right p-4">₹{category.avgPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
