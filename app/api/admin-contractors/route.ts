import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RoleEnum } from "@prisma/client";

export async function GET() {
  const admins = await db.user.findMany({
    where: {
      roles: {
        some: {
          role: { name: RoleEnum.adminContractor }
        }
      },
      isActive: true
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      lastName: true,
      company: { select: { name: true } }
    },
    orderBy: { displayName: "asc" }
  });

  const data = admins.map(admin => ({
    label: admin.displayName || `${admin.name} ${admin.lastName}`,
    value: admin.id,
    description: admin.company?.name || "Sin empresa asignada"
  }));

  return NextResponse.json(data);
}
