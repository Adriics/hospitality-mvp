'use client'
import { createRequest } from './actions'

type TableActionsProps = {
  token: string
}

export default function TableActions({ token }: TableActionsProps) {
  async function handleRequest(type: string) {
  try {
    await createRequest(token, type)

    console.log('Petición creada:', type)
  } catch (error) {
    console.error('Error:', error)
  }
}

  return (
    <div className="grid gap-3">
      <button
        onClick={() => handleRequest('WAITER')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98]"
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
        onClick={() => handleRequest('BILL')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98]"
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
        onClick={() => handleRequest('OTHER')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98]"
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
        onClick={() => handleRequest('PROBLEM')}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition active:scale-[0.98]"
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
    </div>
  )
}