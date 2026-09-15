import { supabase } from '@/lib/supabase/client'

export default async function Home() {
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Restaurantes
      </h1>

      <pre className="mt-4">
        {JSON.stringify(restaurants, null, 2)}
      </pre>
    </main>
  )
}