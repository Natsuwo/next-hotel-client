"use server";
import { auth, signIn, signOut } from "@/auth";
import { contactSchema, signInSchema, signupSchema } from "./zodSchemas";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { areIntervalsOverlapping, isBefore, isValid } from "date-fns";
import {
  cancelReservation,
  getReservationByID,
  getRoomReservations,
  getRoomReservationsByRoomNumber,
  updateReseration,
} from "./supabase/reservations";
import { bookingTotalPrice } from "../utils/reservationsCalcs";
import { daysDifferCount } from "../utils/datetime";
import { revalidatePath } from "next/cache";
import { createGuest, getGuestByEmail } from "./supabase/guests";
// import { hash, hashSync } from "bcryptjs";
import { createMessage } from "./supabase/inbox";
import axios from "axios";

export async function authAction(prevState, formData) {
  // await new Promise((res) => setTimeout(res, 500));
  const email = formData.get("email");
  const password = formData.get("password");
  prevState = {};

  if (!(email && password))
    return { message: "email and password are required" };

  try {
    signInSchema.parse({ email, password });
  } catch (err) {
    err.errors.forEach((element) => {
      prevState[element?.path[0] ?? "unknown"] = element.message;
    });

    return { ...prevState };
  }

  const credentials = { email, password };
  let loginSuccess = true;
  try {
    await signIn("credentials", { ...credentials, redirect: false });
  } catch (err) {
    loginSuccess = false;
    return {
      ...prevState,
      criticalError: err?.cause?.err?.message
        ? err?.cause?.err?.message
        : "Wrong email or password!",
    };
  } finally {
    if (loginSuccess)
      redirect(
        cookies().has("pending_reservation")
          ? "/reservations/checkout"
          : "/account/history"
      );
  }
}

export async function bookingCancelAction() {
  // await new Promise((res) => setTimeout(res, 5000));

  const cookiesStore = cookies();
  if (cookiesStore.has("pending_reservation")) {
    cookies().delete("pending_reservation");
    redirect("/rooms", "replace");
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}

export async function reservationUpdateAction(prevState, formData) {
  prevState = {};

  const check_in = new Date(formData.get("check_in"));
  const check_out = new Date(formData.get("check_out"));
  // const adults = formData.get("adults");
  const total_price = formData.get("total_price");
  const tax_price = formData.get("tax_price");
  const vat_price = formData.get("vat_price");
  const reservation_id = formData.get("reservation_id");

  // CHECKING FOR DATES VALIDATION THAT WAS PICKED UP BY REACT DAYPICKER
  if (!(isValid(check_in) && isValid(check_out)))
    return {
      ...prevState,
      error: "Invalid date, please choose a range from the calendar",
    };
  if (isBefore(check_out, check_in))
    return {
      ...prevState,
      error: "Invalid date, please choose a valid rate range from the calendar",
    };

  // CHECKING FOR USER AUTHENTICATION AND THE EXISTENCE OF THE TARGETED RESERVATION
  const session = await auth();

  if (!session?.user)
    return {
      ...prevState,
      error:
        "Unauthorized to perform this action, please sign in and try again",
    };

  const target_reservation = await getReservationByID(
    session.accessToken,
    reservation_id
  );

  if (!target_reservation)
    return {
      ...prevState,
      error:
        "Error, you are attempting to update an unexisted reservation. please access through your reservation history!",
    };

  // MAKING SURE THAT THE NEW SELECTED DATE RANGE DOES NOT INTERSECT WITH AN ALREADY BOOKED ONE
  // EXCEPT THE CURRENT RESERVATION THAT IS MEANT TO BE UPDATED
  const planned_room_reservations = await getRoomReservationsByRoomNumber(
    target_reservation.room_number
  );
  // const room_busy_days = planned_room_reservations.filter((item) =>
  //   item.id != reservation_id
  //     ? {
  //         start: new Date(item.check_in),
  //         end: new Date(item.check_out),
  //       }
  //     : false
  // );

  // if (
  //   room_busy_days.find((item) =>
  //     areIntervalsOverlapping(item, { start: check_in, end: check_out })
  //   )
  // ) {
  //   return {
  //     ...prevState,
  //     error:
  //       "Invalid date! The selected range already have a booked plan, please adjust your booking range",
  //   };
  // }

  if (planned_room_reservations.length > 0) {
    const room_busy_days = planned_room_reservations.filter((item) =>
      item.id != reservation_id
        ? {
            start: new Date(item.check_in),
            end: new Date(item.check_out),
          }
        : false
    );

    if (
      room_busy_days.find((item) =>
        areIntervalsOverlapping(item, { start: check_in, end: check_out })
      )
    ) {
      return {
        ...prevState,
        error:
          "Invalid date! The selected range already have a booked plan, please adjust your booking range",
      };
    }
  }

  // CHECKING FOR THE USER AUTHORISATION TO UPDATE THE RESERVATION
  if (parseInt(target_reservation.guest_id) !== parseInt(session.user.id))
    return { ...prevState, error: "Unauthorized to perform this action!" };

  const totalNights = daysDifferCount(check_out, check_in);
  // const new_total = bookingTotalPrice(
  //   target_reservation.room?.room_type?.price_per_night,
  //   adults,
  //   totalNights
  // );

  const response = await updateReseration(
    session.accessToken,
    reservation_id,
    totalNights,
    total_price,
    tax_price,
    vat_price,
    check_in,
    check_out
  );

  if (response && response.id) {
    const responseStripe = await axios.put(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe`,
      { invoice: response },
      {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }
    );

    const { checkout_url } = responseStripe.data;

    if (checkout_url) {
      redirect(checkout_url);
    }
  }

  // revalidatePath(`/reservations/edit/${reservation_id}`);

  return { status: "success" };
}

export async function reservationCancelAction(prevState, formData) {
  const reservation_id = formData.get("reservation_id");

  const session = await auth();

  await cancelReservation(session?.supabaseAccessToken, reservation_id);

  revalidatePath("/account/history");
}

export async function signupAction(prevState, formData) {
  prevState = {};
  const fullname = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");

  try {
    const z_validation = signupSchema.parse({
      name: fullname,
      phone,
      email,
      password,
      confirm_password,
    });
  } catch (err) {
    console.log("Caugth Validation");
    console.log(err);
    err.errors.forEach((element) => {
      prevState[element?.path[0] ?? "unknown"] = element.message;
    });
    return { ...prevState };
  }

  const does_email_exists = await getGuestByEmail(email);
  if (does_email_exists)
    return { ...prevState, critical: "Email address already exists!" };

  const avatar = `https://ui-avatars.com/api/?name=${fullname.replace(
    " ",
    "+"
  )}&background=161616&color=F1F1F1`;

  const { success, message } = await createGuest(
    fullname,
    email,
    avatar,
    password,
    phone
  );
  if (!success) {
    if (
      message &&
      message.includes("Duplicate entry") &&
      message.includes("for key 'phone'")
    ) {
      return { ...prevState, critical: "Phone number is already exist" };
    }
    return { ...prevState, critical: JSON.stringify(guestRes) };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    console.error(err);
    return {
      ...prevState,
      authErr:
        "Error occured while attempting to authenticate you. Please try login in through the sign page!",
    };
  }

  redirect("/account/history");
}

export async function contactAction(state, formData) {
  "use server";
  let currentState = {
    errors: {},
    isSuccess: false,
  };

  const fullname = formData.get("fullname");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const message = formData.get("message");

  const validation = contactSchema.safeParse({
    fullname,
    email,
    phone,
    message,
  });

  if (!validation.success) {
    const errors = {};
    validation.error.issues.forEach((item) => {
      errors[item.path.at(0)] = item.message;
    });
    return { ...currentState, errors };
  }

  try {
    await createMessage({ fullname, email, phone, message });
  } catch (err) {
    return {
      ...currentState,
      errors: { ...currentState.errors, critical: err.message },
    };
  }

  return { ...currentState, isSuccess: true, errors: {} };
}
