import Banner from "@/app/_components/Banner";
import EditSection from "./_components/EditSection";
import { notFound } from "next/navigation";
import { getReservationByID } from "@/app/_lib/supabase/reservations";
import { auth } from "@/auth";
import { getGuestById } from "@/app/_lib/supabase/guests";

export const metadata = {
  title: "Edit Reservation",
  description: "Edit your already booked reservation ",
};

async function Page({ params }) {
  const reservation_id = params?.id;
  const session = await auth();
  if (!session) return <h4>Unauthorized action!</h4>;

  const reservation = await getReservationByID(
    session.accessToken,
    reservation_id
  );

  const guest = await getGuestById(session.accessToken);
  if (!reservation || !guest) notFound();

  const isUpdateAllowed = reservation.status === 1;

  if (!isUpdateAllowed)
    return <h4>Sorry, but reservation cannot be edited.</h4>;

  if (parseInt(session?.user?.id) !== parseInt(reservation?.guest_id))
    return (
      <div className="container">
        <h2>Unauthorized action!</h2>
      </div>
    );
  return (
    <>
      <Banner title={"EDIT RESERVATION"} />
      <EditSection reservation={reservation} guest={guest} />
    </>
  );
}

export default Page;
