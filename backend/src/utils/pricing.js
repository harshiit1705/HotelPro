/**
 * Server-side Price & Date Validation Engine
 * Enforces strict financial calculations and prevents client-side price tampering.
 */

function calculateStayDuration(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Invalid check-in or check-out date format');
  }

  // Normalize to UTC midnight to avoid DST / timezone discrepancies
  const utcCheckIn = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const utcCheckOut = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

  const diffTime = utcCheckOut - utcCheckIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  return {
    nights: diffDays,
    normalizedCheckIn: new Date(utcCheckIn),
    normalizedCheckOut: new Date(utcCheckOut)
  };
}

function calculatePricing(roomRate, nights) {
  const taxRate = parseFloat(process.env.HOTEL_TAX_RATE || '0.10');
  const serviceFee = parseFloat(process.env.HOTEL_SERVICE_FEE || '25');

  const subtotal = Math.round(roomRate * nights * 100) / 100;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalPrice = Math.round((subtotal + taxAmount + serviceFee) * 100) / 100;

  return {
    pricePerNight: roomRate,
    totalNights: nights,
    subtotal,
    taxRate,
    taxAmount,
    serviceFee,
    totalPrice
  };
}

module.exports = {
  calculateStayDuration,
  calculatePricing
};

