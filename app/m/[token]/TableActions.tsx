'use client'

import { useEffect, useState } from 'react'
import { createRequest } from './actions'
import { supabase } from '@/lib/supabase/client'

type TableActionsProps = {
  token: string
}

export default function TableActions({
  token,
}: TableActionsProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    if (!requestId) {
      return
    }

    const channel = supabase
      .channel(`table-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          if (payload.new.status === 'RESOLVED') {
            setSent(false)
            setRequestId(null)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [requestId])

  async function handleRequest(type: string) {
    if (sending || sent) {
      return
    }

    try {
      setSending(true)

      const result = await createRequest(token, type)

      setRequestId(result.requestId)
      setSent(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>

        <h2 className="mt-5 text-xl font-bold text-gray-900">
          Hemos avisado al personal
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Enseguida atenderán tu petición.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={sending}
        onClick={() => handleRequest('WAITER')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
          🧑‍🍳
        </span>

        <div>
          <p className="font-semibold text-gray-900">
            Necesito al camarero
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Quiero hablar con alguien
          </p>
        </div>
      </button>

      <button
        type="button"
        disabled={sending}
        onClick={() => handleRequest('BILL')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl">
          🧾
        </span>

        <div>
          <p className="font-semibold text-gray-900">
            Quiero la cuenta
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Solicitar la cuenta de la mesa
          </p>
        </div>
      </button>

      <button
        type="button"
        disabled={sending}
        onClick={() => handleRequest('OTHER')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
          🥤
        </span>

        <div>
          <p className="font-semibold text-gray-900">
            Necesito algo
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Pedir una bebida u otra cosa
          </p>
        </div>
      </button>

      <button
        type="button"
        disabled={sending}
        onClick={() => handleRequest('PROBLEM')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl">
          ⚠️
        </span>

        <div>
          <p className="font-semibold text-gray-900">
            Tengo un problema
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Avisar al personal de un problema
          </p>
        </div>
      </button>

      {sending && (
        <p className="py-2 text-center text-sm text-gray-500">
          Avisando al personal...
        </p>
      )}
    </div>
  )
}