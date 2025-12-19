import HomeHeroSlider from '../models/HomeHeroSlider.js';

const DEFAULT_SLIDES = [
  { src: '/hero-slides/slide-1.jpg', alt: 'Learning and collaboration' },
  { src: '/hero-slides/slide-2.jpg', alt: 'Teamwork and technology' },
  { src: '/hero-slides/slide-3.jpg', alt: 'Technology and IT' },
];

export const getHomeHeroSlider = async (req, res) => {
  try {
    let doc = await HomeHeroSlider.findOne({ key: 'home-hero' }).lean();

    if (!doc) {
      const created = await HomeHeroSlider.create({
        key: 'home-hero',
        slides: DEFAULT_SLIDES,
      });
      doc = created.toObject();
    }

    res.json({
      heroTitleAccent: doc.heroTitleAccent,
      heroTitleMain: doc.heroTitleMain,
      slides: Array.isArray(doc.slides) && doc.slides.length ? doc.slides : DEFAULT_SLIDES,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('getHomeHeroSlider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateHomeHeroSlider = async (req, res) => {
  try {
    const { heroTitleAccent, heroTitleMain, slides } = req.body || {};

    const normalizedSlides = Array.isArray(slides)
      ? slides
          .map((s) => ({
            src: String(s?.src || '').trim(),
            alt: String(s?.alt || '').trim(),
          }))
          .filter((s) => s.src.length > 0)
      : [];

    if (normalizedSlides.length === 0) {
      return res.status(400).json({ message: 'At least one slide image is required.' });
    }

    const update = {
      heroTitleAccent: String(heroTitleAccent ?? '').trim() || 'MULTI-WEB.',
      heroTitleMain:
        String(heroTitleMain ?? '').trim() ||
        'YOUR ONE-STOP PLATFORM FOR LEARNING, EARNING, SHOPPING, AND BLOGGING',
      slides: normalizedSlides,
      updatedBy: req.user?._id,
    };

    const doc = await HomeHeroSlider.findOneAndUpdate(
      { key: 'home-hero' },
      { $set: update, $setOnInsert: { key: 'home-hero' } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      heroTitleAccent: doc.heroTitleAccent,
      heroTitleMain: doc.heroTitleMain,
      slides: doc.slides,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('updateHomeHeroSlider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
