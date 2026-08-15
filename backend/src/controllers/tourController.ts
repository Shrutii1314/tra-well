import { Request, Response } from 'express';
import Tour from '../models/tourModel';
import APIFeatures from '../utils/APIFeatures';

// 1. CREATE a new Tour entry
export const createTour = async (req: Request, res: Response): Promise<void> => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 2. READ All Tours from the database
export const getAllTours = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🧬 EXECUTE THE API FEATURES ENGINE
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Await the fully modified query execution string
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err: any) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 3. READ a Single Tour by its unique ID
export const getTour = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🧬 This pulls the virtual 'reviews' list into the response on the fly!
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
      res.status(404).json({ status: 'fail', message: 'No tour found with that ID' });
      return;
    }

    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 4. UPDATE a specific Tour document by ID
export const updateTour = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedTour) {
      res.status(404).json({
        status: 'fail',
        message: 'No tour found with that ID'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { tour: updatedTour }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 5. DELETE a specific Tour document by ID
export const deleteTour = async (req: Request, res: Response): Promise<void> => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      res.status(404).json({
        status: 'fail',
        message: 'No tour found with that ID'
      });
      return;
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 6. GEOSPATIAL SEARCH: Find tours within a radius
// 6. GEOSPATIAL SEARCH: Find tours within a radius
export const getToursWithin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { distance, unit } = req.params;
    
    // 🛡️ Explicitly cast the value to a native string primitive 
    // This safely handles both string, string[], or undefined types seamlessly
    const latlng = String(req.params.latlng);

    if (!latlng || latlng === 'undefined') {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide latitude and longitude parameters in the format lat,lng.'
      });
      return;
    }

    // Now TypeScript is 100% happy because 'latlng' is strictly a primitive string
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide latitude and longitude in the format lat,lng.'
      });
      return;
    }

    // Calculate the radius of the earth in radians based on the unit requested
    const radius = unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1;

    // 🧬 The Geospatial Query Operator: $geoWithin and $centerSphere
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] } }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
// 7. GEOSPATIAL AGGREGATION: Calculate distances to all tours from a point
export const getDistances = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = String(latlng).split(',');

    if (!lat || !lng) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide latitude and longitude in the format lat,lng.'
      });
      return;
    }

    // Multiplier to convert meters (MongoDB default output) into Miles or Kilometers
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    // Execute the Aggregation Pipeline
    const distances = await Tour.aggregate([
      {
        // $geoNear must always be stage #1
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)] // [Longitude, Latitude]
          },
          distanceField: 'distance', // The name of the field that will be created
          distanceMultiplier: multiplier // Converts meters to miles/km on the fly
        }
      },
      {
        // Clean up the output to only show the distance metric and the tour name
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};