const User = require('../models/User');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

const seedRoomsData = [
  {
    roomNumber: '101',
    title: 'Standard Single Room',
    type: 'Single',
    description: 'A cozy and quiet haven thoughtfully designed for solo business travelers or weekend city getaways, featuring high-thread-count linens and dedicated workstation.',
    pricePerNight: 90,
    maxGuests: 1,
    bedType: 'Queen Bed',
    sizeSqFt: 320,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen HD TV', 'Coffee Maker', 'Work Desk', 'En-suite Rain Shower'],
    images: ['/images/img_1.jpg', '/images/slider-1.jpg'],
    isFeatured: false,
    isActive: true
  },
  {
    roomNumber: '102',
    title: 'Deluxe Double Room',
    type: 'Double',
    description: 'Spacious and luminous room with panoramic garden views, plush queen bedding, handcrafted furnishings, and marble bathroom amenities.',
    pricePerNight: 140,
    maxGuests: 2,
    bedType: '1 King Bed or 2 Twins',
    sizeSqFt: 460,
    amenities: ['High-Speed Wi-Fi', 'Balcony with Garden View', 'Air Conditioning', 'Smart 4K TV', 'Mini Bar', 'Bathrobes & Slippers'],
    images: ['/images/img_2.jpg', '/images/slider-2.jpg'],
    isFeatured: true,
    isActive: true
  },
  {
    roomNumber: '201',
    title: 'Executive Family Suite',
    type: 'Family',
    description: 'Generously proportioned multi-room suite tailored for families, offering connected bedrooms, private dining nook, and children’s entertainment hub.',
    pricePerNight: 210,
    maxGuests: 4,
    bedType: '1 King + 2 Twin Beds',
    sizeSqFt: 720,
    amenities: ['High-Speed Wi-Fi', 'Private Balcony', 'Living & Dining Area', 'Mini Refrigerator', 'Dual Vanities', '24/7 In-Room Dining'],
    images: ['/images/img_3.jpg', '/images/slider-3.jpg'],
    isFeatured: true,
    isActive: true
  },
  {
    roomNumber: '301',
    title: 'Presidential Ocean Suite',
    type: 'Presidential',
    description: 'The pinnacle of luxury at HotelPro. Unrivaled ocean views, private hot tub terrace, butler service on request, premium sound system, and top-tier amenities.',
    pricePerNight: 350,
    maxGuests: 3,
    bedType: 'California King Bed',
    sizeSqFt: 1100,
    amenities: ['Panoramic Ocean View', 'Private Jacuzzi Terrace', 'Personal Butler Service', 'Espresso Bar', 'Soaking Marble Tub', 'Complimentary Champagne'],
    images: ['/images/img_4.jpg', '/images/slider-4.jpg'],
    isFeatured: true,
    isActive: true
  },
  {
    roomNumber: '202',
    title: 'Grand Deluxe King Suite',
    type: 'Deluxe',
    description: 'An expansive suite featuring a separate sitting lounge, artisanal wooden finishings, and floor-to-ceiling windows overlooking the hotel courtyard.',
    pricePerNight: 180,
    maxGuests: 2,
    bedType: 'King Bed',
    sizeSqFt: 580,
    amenities: ['High-Speed Wi-Fi', 'Courtyard View', 'Smart Sound System', 'Mini Bar', 'Rain Shower & Tub', 'Late Checkout Available'],
    images: ['/images/img_5.jpg', '/images/slider-5.jpg'],
    isFeatured: false,
    isActive: true
  },
  {
    roomNumber: '103',
    title: 'Classic Double Queen',
    type: 'Double',
    description: 'Two sumptuous queen beds with hypoallergenic bedding, warm ambient lighting, and an inviting atmosphere suited for colleagues or small traveling groups.',
    pricePerNight: 130,
    maxGuests: 3,
    bedType: '2 Queen Beds',
    sizeSqFt: 480,
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Dual Work Desks', 'Flat-screen TV', 'Organic Bath Products'],
    images: ['/images/img_1.jpg', '/images/slider-6.jpg'],
    isFeatured: false,
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    // 1. Seed or update Admin User
    let admin = await User.findOne({ email: 'admin@hotelpro.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Chief Hotel Administrator',
        email: 'admin@hotelpro.com',
        password: 'admin123',
        phone: '+1 (555) 019-2831',
        role: 'admin'
      });
      console.log('[Seed] Admin user created: admin@hotelpro.com (pwd: admin123)');
    }

    // 2. Seed or update Demo Guest User
    let guest = await User.findOne({ email: 'guest@hotelpro.com' });
    if (!guest) {
      guest = await User.create({
        name: 'Eleanor Vance',
        email: 'guest@hotelpro.com',
        password: 'guest123',
        phone: '+1 (555) 392-8172',
        role: 'guest'
      });
      console.log('[Seed] Guest user created: guest@hotelpro.com (pwd: guest123)');
    }

    // 3. Seed Rooms if empty
    const roomCount = await Room.countDocuments();
    let seededRooms = [];
    if (roomCount === 0) {
      seededRooms = await Room.insertMany(seedRoomsData);
      console.log(`[Seed] Seeded ${seededRooms.length} luxury rooms into database`);
    } else {
      seededRooms = await Room.find();
    }

    // 4. Seed initial realistic reservations if empty
    const reservationCount = await Reservation.countDocuments();
    if (reservationCount === 0 && seededRooms.length >= 2) {
      const today = new Date();
      
      // Reservation 1: Checked-In guest (active occupancy & recorded revenue)
      const r1CheckIn = new Date(today);
      r1CheckIn.setDate(today.getDate() - 1);
      const r1CheckOut = new Date(today);
      r1CheckOut.setDate(today.getDate() + 2);
      
      const r1 = await Reservation.create({
        user: guest._id,
        room: seededRooms[1]._id, // Deluxe Double
        guestDetails: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          specialRequests: 'High floor preferred, quiet wing'
        },
        checkIn: r1CheckIn,
        checkOut: r1CheckOut,
        adults: 2,
        children: 0,
        totalNights: 3,
        pricePerNight: seededRooms[1].pricePerNight,
        subtotal: seededRooms[1].pricePerNight * 3,
        taxAmount: Math.round(seededRooms[1].pricePerNight * 3 * 0.1 * 100) / 100,
        serviceFee: 25,
        totalPrice: Math.round((seededRooms[1].pricePerNight * 3 * 1.1 + 25) * 100) / 100,
        reservationStatus: 'Checked-In',
        paymentStatus: 'Paid',
        paymentDetails: {
          transactionId: 'TXN_INIT_982347',
          method: 'MasterCard •••• 5521',
          paidAt: r1CheckIn,
          amountPaid: Math.round((seededRooms[1].pricePerNight * 3 * 1.1 + 25) * 100) / 100
        }
      });

      // Reservation 2: Future Confirmed stay
      const r2CheckIn = new Date(today);
      r2CheckIn.setDate(today.getDate() + 5);
      const r2CheckOut = new Date(today);
      r2CheckOut.setDate(today.getDate() + 8);

      const r2 = await Reservation.create({
        user: guest._id,
        room: seededRooms[2]._id, // Executive Family Suite
        guestDetails: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          specialRequests: 'Traveling with children, need extra towels'
        },
        checkIn: r2CheckIn,
        checkOut: r2CheckOut,
        adults: 2,
        children: 2,
        totalNights: 3,
        pricePerNight: seededRooms[2].pricePerNight,
        subtotal: seededRooms[2].pricePerNight * 3,
        taxAmount: Math.round(seededRooms[2].pricePerNight * 3 * 0.1 * 100) / 100,
        serviceFee: 25,
        totalPrice: Math.round((seededRooms[2].pricePerNight * 3 * 1.1 + 25) * 100) / 100,
        reservationStatus: 'Confirmed',
        paymentStatus: 'Paid',
        paymentDetails: {
          transactionId: 'TXN_INIT_771923',
          method: 'Visa •••• 4242',
          paidAt: today,
          amountPaid: Math.round((seededRooms[2].pricePerNight * 3 * 1.1 + 25) * 100) / 100
        }
      });

      console.log('[Seed] Seeded initial operational reservations for Eleanor Vance');
    }

    return { admin, guest };
  } catch (err) {
    console.error(`[Seed Error]: ${err.message}`);
  }
};

module.exports = { seedDatabase, seedRoomsData };

