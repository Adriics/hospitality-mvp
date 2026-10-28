"use client";

import { useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase/client";

type Table = {
  id: string;
  number: number;
  token: string;
};

type Restaurant = {
  id: string;
  name: string;
};

type TablesManagerProps = {
  restaurants: Restaurant[];
  initialRestaurantId: string;
  initialTables: Table[];
};

export default function TablesManager({
  restaurants,
  initialRestaurantId,
  initialTables,
}: TablesManagerProps) {
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);

  const [tables, setTables] = useState<Table[]>(initialTables);

  const [loading, setLoading] = useState(false);

  async function handleRestaurantChange(newRestaurantId: string) {
    setRestaurantId(newRestaurantId);
    setLoading(true);

    const { data, error } = await supabase
      .from("tables")
      .select("id, number, token")
      .eq("restaurant_id", newRestaurantId)
      .order("number", { ascending: true });

    if (error) {
      console.error("Error cargando mesas:", error);
      setTables([]);
    } else {
      setTables(data ?? []);
    }

    setLoading(false);
  }

  async function addTable() {
    try {
      setLoading(true);

      const nextNumber =
        tables.length > 0
          ? Math.max(...tables.map((table) => table.number)) + 1
          : 1;

      const token = crypto.randomUUID().replaceAll("-", "").slice(0, 8);

      const { data, error } = await supabase
        .from("tables")
        .insert({
          restaurant_id: restaurantId,
          number: nextNumber,
          token,
        })
        .select("id, number, token")
        .single();

      if (error) {
        throw error;
      }

      setTables((currentTables) => [...currentTables, data]);
    } catch (error) {
      console.error("Error creando mesa:", error);

      alert("No se ha podido crear la mesa.");
    } finally {
      setLoading(false);
    }
  }

  async function generatePdf() {
    try {
      setLoading(true);

      const pdf = new jsPDF();

      const baseUrl = window.location.origin;

      for (let index = 0; index < tables.length; index++) {
        const table = tables[index];

        if (index > 0) {
          pdf.addPage();
        }

        const url = `${baseUrl}/m/${table.token}`;

        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 800,
          margin: 2,
        });

        pdf.setFontSize(28);

        pdf.text(`MESA ${table.number}`, 105, 35, {
          align: "center",
        });

        pdf.addImage(qrDataUrl, "PNG", 45, 55, 120, 120);

        pdf.setFontSize(12);

        pdf.text("Escanea para avisar al personal", 105, 190, {
          align: "center",
        });
      }

      pdf.save("mesas-qr.pdf");
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? "Cargando..." : `${tables.length} mesas configuradas`}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addTable}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 disabled:opacity-50"
          >
            + Añadir mesa
          </button>

          <button
            type="button"
            onClick={generatePdf}
            disabled={loading || tables.length === 0}
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <div key={table.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xl font-bold text-gray-900">
              Mesa {table.number}
            </p>

            <p className="mt-2 break-all text-xs text-gray-400">
              /m/{table.token}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
