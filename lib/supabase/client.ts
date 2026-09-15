import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log('SUPABASE URL:', supabaseUrl)
console.log(
  'SUPABASE KEY PREFIX:',
  supabasePublishableKey?.slice(0, 20),
)

export const supabase = createClient(
  supabaseUrl!,
  supabasePublishableKey!,
)