'use server'

import { supabase } from '@/lib/supabase/client'

export async function createRequest(
  token: string,
  type: string,
) {
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id, restaurant_id')
    .eq('token', token)
    .single()

  if (tableError || !table) {
    throw new Error('Mesa no encontrada')
  }

  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      restaurant_id: table.restaurant_id,
      table_id: table.id,
      type,
      status: 'PENDING',
    })
    .select('id')
    .single()

  if (error || !request) {
    throw new Error(error?.message ?? 'No se ha podido crear la petición')
  }

  return {
    success: true,
    requestId: request.id,
  }
}