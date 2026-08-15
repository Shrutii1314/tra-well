import { Schema, model, Document } from 'mongoose';

// 1. Define the TypeScript Interface for Tour
export interface ITour extends Document {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover?: string;
  images?: string[];
  startDates?: Date[];
  secretTour?: boolean;
  ratingsAverage?: number;  
  ratingsQuantity?: number; 
  createdAt: Date;
  guides?: Schema.Types.ObjectId[];
  // 🗺️ Added to TypeScript Interface
  startLocation: {
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
  };
  locations?: Array<{
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
    day?: number;
  }>;
}

// 2. Define the Mongoose Schema
const tourSchema = new Schema<ITour>({
  name: { type: String, required: [true, 'A tour must have a name'], unique: true, trim: true },
  duration: { type: Number, required: [true, 'A tour must have a duration'] },
  maxGroupSize: { type: Number, required: [true, 'A tour must have a group size'] },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty level'],
    enum: { values: ['easy', 'medium', 'difficult'], message: 'Difficulty must be easy, medium, or difficult' }
  },
  price: { type: Number, required: [true, 'A tour must have a price'] },
  priceDiscount: { type: Number },
  summary: { type: String, trim: true, required: [true, 'A tour must have a summary'] },
  description: { type: String, trim: true },
  imageCover: { type: String },
  images: [String],
  startDates: [Date],
  secretTour: { type: Boolean, default: false },
  ratingsAverage: { 
    type: Number, 
    default: 4.5,
    min: [1, 'Rating must be at or above 1.0'],
    max: [5, 'Rating must be at or below 5.0']
  },
  ratingsQuantity: { 
    type: Number, 
    default: 0 
  },
  createdAt: { type: Date, default: Date.now, select: false },
  guides: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // 🗺️ Added GeoJSON Sub-document Structure
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number], // Expects [Longitude, Latitude]
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ]
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ⚡ 3. GEOSPATIAL INDEXING
// Tells MongoDB to track this field using a spherical earth mapping engine
tourSchema.index({ startLocation: '2dsphere' });

// 4. 🧬 VIRTUAL POPULATE: Connect Tour to Reviews
tourSchema.virtual('reviews', {
  ref: 'Review',          // The model to link to
  foreignField: 'tour',   // The field inside the Review model where the Tour ID is stored
  localField: '_id'       // The field inside this Tour model that matches the foreignField
});

const Tour = model<ITour>('Tour', tourSchema);
export default Tour;