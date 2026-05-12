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

// Dynamically import the project's compiled modules
// We use tsx/ts-node compatible ESM imports via the registered loader
async function getHandlers() {
  const [
    { searchFlights },
    { searchHotels },
    { searchTrains },
    { searchHolidays },
    { packages },
    { hashPassword, verifyPassword, generateSessionToken },
    { createUser, validateUserPassword, createBooking, getUserBookings, getBookingById, cancelBooking, getWalletBalance, topUpWallet, spendFromWallet },
  ] = await Promise.all([
    import("./src/data/flights.ts"),
    import("./src/data/hotels.ts"),
    import("./src/data/trains.ts"),
    import("./src/data/holidays.ts"),
    import("./src/data/packages.ts"),
    import("./src/lib/auth.ts"),
    import("./src/lib/db.ts"),
  ]);

  return {
    searchFlights, searchHotels, searchTrains, searchHolidays, packages,
    hashPassword, verifyPassword, generateSessionToken,
    createUser, validateUserPassword, createBooking,
    getUserBookings, getBookingById, cancelBooking,
    getWalletBalance, topUpWallet, spendFromWallet,
  };
}

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
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

let handlers = null;

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    if (!handlers) handlers = await getHandlers();
    const { searchFlights, searchHotels, searchTrains, searchHolidays, packages, generateSessionToken, createUser, validateUserPassword, createBooking, getUserBookings, getBookingById, cancelBooking, getWalletBalance, topUpWallet, spendFromWallet } = handlers;

    // Flight search
    if (pathname === "/api/search/flights") {
      const results = searchFlights({
        origin: url.searchParams.get("origin") ?? "",
        destination: url.searchParams.get("destination") ?? "",
        departDate: url.searchParams.get("departDate") ?? "",
        cabin: url.searchParams.get("cabin") ?? "Any",
      });
      return jsonResponse(res, results);
    }

    // Hotel search
    if (pathname === "/api/search/hotels") {
      const results = searchHotels({
        city: url.searchParams.get("city") ?? "",
        guests: Number(url.searchParams.get("guests") ?? "2"),
        filters: { recommended: false, promotion: false, childFriendly: false, availableOnly: false, refundable: false },
        rating: null,
      });
      return jsonResponse(res, results);
    }

    // Train search
    if (pathname === "/api/search/trains") {
      const results = searchTrains({
        origin: url.searchParams.get("origin") ?? "",
        destination: url.searchParams.get("destination") ?? "",
        departDate: url.searchParams.get("departDate") ?? "",
        seatClass: url.searchParams.get("seatClass") ?? "Any",
      });
      return jsonResponse(res, results);
    }

    // Holiday search
    if (pathname === "/api/search/holidays") {
      const results = searchHolidays({
        destination: url.searchParams.get("destination") ?? "",
        date: url.searchParams.get("date") ?? "",
        guests: Number(url.searchParams.get("guests") ?? "2"),
      });
      return jsonResponse(res, results);
    }

    // Packages
    if (pathname === "/api/packages") {
      return jsonResponse(res, packages);
    }

    // Mock payment intent
    if (pathname === "/api/payment/create-intent" && req.method === "POST") {
      const { amount = 100, currency = "TND" } = await readBody(req);
      return jsonResponse(res, {
        clientSecret: "mock_client_secret_dev_" + Date.now(),
        paymentIntentId: "pi_mock_" + Date.now(),
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
      });
    }

    // Mock email confirmation
    if (pathname === "/api/email/booking-confirmation" && req.method === "POST") {
      return jsonResponse(res, { success: true, emailId: "mock_email_" + Date.now(), message: "Mock email sent" });
    }

    // Signup
    if (pathname === "/api/auth/signup" && req.method === "POST") {
      const { email, password, name } = await readBody(req);
      if (!email || !password || !name) return jsonResponse(res, { error: "Missing fields" }, 400);
      const result = await createUser(email, password, name);
      if (!result.success) return jsonResponse(res, { error: result.error }, 400);
      return jsonResponse(res, { success: true, user: { ...result.user, phone: "" }, sessionToken: generateSessionToken() });
    }

    // Login
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const { email, password } = await readBody(req);
      if (!email || !password) return jsonResponse(res, { error: "Missing fields" }, 400);
      const user = await validateUserPassword(email, password);
      if (!user) return jsonResponse(res, { error: "Invalid credentials" }, 401);
      return jsonResponse(res, { success: true, user: { ...user, phone: "" }, sessionToken: generateSessionToken() });
    }

    // Bookings GET
    if (pathname === "/api/bookings" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) return jsonResponse(res, { error: "userId required" }, 400);
      const bookings = await getUserBookings(userId);
      return jsonResponse(res, bookings);
    }

    // Bookings POST
    if (pathname === "/api/bookings" && req.method === "POST") {
      const { userId, bookingId, type, details, totalAmount, currency = "TND", departDate } = await readBody(req);
      if (!userId || !bookingId || !type || !details || totalAmount === undefined) {
        return jsonResponse(res, { error: "Missing fields" }, 400);
      }
      const booking = await createBooking(userId, bookingId, type, details, totalAmount, currency, departDate);
      return jsonResponse(res, { success: true, booking });
    }

    // Wallet balance
    if (pathname === "/api/wallet" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) return jsonResponse(res, { error: "userId required" }, 400);
      const balance = await getWalletBalance(userId);
      return jsonResponse(res, { balance });
    }

    // Wallet top-up
    if (pathname === "/api/wallet/topup" && req.method === "POST") {
      const { userId, amount } = await readBody(req);
      if (!userId || !amount || amount <= 0) return jsonResponse(res, { error: "Invalid request" }, 400);
      const balance = await topUpWallet(userId, amount);
      return jsonResponse(res, { success: true, balance });
    }

    // Wallet spend
    if (pathname === "/api/wallet/spend" && req.method === "POST") {
      const { userId, amount } = await readBody(req);
      if (!userId || !amount || amount <= 0) return jsonResponse(res, { error: "Invalid request" }, 400);
      const result = await spendFromWallet(userId, amount);
      if (!result.success) return jsonResponse(res, { error: result.error, balance: result.balance }, 400);
      return jsonResponse(res, { success: true, balance: result.balance });
    }

    // Cancel booking
    if (pathname === "/api/bookings/cancel" && req.method === "POST") {
      const { bookingId } = await readBody(req);
      const booking = await getBookingById(bookingId);
      if (!booking) return jsonResponse(res, { error: "Not found" }, 404);
      const cancelled = await cancelBooking(bookingId);
      return jsonResponse(res, { success: true, booking: cancelled });
    }

    jsonResponse(res, { error: "Not found" }, 404);
  } catch (err) {
    console.error("[dev-server] Error:", err);
    jsonResponse(res, { error: "Internal server error", detail: err?.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`✅  Dev API server running at http://localhost:${PORT}/api/`);
});
