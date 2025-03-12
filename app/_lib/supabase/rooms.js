// import supabase from "./db";
import api from "./api";

export async function getAllRooms(query = "") {
  // let { data: rooms, error } = await supabase.from("rooms").select("*");
  const { success, data: rooms } = await api.get(
    `/rooms${query ? query : ""}`,
    {
      cache: "no-cache",
    }
  );
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
  }

  return rooms;
}

export async function getGallery(limit = 12, page = 1) {
  const { success, data: gallery } = await api.get(
    `/gallery?limit=${limit}&page=${page}`
  );
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
    return false;
  }

  return gallery;
}

export async function getRoomById(id) {
  // let { data: rooms, error } = await supabase
  //   .from("rooms")
  //   .select("*")
  //   .eq("id", id);
  const { success, data: room } = await api.get(`/rooms/${id}`, {
    cache: "no-cache",
  });
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
  }

  return room;
}

export async function getRoomTypeById(id) {
  // let { data: rooms, error } = await supabase
  //   .from("rooms")
  //   .select("*")
  //   .eq("id", id);
  const { success, data: room } = await api.get(`/roomtypes/${id}`, {
    cache: "no-cache",
  });
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ roomsError: "Failed fetching!" });
  }

  return room;
}

export async function getRoomImages(id) {
  // let { data: room_images, error } = await supabase
  //   .from("room_images")
  //   .select("*")
  //   .eq("room_id", id);
  return null;
  // return room_images;
}

export async function filterRoomsByDate(
  start = "2024-09-21",
  end = "2024-09-27"
) {
  let { data: reservations, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("status", "confirmed")
    .or(
      `and(check_in.gte.${start},check_in.lte.${end}),and(check_out.gte.${start},check_out.lte.${end}),and(check_in.lte.${start}, check_out.gte.${end})`
    );

  if (error) {
    console.log(error);
  }

  const reservations_ids = reservations?.map((item) => item.room_id) ?? [];

  let { data: rooms, rooms_error } = await supabase
    .from("rooms")
    .select("*")
    .not("id", "in", `(${reservations_ids.join(",")})`);

  return rooms;
}
