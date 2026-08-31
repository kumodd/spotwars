import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('products').insert({
    founder_id: 'a1005a96-a83d-4299-aec5-1c5c165f14e7', // I'll use a dummy UUID, wait, it must exist in auth.users!
    name: 'Test',
    url: 'https://test.com',
    tagline: 'Test',
    category: 'SaaS',
    country: 'IN',
    pricing: 'Free',
    tags: [],
    social_links: {},
    screenshots: [],
    status: 'pending'
  });
  console.log(error);
}
test();
