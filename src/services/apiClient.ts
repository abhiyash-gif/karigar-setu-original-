import { Product, BuyerEnquiry, ArtisanProfile } from '../types';

const API_BASE = '/api';

export const apiClient = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  async getDrafts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/drafts`);
    if (!res.ok) throw new Error('Failed to fetch drafts');
    return res.json();
  },
  async getCurrentDraft(): Promise<Partial<Product> | null> {
    const res = await fetch(`${API_BASE}/products/drafts/current`);
    if (!res.ok) throw new Error('Failed to fetch current draft');
    const data = await res.json();
    return data.empty ? null : data;
  },
  async saveCurrentDraft(draft: Partial<Product>): Promise<void> {
    const res = await fetch(`${API_BASE}/products/drafts/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
    if (!res.ok) throw new Error('Failed to save current draft');
  },
  async createProduct(product: Partial<Product>): Promise<{success: boolean, id: string}> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },
  async createDraft(product: Partial<Product>): Promise<{success: boolean, id: string}> {
    const res = await fetch(`${API_BASE}/products/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to create draft');
    return res.json();
  },
  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },
  async deleteDraft(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/drafts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete draft');
  },
  
  // ORDERS (Enquiries in UI)
  async getOrders(): Promise<BuyerEnquiry[]> {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      productId: d.product_id,
      productName: d.product_name,
      buyerName: d.buyer_name,
      buyerType: d.buyer_type,
      buyerLocation: d.buyer_location,
      quantityRequested: d.quantity,
      offeredPricePerUnit: d.total / (d.quantity || 1),
      message: d.message,
      date: d.created_at,
      status: d.status,
      verifiedBadge: true
    }));
  },
  async updateOrderStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
  },
  
  // AUTH (Mock)
  async getMe(): Promise<{success: boolean, user: any}> {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }
};
