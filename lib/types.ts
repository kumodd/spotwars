// Shared TypeScript types matching the Supabase schema

export interface Board {
  id: string
  name: string
  slug: string
  type: 'global' | 'category' | 'geo' | 'stage' | 'theme'
  category?: string
  entry_fee: number
  min_overtake_increment: number
  max_positions: number
  is_active: boolean
  description?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  founder_id: string
  name: string
  url: string
  logo_url?: string
  tagline: string
  description?: string
  category: string
  country: string
  pricing: string
  tags: string[]
  social_links: Record<string, string>
  screenshots: string[]
  founder_name?: string
  company_name?: string
  total_spend: number
  click_count: number
  impression_count: number
  spot_score: number
  momentum_score: number
  status: 'pending' | 'active' | 'paused' | 'banned'
  featured: boolean
  created_at: string
  updated_at: string
  // Joined from board_positions
  position?: number
  previous_position?: number
  spend_on_board?: number
}

export interface BoardPosition {
  id: string
  product_id: string
  board_id: string
  position: number
  spend_on_board: number
  previous_position?: number
  position_changed_at: string
  entered_at: string
  product?: Product
}

export interface Bid {
  id: string
  product_id: string
  board_id: string
  founder_id: string
  amount: number
  type: 'entry' | 'attack' | 'defense' | 'boost'
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  position_before?: number
  position_after?: number
  target_product_id?: string
  notes?: string
  created_at: string
  verified_at?: string
}

export interface ActivityEvent {
  id: string
  event_type:
    | 'product_entered'
    | 'overtake'
    | 'defense'
    | 'milestone_clicks'
    | 'milestone_spend'
    | 'reached_top10'
    | 'reached_top3'
    | 'reached_number1'
    | 'trending'
    | 'fastest_riser'
    | 'battle_started'
    | 'battle_ended'
  board_id?: string
  product_id?: string
  target_product_id?: string
  data: Record<string, unknown>
  is_public: boolean
  created_at: string
  product?: Product
  target_product?: Product
  board?: Board
}

export interface Profile {
  id: string
  display_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  twitter?: string
  linkedin?: string
  role: 'founder' | 'admin' | 'moderator'
  spot_points: number
  prediction_rating: number
  correct_predictions: number
  total_predictions: number
  created_at: string
  updated_at: string
}

export interface DailySnapshot {
  id: string
  product_id: string
  board_id: string
  date: string
  spend: number
  clicks: number
  impressions: number
  position?: number
}

// Razorpay types
export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

// Board entry with enriched data
export interface BoardEntry {
  position: number
  previous_position?: number
  spend_on_board: number
  product: Product
  movement: number // positive = moved up, negative = moved down
}

// For the live board view
export interface LiveBoardData {
  board: Board
  entries: BoardEntry[]
  total_products: number
  last_updated: string
}

export const CATEGORIES = [
  'AI & ML',
  'SaaS',
  'Developer Tools',
  'E-commerce',
  'Fintech',
  'Education',
  'Consumer Apps',
  'Creator Tools',
  'Gaming',
  'Health & Wellness',
  'Social',
  'Productivity',
  'Marketing',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]

export const PRICING_OPTIONS = [
  'Free',
  'Freemium',
  'Paid',
  'Free Trial',
  'Open Source',
  'Enterprise',
] as const

export const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
] as const
