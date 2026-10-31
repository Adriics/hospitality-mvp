"use server";

import { supabase } from "@/lib/supabase/client";

export async function resolveRequest(requestId: string) {
  const { error } = await supabase
    .from("requests")
    .update({
      status: "RESOLVED",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function linkDevice(pairingCode: string) {
  const { data: device, error } = await supabase
    .from("devices")
    .select("id, name, pairing_code, pairing_expires_at")
    .eq("pairing_code", pairingCode)
    .single();

  if (error || !device) {
    throw new Error("Código de vinculación no válido.");
  }

  if (
    !device.pairing_expires_at ||
    new Date(device.pairing_expires_at) <= new Date()
  ) {
    throw new Error("El código de vinculación ha caducado.");
  }

  const { error: clearError } = await supabase
    .from("devices")
    .update({
      pairing_code: null,
      pairing_expires_at: null,
    })
    .eq("id", device.id);

  if (clearError) {
    throw new Error(
      "No se ha podido completar la vinculación.",
    );
  }

  return {
    deviceId: device.id,
    deviceName: device.name,
  };
}