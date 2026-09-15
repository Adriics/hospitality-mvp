import { supabase } from "@/lib/supabase/client";
import TablesManager from "./TablesManager";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const restaurantId =
    "626afdc0-dace-42cb-a3c3-d6133fb9c4ec";

  const { data: tables, error } = await supabase
    .from("tables")
    .select("id, number, token")
    .eq("restaurant_id", restaurantId)
    .order("number", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <p>Error cargando mesas: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mesas
          </h1>

          <p className="mt-1 text-gray-500">
            Gestiona las mesas y genera sus códigos QR.
          </p>
        </div>

        <TablesManager
          restaurantId={restaurantId}
          initialTables={tables ?? []}
        />
      </div>
    </main>
  );
}