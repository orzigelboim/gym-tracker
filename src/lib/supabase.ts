import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fsjyprlgvqvmtctdzeqf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_P0kjtIFthEMgy4ymIJe7ZA_zbZC8CV4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
