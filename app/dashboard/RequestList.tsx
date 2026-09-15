'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import RequestCard from './RequestCard'

type Request = {
  id: string
  type: string
  status: string
  created_at: string
  table: {
    number: number
  }
}

type RequestListProps = {
  initialRequests: Request[]
}

export default function RequestList({
  initialRequests,
}: RequestListProps) {
  const [requests, setRequests] = useState(initialRequests)

  useEffect(() => {
    const channel = supabase
      .channel('requests-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
        },
        async (payload) => {
          console.log('🔥 NUEVA REQUEST:', payload)

          const newRequest = payload.new as {
            id: string
            type: string
            status: string
            created_at: string
            table_id: string
          }

          if (newRequest.status !== 'PENDING') {
            return
          }

          const { data: table, error } = await supabase
            .from('tables')
            .select('number')
            .eq('id', newRequest.table_id)
            .single()

          if (error || !table) {
            console.error(
              'Error obteniendo mesa:',
              error,
            )
            return
          }

          setRequests((currentRequests) => {
            if (
              currentRequests.some(
                (request) => request.id === newRequest.id,
              )
            ) {
              return currentRequests
            }

            return [
              ...currentRequests,
              {
                id: newRequest.id,
                type: newRequest.type,
                status: newRequest.status,
                created_at: newRequest.created_at,
                table: {
                  number: table.number,
                },
              },
            ]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          console.log('🔄 REQUEST ACTUALIZADA:', payload)

          const updatedRequest = payload.new as {
            id: string
            status: string
          }

          if (updatedRequest.status === 'RESOLVED') {
            setRequests((currentRequests) =>
              currentRequests.filter(
                (request) =>
                  request.id !== updatedRequest.id,
              ),
            )
          }
        },
      )
      .subscribe((status) => {
        console.log(
          '📡 REALTIME STATUS:',
          status,
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          No hay peticiones pendientes.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          id={request.id}
          tableNumber={request.table.number}
          type={request.type}
        />
      ))}
    </div>
  )
}