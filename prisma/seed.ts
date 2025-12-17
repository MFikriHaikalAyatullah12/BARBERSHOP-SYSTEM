import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Create admin user with password from environment variable
  const adminPassword = process.env.ADMIN_PASSWORD || 'barberpro567'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@barbershop.com' },
    update: {
      password: hashedPassword, // Update password if admin already exists
    },
    create: {
      email: 'admin@barbershop.com',
      password: hashedPassword,
      name: 'Admin Barbershop',
      role: 'admin'
    }
  })

  console.log('Created admin:', admin)

  // Create barbers
  const barber1 = await prisma.barber.upsert({
    where: { id: 'barber-1' },
    update: {},
    create: {
      id: 'barber-1',
      name: 'John Smith',
      specialty: 'Classic Cuts & Beard Styling',
      description: 'Expert barber with 10+ years experience in classic and modern cuts',
      imageUrl: '/images/barber-1.jpg',
      isActive: true
    }
  })

  const barber2 = await prisma.barber.upsert({
    where: { id: 'barber-2' },
    update: {},
    create: {
      id: 'barber-2',
      name: 'Mike Johnson',
      specialty: 'Fade Specialist',
      description: 'Master of fades and modern styling techniques',
      imageUrl: '/images/barber-2.jpg',
      isActive: true
    }
  })

  const barber3 = await prisma.barber.upsert({
    where: { id: 'barber-3' },
    update: {},
    create: {
      id: 'barber-3',
      name: 'David Wilson',
      specialty: 'Traditional & Premium Services',
      description: 'Specialist in traditional barbering and luxury grooming',
      imageUrl: '/images/barber-3.jpg',
      isActive: true
    }
  })

  console.log('Created barbers:', { barber1, barber2, barber3 })

  // Create services
  const service1 = await prisma.service.upsert({
    where: { id: 'service-1' },
    update: {},
    create: {
      id: 'service-1',
      name: 'Basic Haircut',
      description: 'Professional haircut with basic styling',
      duration: 30,
      price: 50000,
      isActive: true
    }
  })

  const service2 = await prisma.service.upsert({
    where: { id: 'service-2' },
    update: {},
    create: {
      id: 'service-2',
      name: 'Premium Cut & Style',
      description: 'Premium haircut with wash, cut, and styling',
      duration: 45,
      price: 75000,
      isActive: true
    }
  })

  const service3 = await prisma.service.upsert({
    where: { id: 'service-3' },
    update: {},
    create: {
      id: 'service-3',
      name: 'Full Service Package',
      description: 'Haircut, beard trim, hot towel treatment, and styling',
      duration: 60,
      price: 100000,
      isActive: true
    }
  })

  const service4 = await prisma.service.upsert({
    where: { id: 'service-4' },
    update: {},
    create: {
      id: 'service-4',
      name: 'Beard Trim Only',
      description: 'Professional beard trimming and shaping',
      duration: 20,
      price: 30000,
      isActive: true
    }
  })

  console.log('Created services:', { service1, service2, service3, service4 })
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