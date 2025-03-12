import Image from "next/image";
import styles from "./styles.module.css";

import Badge from "@/app/_ui/Badge";
import { auth } from "@/auth";
import {
  deleteReservation,
  getReservationByID,
} from "@/app/_lib/supabase/reservations";
import { revalidatePath } from "next/cache";
import ControlButtons from "../ControlButtons";
import {
  reservationCancelAction,
  reservationUpdateAction,
} from "@/app/_lib/actions";
import { formatToAbrFormat } from "@/app/utils/datetime";
import { differenceInDays, isFuture, isPast } from "date-fns";

const SUPABASE_ROOMS_URL = process.env.NEXT_PUBLIC_SUPABASE_IMGS_URL;

function ReservationCard({ reservation }) {
  async function deleteReservationAction(prevState, formData) {
    "use server";

    prevState = {};

    const session = await auth();
    const active_user = session?.user;

    if (!active_user)
      return {
        ...prevState,
        error: "unauthorized action, please authenticate and try again",
      };

    const targeted_reservation = await getReservationByID(
      session.accessToken,
      reservation.id
    );

    if (targeted_reservation.status === 1)
      return {
        ...prevState,
        error:
          "Cannot delete active reservations! You may want to cancel it instead",
      };

    console.log(targeted_reservation?.guest_id, active_user?.id);

    if (parseInt(targeted_reservation?.guest_id) !== parseInt(active_user?.id))
      return { ...prevState, error: "unauthorized action!" };

    await deleteReservation(session.accessToken, reservation.id);
    revalidatePath("/account/history");

    return { ...prevState, status: "success" };
  }

  const arrivalDate = formatToAbrFormat(reservation.check_in);
  const departureDate = formatToAbrFormat(reservation.check_out);

  const paidAmount = reservation?.invoice.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  return (
    <article className={styles.reservationItem}>
      <div className={styles.reservationThumbnail}>
        {reservation.thumbnail && (
          <Image fill src={`${reservation.thumbnail}`} alt={`a`} />
        )}
      </div>

      <div className={styles.reservationInfos}>
        <div className={styles.reservationOverview}>
          <h2 className={styles.reservationTitle}>
            <span>
              {reservation?.room?.room_number} -{" "}
              {reservation?.room?.room_type?.title}
            </span>

            {isPast(reservation.check_in) && isFuture(reservation.check_out) ? (
              <span
                className={`${styles.onGoing} ${styles.reservationEstimation}`}
              >
                ON GOING
              </span>
            ) : isFuture(reservation.check_in) ? (
              <span
                className={`${styles.future} ${styles.reservationEstimation}`}
              >
                FUTURE
              </span>
            ) : isPast(reservation.check_out) ? (
              <span
                className={`${styles.past} ${styles.reservationEstimation}`}
              >
                PAST
              </span>
            ) : (
              ""
            )}
          </h2>
          <p>
            {formatToAbrFormat(arrivalDate)} -{" "}
            {formatToAbrFormat(departureDate)}
          </p>

          <p>
            <span className={styles.price}>${paidAmount?.toFixed(2)}</span> -{" "}
            {reservation.adults} Guest(s)
          </p>

          {/* CREATE A SEPARATED COMPONENT FOR THE STATUS AS BADGE */}
          <Badge
            type={
              reservation.status == 0
                ? "warning"
                : reservation.status == 2 || reservation.status == 3
                ? "danger"
                : "success"
            }
          >
            {reservation.status == 0
              ? "Pending"
              : reservation.status == 1
              ? "Confirmed"
              : reservation.status == 2
              ? "Cancelled"
              : "Refunded"}
          </Badge>
        </div>
        <div className={styles.reservationPriceContainer}>
          {/* USE 3rd PARTY API FOR CURRENCY CONVERSION */}

          <ControlButtons
            paidAmount={paidAmount}
            reservationUpdateAction={reservationUpdateAction}
            deleteAction={deleteReservationAction}
            reservation={reservation}
            reservationCancelAction={reservationCancelAction}
          />

          {/* <DeleteForm deleteAction={deleteReservationAction} /> */}
        </div>
      </div>
    </article>
  );
}

export default ReservationCard;
