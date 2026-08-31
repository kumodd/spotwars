// Format paise (integer) to INR currency string
export function formatINR(paise: number, compact = false): string {
  const rupees = paise / 100
  if (compact && rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`
  }
  if (compact && rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`
  }
  return `₹${rupees.toLocaleString('en-IN')}`
}

export function formatCurrency(amount: number, currency: "INR" | "USD"): string {
  if (currency === "USD") {
    return `$${(amount / 100).toFixed(2)}`;
  }
  return formatINR(amount);
}

// Format large numbers compactly
export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// Momentum badge color
export function getMomentumColor(momentum: number): string {
  if (momentum >= 50) return 'text-green-400'
  if (momentum >= 20) return 'text-emerald-400'
  if (momentum >= 0) return 'text-blue-400'
  if (momentum >= -20) return 'text-yellow-400'
  return 'text-red-400'
}

// Position movement indicator
export function getMovement(current: number, previous?: number): number {
  if (!previous) return 0
  return previous - current // positive = moved up in rank
}

// Rank badge label
export function getRankLabel(position: number): string {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return `#${position}`
}

// SpotScore color
export function getSpotScoreColor(score: number): string {
  if (score >= 80) return 'text-yellow-400'
  if (score >= 60) return 'text-green-400'
  if (score >= 40) return 'text-blue-400'
  return 'text-slate-400'
}

// Activity event emoji & text
export function getEventDisplay(eventType: string, data: Record<string, unknown>): { emoji: string; text: string } {
  switch (eventType) {
    case 'product_entered': return { emoji: '🚀', text: `entered the board at #${data.position}` }
    case 'overtake': return { emoji: '⚔️', text: `took #${data.new_position} from ${data.target_name}` }
    case 'defense': return { emoji: '🛡️', text: `defended position #${data.position}` }
    case 'reached_top10': return { emoji: '💥', text: 'entered the Top 10!' }
    case 'reached_top3': return { emoji: '🔥', text: 'entered the Top 3!' }
    case 'reached_number1': return { emoji: '👑', text: 'reached #1!' }
    case 'milestone_clicks': return { emoji: '🎉', text: `reached ${formatNumber(data.clicks as number)} clicks!` }
    case 'trending': return { emoji: '📈', text: 'is now trending!' }
    case 'fastest_riser': return { emoji: '🚀', text: 'is the Fastest Riser today!' }
    default: return { emoji: '⚡', text: 'made a move' }
  }
}

// Time ago formatter
export function timeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Cost to take a position
export function costToTake(currentSpend: number): number {
  return currentSpend + 100 // +₹1 (100 paise)
}

// Generate a unique session ID for tracking
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('sw_session_id')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('sw_session_id', id)
  }
  return id
}

// Razorpay script loader
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
