import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

function pickWarehouseColumn(movement: string): "warehouse_id" | "warehouse_dest_id" {
  switch (movement) {
    case "purchase":
    case "sales_returns":
    case "manufacturing":
    case "transfer_in":
      return "warehouse_dest_id";
    case "sales":
    case "purchase_return":
    case "wastages":
    case "consumption":
      return "warehouse_id";
    default:
      return "warehouse_id";
  }
}

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

    for (const mv of movements as string[]) {
      const col = pickWarehouseColumn(mv);

      // Build dynamic query
      let query = supabase
        .from("stock_movements")
        .select("product_id, warehouse_id, warehouse_dest_id, movement_type, quantity, created_at")
        .eq("movement_type", mv)
        .in("product_id", productIds);

      if (warehouseIds?.length) {
        // @ts-ignore dynamic column name
        query = query.in(col as any, warehouseIds);
      }
      if (fromDate) query = query.gte("created_at", fromDate);
      if (toDate) query = query.lte("created_at", toDate);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      for (const row of data ?? []) {
        const wh = String(row[col as keyof typeof row]);
        if (!byWarehouse[wh]) byWarehouse[wh] = {};
        byWarehouse[wh][mv] = (byWarehouse[wh][mv] ?? 0) + Number(row.quantity ?? 0);
      }
    }

    return NextResponse.json({ byWarehouse });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
