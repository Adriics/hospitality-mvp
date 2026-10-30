import { supabase } from "@/lib/supabase/client";
import TableActions from "./TableActions";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function TablePage({ params }: Props) {
  const { token } = await params;

  const { data: table, error: tableError } = await supabase
    .from("tables")
    .select("id, number, restaurant_id")
    .eq("token", token)
    .single();

  if (tableError || !table) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <h1 className="text-xl font-semibold">Mesa no encontrada</h1>
      </main>
    );
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", table.restaurant_id)
    .single();

  if (restaurantError || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <h1 className="text-xl font-semibold">Restaurante no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Marca */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] text-[#c9a56b]">
            TAVRO
          </p>

          <div className="mx-auto mt-3 h-px w-8 bg-[#c9a56b]" />
        </div>

        {/* Restaurante y mesa */}
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-gray-500">{restaurant.name}</p>

          <h1 className="mt-2 text-3xl font-bold text-[#14231e]">
            Mesa {table.number}
          </h1>
        </div>

        {/* Título */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#14231e]">
            ¿Necesitas algo?
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Pulsa una opción y avisaremos al personal.
          </p>
        </div>

        <TableActions token={token} />

        {/* Footer */}
        <p className="mt-8 text-center text-xs font-medium tracking-wide text-gray-400">
          POWERED BY TAVRO
        </p>
      </div>
    </main>
  );
}
