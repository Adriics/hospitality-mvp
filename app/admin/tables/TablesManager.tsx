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

  async function generatePdf(theme: "light" | "dark") {
    try {
      setLoading(true);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;

      const cardWidth = 86;
      const cardHeight = 125;
      const cardX = (pageWidth - cardWidth) / 2;

      const cardPositions = [18, 154];

      const isDark = theme === "dark";

      for (let index = 0; index < tables.length; index++) {
        const table = tables[index];

        const positionInPage = index % 2;

        if (index > 0 && positionInPage === 0) {
          pdf.addPage();
        }

        const cardY = cardPositions[positionInPage];

        const url = `${window.location.origin}/m/${table.token}`;

        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        // =========================
        // COLORES
        // =========================

        const backgroundColor = isDark ? [20, 35, 30] : [250, 248, 243];

        const textColor = isDark ? [250, 248, 243] : [20, 35, 30];

        const borderColor = isDark ? [65, 80, 72] : [220, 215, 205];

        const accentColor = [212, 175, 124];

        // =========================
        // TARJETA
        // =========================

        pdf.setFillColor(
          backgroundColor[0],
          backgroundColor[1],
          backgroundColor[2],
        );

        pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, "F");

        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);

        pdf.setLineWidth(0.4);

        pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, "S");

        // =========================
        // ISOTIPO
        // =========================

        const logoCenterX = pageWidth / 2;
        const logoY = cardY + 12;

        pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);

        pdf.setLineWidth(1.2);

        // Cuerno izquierdo
        pdf.line(logoCenterX, logoY + 4, logoCenterX - 5, logoY);

        pdf.line(logoCenterX - 5, logoY, logoCenterX - 10, logoY - 3);

        // Cuerno derecho
        pdf.line(logoCenterX, logoY + 4, logoCenterX + 5, logoY);

        pdf.line(logoCenterX + 5, logoY, logoCenterX + 10, logoY - 3);

        // =========================
        // TAVRO
        // =========================

        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);

        pdf.text("TAVRO", pageWidth / 2, cardY + 28, {
          align: "center",
        });

        // Línea decorativa
        pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);

        pdf.setLineWidth(0.6);

        pdf.line(pageWidth / 2 - 5, cardY + 33, pageWidth / 2 + 5, cardY + 33);

        // =========================
        // MESA
        // =========================

        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);

        pdf.text(`MESA ${table.number}`, pageWidth / 2, cardY + 43, {
          align: "center",
        });

        // =========================
        // QR
        // =========================

        const qrSize = 50;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = cardY + 46;

        pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        // =========================
        // TEXTO
        // =========================

        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);

        pdf.text("¿Necesitas algo?", pageWidth / 2, cardY + 101, {
          align: "center",
        });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);

        pdf.text("Escanea y avísanos", pageWidth / 2, cardY + 108, {
          align: "center",
        });

        // =========================
        // FOOTER
        // =========================

        pdf.setFillColor(
          isDark ? 250 : 20,
          isDark ? 248 : 35,
          isDark ? 243 : 30,
        );

        pdf.roundedRect(cardX, cardY + cardHeight - 8, cardWidth, 8, 0, 0, "F");

        pdf.setTextColor(
          isDark ? 20 : 255,
          isDark ? 35 : 255,
          isDark ? 30 : 255,
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.5);

        pdf.text("POWERED BY TAVRO", pageWidth / 2, cardY + cardHeight - 3, {
          align: "center",
        });
      }

      pdf.save(
        theme === "dark"
          ? "tavro-mesas-qr-oscuro.pdf"
          : "tavro-mesas-qr-claro.pdf",
      );
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
            onClick={() => generatePdf("light")}
            disabled={loading || tables.length === 0}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 disabled:opacity-50"
          >
            PDF claro
          </button>

          <button
            type="button"
            onClick={() => generatePdf("dark")}
            disabled={loading || tables.length === 0}
            className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            PDF oscuro
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
