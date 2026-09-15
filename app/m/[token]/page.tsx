import { supabase } from '@/lib/supabase/client'
import TableActions from './TableActions'

type Props = {
  params: Promise<{
    token: string
  }>
}

export default async function TablePage({ params }: Props) {
  const { token } = await params

  const { data: table, error } = await supabase
    .from('tables')
    .select(`
      id,
      number,
      token,
      restaurant:restaurants (
        id,
        name
      )
    `)
    .eq('token', token)
    .single()

  if (error || !table) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <h1 className="text-xl font-semibold">
          Mesa no encontrada
        </h1>
      </main>
    )
  }

  return (
  <main className="min-h-screen bg-gray-100 px-4 py-8">
    <div className="mx-auto max-w-md">
      <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Bienvenido a
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {table.restaurant.name}
        </h1>

        <div className="mt-3 inline-block rounded-full bg-gray-100 px-4 py-2">
          <span className="text-sm font-semibold text-gray-700">
            Mesa {table.number}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          ¿En qué podemos ayudarte?
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Pulsa una opción y avisaremos al personal.
        </p>
      </div>

      <TableActions token={token} />
    </div>
  </main>
)
}