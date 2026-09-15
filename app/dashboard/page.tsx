import { supabase } from "@/lib/supabase/client";
import RequestList from "./RequestList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: requests, error: requestsError } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  if (requestsError) {
    return (
      <main className="p-6">
        <p>Error cargando peticiones: {requestsError.message}</p>
      </main>
    );
  }

  const tableIds = [
    ...new Set(
      (requests ?? []).map((request) => request.table_id),
    ),
  ];

  let tables: {
    id: string;
    number: number;
  }[] = [];

  if (tableIds.length > 0) {
    const { data, error: tablesError } = await supabase
      .from("tables")
      .select("id, number")
      .in("id", tableIds);

    if (tablesError) {
      return (
        <main className="p-6">
          <p>Error cargando mesas: {tablesError.message}</p>
        </main>
      );
    }

    tables = data ?? [];
  }

  const formattedRequests = (requests ?? [])
    .map((request) => {
      const table = tables.find(
        (table) => table.id === request.table_id,
      );

      if (!table) {
        return null;
      }

      return {
        id: request.id,
        type: request.type,
        status: request.status,
        created_at: request.created_at,
        table: {
          number: table.number,
        },
      };
    })
    .filter(
      (
        request,
      ): request is {
        id: string;
        type: string;
        status: string;
        created_at: string;
        table: {
          number: number;
        };
      } => request !== null,
    );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Peticiones pendientes
          </p>
        </div>

        <RequestList initialRequests={formattedRequests} />
      </div>
    </main>
  );
}