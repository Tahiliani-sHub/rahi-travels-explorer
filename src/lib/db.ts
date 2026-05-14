import { PrismaClient } from "../generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword, verifyPassword } from "./auth";

let prisma: PrismaClient | undefined;

function getPrismaClient() {
  if (!prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter } as any);
  }
  return prisma;
}

export async function createUser(email: string, password: string, name: string, phone = "") {
  const db = getPrismaClient();
  const hashedPassword = await hashPassword(password);

  try {
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        wallet: {
          create: { balance: 0 }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    return { success: true, user };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Email already exists' };
    }
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  const db = getPrismaClient();
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { wallet: true }
  });
}

export async function validateUserPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.password) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? ""
  };
}

export async function findUserById(id: string) {
  const db = getPrismaClient();
  return db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, phone: true }
  });
}

export async function updateUser(id: string, data: { name?: string; phone?: string }) {
  const db = getPrismaClient();
  return db.user.update({ where: { id }, data });
}

export async function updatePassword(id: string, newPassword: string) {
  const db = getPrismaClient();
  const hashed = await hashPassword(newPassword);
  return db.user.update({ where: { id }, data: { password: hashed } });
}

export async function createSession(userId: string, token: string) {
  const db = getPrismaClient();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return db.session.create({ data: { userId, token, expiresAt } });
}

export async function validateSession(token: string): Promise<string | null> {
  if (!token) return null;
  const db = getPrismaClient();
  const session = await db.session.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.userId;
}

export async function deleteSession(token: string) {
  const db = getPrismaClient();
  return db.session.delete({ where: { token } }).catch(() => {});
}

export async function createBooking(
  userId: string,
  bookingId: string,
  type: string,
  details: any,
  totalAmount: number,
  currency: string = 'EUR',
  departDate?: string
) {
  const db = getPrismaClient();

  const booking = await db.booking.create({
    data: {
      userId,
      bookingId,
      type,
      details: JSON.stringify(details),
      totalAmount,
      currency,
      status: 'confirmed',
      departDate
    }
  });

  return booking;
}

export async function getUserBookings(userId: string) {
  const db = getPrismaClient();

  const bookings = await db.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return bookings.map(b => ({
    ...b,
    details: JSON.parse(b.details)
  }));
}

export async function createTransaction(
  bookingId: string,
  amount: number,
  type: 'charge' | 'refund',
  paymentId?: string
) {
  const db = getPrismaClient();

  return db.transaction.create({
    data: {
      bookingId,
      amount,
      type,
      status: 'completed',
      paymentId
    }
  });
}

export async function getBookingById(bookingId: string) {
  const db = getPrismaClient();

  const booking = await db.booking.findUnique({
    where: { bookingId }
  });

  if (!booking) return null;

  return {
    ...booking,
    details: JSON.parse(booking.details)
  };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const db = getPrismaClient();

  return db.booking.update({
    where: { bookingId },
    data: { status }
  });
}

export async function cancelBooking(bookingId: string) {
  const db = getPrismaClient();

  const booking = await db.booking.update({
    where: { bookingId },
    data: { status: 'cancelled' }
  });

  if (booking.totalAmount > 0) {
    await createTransaction(
      bookingId,
      booking.totalAmount,
      'refund'
    );
  }

  return booking;
}

export async function createReview(
  userId: string,
  itemId: string,
  itemType: string,
  rating: number,
  title: string,
  comment: string
) {
  const db = getPrismaClient();

  try {
    const review = await db.review.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId, itemType, rating, title, comment },
      update: { rating, title, comment, updatedAt: new Date() }
    });
    return { success: true, review };
  } catch (error: any) {
    console.error('Review creation error:', error);
    return { success: false, error: 'Failed to create review' };
  }
}

export async function getReviewsForItem(itemId: string) {
  const db = getPrismaClient();

  return db.review.findMany({
    where: { itemId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUserReviewForItem(userId: string, itemId: string) {
  const db = getPrismaClient();

  return db.review.findUnique({
    where: { userId_itemId: { userId, itemId } }
  });
}

export async function getAverageRatingForItem(itemId: string) {
  const db = getPrismaClient();

  const reviews = await db.review.findMany({
    where: { itemId },
    select: { rating: true }
  });

  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export async function deleteReview(reviewId: string) {
  const db = getPrismaClient();

  return db.review.delete({
    where: { id: reviewId }
  });
}

export async function validateCoupon(code: string, amount: number) {
  const db = getPrismaClient();

  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!coupon) {
    return { valid: false, error: 'Coupon code not found' };
  }

  if (!coupon.active) {
    return { valid: false, error: 'This coupon is no longer active' };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { valid: false, error: 'This coupon has expired' };
  }

  if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (amount * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  }

  const finalAmount = Math.max(0, amount - discount);

  return {
    valid: true,
    coupon,
    discount,
    finalAmount,
    savings: discount
  };
}

export async function applyCoupon(couponCode: string) {
  const db = getPrismaClient();

  const coupon = await db.coupon.findUnique({
    where: { code: couponCode.toUpperCase() }
  });

  if (coupon && coupon.maxUses !== -1) {
    await db.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: coupon.usedCount + 1 }
    });
  }

  return coupon;
}

export async function listCoupons() {
  const db = getPrismaClient();
  return db.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createCoupon(
  code: string,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  maxUses: number,
  validFrom: Date,
  validTo: Date
) {
  const db = getPrismaClient();

  return db.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validTo,
      active: true
    }
  });
}

export async function getWalletBalance(userId: string): Promise<number> {
  const db = getPrismaClient();
  const wallet = await db.wallet.findUnique({ where: { userId } });
  return wallet?.balance ?? 0;
}

export async function topUpWallet(userId: string, amount: number): Promise<number> {
  const db = getPrismaClient();
  const wallet = await db.wallet.upsert({
    where: { userId },
    create: { userId, balance: amount },
    update: { balance: { increment: amount } }
  });
  return wallet.balance;
}

export async function spendFromWallet(userId: string, amount: number): Promise<{ success: boolean; balance: number; error?: string }> {
  const db = getPrismaClient();
  const wallet = await db.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amount) {
    return { success: false, balance: wallet?.balance ?? 0, error: 'Insufficient balance' };
  }
  const updated = await db.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } }
  });
  return { success: true, balance: updated.balance };
}

export async function getSavedItems(userId: string) {
  const db = getPrismaClient();
  const items = await db.savedItem.findMany({ where: { userId }, orderBy: { savedAt: 'desc' } });
  return items.map(i => ({ ...i, meta: JSON.parse(i.meta), savedAt: i.savedAt.toISOString() }));
}

export async function toggleSavedItemDB(userId: string, item: { itemId: string; type: string; title: string; subtitle: string; price: number; meta: Record<string, unknown> }) {
  const db = getPrismaClient();
  const existing = await db.savedItem.findUnique({ where: { userId_itemId: { userId, itemId: item.itemId } } });
  if (existing) {
    await db.savedItem.delete({ where: { userId_itemId: { userId, itemId: item.itemId } } });
    return { saved: false };
  }
  await db.savedItem.create({ data: { userId, itemId: item.itemId, type: item.type, title: item.title, subtitle: item.subtitle, price: item.price, meta: JSON.stringify(item.meta) } });
  return { saved: true };
}

export async function findOrCreateGoogleUser(googleId: string, email: string, name: string) {
  const db = getPrismaClient();

  // Existing Google-linked account
  let user = await db.user.findUnique({ where: { googleId } });
  if (user) return { id: user.id, email: user.email, name: user.name, phone: user.phone };

  // Link Google ID to existing email account
  user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user) {
    user = await db.user.update({ where: { id: user.id }, data: { googleId } });
    return { id: user.id, email: user.email, name: user.name, phone: user.phone };
  }

  // Create new Google user (no password)
  const created = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      googleId,
      wallet: { create: { balance: 0 } },
    },
  });
  return { id: created.id, email: created.email, name: created.name, phone: created.phone };
}

export async function closePrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
