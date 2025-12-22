import ContactMessage from '../models/ContactMessage.js';

// Admin: list messages
// GET /api/admin/contact-messages?status=open|replied|closed&search=...
export const listContactMessages = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && ['open', 'replied', 'closed'].includes(status)) {
      query.status = status;
    }

    if (search) {
      const q = String(search).trim();
      if (q) {
        query.$or = [
          { trackingCode: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
        ];
      }
    }

    const items = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .select('trackingCode name email phone message status adminReply createdAt updatedAt')
      .lean();

    res.json(items);
  } catch (error) {
    console.error('listContactMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: reply
// PUT /api/admin/contact-messages/:id/reply
export const replyToContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};

    const msg = String(reply || '').trim();
    if (!msg) return res.status(400).json({ message: 'Reply message is required.' });

    const doc = await ContactMessage.findById(id);
    if (!doc) return res.status(404).json({ message: 'Message not found' });

    doc.adminReply = {
      message: msg,
      repliedAt: new Date(),
      repliedBy: req.user?._id || null,
    };
    doc.status = 'replied';
    await doc.save();

    res.json({
      trackingCode: doc.trackingCode,
      status: doc.status,
      adminReply: { message: doc.adminReply.message, repliedAt: doc.adminReply.repliedAt },
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('replyToContactMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: close
// PUT /api/admin/contact-messages/:id/close
export const closeContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ContactMessage.findById(id);
    if (!doc) return res.status(404).json({ message: 'Message not found' });

    doc.status = 'closed';
    await doc.save();

    res.json({ status: doc.status, updatedAt: doc.updatedAt });
  } catch (error) {
    console.error('closeContactMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
