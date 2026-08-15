import { Document, Query } from 'mongoose';

class APIFeatures<T extends Document[]> {
  // query: The Mongoose query object (e.g., Tour.find())
  // queryString: The raw URL parameters from Express (req.query)
  constructor(public query: any, public queryString: any) {}

  // 1️⃣ BASIC & ADVANCED FILTERING
  filter() {
    // A. Basic Filtering: Create a shallow copy of req.query and remove special API keywords
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // B. Advanced Filtering: Convert comparison operators (gte, gt, lte, lt) to Mongoose syntax ($gte)
    // Example: ?price[gte]=500 -> { price: { gte: '500' } } -> { price: { $gte: '500' } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Update the internal Mongoose query object
    this.query = this.query.find(JSON.parse(queryStr));
    return this; // Returns the entire class instance to allow method chaining
  }

  // 2️⃣ SORTING
  sort() {
    if (this.queryString.sort) {
      // Example: ?sort=-price,duration -> split(',') -> join(' ') -> '-price duration'
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default fallback: Sort by newest tours first
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 3️⃣ FIELD LIMITING (Projecting specific columns)
  limitFields() {
    if (this.queryString.fields) {
      // Example: ?fields=name,duration,price -> 'name duration price'
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Default fallback: Hide internal Mongoose versioning strings (__v) from the frontend
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 4️⃣ PAGINATION
  paginate() {
    // Parse values from string to numbers, or use defaults (?page=1&limit=10)
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    
    // Calculate how many documents to skip over
    // Page 1: skip(0), Page 2: skip(10), Page 3: skip(20)
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;