'use server'

import { supabase } from '@/lib/supabase/client'

export async function resolveRequest(requestId: string) {
  const { error } = await supabase
    .from('requests')
    .update({
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}