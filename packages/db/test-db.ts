import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing connection...')
  try {
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`
    console.log('Connection successful:', result)
    
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`
    console.log('Tables in public schema:', tables)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
