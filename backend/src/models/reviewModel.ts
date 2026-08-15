import { Schema, model, Document } from 'mongoose';

// 1. Define the TypeScript Interface for Review
export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

// 2. Define the Mongoose Schema
const reviewSchema = new Schema<IReview>({
  review: {
    type: String,
    required: [true, 'Review cannot be empty!'],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user.']
  }
},
{
  // This ensures virtual properties show up when outputting data as JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 3. Pre-Find Middleware: Automatically populate user information into the review output
reviewSchema.pre(/^find/, async function(this: any) {
  this.populate({
    path: 'user',
    select: 'name email' // Keeps sensitive fields like password out of the output
  });
});

// 4. Static Method: Calculate average ratings and quantity for a specific tour
// 4. Static Method: Calculate average ratings and quantity for a specific tour
reviewSchema.statics.calcAverageRatings = async function(tourId: any) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // ✅ FIX: Changed 'this.model' to 'this.db.model' to clear up the naming clash!
  const Tour = this.db.model('Tour'); 
  
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// 5. Post-Save Hook: Automatically trigger calculation after a new review is saved
reviewSchema.post('save', function(this: any) {
  // Use constructor directly to access the static method safely across execution contexts
  const ReviewModel = this.constructor as any;
  ReviewModel.calcAverageRatings(this.tour);
});
// 6. Pre-Query Hook: Capture the tour ID before an update or delete query executes
reviewSchema.pre(/^findOneAnd/, async function (this: any) {
  // ✅ FIX: Removed 'next' completely. Mongoose automatically handles the async resolution!
  this.r = await this.db.model('Review').findOne(this.getQuery());
});

// 7. Post-Query Hook: Run calculation using the captured tour ID after database execution
reviewSchema.post(/^findOneAnd/, async function (this: any) {
  if (this.r) {
    const ReviewModel = this.r.constructor as any;
    await ReviewModel.calcAverageRatings(this.r.tour);
  }
});
const Review = model<IReview>('Review', reviewSchema);
export default Review;