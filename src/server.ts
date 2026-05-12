import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { searchFlights } from "./data/flights";
import { searchHotels } from "./data/hotels";
import { searchTrains } from "./data/trains";
import { searchHolidays } from "./data/holidays";
import { packages } from "./data/packages";
import { validateEnv } from "./lib/env";
import { hashPassword, verifyPassword, generateSessionToken } from "./lib/auth";
import { createUser, findUserByEmail, validateUserPassword, createBooking, getUserBookings, createTransaction, getBookingById, updateBookingStatus, cancelBooking, createReview, getReviewsForItem, getUserReviewForItem, getAverageRatingForItem, deleteReview, validateCoupon, applyCoupon, getWalletBalance, topUpWallet, spendFromWallet } from "./lib/db";
import { generateBookingPDF } from "./lib/pdf";
import { searchFlightsWithDuffel } from "./lib/duffel";
import { applySearchFiltersAndSort } from "./lib/search";
import { Duffel } from '@duffel/api';
import Stripe from 'stripe';
import { Resend } from 'resend';

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function jsonResponse(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

async function forwardToDuffel(request: Request, baseUrl: string) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, baseUrl).toString();
  return fetch(target, {
    method: request.method,
    headers: request.headers,
    body: request.method === "GET" ? null : request.body,
  });
}

async function handleApiRequest(request: Request, env: unknown) {
  const url = new URL(request.url);
  const envRecord = env as Record<string, string | undefined>;

  try {
    validateEnv(envRecord);
  } catch (error) {
    console.error('Environment validation failed:', error);
    return jsonResponse(
      { error: 'Server configuration error. Contact support.' },
      { status: 500 }
    );
  }

  const envAny = envRecord;
  const duffel = new Duffel({
    token: envAny.DUFFEL_API_KEY || ""
  });

  if (url.pathname === "/api/search/flights") {
    const origin = url.searchParams.get("origin") ?? "";
    const destination = url.searchParams.get("destination") ?? "";
    const departDate = url.searchParams.get("departDate") ?? "";
    const cabin = url.searchParams.get("cabin") ?? "Any";

    const minPrice = url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice")!) : undefined;
    const maxPrice = url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice")!) : undefined;
    const maxStops = url.searchParams.get("maxStops") ? parseInt(url.searchParams.get("maxStops")!) : undefined;
    const sortBy = (url.searchParams.get("sortBy") as any) ?? undefined;

    if (envAny.DUFFEL_API_KEY && envAny.DUFFEL_API_KEY !== 'your_duffel_api_key') {
      try {
        const duffelFlights = await searchFlightsWithDuffel(duffel, {
          origin,
          destination,
          departDate,
          cabin
        });

        if (duffelFlights.length > 0) {
          const filtered = applySearchFiltersAndSort(duffelFlights, {
            minPrice,
            maxPrice,
            maxStops,
            cabins: cabin && cabin !== 'Any' ? [cabin] : undefined
          }, sortBy);
          return jsonResponse(filtered);
        }
      } catch (error) {
        console.warn('Duffel API search failed, falling back to mock data:', error);
      }
    }

    const mockFlights = searchFlights({ origin, destination, departDate, cabin });
    const filtered = applySearchFiltersAndSort(mockFlights, {
      minPrice,
      maxPrice,
      maxStops,
      cabins: cabin && cabin !== 'Any' ? [cabin] : undefined
    }, sortBy);

    return jsonResponse(filtered);
  }

  if (url.pathname === "/api/search/hotels") {
    const city = url.searchParams.get("city") ?? "";
    const checkIn = url.searchParams.get("checkIn") ?? "";
    const checkOut = url.searchParams.get("checkOut") ?? "";
    const guests = Number(url.searchParams.get("guests") ?? "2");

    // Duffel API currently focuses on flights, so hotels use mock data
    // Hotels integration can be added when Duffel expands to accommodation
    return jsonResponse(searchHotels({ city, guests, filters: { recommended: false, promotion: false, childFriendly: false, availableOnly: false, refundable: false }, rating: null }));
  }

  if (url.pathname === "/api/search/trains") {
    const origin = url.searchParams.get("origin") ?? "";
    const destination = url.searchParams.get("destination") ?? "";
    const departDate = url.searchParams.get("departDate") ?? "";
    const seatClass = url.searchParams.get("seatClass") ?? "Any";
    return jsonResponse(searchTrains({ origin, destination, departDate, seatClass }));
  }

  if (url.pathname === "/api/search/holidays") {
    const destination = url.searchParams.get("destination") ?? "";
    const date = url.searchParams.get("date") ?? "";
    const guests = Number(url.searchParams.get("guests") ?? "2");
    return jsonResponse(searchHolidays({ destination, date, guests }));
  }

  if (url.pathname === "/api/payment/create-intent") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }
    
    try {
      const { amount, currency = "TND", description, email } = await request.json() as any;
      
      const stripeSecret = envAny.STRIPE_SECRET_KEY || "";
      if (!stripeSecret || stripeSecret === "your_stripe_secret_key") {
        console.warn('Mocking Stripe payment intent because STRIPE_SECRET_KEY is missing.');
        return jsonResponse({
          clientSecret: "mock_client_secret_for_development_only_" + Date.now(),
          paymentIntentId: "pi_mock_" + Date.now(),
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase()
        });
      }

      const stripe = new Stripe(stripeSecret);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        description,
        receipt_email: email,
        metadata: {
          booking_date: new Date().toISOString(),
          customer_email: email
        }
      });

      return jsonResponse({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return jsonResponse({ error: 'Failed to create payment intent' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/email/booking-confirmation") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }
    
    try {
      const { 
        customerEmail, 
        customerName, 
        bookingId, 
        bookingDetails, 
        totalAmount,
        currency = "TND"
      } = await request.json() as any;

      const resendApiKey = envAny.RESEND_API_KEY || "";
      if (!resendApiKey || resendApiKey === "your_resend_api_key") {
        console.warn('Mocking email confirmation because RESEND_API_KEY is missing.');
        return jsonResponse({
          success: true,
          emailId: "mock_email_" + Date.now(),
          message: 'Mock confirmation email sent successfully'
        });
      }

      const resend = new Resend(resendApiKey);
      const senderEmail = envAny.SENDER_EMAIL || 'bookings@rahitravels.tn';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #007bff; color: white; padding: 20px; border-radius: 5px; }
              .details { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .footer { color: #777; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
              strong { color: #007bff; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmation</h1>
                <p>Thank you for your booking, ${customerName}!</p>
              </div>
              
              <div class="details">
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Total Amount:</strong> ${totalAmount} ${currency}</p>
                <p><strong>Status:</strong> CONFIRMED</p>
              </div>

              <div class="details">
                <h3>Booking Details</h3>
                <pre>${JSON.stringify(bookingDetails, null, 2)}</pre>
              </div>

              <p>We've sent you a confirmation email. Please check your email for further details.</p>
              <p>If you have any questions, contact us at <strong>+216 71 000 000</strong> or WhatsApp us.</p>

              <div class="footer">
                <p>© 2026 Rahi Travels - Premium Tunisia Travel Booking Platform</p>
                <p>This is an automated email, please do not reply directly.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: senderEmail,
        to: customerEmail,
        subject: `Booking Confirmation - ${bookingId}`,
        html: emailHtml
      });

      return jsonResponse({
        success: true,
        emailId: response.data?.id,
        message: 'Confirmation email sent successfully'
      });
    } catch (error) {
      console.error('Email sending error:', error);
      return jsonResponse({ error: 'Failed to send confirmation email' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/auth/signup") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { email, password, name } = await request.json() as any;

      if (!email || !password || !name) {
        return jsonResponse(
          { error: "Missing required fields: email, password, name" },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return jsonResponse(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonResponse(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      const result = await createUser(email, password, name);
      if (!result.success) {
        return jsonResponse(
          { error: result.error || 'Signup failed' },
          { status: 400 }
        );
      }

      const sessionToken = generateSessionToken();

      return jsonResponse({
        success: true,
        user: result.user,
        sessionToken
      });
    } catch (error) {
      console.error('Signup error:', error);
      return jsonResponse({ error: 'Signup failed' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/auth/login") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { email, password } = await request.json() as any;

      if (!email || !password) {
        return jsonResponse(
          { error: "Missing required fields: email, password" },
          { status: 400 }
        );
      }

      const user = await validateUserPassword(email, password);
      if (!user) {
        return jsonResponse(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const sessionToken = generateSessionToken();

      return jsonResponse({
        success: true,
        user,
        sessionToken
      });
    } catch (error) {
      console.error('Login error:', error);
      return jsonResponse({ error: 'Login failed' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/wallet") {
    if (request.method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) return jsonResponse({ error: "userId is required" }, { status: 400 });
      const balance = await getWalletBalance(userId);
      return jsonResponse({ balance });
    }
  }

  if (url.pathname === "/api/wallet/topup") {
    if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    try {
      const { userId, amount } = await request.json() as any;
      if (!userId || !amount || amount <= 0) return jsonResponse({ error: "Invalid request" }, { status: 400 });
      const balance = await topUpWallet(userId, amount);
      return jsonResponse({ success: true, balance });
    } catch (error) {
      return jsonResponse({ error: "Top-up failed" }, { status: 500 });
    }
  }

  if (url.pathname === "/api/wallet/spend") {
    if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    try {
      const { userId, amount } = await request.json() as any;
      if (!userId || !amount || amount <= 0) return jsonResponse({ error: "Invalid request" }, { status: 400 });
      const result = await spendFromWallet(userId, amount);
      if (!result.success) return jsonResponse({ error: result.error, balance: result.balance }, { status: 400 });
      return jsonResponse({ success: true, balance: result.balance });
    } catch (error) {
      return jsonResponse({ error: "Spend failed" }, { status: 500 });
    }
  }

  if (url.pathname === "/api/bookings") {
    if (request.method === "GET") {
      try {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return jsonResponse(
            { error: "userId is required" },
            { status: 400 }
          );
        }

        const bookings = await getUserBookings(userId);
        return jsonResponse(bookings);
      } catch (error) {
        console.error('Get bookings error:', error);
        return jsonResponse({ error: 'Failed to fetch bookings' }, { status: 500 });
      }
    }

    if (request.method === "POST") {
      try {
        const { userId, bookingId, type, details, totalAmount, currency = 'TND', departDate } = await request.json() as any;

        if (!userId || !bookingId || !type || !details || totalAmount === undefined) {
          return jsonResponse(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        const booking = await createBooking(
          userId,
          bookingId,
          type,
          details,
          totalAmount,
          currency,
          departDate
        );

        return jsonResponse({
          success: true,
          booking
        });
      } catch (error) {
        console.error('Create booking error:', error);
        return jsonResponse({ error: 'Failed to create booking' }, { status: 500 });
      }
    }

    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  if (url.pathname === "/api/bookings/details") {
    try {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) {
        return jsonResponse(
          { error: "bookingId is required" },
          { status: 400 }
        );
      }

      const booking = await getBookingById(bookingId);
      if (!booking) {
        return jsonResponse(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      return jsonResponse(booking);
    } catch (error) {
      console.error('Get booking details error:', error);
      return jsonResponse({ error: 'Failed to fetch booking' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/bookings/cancel") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { bookingId } = await request.json() as any;

      if (!bookingId) {
        return jsonResponse(
          { error: "bookingId is required" },
          { status: 400 }
        );
      }

      const booking = await getBookingById(bookingId);
      if (!booking) {
        return jsonResponse(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      if (booking.status === 'cancelled') {
        return jsonResponse(
          { error: "Booking already cancelled" },
          { status: 400 }
        );
      }

      const cancelled = await cancelBooking(bookingId);

      return jsonResponse({
        success: true,
        booking: cancelled,
        message: "Booking cancelled successfully"
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      return jsonResponse({ error: 'Failed to cancel booking' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/bookings/status") {
    try {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) {
        return jsonResponse(
          { error: "bookingId is required" },
          { status: 400 }
        );
      }

      const booking = await getBookingById(bookingId);
      if (!booking) {
        return jsonResponse(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      return jsonResponse({
        bookingId: booking.bookingId,
        status: booking.status,
        type: booking.type,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookingDate: booking.bookingDate,
        departDate: booking.departDate
      });
    } catch (error) {
      console.error('Get booking status error:', error);
      return jsonResponse({ error: 'Failed to fetch booking status' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/bookings/download-pdf") {
    try {
      const bookingId = url.searchParams.get("bookingId");
      if (!bookingId) {
        return jsonResponse(
          { error: "bookingId is required" },
          { status: 400 }
        );
      }

      const booking = await getBookingById(bookingId);
      if (!booking) {
        return jsonResponse(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      const pdfBuffer = await generateBookingPDF({
        bookingId: booking.bookingId,
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        bookingDetails: booking.details,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookingDate: booking.bookingDate.toString()
      });

      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="booking-${bookingId}.pdf"`
        }
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      return jsonResponse({ error: 'Failed to generate PDF' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/packages") {
    return jsonResponse(packages);
  }

  // Coupon endpoints
  if (url.pathname === "/api/coupons/validate" && request.method === "POST") {
    try {
      const { code, amount } = await request.json() as any;

      if (!code || !amount) {
        return jsonResponse(
          { error: "Missing required fields: code, amount" },
          { status: 400 }
        );
      }

      const result = await validateCoupon(code, amount);
      if (!result.valid) {
        return jsonResponse(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return jsonResponse({
        success: true,
        coupon: result.coupon?.code,
        discount: result.discount,
        savings: result.savings,
        finalAmount: result.finalAmount
      });
    } catch (error) {
      console.error('Coupon validation error:', error);
      return jsonResponse({ error: 'Failed to validate coupon' }, { status: 500 });
    }
  }

  if (url.pathname === "/api/coupons/apply" && request.method === "POST") {
    try {
      const { code } = await request.json() as any;

      if (!code) {
        return jsonResponse(
          { error: "Coupon code required" },
          { status: 400 }
        );
      }

      await applyCoupon(code);
      return jsonResponse({ success: true });
    } catch (error) {
      console.error('Coupon apply error:', error);
      return jsonResponse({ error: 'Failed to apply coupon' }, { status: 500 });
    }
  }

  // Review endpoints
  if (url.pathname.startsWith("/api/reviews")) {
    // GET /api/reviews/item/:itemId - get all reviews for an item
    if (url.pathname.match(/^\/api\/reviews\/item\//) && request.method === "GET") {
      const itemId = url.pathname.split("/").pop();
      if (!itemId) {
        return jsonResponse({ error: "Item ID required" }, { status: 400 });
      }
      const reviews = await getReviewsForItem(itemId);
      return jsonResponse(reviews);
    }

    // GET /api/reviews/rating/:itemId - get average rating for an item
    if (url.pathname.match(/^\/api\/reviews\/rating\//) && request.method === "GET") {
      const itemId = url.pathname.split("/").pop();
      if (!itemId) {
        return jsonResponse({ error: "Item ID required" }, { status: 400 });
      }
      const avgRating = await getAverageRatingForItem(itemId);
      const reviews = await getReviewsForItem(itemId);
      return jsonResponse({ 
        averageRating: avgRating, 
        reviewCount: reviews.length 
      });
    }

    // POST /api/reviews - create/update review
    if (url.pathname === "/api/reviews" && request.method === "POST") {
      try {
        const { userId, itemId, itemType, rating, title, comment } = await request.json() as any;

        if (!userId || !itemId || !itemType || !rating || !title || !comment) {
          return jsonResponse(
            { error: "Missing required fields: userId, itemId, itemType, rating, title, comment" },
            { status: 400 }
          );
        }

        if (rating < 1 || rating > 5) {
          return jsonResponse(
            { error: "Rating must be between 1 and 5" },
            { status: 400 }
          );
        }

        const result = await createReview(userId, itemId, itemType, rating, title, comment);
        if (!result.success) {
          return jsonResponse({ error: result.error }, { status: 500 });
        }

        return jsonResponse({ success: true, review: result.review });
      } catch (error) {
        console.error('Review creation error:', error);
        return jsonResponse({ error: 'Failed to create review' }, { status: 500 });
      }
    }

    // DELETE /api/reviews/:reviewId - delete review
    if (url.pathname.match(/^\/api\/reviews\/[a-zA-Z0-9]+$/) && request.method === "DELETE") {
      try {
        const reviewId = url.pathname.split("/").pop();
        if (!reviewId) {
          return jsonResponse({ error: "Review ID required" }, { status: 400 });
        }
        await deleteReview(reviewId);
        return jsonResponse({ success: true });
      } catch (error) {
        console.error('Review deletion error:', error);
        return jsonResponse({ error: 'Failed to delete review' }, { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
