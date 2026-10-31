"use server";

import { supabase } from "@/lib/supabase/client";

function createPairingCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(
      Math.random() * characters.length,
    );

    code += characters[index];
  }

  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export async function generatePairingCode(
  deviceId: string,
) {
  const code = createPairingCode();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  const { error } = await supabase
    .from("devices")
    .update({
      pairing_code: code,
      pairing_expires_at: expiresAt.toISOString(),
    })
    .eq("id", deviceId);

  if (error) {
    console.error(
      "Error generando código de vinculación:",
      error,
    );

    throw new Error(
      "No se ha podido generar el código de vinculación.",
    );
  }

  return {
    code,
    expiresAt: expiresAt.toISOString(),
  };
}