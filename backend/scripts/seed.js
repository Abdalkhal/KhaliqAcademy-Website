const mongoose = require('mongoose');
const { Admin, Course } = require('../models');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khaliq_elearning');
    console.log('Connected to MongoDB');

    // Create default admin if not exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin123',
        name: 'Abdulkhaliq'
      });
      await admin.save();
      console.log('✅ Default admin created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // Create sample courses if none exist
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      const courses = [
        {
          title: 'Computer Networks',
          description: 'Master computer networking concepts including OSI model, TCP/IP, routing, switching, and network security. This course covers everything from basics to advanced networking protocols.',
          shortDescription: 'Learn networking from basics to advanced protocols',
          price: 25,
          currency: 'USD',
          category: 'Computer Science',
          level: 'intermediate',
          isPublished: true,
          featured: true,
          order: 1
        },
        {
          title: 'Computer Architecture',
          description: 'Deep dive into computer organization and architecture. Learn about CPU design, memory hierarchy, instruction sets, and performance optimization.',
          shortDescription: 'Understand how computers work from the ground up',
          price: 30,
          currency: 'USD',
          category: 'Computer Science',
          level: 'advanced',
          isPublished: true,
          featured: true,
          order: 2
        },
        {
          title: 'Digital Signal Processing',
          description: 'Comprehensive course on DSP fundamentals, Fourier transforms, filter design, and real-world signal processing applications.',
          shortDescription: 'Master signal processing concepts and applications',
          price: 20,
          currency: 'USD',
          category: 'Electronics',
          level: 'intermediate',
          isPublished: true,
          featured: false,
          order: 3
        },
        {
          title: 'Hardware Security',
          description: 'Learn about hardware-level security, side-channel attacks, secure hardware design, and trusted computing platforms.',
          shortDescription: 'Secure hardware design and attack prevention',
          price: 35,
          currency: 'USD',
          category: 'Cyber Security',
          level: 'advanced',
          isPublished: true,
          featured: true,
          order: 4
        }
      ];

      await Course.insertMany(courses);
      console.log('✅ Sample courses created');
    } else {
      console.log('ℹ️ Courses already exist');
    }

    console.log('\n🎓 Seed complete! You can now:');
    console.log('   - Login as admin: admin / admin123');
    console.log('   - Generate codes for courses');
    console.log('   - Start adding lectures and videos');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
