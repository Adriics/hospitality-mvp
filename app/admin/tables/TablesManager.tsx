"use client";

import { useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

type Table = {
  id: string;
  number: number;
  token: string;
};

type TablesManagerProps = {
  restaurantId: string;
  initialTables: Table[];
};

export default function TablesManager({
  restaurantId,
  initialTables,
}: TablesManagerProps) {
  const [tables] = useState(initialTables);
  const [loading, setLoading] = useState(false);

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
        pdf.text(
          `MESA ${table.number}`,
          105,
          35,
          {
            align: "center",
          },
        );

        pdf.addImage(
          qrDataUrl,
          "PNG",
          45,
          55,
          120,
          120,
        );

        pdf.setFontSize(12);
        pdf.text(
          "Escanea para avisar al personal",
          105,
          190,
          {
            align: "center",
          },
        );
      }

      pdf.save("mesas-qr.pdf");
    } catch (error) {
      console.error(
        "Error generando PDF:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {tables.length} mesas configuradas
          </p>
        </div>

        <button
          type="button"
          onClick={generatePdf}
          disabled={
            loading || tables.length === 0
          }
          className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Generando..."
            : "Descargar PDF"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
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