import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up demo data...')
  
  try {
    // Delete in order to handle foreign key constraints
    const eventCount = await prisma.trackingEvent.deleteMany({})
    console.log(`Deleted ${eventCount.count} tracking events.`)

    const shipmentCount = await prisma.shipment.deleteMany({})
    console.log(`Deleted ${shipmentCount.count} shipments.`)

    const addressCount = await prisma.address.deleteMany({})
    console.log(`Deleted ${addressCount.count} addresses.`)

    const userCount = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    })
    console.log(`Deleted ${userCount.count} non-admin users.`)

    console.log('Database is now clean!')
  } catch (e) {
    console.error('Error during cleanup:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
