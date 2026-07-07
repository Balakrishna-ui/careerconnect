import { createBooking, confirmBooking, getAvailableDates, getAvailableSlots } from './src/actions/booking-actions';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function testBooking() {
  const user = await prisma.user.findFirst();
  const mentor = await prisma.mentor.findFirst({ include: { sessionTypes: true } });
  if (!user || !mentor) throw new Error("No user or mentor");
  
  const service = mentor.sessionTypes[0];
  if (!service) throw new Error("Mentor has no services");

  const dates = await getAvailableDates(mentor.id, 2026, 6, service.duration); // July 2026 is month 6
  if (!dates.length) throw new Error("No dates");
  const firstDate = dates[0].date;
  
  const slots = await getAvailableSlots(mentor.id, firstDate, service.duration);
  const firstSlot = slots.find(s => s.available)?.start;
  if (!firstSlot) throw new Error("No slots");

  console.log(`Booking ${firstDate} at ${firstSlot}...`);
  const result = await createBooking({
    mentorId: mentor.id,
    userId: user.id,
    serviceId: service.id,
    dateStr: firstDate,
    startTime: firstSlot
  });

  console.log("Create Result:", result);

  if (result.success && result.bookingId) {
    console.log("Confirming booking...");
    const confirmResult = await confirmBooking({
      bookingId: result.bookingId,
      razorpayPaymentId: "pay_test123"
    });
    console.log("Confirm Result:", confirmResult);
  }
}

testBooking().catch(console.error).finally(() => prisma.$disconnect());
