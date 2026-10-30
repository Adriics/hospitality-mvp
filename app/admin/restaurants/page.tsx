"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Restaurant = {
  id: string;
  name: string;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadRestaurants() {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando restaurantes:", error);
      return;
    }

    setRestaurants(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function createRestaurant() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase
        .from("restaurants")
        .insert({
          name: trimmedName,
        })
        .select("id, name")
        .single();

      if (error) {
        throw error;
      }

      setRestaurants((current) =>
        [...current, data].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setName("");
    } catch (error) {
      console.error(
        "Error creando restaurante:",
        error,
      );

      alert("No se ha podido crear el restaurante.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurantes
          </h1>

          <p className="mt-1 text-gray-500">
            Gestiona los restaurantes de la plataforma.
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Crear restaurante
          </h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  createRestaurant();
                }
              }}
              placeholder="Nombre del restaurante"
              className="flex-1 text-gray-900 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={createRestaurant}
              disabled={
                creating || !name.trim()
              }
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {creating
                ? "Creando..."
                : "Crear restaurante"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Restaurantes
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Cargando restaurantes...
            </p>
          ) : restaurants.length === 0 ? (
            <p className="text-gray-500">
              No hay restaurantes configurados.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <p className="text-xl font-bold text-gray-900">
                    {restaurant.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}