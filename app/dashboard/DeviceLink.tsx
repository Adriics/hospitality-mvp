"use client";

import { FormEvent, useState } from "react";
import { linkDevice } from "./actions";

type DeviceLinkProps = {
  onLinked: (deviceId: string, deviceName: string) => void;
};

export default function DeviceLink({
  onLinked,
}: DeviceLinkProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Introduce el código de vinculación.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const device = await linkDevice(normalizedCode);

      onLinked(device.deviceId, device.deviceName);
    } catch (error) {
      console.error("Error vinculando dispositivo:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se ha podido vincular el dispositivo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              TAVRO
            </h1>

            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Vincula este dispositivo
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Introduce el código que aparece en administración.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="pairing-code"
              className="block text-sm font-semibold text-gray-700"
            >
              Código de vinculación
            </label>

            <input
              id="pairing-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="ABC-123"
              maxLength={7}
              autoComplete="off"
              autoCapitalize="characters"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl font-bold tracking-widest text-gray-900 outline-none focus:border-gray-900"
            />

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Vinculando..." : "Vincular"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}