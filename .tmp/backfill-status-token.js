"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Cargar variables de entorno desde .env al ejecutar con node/ts-node
require("dotenv/config");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
async function main() {
    const apps = await prisma.application.findMany({
        where: { statusToken: null },
        select: { id: true }
    });
    console.log('Found applications to backfill:', apps.length);
    for (const a of apps) {
        const token = (0, uuid_1.v4)();
        await prisma.application.update({
            where: { id: a.id },
            data: { statusToken: token }
        });
    }
    console.log('Backfill complete:', apps.length);
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
