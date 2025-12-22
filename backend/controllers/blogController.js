import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username name')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'username name email');

    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, featuredImage } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const blog = await Blog.create({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      featuredImage,
      author: req.user._id,
      status: 'pending'
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, featuredImage } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;

    // If admin edits, keep status; if user edits, set to pending
    if (!req.user.isAdmin && blog.status === 'published') {
      blog.status = 'pending';
    }

    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve blog (Admin)
// @route   PUT /api/blogs/:id/approve
// @access  Private/Admin
export const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate('author');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'published';
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject blog (Admin)
// @route   PUT /api/blogs/:id/reject
// @access  Private/Admin
export const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'rejected';
    if (adminNotes) blog.adminNotes = adminNotes;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blog ad revenue (Admin)
// @route   PUT /api/blogs/:id/revenue
// @access  Private/Admin
export const updateBlogRevenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { adRevenue } = req.body;

    if (!adRevenue || adRevenue < 0) {
      return res.status(400).json({ message: 'Invalid ad revenue amount' });
    }

    const blog = await Blog.findById(id).populate('author');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const revenueIncrease = adRevenue - blog.adRevenue;
    blog.adRevenue = adRevenue;
    blog.totalEarnings += revenueIncrease;
    await blog.save();

    // Update author earnings
    const author = await User.findById(blog.author._id);
    author.blogEarnings += revenueIncrease;
    author.currentBalance += revenueIncrease;
    author.totalEarnings += revenueIncrease;
    await author.save();

    // Create earning record
    await Earning.create({
      userId: author._id,
      type: 'blog',
      amount: revenueIncrease,
      status: 'approved',
      description: `Blog ad revenue: ${blog.title}`,
      referenceId: blog._id,
      blogId: blog._id
    });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

