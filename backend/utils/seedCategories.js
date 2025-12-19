import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import connectDB from '../config/database.js';

dotenv.config();

const itCategories = [
  {
    name: 'Web Development',
    description: 'Frontend and backend web development technologies',
    type: 'it',
    icon: '🌐',
    color: '#3498db',
    order: 1,
    isActive: true
  },
  {
    name: 'Mobile Development',
    description: 'iOS and Android mobile app development',
    type: 'it',
    icon: '📱',
    color: '#9b59b6',
    order: 2,
    isActive: true
  },
  {
    name: 'Data Science',
    description: 'Data analysis, machine learning, and AI',
    type: 'it',
    icon: '📊',
    color: '#e74c3c',
    order: 3,
    isActive: true
  },
  {
    name: 'Cybersecurity',
    description: 'Network security, ethical hacking, and information security',
    type: 'it',
    icon: '🔒',
    color: '#f39c12',
    order: 4,
    isActive: true
  },
  {
    name: 'Cloud Computing',
    description: 'AWS, Azure, Google Cloud, and cloud infrastructure',
    type: 'it',
    icon: '☁️',
    color: '#1abc9c',
    order: 5,
    isActive: true
  },
  {
    name: 'Artificial Intelligence',
    description: 'AI, machine learning, deep learning, and neural networks',
    type: 'it',
    icon: '🤖',
    color: '#e67e22',
    order: 6,
    isActive: true
  },
  {
    name: 'DevOps',
    description: 'CI/CD, Docker, Kubernetes, and infrastructure automation',
    type: 'it',
    icon: '⚙️',
    color: '#34495e',
    order: 7,
    isActive: true
  },
  {
    name: 'Blockchain',
    description: 'Cryptocurrency, smart contracts, and decentralized applications',
    type: 'it',
    icon: '⛓️',
    color: '#16a085',
    order: 8,
    isActive: true
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and user experience design',
    type: 'it',
    icon: '🎨',
    color: '#e91e63',
    order: 9,
    isActive: true
  },
  {
    name: 'Database Management',
    description: 'SQL, NoSQL, database design and administration',
    type: 'it',
    icon: '🗄️',
    color: '#673ab7',
    order: 10,
    isActive: true
  },
  {
    name: 'Software Engineering',
    description: 'Software development methodologies and best practices',
    type: 'it',
    icon: '💻',
    color: '#2196f3',
    order: 11,
    isActive: true
  },
  {
    name: 'Game Development',
    description: 'Video game design and development',
    type: 'it',
    icon: '🎮',
    color: '#ff5722',
    order: 12,
    isActive: true
  },
  {
    name: 'Networking',
    description: 'Computer networks, protocols, and infrastructure',
    type: 'it',
    icon: '🌐',
    color: '#009688',
    order: 13,
    isActive: true
  },
  {
    name: 'System Administration',
    description: 'Server management, Linux, and system operations',
    type: 'it',
    icon: '🖥️',
    color: '#795548',
    order: 14,
    isActive: true
  },
  {
    name: 'Programming Languages',
    description: 'Python, Java, JavaScript, C++, and other programming languages',
    type: 'it',
    icon: '📝',
    color: '#607d8b',
    order: 15,
    isActive: true
  },
  {
    name: 'Full Stack Development',
    description: 'Complete web application development from frontend to backend',
    type: 'it',
    icon: '🚀',
    color: '#ff9800',
    order: 16,
    isActive: true
  },
  {
    name: 'Quality Assurance',
    description: 'Software testing, QA automation, and test engineering',
    type: 'it',
    icon: '✅',
    color: '#4caf50',
    order: 17,
    isActive: true
  },
  {
    name: 'IT Support',
    description: 'Technical support, help desk, and IT troubleshooting',
    type: 'it',
    icon: '🛠️',
    color: '#9e9e9e',
    order: 18,
    isActive: true
  },
  {
    name: 'Digital Marketing',
    description: 'SEO, SEM, social media marketing, and online advertising',
    type: 'it',
    icon: '📈',
    color: '#00bcd4',
    order: 19,
    isActive: true
  },
  {
    name: 'E-commerce Development',
    description: 'Online store development and e-commerce platforms',
    type: 'it',
    icon: '🛒',
    color: '#ff6f00',
    order: 20,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await Category.deleteMany({ type: 'it' });
    // console.log('Cleared existing IT categories');

    let added = 0;
    let skipped = 0;

    for (const categoryData of itCategories) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({
          $or: [
            { name: categoryData.name },
            { slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
          ]
        });

        if (existing) {
          console.log(`Skipped: ${categoryData.name} (already exists)`);
          skipped++;
        } else {
          await Category.create(categoryData);
          console.log(`Added: ${categoryData.name}`);
          added++;
        }
      } catch (error) {
        console.error(`Error adding ${categoryData.name}:`, error.message);
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`Added: ${added} categories`);
    console.log(`Skipped: ${skipped} categories (already exist)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
