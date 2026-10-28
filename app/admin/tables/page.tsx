import { supabase } from "@/lib/supabase/client";
import TablesManager from "./TablesManager";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const { data: restaurants, error: restaurantsError } =
    await supabase
      .from("restaurants")
      .select("id, name")
      .order("name", { ascending: true });

  if (restaurantsError) {
    return (
      <main className="p-6">
        <p>
          Error cargando restaurantes:{" "}
          {restaurantsError.message}
        </p>
      </main>
    );
  }

  const firstRestaurant = restaurants?.[0];

  if (!firstRestaurant) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Mesas
          </h1>

          <p className="mt-4 text-gray-500">
            No hay restaurantes configurados.
          </p>
        </div>
      </main>
    );
  }

  const { data: tables, error: tablesError } =
    await supabase
      .from("tables")
      .select("id, number, token")
      .eq("restaurant_id", firstRestaurant.id)
      .order("number", { ascending: true });

  if (tablesError) {
    return (
      <main className="p-6">
        <p>
          Error cargando mesas:{" "}
          {tablesError.message}
        </p>
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
          restaurants={restaurants ?? []}
          initialRestaurantId={firstRestaurant.id}
          initialTables={tables ?? []}
        />
      </div>
    </main>
  );
}