import { supabase } from "@/lib/supabase/client";
import DevicesManager from "./DevicesManager";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
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
            Dispositivos
          </h1>

          <p className="mt-4 text-gray-500">
            No hay restaurantes configurados.
          </p>
        </div>
      </main>
    );
  }

  const { data: devices, error: devicesError } =
    await supabase
      .from("devices")
      .select("id, name, created_at")
      .eq("restaurant_id", firstRestaurant.id)
      .order("name", { ascending: true });

  if (devicesError) {
    return (
      <main className="p-6">
        <p>
          Error cargando dispositivos:{" "}
          {devicesError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dispositivos
          </h1>

          <p className="mt-1 text-gray-500">
            Gestiona los dispositivos que recibirán las peticiones
            de las mesas.
          </p>
        </div>

        <DevicesManager
          restaurants={restaurants ?? []}
          initialRestaurantId={firstRestaurant.id}
          initialDevices={devices ?? []}
        />
      </div>
    </main>
  );
}