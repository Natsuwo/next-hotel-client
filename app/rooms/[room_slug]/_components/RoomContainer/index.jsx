import styles from "./styles.module.css";

import Heading from "@/app/_ui/Heading";
import Features from "../Features";
import RoomSlider from "../RoomSlider";
import RoomBookingForm from "../RoomBookingForm";
import RoomDescription from "../RoomDescription";
import Facilities from "../Facilities";
import BookingPolicy from "../BookingPolicy";
import { getRoomTypeById } from "@/app/_lib/supabase/rooms";
import { notFound, redirect } from "next/navigation";
import { bookingSchema } from "@/app/_lib/zodSchemas";
import { cookies } from "next/headers";
import Amenities from "../Amenities";
import { getGuestById } from "@/app/_lib/supabase/guests";
import { auth } from "@/auth";

async function RoomContainer({ params }) {
  const room_slug = params?.room_slug;
  if (!room_slug) notFound();
  const room = await getRoomTypeById(room_slug);
  const session = await auth();
  const guest = await getGuestById(session?.accessToken);

  // const room_images = await getRoomImages(room_slug ?? []);
  if (!room) notFound();

  const images = room?.thumbnails ?? [];

  async function bookingAction(prevState, formData) {
    "use server";

    prevState = { ...prevState, isBooking: true };
    const check_in = formData.get("check_in");
    const check_out = formData.get("check_out");
    const adults = parseInt(formData.get("adults"));
    const child = parseInt(formData.get("children") ?? 0);
    const room_id = formData.get("room_id");

    // FORM VALIDATION
    let isValid = true;
    try {
      bookingSchema.parse({ check_in, check_out, adults });
    } catch (err) {
      isValid = false;
      err.errors.forEach((element) => {
        prevState[element?.path[0] ?? "unknown"] = element.notes;
      });

      return { ...prevState, isBooking: false };
    } finally {
      prevState = { ...prevState, isBooking: false };
    }

    if (isValid) {
      const reservation_cookies = cookies();
      const guest_id = guest?.id;
      const duration = Math.abs(new Date(check_out) - new Date(check_in));
      const nights = Math.ceil(duration / (1000 * 60 * 60 * 24));
      reservation_cookies.set(
        "pending_reservation",
        JSON.stringify({
          guest_id,
          check_in,
          check_out,
          adults,
          room_id,
          duration: nights ?? 1,
          adults,
          child,
        }),
        {
          maxAge: 60 * 60 * 2,
          httpOnly: true,
        }
      );

      redirect(`/reservations/checkout`);
    }
  }

  return (
    <>
      <Heading className={styles.heading}>{room.title}</Heading>
      <Features room={room} />
      <RoomSlider images={images} />
      <RoomBookingForm bookingAction={bookingAction} room={room} />
      <RoomDescription description={room?.description} />
      <Facilities facilities={room?.facilities} />
      <Amenities data={room.amenities} title="Amenities" />
      <Amenities data={room.features} title="Features" />
      <BookingPolicy />
    </>
  );
}

export default RoomContainer;
