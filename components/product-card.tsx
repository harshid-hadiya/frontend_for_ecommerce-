'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  updatedAt: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="text-sm text-muted-foreground">{product.sku}</div>
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardDescription>{product.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-2xl font-bold text-primary mb-2">₹{product.price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(product.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={handleAddToCart} className="w-full gap-2 mt-4">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
