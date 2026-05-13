/**
 * dev-server.mjs
 * Lightweight local Node.js API server for development.
 * Mirrors the /api/* routes from src/server.ts so you can run:
 *   npm run dev:api   (this file on port 3001)
 *   npm run dev       (vite on port 5173, proxied to 3001)
 */

import http from "node:http";
import { URL } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac } from "node:crypto";
import Razorpay from "razorpay";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
try {
  const env = readFileSync(path.join(__dirname, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
} catch {}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CURRENCY = process.env.CURRENCY || "EUR";

async function getHandlers() {
  const [
    { searchFlights },
    { searchHotels },
    { searchTrains },
    { searchHolidays },
    { packages },
    { generateSessionToken },
    {
      createUser, validateUserPassword,
      findUserById, updateUser, updatePassword,
      createSession, validateSession, deleteSession,
      createBooking, getUserBookings, getBookingById, cancelBooking, updateBookingStatus,
      getWalletBalance, topUpWallet, spendFromWallet,
      createReview, getReviewsForItem, getAverageRatingForItem, deleteReview,
      validateCoupon, applyCoupon, listCoupons, createCoupon,
      getSavedItems, toggleSavedItemDB,
    },
    { generateBookingPDF },
  ] = await Promise.all([
    import("./src/data/flights.ts"),
    import("./src/data/hotels.ts"),
    import("./src/data/trains.ts"),
    import("./src/data/holidays.ts"),
    import("./src/data/packages.ts"),
    import("./src/lib/auth.ts"),
    import("./src/lib/db.ts"),
    import("./src/lib/pdf.ts"),
  ]);

  return {
    searchFlights, searchHotels, searchTrains, searchHolidays, packages,
    generateSessionToken,
    createUser, validateUserPassword,
    findUserById, updateUser, updatePassword,
    createSession, validateSession, deleteSession,
    createBooking, getUserBookings, getBookingById, cancelBooking, updateBookingStatus,
    getWalletBalance, topUpWallet, spendFromWallet,
    createReview, getReviewsForItem, getAverageRatingForItem, deleteReview,
    validateCoupon, applyCoupon, listCoupons, createCoupon,
    generateBookingPDF,
  };
}

function jsonResponse(res, data, status = 200) {
  if (!res.headersSent) {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
  }
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

function getToken(req) {
  return (req.headers["authorization"] || "").replace("Bearer ", "").trim();
}

let handlers = null;

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const finish = (status) => {
    console.log(`${req.method} ${req.url} → ${status} (${Date.now() - started}ms)`);
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Rahi-Request",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    });
    res.end();
    finish(204);
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    res.writeHead(404);
    res.end("Not found");
    finish(404);
    return;
  }

  // CSRF: all mutating requests must carry this custom header
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    if (req.headers["x-rahi-request"] !== "true") {
      jsonResponse(res, { error: "Forbidden" }, 403);
      finish(403);
      return;
    }
  }

  try {
    if (!handlers) handlers = await getHandlers();
    const {
      searchFlights, searchHotels, searchTrains, searchHolidays, packages,
      generateSessionToken,
      createUser, validateUserPassword,
      findUserById, updateUser, updatePassword,
      createSession, validateSession, deleteSession,
      createBooking, getUserBookings, getBookingById, cancelBooking,
      getWalletBalance, topUpWallet, spendFromWallet,
      createReview, getReviewsForItem, getAverageRatingForItem, deleteReview,
      validateCoupon, applyCoupon, listCoupons, createCoupon,
      getSavedItems, toggleSavedItemDB,
      generateBookingPDF,
    } = handlers;

    // ── Health ────────────────────────────────────────────────────────────────

    if (pathname === "/api/health") {
      return jsonResponse(res, { ok: true, ts: Date.now() });
    }

    // ── Search ────────────────────────────────────────────────────────────────

    if (pathname === "/api/search/flights") {
      return jsonResponse(res, searchFlights({
        origin: url.searchParams.get("origin") ?? "",
        destination: url.searchParams.get("destination") ?? "",
        departDate: url.searchParams.get("departDate") ?? "",
        cabin: url.searchParams.get("cabin") ?? "Any",
      }));
    }

    if (pathname === "/api/search/hotels") {
      return jsonResponse(res, searchHotels({
        city: url.searchParams.get("city") ?? "",
        guests: Number(url.searchParams.get("guests") ?? "2"),
        filters: { recommended: false, promotion: false, childFriendly: false, availableOnly: false, refundable: false },
        rating: null,
      }));
    }

    if (pathname === "/api/search/trains") {
      return jsonResponse(res, searchTrains({
        origin: url.searchParams.get("origin") ?? "",
        destination: url.searchParams.get("destination") ?? "",
        departDate: url.searchParams.get("departDate") ?? "",
        seatClass: url.searchParams.get("seatClass") ?? "Any",
      }));
    }

    if (pathname === "/api/search/holidays") {
      return jsonResponse(res, searchHolidays({
        destination: url.searchParams.get("destination") ?? "",
        date: url.searchParams.get("date") ?? "",
        guests: Number(url.searchParams.get("guests") ?? "2"),
      }));
    }

    if (pathname === "/api/packages") {
      return jsonResponse(res, packages);
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    if (pathname === "/api/auth/signup" && req.method === "POST") {
      const { email, password, name, phone = "" } = await readBody(req);
      if (!email || !password || !name) return jsonResponse(res, { error: "Missing fields" }, 400);
      const result = await createUser(email, password, name, phone);
      if (!result.success) return jsonResponse(res, { error: result.error }, 400);
      const token = generateSessionToken();
      await createSession(result.user.id, token);
      return jsonResponse(res, { success: true, user: result.user, sessionToken: token });
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      const { email, password } = await readBody(req);
      if (!email || !password) return jsonResponse(res, { error: "Missing fields" }, 400);
      const user = await validateUserPassword(email, password);
      if (!user) return jsonResponse(res, { error: "Invalid credentials" }, 401);
      const token = generateSessionToken();
      await createSession(user.id, token);
      return jsonResponse(res, { success: true, user, sessionToken: token });
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      await deleteSession(getToken(req));
      return jsonResponse(res, { success: true });
    }

    if (pathname === "/api/auth/profile") {
      const userId = await validateSession(getToken(req));
      if (!userId) return jsonResponse(res, { error: "Unauthorized" }, 401);
      if (req.method === "GET") {
        const user = await findUserById(userId);
        if (!user) return jsonResponse(res, { error: "Not found" }, 404);
        return jsonResponse(res, user);
      }
      if (req.method === "PUT") {
        const { name, phone } = await readBody(req);
        const updated = await updateUser(userId, { name, phone });
        return jsonResponse(res, { success: true, user: { id: updated.id, name: updated.name, phone: updated.phone, email: updated.email } });
      }
      return jsonResponse(res, { error: "Method not allowed" }, 405);
    }

    if (pathname === "/api/auth/change-password" && req.method === "POST") {
      const userId = await validateSession(getToken(req));
      if (!userId) return jsonResponse(res, { error: "Unauthorized" }, 401);
      const { password } = await readBody(req);
      if (!password || password.length < 8) return jsonResponse(res, { error: "Password must be at least 8 characters" }, 400);
      await updatePassword(userId, password);
      return jsonResponse(res, { success: true });
    }

    // ── Payment ───────────────────────────────────────────────────────────────

    if (pathname === "/api/payment/create-order" && req.method === "POST") {
      const { amount, description } = await readBody(req);
      const keyId = process.env.RAZORPAY_KEY_ID || "";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (!keyId || !keySecret) {
        return jsonResponse(res, { orderId: "order_mock_" + Date.now(), keyId: "rzp_test_mock", amount: Math.round(amount * 100), currency: CURRENCY });
      }
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await rzp.orders.create({ amount: Math.round(amount * 100), currency: CURRENCY, notes: { description } });
        return jsonResponse(res, { orderId: order.id, keyId, amount: order.amount, currency: order.currency });
      } catch (err) {
        const detail = err?.error?.description || err?.message || String(err);
        console.error("[dev-server] Razorpay create-order:", detail);
        return jsonResponse(res, { error: `Failed to create payment order: ${detail}` }, 500);
      }
    }

    if (pathname === "/api/payment/verify" && req.method === "POST") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await readBody(req);
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (!keySecret) return jsonResponse(res, { success: true, paymentId: razorpay_payment_id || "mock_pay_" + Date.now() });
      const expected = createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
      if (expected !== razorpay_signature) return jsonResponse(res, { error: "Invalid payment signature" }, 400);
      return jsonResponse(res, { success: true, paymentId: razorpay_payment_id });
    }

    // ── Email (mock in dev) ───────────────────────────────────────────────────

    if (pathname === "/api/email/booking-confirmation" && req.method === "POST") {
      return jsonResponse(res, { success: true, emailId: "mock_email_" + Date.now() });
    }

    // ── Wallet ────────────────────────────────────────────────────────────────

    if (pathname === "/api/wallet" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) return jsonResponse(res, { error: "userId required" }, 400);
      return jsonResponse(res, { balance: await getWalletBalance(userId) });
    }

    if (pathname === "/api/wallet/topup-verify" && req.method === "POST") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = await readBody(req);
      if (!userId || !amount || amount <= 0) return jsonResponse(res, { error: "Invalid request" }, 400);
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (keySecret) {
        const expected = createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
        if (expected !== razorpay_signature) return jsonResponse(res, { error: "Invalid payment signature" }, 400);
      }
      const balance = await topUpWallet(userId, amount);
      return jsonResponse(res, { success: true, balance });
    }

    if (pathname === "/api/wallet/spend" && req.method === "POST") {
      const { userId, amount } = await readBody(req);
      if (!userId || !amount || amount <= 0) return jsonResponse(res, { error: "Invalid request" }, 400);
      const result = await spendFromWallet(userId, amount);
      if (!result.success) return jsonResponse(res, { error: result.error, balance: result.balance }, 400);
      return jsonResponse(res, { success: true, balance: result.balance });
    }

    // ── Bookings ──────────────────────────────────────────────────────────────

    if (pathname === "/api/bookings") {
      if (req.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) return jsonResponse(res, { error: "userId required" }, 400);
        return jsonResponse(res, await getUserBookings(userId));
      }
      if (req.method === "POST") {
        const { userId, bookingId, type, details, totalAmount, currency = CURRENCY, departDate } = await readBody(req);
        if (!userId || !bookingId || !type || !details || totalAmount === undefined)
          return jsonResponse(res, { error: "Missing fields" }, 400);
        const booking = await createBooking(userId, bookingId, type, details, totalAmount, currency, departDate);
        return jsonResponse(res, { success: true, booking });
      }
      return jsonResponse(res, { error: "Method not allowed" }, 405);
    }

    if (pathname === "/api/bookings/details" && req.method === "GET") {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) return jsonResponse(res, { error: "bookingId required" }, 400);
      const booking = await getBookingById(bookingId);
      if (!booking) return jsonResponse(res, { error: "Not found" }, 404);
      return jsonResponse(res, booking);
    }

    if (pathname === "/api/bookings/status" && req.method === "GET") {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) return jsonResponse(res, { error: "bookingId required" }, 400);
      const booking = await getBookingById(bookingId);
      if (!booking) return jsonResponse(res, { error: "Not found" }, 404);
      return jsonResponse(res, {
        bookingId: booking.bookingId,
        status: booking.status,
        type: booking.type,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookingDate: booking.bookingDate,
        departDate: booking.departDate,
      });
    }

    if (pathname === "/api/bookings/cancel" && req.method === "POST") {
      const { bookingId } = await readBody(req);
      if (!bookingId) return jsonResponse(res, { error: "bookingId required" }, 400);
      const booking = await getBookingById(bookingId);
      if (!booking) return jsonResponse(res, { error: "Not found" }, 404);
      if (booking.status === "cancelled") return jsonResponse(res, { error: "Already cancelled" }, 400);
      const cancelled = await cancelBooking(bookingId);

      // Refund: card payments via Razorpay, wallet payments credit back
      if (bookingId.startsWith("pay_")) {
        const keyId = process.env.RAZORPAY_KEY_ID || "";
        const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
        if (keyId && keySecret) {
          try {
            const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
            await rzp.payments.refund(bookingId, { amount: Math.round(booking.totalAmount * 100) });
          } catch (e) { console.warn("[dev-server] Razorpay refund failed:", e?.message); }
        }
      } else if (bookingId.startsWith("wallet_")) {
        // Credit wallet back
        try { await topUpWallet(booking.userId, booking.totalAmount); } catch {}
      }

      return jsonResponse(res, { success: true, booking: cancelled });
    }

    if (pathname === "/api/bookings/download-pdf" && req.method === "GET") {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) return jsonResponse(res, { error: "bookingId required" }, 400);
      const booking = await getBookingById(bookingId);
      if (!booking) return jsonResponse(res, { error: "Not found" }, 404);
      const customer = await findUserById(booking.userId);
      const pdf = await generateBookingPDF({
        bookingId: booking.bookingId,
        customerName: customer?.name ?? "Customer",
        customerEmail: customer?.email ?? "customer@example.com",
        bookingDetails: booking.details,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookingDate: booking.bookingDate.toString(),
      });
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${bookingId}.pdf"`,
        "Access-Control-Allow-Origin": "*",
      });
      res.end(Buffer.from(pdf));
      return;
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    if (pathname.startsWith("/api/reviews")) {
      if (pathname.startsWith("/api/reviews/item/") && req.method === "GET") {
        const itemId = pathname.split("/").pop();
        return jsonResponse(res, await getReviewsForItem(itemId));
      }
      if (pathname.startsWith("/api/reviews/rating/") && req.method === "GET") {
        const itemId = pathname.split("/").pop();
        const [avgRating, reviews] = await Promise.all([getAverageRatingForItem(itemId), getReviewsForItem(itemId)]);
        return jsonResponse(res, { averageRating: avgRating, reviewCount: reviews.length });
      }
      if (pathname === "/api/reviews" && req.method === "POST") {
        const { userId, itemId, itemType, rating, title, comment } = await readBody(req);
        if (!userId || !itemId || !itemType || !rating || !title || !comment)
          return jsonResponse(res, { error: "Missing required fields" }, 400);
        if (rating < 1 || rating > 5) return jsonResponse(res, { error: "Rating must be 1–5" }, 400);
        const result = await createReview(userId, itemId, itemType, rating, title, comment);
        if (!result.success) return jsonResponse(res, { error: result.error }, 500);
        return jsonResponse(res, { success: true, review: result.review });
      }
      if (pathname.match(/^\/api\/reviews\/[a-zA-Z0-9]+$/) && req.method === "DELETE") {
        const reviewId = pathname.split("/").pop();
        await deleteReview(reviewId);
        return jsonResponse(res, { success: true });
      }
    }

    // ── Coupons ───────────────────────────────────────────────────────────────

    if (pathname === "/api/admin/coupons") {
      if (req.method === "GET") return jsonResponse(res, await listCoupons());
      if (req.method === "POST") {
        const { code, discountType, discountValue, maxUses = -1, validFrom, validTo } = await readBody(req);
        if (!code || !discountType || discountValue === undefined || !validFrom || !validTo)
          return jsonResponse(res, { error: "Missing required fields" }, 400);
        try {
          const coupon = await createCoupon(code, discountType, Number(discountValue), Number(maxUses), new Date(validFrom), new Date(validTo));
          return jsonResponse(res, { success: true, coupon });
        } catch (e) {
          if (e?.code === "P2002") return jsonResponse(res, { error: "Coupon code already exists" }, 400);
          return jsonResponse(res, { error: "Failed to create coupon" }, 500);
        }
      }
      return jsonResponse(res, { error: "Method not allowed" }, 405);
    }

    if (pathname === "/api/coupons/validate" && req.method === "POST") {
      const { code, amount } = await readBody(req);
      if (!code || !amount) return jsonResponse(res, { error: "Missing fields" }, 400);
      const result = await validateCoupon(code, amount);
      if (!result.valid) return jsonResponse(res, { success: false, error: result.error }, 400);
      return jsonResponse(res, { success: true, coupon: result.coupon?.code, discount: result.discount, savings: result.savings, finalAmount: result.finalAmount });
    }

    if (pathname === "/api/coupons/apply" && req.method === "POST") {
      const { code } = await readBody(req);
      if (!code) return jsonResponse(res, { error: "Coupon code required" }, 400);
      await applyCoupon(code);
      return jsonResponse(res, { success: true });
    }

    // ── Saved Items ───────────────────────────────────────────────────────────

    if (pathname === "/api/saved-items") {
      const userId = await validateSession(getToken(req));
      if (!userId) return jsonResponse(res, { error: "Unauthorized" }, 401);
      if (req.method === "GET") {
        return jsonResponse(res, await getSavedItems(userId));
      }
      if (req.method === "POST") {
        const { itemId, type, title, subtitle, price, meta } = await readBody(req);
        if (!itemId || !type || !title) return jsonResponse(res, { error: "Missing fields" }, 400);
        const result = await toggleSavedItemDB(userId, { itemId, type, title, subtitle: subtitle ?? "", price: price ?? 0, meta: meta ?? {} });
        return jsonResponse(res, result);
      }
      return jsonResponse(res, { error: "Method not allowed" }, 405);
    }

    jsonResponse(res, { error: "Not found" }, 404);
    finish(404);
  } catch (err) {
    console.error("[dev-server] Error:", err);
    jsonResponse(res, { error: "Internal server error", detail: err?.message }, 500);
    finish(500);
  }
});

server.listen(PORT, () => {
  console.log(`✅  Dev API server running at http://localhost:${PORT}/api/`);
});
