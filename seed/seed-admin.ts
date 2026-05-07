import bcryptjs from 'bcryptjs';
import { RoleEnum } from '@prisma/client';
import { db } from '../lib/db';
import { initialData } from './seed';

const seedAdminUser = initialData.users.find(user => user.roles.includes('admin'));
if (!seedAdminUser) {
  throw new Error('No se encontró un usuario admin en seed/seed.ts');
}

const seedCompany =
  initialData.companies.find(company => company.name === 'RCR-Support') ||
  initialData.companies[0];

if (!seedCompany) {
  throw new Error('No se encontró empresa base en seed/seed.ts');
}

const ADMIN_EMAIL = (
  process.env.SEED_ADMIN_EMAIL || 'soporte@rcrsupport.cl'
).toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'uno1dos2';
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD
  ? bcryptjs.hashSync(ADMIN_PASSWORD, 10)
  : seedAdminUser.password;
const ADMIN_RUN = process.env.SEED_ADMIN_RUN || seedAdminUser.run;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Hector';
const ADMIN_MIDDLE_NAME = seedAdminUser.middleName || '';
const ADMIN_LAST_NAME = process.env.SEED_ADMIN_LAST_NAME || 'Matcovich';
const ADMIN_SECOND_LAST_NAME =
  process.env.SEED_ADMIN_SECOND_LAST_NAME || 'Gonzales';
const ADMIN_DISPLAY_NAME =
  process.env.SEED_ADMIN_DISPLAY_NAME || 'Hector Matcovich Gonzales';
const ADMIN_USERNAME =
  process.env.SEED_ADMIN_USERNAME || 'Hector Matcovich Gonzales';
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || seedAdminUser.phoneNumber;
const ADMIN_CATEGORY = seedAdminUser.category;

async function ensureBaseCompany() {
  return db.company.upsert({
    where: { rut: seedCompany.rut },
    update: {
      name: seedCompany.name,
      phone: seedCompany.phone,
      status: true,
    },
    create: {
      name: seedCompany.name,
      rut: seedCompany.rut,
      phone: seedCompany.phone,
      status: true,
    },
  });
}

async function ensureAdminRole() {
  return db.role.upsert({
    where: { name: RoleEnum.admin },
    update: {},
    create: { name: RoleEnum.admin },
  });
}

async function ensureAdminUser(companyId: string) {

  const existingByEmail = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingByEmail) {
    return db.user.update({
      where: { id: existingByEmail.id },
      data: {
        name: ADMIN_NAME,
        lastName: ADMIN_LAST_NAME,
        displayName: ADMIN_DISPLAY_NAME,
        userName: ADMIN_USERNAME,
        phoneNumber: ADMIN_PHONE,
        category: ADMIN_CATEGORY,
        run: ADMIN_RUN,
        middleName: ADMIN_MIDDLE_NAME,
        secondLastName: ADMIN_SECOND_LAST_NAME,
        companyId,
        deletedLogic: false,
        isActive: true,
        password: ADMIN_PASSWORD_HASH,
      },
    });
  }

  const existingByRun = await db.user.findUnique({
    where: { run: ADMIN_RUN },
  });

  if (existingByRun) {
    return db.user.update({
      where: { id: existingByRun.id },
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        lastName: ADMIN_LAST_NAME,
        displayName: ADMIN_DISPLAY_NAME,
        userName: ADMIN_USERNAME,
        phoneNumber: ADMIN_PHONE,
        category: ADMIN_CATEGORY,
        middleName: ADMIN_MIDDLE_NAME,
        secondLastName: ADMIN_SECOND_LAST_NAME,
        companyId,
        deletedLogic: false,
        isActive: true,
        password: ADMIN_PASSWORD_HASH,
      },
    });
  }

  return db.user.create({
    data: {
      email: ADMIN_EMAIL,
      run: ADMIN_RUN,
      name: ADMIN_NAME,
      middleName: ADMIN_MIDDLE_NAME,
      lastName: ADMIN_LAST_NAME,
      secondLastName: ADMIN_SECOND_LAST_NAME,
      displayName: ADMIN_DISPLAY_NAME,
      userName: ADMIN_USERNAME,
      phoneNumber: ADMIN_PHONE,
      category: ADMIN_CATEGORY,
      companyId,
      deletedLogic: false,
      isActive: true,
      image: '',
      password: ADMIN_PASSWORD_HASH,
    },
  });
}

async function main() {
  console.log('Seeding admin only...');

  const baseCompany = await ensureBaseCompany();
  const adminRole = await ensureAdminRole();
  const adminUser = await ensureAdminUser(baseCompany.id);

  await db.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Admin listo:');
  console.log(`- Email: ${adminUser.email}`);
  console.log(`- RUN: ${adminUser.run}`);
  console.log(`- Empresa: ${baseCompany.name || baseCompany.rut}`);
  console.log('- Role: admin');
}

main()
  .catch(error => {
    console.error('Error en seed admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
