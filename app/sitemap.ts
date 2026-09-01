import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://internetbillboard.space';
  const supabase = await createClient();

  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('status', 'active');

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const staticRoutes = [
    '',
    '/internet-billboard',
    '/product-visibility',
    '/product-promotion',
    '/online-billboard',
    '/product-discovery',
    '/new-products',
    '/trending',
    '/how-it-works',
    '/for-founders',
    '/compare/internetbillboard-vs-ownspot',
    '/compare/internetbillboard-vs-spotwars',
    '/alternatives/ownspot',
    '/alternatives/spotwars',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes, ...productUrls];
}
