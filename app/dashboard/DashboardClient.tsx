"use client";

import { useEffect, useState } from "react";
import DeviceLink from "./DeviceLink";
import RequestList from "./RequestList";

type Request = {
  id: string;
  type: string;
  status: string;
  created_at: string;
  table: {
    number: number;
  };
};

type DashboardClientProps = {
  initialRequests: Request[];
};

const DEVICE_STORAGE_KEY = "tavro_device_id";

export default function DashboardClient({
  initialRequests,
}: DashboardClientProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedDeviceId =
      localStorage.getItem(DEVICE_STORAGE_KEY);

    const storedDeviceName =
      localStorage.getItem("tavro_device_name");

    setDeviceId(storedDeviceId);
    setDeviceName(storedDeviceName);
    setLoaded(true);
  }, []);

  function handleLinked(
    newDeviceId: string,
    newDeviceName: string,
  ) {
    localStorage.setItem(
      DEVICE_STORAGE_KEY,
      newDeviceId,
    );

    localStorage.setItem(
      "tavro_device_name",
      newDeviceName,
    );

    setDeviceId(newDeviceId);
    setDeviceName(newDeviceName);
  }

  if (!loaded) {
    return null;
  }

  if (!deviceId) {
    return <DeviceLink onLinked={handleLinked} />;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Dispositivo: {deviceName}
          </p>
        </div>

        <RequestList initialRequests={initialRequests} />
      </div>
    </main>
  );
}