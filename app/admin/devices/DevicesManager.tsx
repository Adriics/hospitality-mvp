"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { generatePairingCode } from "./actions";

type Restaurant = {
  id: string;
  name: string;
};

type Device = {
  id: string;
  name: string;
  created_at: string;
};

type Table = {
  id: string;
  number: number;
  device_id: string | null;
};

type DevicesManagerProps = {
  restaurants: Restaurant[];
  initialRestaurantId: string;
  initialDevices: Device[];
};

export default function DevicesManager({
  restaurants,
  initialRestaurantId,
  initialDevices,
}: DevicesManagerProps) {
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);

  const [devices, setDevices] = useState<Device[]>(initialDevices);

  const [tables, setTables] = useState<Table[]>([]);

  const [deviceName, setDeviceName] = useState("");

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const [pairingDeviceId, setPairingDeviceId] = useState<string | null>(null);

  const [pairingExpiresAt, setPairingExpiresAt] = useState<string | null>(null);

  async function loadTables(newRestaurantId: string) {
    const { data, error } = await supabase
      .from("tables")
      .select("id, number, device_id")
      .eq("restaurant_id", newRestaurantId)
      .order("number", { ascending: true });

    if (error) {
      console.error("Error cargando mesas:", error);
      setTables([]);
      return;
    }

    setTables(data ?? []);
  }

  async function handleRestaurantChange(newRestaurantId: string) {
    setRestaurantId(newRestaurantId);
    setEditingDeviceId(null);
    setSelectedTableIds([]);
    setLoading(true);

    const [devicesResult, tablesResult] = await Promise.all([
      supabase
        .from("devices")
        .select("id, name, created_at")
        .eq("restaurant_id", newRestaurantId)
        .order("name", { ascending: true }),

      supabase
        .from("tables")
        .select("id, number, device_id")
        .eq("restaurant_id", newRestaurantId)
        .order("number", { ascending: true }),
    ]);

    if (devicesResult.error) {
      console.error("Error cargando dispositivos:", devicesResult.error);
      setDevices([]);
    } else {
      setDevices(devicesResult.data ?? []);
    }

    if (tablesResult.error) {
      console.error("Error cargando mesas:", tablesResult.error);
      setTables([]);
    } else {
      setTables(tablesResult.data ?? []);
    }

    setLoading(false);
  }

  async function addDevice() {
    const name = deviceName.trim();

    if (!name) {
      alert("Introduce un nombre para el dispositivo.");
      return;
    }

    try {
      setLoading(true);

      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("devices")
        .insert({
          restaurant_id: restaurantId,
          name,
          token,
        })
        .select("id, name, created_at")
        .single();

      if (error) {
        throw error;
      }

      setDevices((currentDevices) => [...currentDevices, data]);

      setDeviceName("");
    } catch (error) {
      console.error("Error creando dispositivo:", error);
      alert("No se ha podido crear el dispositivo.");
    } finally {
      setLoading(false);
    }
  }

  function startEditingDevice(deviceId: string) {
    const assignedTables = tables
      .filter((table) => table.device_id === deviceId)
      .map((table) => table.id);

    setEditingDeviceId(deviceId);
    setSelectedTableIds(assignedTables);
  }

  function toggleTable(tableId: string) {
    setSelectedTableIds((current) => {
      if (current.includes(tableId)) {
        return current.filter((id) => id !== tableId);
      }

      return [...current, tableId];
    });
  }

  async function saveDeviceTables() {
    if (!editingDeviceId) {
      return;
    }

    try {
      setLoading(true);

      /*
       * Primero liberamos las mesas que pertenecían
       * a este dispositivo pero ya no están seleccionadas.
       */
      const tablesToRemove = tables.filter(
        (table) =>
          table.device_id === editingDeviceId &&
          !selectedTableIds.includes(table.id),
      );

      if (tablesToRemove.length > 0) {
        const { error } = await supabase
          .from("tables")
          .update({ device_id: null })
          .in(
            "id",
            tablesToRemove.map((table) => table.id),
          )
          .eq("restaurant_id", restaurantId);

        if (error) {
          throw error;
        }
      }

      /*
       * Después asignamos las mesas seleccionadas
       * a este dispositivo.
       *
       * Si alguna pertenecía a otro dispositivo,
       * simplemente se mueve a este.
       */
      if (selectedTableIds.length > 0) {
        const { error } = await supabase
          .from("tables")
          .update({ device_id: editingDeviceId })
          .in("id", selectedTableIds)
          .eq("restaurant_id", restaurantId);

        if (error) {
          throw error;
        }
      }

      await loadTables(restaurantId);

      setEditingDeviceId(null);
      setSelectedTableIds([]);
    } catch (error) {
      console.error("Error guardando asignación de mesas:", error);

      alert("No se han podido guardar las mesas del dispositivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePairingCode(deviceId: string) {
    try {
      setLoading(true);

      const result = await generatePairingCode(deviceId);

      setPairingCode(result.code);
      setPairingDeviceId(deviceId);
      setPairingExpiresAt(result.expiresAt);
    } catch (error) {
      console.error("Error generando código:", error);

      alert("No se ha podido generar el código de vinculación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Restaurante */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <label
          htmlFor="restaurant"
          className="block text-sm font-semibold text-gray-700"
        >
          Restaurante
        </label>

        <select
          id="restaurant"
          value={restaurantId}
          onChange={(event) => handleRestaurantChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Crear dispositivo */}
      <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Añadir dispositivo</h2>

        <p className="mt-1 text-sm text-gray-500">
          Puedes llamarlo, por ejemplo, "Juan", "Barra" o "Terraza".
        </p>

        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={deviceName}
            onChange={(event) => setDeviceName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addDevice();
              }
            }}
            placeholder="Nombre del dispositivo"
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={addDevice}
            disabled={loading}
            className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>

      {/* Contador */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading
            ? "Cargando..."
            : `${devices.length} dispositivos configurados`}
        </p>
      </div>

      {/* Dispositivos */}
      {devices.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-gray-900">No hay dispositivos</p>

          <p className="mt-1 text-sm text-gray-500">
            Crea uno para empezar a configurar la recepción de peticiones.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {devices.map((device) => {
            const assignedTables = tables.filter(
              (table) => table.device_id === device.id,
            );

            const isEditing = editingDeviceId === device.id;

            return (
              <div
                key={device.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {device.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Dispositivo TAVRO
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {assignedTables.length}{" "}
                    {assignedTables.length === 1 ? "mesa" : "mesas"}
                  </span>
                </div>

                {!isEditing ? (
                  <>
                    {pairingDeviceId === device.id && pairingCode && (
                      <div className="mt-5 rounded-xl bg-gray-50 p-4 text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          Código de vinculación
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-widest text-gray-900">
                          {pairingCode}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Válido durante 10 minutos.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleGeneratePairingCode(device.id)}
                      disabled={loading}
                      className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
                    >
                      {loading ? "Generando..." : "Vincular dispositivo"}
                    </button>
                    <div className="mt-4">
                      {assignedTables.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No tiene mesas asignadas.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700">
                          Mesas:{" "}
                          {assignedTables
                            .map((table) => table.number)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => startEditingDevice(device.id)}
                      className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Editar mesas
                    </button>
                  </>
                ) : (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Mesas asignadas
                    </p>

                    {tables.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Este restaurante no tiene mesas.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tables.map((table) => (
                          <label
                            key={table.id}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTableIds.includes(table.id)}
                              onChange={() => toggleTable(table.id)}
                              className="h-4 w-4"
                            />

                            <span className="font-medium text-gray-900">
                              Mesa {table.number}
                            </span>

                            {table.device_id &&
                              table.device_id !== device.id && (
                                <span className="ml-auto text-xs text-gray-500">
                                  Actualmente asignada
                                </span>
                              )}
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDeviceId(null);
                          setSelectedTableIds([]);
                        }}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={saveDeviceTables}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {loading ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
