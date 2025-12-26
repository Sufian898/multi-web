import mongoose from 'mongoose';

const HomeHeroSlideSchema = new mongoose.Schema(
  {
    src: { type: String, required: true, trim: true },
    alt: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const HomeHeroSliderSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'home-hero', index: true },
    heroTitleAccent: { type: String, default: 'Life Changer Way.' },
    heroTitleMain: {
      type: String,
      default: 'YOUR ONE-STOP PLATFORM FOR LEARNING, EARNING, SHOPPING, AND BLOGGING',
    },
    slides: { type: [HomeHeroSlideSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('HomeHeroSlider', HomeHeroSliderSchema);
