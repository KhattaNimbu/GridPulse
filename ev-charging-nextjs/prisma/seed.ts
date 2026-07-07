import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { generateInitialSlots } from '../lib/slots'
import { validatePassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  const requiredEnv = [
    'DEMO_DRIVER_EMAIL',
    'DEMO_DRIVER_PASSWORD',
    'DEMO_OPERATOR_EMAIL',
    'DEMO_OPERATOR_PASSWORD',
  ] as const

  const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim())
  if (missingEnv.length > 0) {
    throw new Error(`Missing required demo seed env vars: ${missingEnv.join(', ')}`)
  }

  const driverEmail = process.env.DEMO_DRIVER_EMAIL!.trim()
  const driverPassword = process.env.DEMO_DRIVER_PASSWORD!
  const operatorEmail = process.env.DEMO_OPERATOR_EMAIL!.trim()
  const operatorPassword = process.env.DEMO_OPERATOR_PASSWORD!

  const driverCheck = validatePassword(driverPassword)
  const operatorCheck = validatePassword(operatorPassword)
  if (!driverCheck.valid || !operatorCheck.valid) {
    console.warn('Demo passwords do not meet strong password rules. Update DEMO_*_PASSWORD in your environment to stronger values.')
  }

  const driverPasswordHash = await hash(driverPassword, 10)
  const operatorPasswordHash = await hash(operatorPassword, 10)

  // Create test users
  await prisma.user.upsert({
    where: { email: driverEmail },
    update: {
      name: 'Alice Driver',
      role: 'DRIVER',
      passwordHash: driverPasswordHash,
    },
    create: {
      name: 'Alice Driver',
      email: driverEmail,
      role: 'DRIVER',
      passwordHash: driverPasswordHash,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: operatorEmail },
    update: {
      name: 'Bob Operator',
      role: 'OPERATOR',
      passwordHash: operatorPasswordHash,
    },
    create: {
      name: 'Bob Operator',
      email: operatorEmail,
      role: 'OPERATOR',
      passwordHash: operatorPasswordHash,
    },
  });

  // Seed stations
  const stationsData = [
    {
      name: 'Downtown Supercharger',
      latitude: 37.7749,
      longitude: -122.4194,
      maxCapacityKw: 500,
      numChargers: 8,
      chargerType: 'DC Fast',
      operatorId: operator.id,
    },
    {
      name: 'Suburban Mall Level 2',
      latitude: 37.3382,
      longitude: -121.8863,
      maxCapacityKw: 100,
      numChargers: 10,
      chargerType: 'Level 2',
      operatorId: operator.id,
    },
    {
      name: 'Highway Rest Stop',
      latitude: 36.9741,
      longitude: -122.0308,
      maxCapacityKw: 1000,
      numChargers: 12,
      chargerType: 'DC Fast',
      operatorId: operator.id,
    },
  ];

  for (const data of stationsData) {
    const existingStation = await prisma.station.findFirst({
      where: { name: data.name },
    });

    if (!existingStation) {
      const station = await prisma.station.create({ data });
      console.log(`Created station: ${station.name}`);
      const numSlots = await generateInitialSlots(station.id, station.maxCapacityKw);
      console.log(`Generated ${numSlots} slots for ${station.name}`);
    } else {
      console.log(`Station ${data.name} already exists`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
