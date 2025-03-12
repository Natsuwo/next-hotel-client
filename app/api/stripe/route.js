import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import api from "@/app/_lib/supabase/api";
import { cookies, headers } from "next/headers";
import { getRoomById } from "@/app/_lib/supabase/rooms";
import { daysDifferCount } from "@/app/utils/datetime";
import { format, parse } from "date-fns";
import { getGuestById } from "@/app/_lib/supabase/guests";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export async function POST(req, res) {
  const headersList = headers();
  const requestBody = await req.json();

  // PREVENT MALICIOUS ACCESS

  const bearerToken = headersList.get("Authorization");
  // console.log({ bearerToken });

  if (!bearerToken?.length) {
    return NextResponse.json(
      {
        status: "forbidden",
        message: "you are unauthorized to access this resource",
      },
      { status: 403 }
    );
  }

  const accessToken = bearerToken.split(" ").at(1);

  const cookiesInstance = cookies();

  if (!requestBody?.pending_reservation)
    return NextResponse.json(
      {
        status: "error",
        message:
          "you are unauthorized to access this resource! please make a booking from the rooms page.",
      },
      { status: 403 }
    );

  const pending_reservation = requestBody.pending_reservation;

  const [guest, room] = await Promise.all([
    getGuestById(accessToken),
    getRoomById(pending_reservation?.room_id),
  ]);

  if (!guest?.id) {
    return NextResponse.json(
      {
        status: "forbidden",
        message: "you are unauthorized to perform this operation.",
      },
      { status: 403 }
    );
  }

  if (!room?.id) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "room doesn't exists! please make a booking from the rooms page.",
      },
      { status: 422 }
    );
  }

  const totalNights = daysDifferCount(
    pending_reservation.check_out,
    pending_reservation.check_in
  );

  const totalUSDPrice = parseFloat(pending_reservation?.total_price);
  const totalCentPrice = Math.round(totalUSDPrice * 100);

  // const data = await req;
  // console.log({ METHOD: req.method, data: data, pending_reservation });
  // console.log({ body: req.body, bodyPrice: req.body.priceId });

  if (req.method === "POST") {
    try {
      // Create Checkout Sessions from body params.

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // price: data.priceId, // THIS IS USEFULL WHEN HAVING PRODUCTS IN STRIP DASHBOARD
            quantity: 1,
            price_data: {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              currency: "usd",
              unit_amount: totalCentPrice,
              product_data: {
                name: room?.room_type?.title,
                description: `Booking ${room?.room_type?.title} for ${
                  pending_reservation.adults
                } guest(s). Starting from ${format(
                  pending_reservation.check_in,
                  "LLLL dd yyyy"
                )} until ${format(
                  pending_reservation.check_out,
                  "LLLL do yyyy"
                )} : (${totalNights}) Nights`,
                images: [room?.thumbnails[0]?.url],
              },
            },
          },
        ],
        mode: "payment",
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 2, // EXPIRE IN 2 HOURS FROM CREATION TIME
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservations/checkout`,
      });

      const reservation = await api.post(
        "/reservation/create",
        {
          ...pending_reservation,
          session_id: session.id,
          payment_method: "card",
        },
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      );

      if (!reservation.success) {
        return NextResponse.json(
          {
            status: "error",
            message: reservation?.message,
          },
          { status: 422 }
        );
      }

      // console.log({ session });
      const updated_session = await stripe.checkout.sessions.update(
        session.id,
        {
          metadata: {
            payload: JSON.stringify({
              session_id: session.id,
              pending_reservation,
              guest_id: guest.id,
              reservation_id: reservation?.data?.id,
              invoice_id: reservation?.data?.invoice_id,
            }),
          },
        }
      );

      console.log("NO ERROR");

      cookiesInstance.set("payment_id", session.id);

      return NextResponse.json(
        {
          status: "success",
          session_id: session.id,
          checkout_url: session.url,
        },
        { status: 200 }
      );
      // return req.redirect(303, session.url);
      // return NextResponse.redirect(new URL(session.url));
    } catch (err) {
      console.log("!!!!!!!!! ERROR !!!!!!!!!!!");
      console.log({ ERROR: err?.message ?? err });
      return NextResponse.json({ error: err?.message }, { status: 500 });
    }
  } else {
    NextResponse.setHeader("Allow", ["POST"]);
    return NextResponse.status(405).end("Method Not Allowed");
  }
}

export async function PUT(req, res) {
  const headersList = headers();
  const requestBody = await req.json();

  // PREVENT MALICIOUS ACCESS

  const bearerToken = headersList.get("Authorization");
  // console.log({ bearerToken });

  if (!bearerToken?.length) {
    return NextResponse.json(
      {
        status: "forbidden",
        message: "you are unauthorized to access this resource",
      },
      { status: 403 }
    );
  }

  const accessToken = bearerToken.split(" ").at(1);
  const cookiesInstance = cookies();

  if (!requestBody?.invoice)
    return NextResponse.json(
      {
        status: "error",
        message:
          "you are unauthorized to access this resource! please make a booking from the rooms page.",
      },
      { status: 403 }
    );

  const invoice = requestBody.invoice;

  const [guest, room] = await Promise.all([
    getGuestById(accessToken),
    getRoomById(invoice?.room_id),
  ]);

  if (!guest?.id) {
    return NextResponse.json(
      {
        status: "forbidden",
        message: "you are unauthorized to perform this operation.",
      },
      { status: 403 }
    );
  }

  if (!room?.id) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "room doesn't exists! please make a booking from the rooms page.",
      },
      { status: 422 }
    );
  }

  const totalCentPrice = Math.round(invoice.amount * 100);
  const reservation = invoice?.reservation;

  if (!reservation) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "reservation not found! please make a booking from the rooms page.",
      },
      { status: 422 }
    );
  }

  const totalNights = daysDifferCount(
    reservation.check_out,
    reservation.check_in
  );

  if (req.method === "PUT") {
    try {
      // Create Checkout Sessions from body params.
      if (totalCentPrice <= 0) {
        return NextResponse.json(
          {
            success: true,
            status: "error",
            message: "Invalid amount",
          },
          { status: 200 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // price: data.priceId, // THIS IS USEFULL WHEN HAVING PRODUCTS IN STRIP DASHBOARD
            quantity: 1,
            price_data: {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              currency: "usd",
              unit_amount: totalCentPrice,
              product_data: {
                name: room?.room_type?.title,
                description: `Booking ${room?.room_type?.title} for ${
                  reservation.adults
                } guest(s). Starting from ${format(
                  reservation.check_in,
                  "LLLL dd yyyy"
                )} until ${format(
                  reservation.check_out,
                  "LLLL do yyyy"
                )} : (${totalNights}) Nights`,
                images: [room?.thumbnails[0]?.url],
              },
            },
          },
        ],
        mode: "payment",
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 2, // EXPIRE IN 2 HOURS FROM CREATION TIME
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservations/checkout`,
      });

      const payment = await api.post(
        "/payment/create",
        {
          invoice_id: invoice.id,
          transaction_id: session.id,
          payment_method: "card",
        },
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      );

      if (!payment.success) {
        return NextResponse.json(
          {
            status: "error",
            message: reservation?.message,
          },
          { status: 422 }
        );
      }

      // console.log({ session });
      const updated_session = await stripe.checkout.sessions.update(
        session.id,
        {
          metadata: {
            payload: JSON.stringify({
              session_id: session.id,
              guest_id: guest.id,
              reservation_id: reservation?.id,
              invoice_id: invoice?.id,
            }),
          },
        }
      );

      console.log("NO ERROR");

      cookiesInstance.set("payment_id", session.id);

      return NextResponse.json(
        {
          status: "success",
          session_id: session.id,
          checkout_url: session.url,
        },
        { status: 200 }
      );
      // return req.redirect(303, session.url);
      // return NextResponse.redirect(new URL(session.url));
    } catch (err) {
      console.log("!!!!!!!!! ERROR !!!!!!!!!!!");
      console.log({ ERROR: err?.message ?? err });
      return NextResponse.json({ error: err?.message }, { status: 500 });
    }
  } else {
    NextResponse.setHeader("Allow", ["POST"]);
    return NextResponse.status(405).end("Method Not Allowed");
  }
}

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "Session not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ url: session.url });
}
