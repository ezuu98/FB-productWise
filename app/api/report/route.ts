import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

function pickWarehouseColumn(movement: string): "warehouse_id" | "warehouse_dest_id" {
  switch (movement) {
    case "purchase":
    case "manufacturing":
    case "transfer_in":
      return "warehouse_dest_id";
    case "sales":
    case "sales_returns":
    case "purchase_return":
    case "wastages":
    case "consumption":
      return "warehouse_id";
    default:
      return "warehouse_id";
  }
}

function toUtcStart(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function nextUtcStart(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

const MOVEMENT_ALIASES: Record<string, string[]> = {
  purchase: ["purchase", "purchases"],
  sales: ["sales", "sale"],
  sales_returns: ["sales_returns", "sales_return", "sale_return"],
  purchase_return: ["purchase_return", "purchase_returns"],
  manufacturing: ["manufacturing", "manufacture"],
  wastages: ["wastages", "wastage"],
  consumption: ["consumption", "consumptions"],
  transfer_in: ["transfer_in", "transfer"],
};

export async function POST(req: Request) {
  try {
    const { productIds, warehouseIds, movements, fromDate, toDate } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0)
      return NextResponse.json({ error: "Select at least one product" }, { status: 400 });
    if (!Array.isArray(warehouseIds) || warehouseIds.length === 0)
      return NextResponse.json({ error: "Select at least one warehouse" }, { status: 400 });
    if (!Array.isArray(movements) || movements.length === 0)
      return NextResponse.json({ error: "Select at least one movement type" }, { status: 400 });

    const supabase = createServiceSupabase();

    const byWarehouse: Record<string, Record<string, number>> = {};

    // Normalize date range to UTC day boundaries using provided values only
    const startISO = toUtcStart(fromDate || null);
    const endISO = nextUtcStart(toDate || null);

    for (const mv of movements as string[]) {
      const col = pickWarehouseColumn(mv);

      let query = supabase
        .from("stock_movements")
        .select("product_id, warehouse_id, warehouse_dest_id, movement_type, quantity, created_at")
        .in("movement_type", MOVEMENT_ALIASES[mv] ?? [mv])
        .in("product_id", productIds);

      if (warehouseIds?.length) {
        // @ts-ignore dynamic column name
        query = query.in(col as any, warehouseIds);
      }
      if (startISO) query = query.gte("created_at", startISO);
      if (endISO) query = query.lt("created_at", endISO);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      for (const row of data ?? []) {
        const wh = String(row[col as keyof typeof row]);
        if (!byWarehouse[wh]) byWarehouse[wh] = {};
        const rawQty = Number(row.quantity ?? 0);
        const qty = mv === "sales_returns" ? Math.abs(rawQty) : rawQty;
        byWarehouse[wh][mv] = (byWarehouse[wh][mv] ?? 0) + qty;
      }
    }

    return NextResponse.json({ byWarehouse });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
