const API_BASE_URL = 'https://backend-for-ecommerce-1.onrender.com/api';

export async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    let errorMessage = 'API error';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || 'API error';
    } catch {
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'customer' | 'admin' = 'customer'
) {
  return apiCall('/auth/register', 'POST', { name, email, password, role });
}

export async function loginUser(email: string, password: string) {
  return apiCall('/auth/login', 'POST', { email, password });
}

export async function getProducts(token?: string) {
  return apiCall('/products', 'GET', undefined, token);
}

export async function createProduct(
  sku: string,
  name: string,
  price: number,
  category: string,
  token: string
) {
  return apiCall('/products', 'POST', { sku, name, price, category }, token);
}

export async function createOrder(
  userId: number,
  total: number,
  items: any[],
  token: string
) {
  const formattedItems = items.map(item => ({
    productId: String(item.productId),
    quantity: parseInt(item.quantity),
    priceAtPurchase: parseFloat(item.price),
  }));

  return apiCall(
    '/orders',
    'POST',
    {
      userId,
      total: parseFloat(String(total)),
      items: formattedItems,
    },
    token
  );
}

export async function getOrders(userId: number, date?: string, token?: string) {
  const queryString = date ? `?date=${date}` : '';
  return apiCall(`/orders/${userId}${queryString}`, 'GET', undefined, token);
}
