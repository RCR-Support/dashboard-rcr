import { initialData } from "./seed";
import { db } from "../lib/db";

async function main() {

    await db.user.deleteMany();

    const { users } = initialData;

    await db.user.createMany({
        data: users
    });

    console.log('seed ejecutado correctamente')
}

(() => {

    if (process.env.NODE_ENV === 'production') return;

    main();
})();
