'use client'

import { useEffect, useState } from 'react'
import { resolveRequest } from './actions'

type RequestCardProps = {
  id: string
  tableNumber: number
  type: string
  createdAt: string
}

export default function RequestCard({
  id,
  tableNumber,
  type,
  createdAt,
}: RequestCardProps) {
  const [loading, setLoading] = useState(false)
  const [waitingTime, setWaitingTime] = useState(
    getWaitingTime(createdAt),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingTime(getWaitingTime(createdAt))
    }, 60_000)

    return () => {
      clearInterval(interval)
    }
  }, [createdAt])

  async function handleResolve() {
    try {
      setLoading(true)

      await resolveRequest(id)
    } catch (error) {
      console.error('Error al resolver:', error)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900">
            Mesa {tableNumber}
          </p>

          <p className="mt-2 text-base font-medium text-gray-700">
            {getRequestLabel(type)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {waitingTime}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResolve}
          disabled={loading}
          className="shrink-0 rounded-xl bg-black px-5 py-3 font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {loading ? '...' : 'Atendido'}
        </button>
      </div>
    </div>
  )
}

function getWaitingTime(createdAt: string) {
  const createdTime = new Date(createdAt).getTime()
  const currentTime = Date.now()

  const differenceInMinutes = Math.max(
    0,
    Math.floor(
      (currentTime - createdTime) / 60_000,
    ),
  )

  if (differenceInMinutes === 0) {
    return 'Hace menos de 1 min'
  }

  if (differenceInMinutes === 1) {
    return 'Hace 1 min'
  }

  return `Hace ${differenceInMinutes} min`
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
