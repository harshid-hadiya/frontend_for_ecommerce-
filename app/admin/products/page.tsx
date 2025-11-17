'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, Plus, Trash, Pencil } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, token } = useAuth();
  const router = useRouter();

  const normalize = (raw: any): Product => ({
    id: raw._id || raw.id,
    sku: raw.sku,
    name: raw.name,
    price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
    category: raw.category,
    updatedAt: raw.updatedAt || raw.updatedAt === 0 ? raw.updatedAt : new Date().toISOString(),
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiCall('/products', 'GET', undefined, token);
        if (Array.isArray(data)) {
          setProducts(data.map(normalize));
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Load products error', err);
        setError(err?.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user, token, router]);

  const openAddForm = () => {
    setEditId(null);
    setFormData({ sku: '', name: '', price: '', category: '' });
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setFormData({ sku: p.sku, name: p.name, price: p.price.toString(), category: p.category });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.sku.trim() || !formData.name.trim() || !formData.category.trim() || formData.price === '') {
        setError('Please fill all fields');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price as unknown as string),
        category: formData.category.trim(),
      };

      if (editId) {
        const updatedRaw = await apiCall(`/products/${editId}`, 'PUT', payload, token);
        const updated = normalize(updatedRaw);
        setProducts(prev => prev.map(p => (p.id === editId ? updated : p)));
        setEditId(null);
      } else {
        const createdRaw = await apiCall('/products', 'POST', payload, token);
        const created = normalize(createdRaw);
        setProducts(prev => [...prev, created]);
      }

      setFormData({ sku: '', name: '', price: '', category: '' });
      setShowForm(false);
    } catch (err: any) {
      console.error('submit error', err);
      setError(err?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setError('');
    try {
      await apiCall(`/products/${id}`, 'DELETE', undefined, token);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editId === id) {
        setEditId(null);
        setShowForm(false);
        setFormData({ sku: '', name: '', price: '', category: '' });
      }
    } catch (err: any) {
      console.error('delete error', err);
      setError(err?.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Products</h1>
          <Button onClick={openAddForm} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editId ? 'Edit Product' : 'Create New Product'}</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      placeholder="P001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      placeholder="Product Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      placeholder="99.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      step="0.01"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="Electronics"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (editId ? 'Updating...' : 'Creating...') : (editId ? 'Update Product' : 'Create Product')}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                      setFormData({ sku: '', name: '', price: '', category: '' });
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Updated</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">{product.sku}</td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4 font-semibold">₹{product.price.toFixed(2)}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}
                  </td>

                  <td className="p-4 flex gap-3">
                    <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
