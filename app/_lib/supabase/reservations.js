import { formatISO, formatISO9075 } from "date-fns";
import supabase, { supabaseWithToken } from "./db";
import api from "./api";

export async function getRoomReservations(id, options = {}) {
  // let { data: reservations, error } = await supabase
  //   .from("reservations")
  //   .select("*")
  //   .eq("room_id", id);

  const query = new URLSearchParams(options).toString();
  const {
    success,
    data: reservations,
    rooms_left,
    rooms,
  } = await api.get(`/rooms/${id}/reservations?${query}`, {
    next: {
      cache: "no-cache",
    },
  });

  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
    return false;
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return { reservations, rooms_left, rooms };
}

export async function getRoomReservationsByRoomNumber(
  room_number,
  options = {}
) {
  // let { data: reservations, error } = await supabase
  //   .from("reservations")
  //   .select("*")
  //   .eq("room_id", id);

  const query = new URLSearchParams(options).toString();
  const { success, data: reservations } = await api.get(
    `/reservation/room_number/${room_number}?${query}`,
    {
      cache: "no-cache",
    }
  );

  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
    return false;
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return reservations;
}

export async function getGuestReservations(accessToken, guest_id, query = "") {
  const {
    success,
    data: reservations,
    total_page,
  } = await api.get(`/reservation/guest/${guest_id}${query ? query : ""}`, {
    next: {
      cache: "no-cache",
    },
    Authorization: `Bearer ${accessToken}`,
  });

  if (!success) {
    console.log({ reservationsError: "Failed fetching!" });
    return false;
  }

  return { reservations, total_page };
}

export async function getCoupon(accessToken, code) {
  const {
    success,
    data: coupon,
    message,
  } = await api.get(`/coupon/${code}`, {
    next: {
      cache: "no-cache",
    },
    Authorization: `Bearer ${accessToken}`,
  });

  if (!success) {
    console.log({ coupon: "Failed fetching!" });
    return { success: false, message };
  }

  return { success, coupon };
}
/**
 * fullname,
  email,
  phone,
  nationality,
  countryFlag,
  reserved_price,
  nationalID,
 */

export async function createNewReservation(reservationObj) {
  const {
    authToken: supabaseAccessToken,
    room_id,
    guest_id,
    adults,
    message,
    reserved_price,
    check_in,
    check_out,
    stripe_session_id,
    status,
  } = reservationObj;

  const { data: reservations, error } = await supabaseWithToken(
    supabaseAccessToken
  )
    .from("reservations")
    .insert([
      {
        room_id,
        guest_id,
        adults,
        reserved_price,
        message,
        check_in,
        check_out,
        stripe_session_id,
        status,
      },
    ])
    .select();

  console.log({ NEW_RESERVATION: reservations });
  if (error) {
    // console.log("===== CREATION ERROR =====");
    console.log({ RESERVATION_ERROR: error });
    // console.log(session);
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return reservations;
}

export async function deleteReservation(supabaseAccessToken, id) {
  const { success, message } = await api.delete(`/reservation/${id}`, {
    Authorization: `Bearer ${supabaseAccessToken}`,
    "Content-Type": "application/json",
  });
  if (!success) {
    console.error(message);
    return false;
  }

  return true;
}

export async function getReservationByID(accessToken, id) {
  // let { data: reservations, error } = await supabase
  //   .from("reservations")
  //   .select("*, rooms(thumbnail, name, capacity, price)")
  //   .eq("id", id)
  //   .single();

  const { success, data: reservation } = await api.get(`/reservation/${id}`, {
    next: {
      cache: "no-cache",
    },
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });

  if (!success) {
    console.log({ reservationError: "Failed fetching!" });
    return false;
  }

  return reservation;
}

export async function updateReseration(
  accessToken,
  id,
  duration,
  total_price,
  tax_price,
  vat_price,
  check_in,
  check_out
) {
  const { success, message, data } = await api.put(
    `/reservation/${id}`,
    {
      duration,
      total_price,
      tax_price,
      vat_price,
      check_in,
      check_out,
    },
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }
  );

  if (!success) {
    console.error(message);
    return false;
  }

  if (data) {
    return data;
  }

  return true;
}

export async function cancelReservation(supabaseAccessToken, id) {
  const { data: reservations, error } = await supabaseWithToken(
    supabaseAccessToken
  )
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id);

  console.log("datetime", formatISO9075(new Date()));
  return reservations;
}

export async function getReservationByStripeSessionId(accessToken, session_id) {
  const { success, data, message } = await api.get(`/payment/${session_id}`, {
    cache: "no-cache",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });
  if (!success) {
    console.error(message);
    return false;
  }

  return data;
}

export async function updateStatusReservation(accessToken, session_id, status) {
  const { success, message } = await api.put(
    `/payment/${session_id}`,
    {
      status,
    },
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }
  );

  if (!success) {
    console.error(message);
    return false;
  }

  return success;
}
