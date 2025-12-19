import Category from '../models/Category.js';

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

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { type, active } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .populate('createdBy', 'username name');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username name');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, type, icon, color, order } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      type: type || 'it',
      icon: icon || '',
      color: color || '#667eea',
      order: order || 0,
      createdBy: req.user._id
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, description, type, icon, color, isActive, order } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name && name !== category.name) {
      // Check if new name already exists
      const existingCategory = await Category.findOne({
        $or: [
          { name: name.trim() },
          { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
        ],
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (description !== undefined) category.description = description;
    if (type) category.type = type;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed IT categories (Admin)
// @route   POST /api/categories/seed
// @access  Private/Admin
export const seedCategories = async (req, res) => {
  try {
    if (!itCategories || itCategories.length === 0) {
      return res.status(400).json({ message: 'No categories to seed' });
    }

    let added = 0;
    let skipped = 0;
    const errors = [];
    const addedCategories = [];
    const skippedCategories = [];

    for (const categoryData of itCategories) {
      try {
        // Generate slug
        const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Check if category already exists
        const existing = await Category.findOne({
          $or: [
            { name: categoryData.name.trim() },
            { slug: slug }
          ]
        });

        if (existing) {
          skipped++;
          skippedCategories.push(categoryData.name);
        } else {
          const newCategory = await Category.create({
            name: categoryData.name.trim(),
            slug: slug, // Explicitly set slug
            description: categoryData.description || '',
            type: categoryData.type || 'it',
            icon: categoryData.icon || '',
            color: categoryData.color || '#667eea',
            order: categoryData.order || 0,
            isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
            createdBy: req.user._id
          });
          added++;
          addedCategories.push(categoryData.name);
        }
      } catch (error) {
        console.error(`Error processing category ${categoryData.name}:`, error);
        errors.push({ category: categoryData.name, error: error.message });
      }
    }

    res.json({
      message: 'Categories seeding completed',
      added,
      skipped,
      total: itCategories.length,
      addedCategories: addedCategories.length > 0 ? addedCategories : undefined,
      skippedCategories: skippedCategories.length > 0 ? skippedCategories : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in seedCategories:', error);
    res.status(500).json({ message: error.message || 'Error seeding categories' });
  }
};
