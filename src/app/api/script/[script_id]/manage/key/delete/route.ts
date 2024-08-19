import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { script_id: string } }) {
  const { discord_id } = await request.json();

  if (!discord_id) {
    return NextResponse.json({
      success: false,
      error: "Missing required field discord_id",
    }, { status: 400 });
  }

  const response = await db.delete(users)
    .where(sql`${users.discord_id} = ${discord_id} AND ${users.project_id} = ${params.script_id}`)
    .returning();

  return NextResponse.json({
    success: true,
    deleted: response
  })
}