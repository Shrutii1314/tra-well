import { TOP_AGENCIES, type Agency } from '../pages/AgenciesDashboard';

const STORAGE_KEYS = {
  AGENCIES: 'trawell_custom_agencies',
  TOURS: 'trawell_custom_tours'
};

// Default seed tours for demo agencies
const DEFAULT_AGENCY_TOURS: any[] = [
  {
    id: 'at-seed-101',
    _id: 'at-seed-101',
    name: 'Kedarkantha Summit Winter Trek',
    title: 'Kedarkantha Summit Winter Trek',
    category: 'Winter Summit',
    duration: 5,
    maxGroupSize: 20,
    capacity: 20,
    bookedSeats: 18,
    difficulty: 'easy',
    price: 399,
    agencyId: 'ag-1',
    agencyName: 'Himalayan High Expeditions',
    agencyEmail: 'contact@himalayanhigh.com',
    summary: 'Conquer the snow-capped summit of Kedarkantha (12,500 ft) with breathtaking pine forests and campsite views.',
    description: 'Conquer the snow-capped summit of Kedarkantha (12,500 ft) with breathtaking pine forests and campsite views.',
    imageCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Sankri, Uttarakhand' },
    ratingsAverage: 4.9,
    ratingsQuantity: 184,
    status: 'Active'
  },
  {
    id: 'at-seed-102',
    _id: 'at-seed-102',
    name: 'Hampta Pass & Chandratal Circuit',
    title: 'Hampta Pass & Chandratal Circuit',
    category: 'Cross-over Trek',
    duration: 6,
    maxGroupSize: 16,
    capacity: 16,
    bookedSeats: 14,
    difficulty: 'medium',
    price: 499,
    agencyId: 'ag-1',
    agencyName: 'Himalayan High Expeditions',
    agencyEmail: 'contact@himalayanhigh.com',
    summary: 'A dramatic cross-over trek from lush green Kullu valley to the stark desert landscape of Lahaul & Spiti.',
    description: 'A dramatic cross-over trek from lush green Kullu valley to the stark desert landscape of Lahaul & Spiti.',
    imageCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Manali, Himachal Pradesh' },
    ratingsAverage: 4.8,
    ratingsQuantity: 142,
    status: 'Active'
  }
];

// ─── AGENCY STORE HELPERS ───

export const getStoredAgencies = (): Agency[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENCIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse stored agencies', e);
    return [];
  }
};

export const saveAgencyProfile = (agencyData: Partial<Agency> & { email: string }) => {
  try {
    const current = getStoredAgencies();
    const existingIndex = current.findIndex(
      (a) => a.email.toLowerCase() === agencyData.email.toLowerCase() || (agencyData.id && a.id === agencyData.id)
    );

    const agencyId = agencyData.id || `ag-${agencyData.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
    const fullAgency: Agency = {
      id: agencyId,
      name: agencyData.name || 'Shruti Expeditions',
      logo: agencyData.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      coverImage: agencyData.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
      rating: agencyData.rating || 5.0,
      reviewsCount: agencyData.reviewsCount || 12,
      hostedToursCount: agencyData.hostedToursCount || 1,
      location: agencyData.location || 'Manali, Himachal Pradesh',
      verified: true,
      bio: agencyData.bio || 'Verified adventure agency on Tra-Well platform.',
      phone: agencyData.phone || '+91 98160 12345',
      email: agencyData.email,
      website: agencyData.website || 'www.trawell.com',
      specialization: agencyData.specialization || 'Custom Expeditions & Summit Treks'
    };

    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...fullAgency };
    } else {
      current.push(fullAgency);
    }

    localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(current));
    return fullAgency;
  } catch (e) {
    console.error('Failed to save agency profile', e);
    return null;
  }
};

export const getAllAgenciesList = (): Agency[] => {
  const custom = getStoredAgencies();
  const allTours = getAllToursList([]);

  // Merge default TOP_AGENCIES with custom agencies
  const mergedMap = new Map<string, Agency>();

  TOP_AGENCIES.forEach((ag) => {
    mergedMap.set(ag.id, { ...ag });
  });

  custom.forEach((c) => {
    mergedMap.set(c.id, { ...c });
  });

  // Calculate dynamic hostedToursCount for each agency
  const agencies = Array.from(mergedMap.values());
  return agencies.map((ag) => {
    const agencyTours = allTours.filter(
      (t) =>
        (t.agencyId && t.agencyId === ag.id) ||
        (t.agencyName && t.agencyName.toLowerCase().includes(ag.name.toLowerCase())) ||
        (t.agencyEmail && t.agencyEmail.toLowerCase() === ag.email.toLowerCase())
    );
    return {
      ...ag,
      hostedToursCount: agencyTours.length > 0 ? agencyTours.length : ag.hostedToursCount
    };
  });
};

// ─── TOUR STORE HELPERS ───

export const getStoredTours = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse stored tours', e);
    return [];
  }
};

export const saveAgencyTour = (tourData: any) => {
  try {
    const current = getStoredTours();
    const tourId = tourData.id || tourData._id || `AT-${Date.now().toString().slice(-4)}`;

    const tourObj = {
      id: tourId,
      _id: tourId,
      name: tourData.title || tourData.name || 'New Expedition',
      title: tourData.title || tourData.name || 'New Expedition',
      category: tourData.category || 'Winter Summit',
      duration: Number(tourData.duration) || 5,
      maxGroupSize: Number(tourData.capacity) || 15,
      capacity: Number(tourData.capacity) || 15,
      bookedSeats: Number(tourData.bookedSeats) || 0,
      price: Number(tourData.price) || 399,
      agencyId: tourData.agencyId || 'ag-1',
      agencyName: tourData.agencyName || 'Agency Expeditions',
      agencyEmail: tourData.agencyEmail || 'agency@trawell.com',
      summary: tourData.summary || tourData.description || `Specialist tour package hosted by ${tourData.agencyName || 'Agency'}.`,
      description: tourData.description || tourData.summary || `Specialist tour package hosted by ${tourData.agencyName || 'Agency'}.`,
      imageCover: tourData.imageCover || tourData.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      startLocation: { description: tourData.pickupLocation || 'Base Station' },
      difficulty: tourData.difficulty || 'medium',
      ratingsAverage: 5.0,
      ratingsQuantity: 1,
      status: tourData.status || 'Active',
      startDate: tourData.startDate || new Date().toISOString().split('T')[0]
    };

    const existingIndex = current.findIndex((t) => (t.id && t.id === tourId) || (t._id && t._id === tourId));
    if (existingIndex >= 0) {
      current[existingIndex] = tourObj;
    } else {
      current.unshift(tourObj);
    }

    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(current));
    return tourObj;
  } catch (e) {
    console.error('Failed to save tour', e);
    return null;
  }
};

export const deleteAgencyTour = (tourId: string) => {
  try {
    const current = getStoredTours();
    const updated = current.filter((t) => t.id !== tourId && t._id !== tourId);
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete tour', e);
  }
};

export const getAllToursList = (apiTours: any[] = []): any[] => {
  const custom = getStoredTours();
  const map = new Map<string, any>();

  // Add default seed tours
  DEFAULT_AGENCY_TOURS.forEach((t) => map.set(t.id, t));

  // Add API tours
  apiTours.forEach((t) => {
    const key = t.id || t._id;
    if (key) map.set(key, t);
  });

  // Add custom agency tours created in Agency Portal
  custom.forEach((t) => {
    const key = t.id || t._id;
    if (key) map.set(key, t);
  });

  return Array.from(map.values());
};
