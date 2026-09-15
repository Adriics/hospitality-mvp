'use client'

import { useState } from 'react'
import { resolveRequest } from './actions'

type RequestCardProps = {
  id: string
  tableNumber: number
  type: string
}

export default function RequestCard({
  id,
  tableNumber,
  type,
}: RequestCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleResolve() {
    try {
      setLoading(true)

      await resolveRequest(id)

      window.location.reload()
    } catch (error) {
      console.error('Error al resolver:', error)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">
            Mesa {tableNumber}
          </p>

          <p className="mt-1 text-gray-600">
            {getRequestLabel(type)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResolve}
          disabled={loading}
          className="rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Atendido'}
        </button>
      </div>
    </div>
  )
}

function getRequestLabel(type: string) {
  switch (type) {
    case 'WAITER':
      return '🧑‍🍳 Necesita al camarero'

    case 'BILL':
      return '🧾 Quiere la cuenta'

    case 'OTHER':
      return '🥤 Necesita algo'

    case 'PROBLEM':
      return '⚠️ Tiene un problema'

    default:
      return 'Nueva petición'
  }
}