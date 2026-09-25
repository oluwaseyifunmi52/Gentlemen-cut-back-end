import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);

import { connectDatabase } from '../config/database';
import Service from '../models/Service';
import Barber from '../models/Barber';

const seedDatabase = async () => {
  try {
    await connectDatabase();

    // Seed services
    await Service.deleteMany({});
    await Service.insertMany([
      {
        name: 'Classic Gentleman\'s Cut',
        slug: 'classic-gentlemans-cut',
        description: 'The complete gentleman\'s cut with fade and style',
        category: 'haircuts',
        price: 7000,
        durationMinutes: 45,
        imageUrl: '/images/b0937819899bdc179995f891bacdf8ec.jpg',
        active: true,
      },
      {
        name: 'Skin Fade',
        slug: 'skin-fade',
        description: 'Precision skin fade on sides and back',
        category: 'haircuts',
        price: 8500,
        durationMinutes: 60,
        imageUrl: '/images/professional-barber-giving-a-taper-fade-haircut-in-modern-barbershop.webp',
        active: true,
      },
      {
        name: 'Low / Mid Fade',
        slug: 'low-mid-fade',
        description: 'Low or mid fade with textured top',
        category: 'haircuts',
        price: 8000,
        durationMinutes: 60,
        imageUrl: '/images/Barbershop_Interior_Design_21_1024x1024.webp',
        active: true,
      },
      {
        name: 'Scissor Cut',
        slug: 'scissor-cut',
        description: 'Traditional scissor cut without fade',
        category: 'haircuts',
        price: 8000,
        durationMinutes: 45,
        imageUrl: '/images/straight-edge-barber-folding-shaving-razors-surgicalmart.webp',
        active: true,
      },
      {
        name: 'Beard Trim & Shape',
        slug: 'beard-trim-shape',
        description: 'Beard trim and shape-up',
        category: 'beard',
        price: 4500,
        durationMinutes: 30,
        imageUrl: '/images/straight-edge-barber-folding-shaving-razors-surgicalmart.webp',
        active: true,
      },
      {
        name: 'Hot-Towel Shave',
        slug: 'hot-towel-shave',
        description: 'Classic hot-towel straight razor shave',
        category: 'beard',
        price: 6000,
        durationMinutes: 40,
        imageUrl: '/images/straight-edge-barber-folding-shaving-razors-surgicalmart.webp',
        active: true,
      },
      {
        name: 'Cut + Beard',
        slug: 'cut-beard',
        description: 'Classic Gentleman\'s Cut plus Beard Trim & Shape',
        category: 'packages',
        price: 11000,
        durationMinutes: 75,
        imageUrl: '/images/b0937819899bdc179995f891bacdf8ec.jpg',
        active: true,
      },
      {
        name: 'Full Gentleman Experience',
        slug: 'full-gentleman-experience',
        description: 'All services included: cut, beard, shave',
        category: 'packages',
        price: 14000,
        durationMinutes: 90,
        imageUrl: '/images/Barbershop_Interior_Design_21_1024x1024.webp',
        active: true,
      },
      {
        name: 'Kids Cut',
        slug: 'kids-cut',
        description: 'Gentle haircut for children',
        category: 'kids',
        price: 5000,
        durationMinutes: 40,
        imageUrl: '/images/b0937819899bdc179995f891bacdf8ec.jpg',
        active: true,
      },
    ]);

    // Seed barbers
    await Barber.deleteMany({});
    await Barber.insertMany([
      {
        name: 'Marcus Adeyemi',
        role: 'Master Barber',
        specialty: 'Skin fades & precision cuts',
        imageUrl: '/images/barbers/marcus.webp',
        active: true,
      },
      {
        name: 'Daniel Okafor',
        role: 'Senior Barber',
        specialty: 'Classic cuts & beard styling',
        imageUrl: '/images/barbers/daniel.webp',
        active: true,
      },
      {
        name: 'Tunde Akinwale',
        role: 'Barber',
        specialty: 'Modern fades & textured styles',
        imageUrl: '/images/barbers/tunde.jpg',
        active: true,
      },
    ]);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();