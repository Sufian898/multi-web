import ContactMessage from '../models/ContactMessage.js';

function generateTrackingCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function createUniqueTrackingCode() {
  // try a few times to avoid collisions
  for (let i = 0; i < 10; i += 1) {
    const code = generateTrackingCode(8);
    // eslint-disable-next-line no-await-in-loop
    const exists = await ContactMessage.exists({ trackingCode: code });
    if (!exists) return code;
  }
  return `${generateTrackingCode(6)}${Date.now().toString().slice(-2)}`;
}

// Public: create message
// POST /api/contact-messages
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Name, email, phone, and message are required.' });
    }

    const trackingCode = await createUniqueTrackingCode();

    const doc = await ContactMessage.create({
      trackingCode,
      userId: req.user?._id || null,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      status: 'open',
    });

    return res.status(201).json({
      id: doc._id,
      trackingCode: doc.trackingCode,
      createdAt: doc.createdAt,
    });
  } catch (error) {
    console.error('createContactMessage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Public: fetch by tracking code
// GET /api/contact-messages/track/:code
export const getContactMessageByTrackingCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Tracking code is required' });

    const doc = await ContactMessage.findOne({ trackingCode: code })
      .select('trackingCode name email phone message status adminReply createdAt updatedAt')
      .lean();

    if (!doc) return res.status(404).json({ message: 'Not found' });

    return res.json({
      trackingCode: doc.trackingCode,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      message: doc.message,
      status: doc.status,
      adminReply: doc.adminReply?.message
        ? {
            message: doc.adminReply.message,
            repliedAt: doc.adminReply.repliedAt,
          }
        : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('getContactMessageByTrackingCode error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
