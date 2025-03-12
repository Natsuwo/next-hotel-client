"use client";
import styles from "./styles.module.css";
import Card from "@/app/_components/Card/Card";
import Image from "next/image";

import { formatToAbrFormat } from "@/app/utils/datetime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import DeleteForm from "../DeleteFrom";
import Link from "next/link";
import { useState } from "react";
import CancelButton from "../CancelButton";

import { useFormState } from "react-dom";

const SUPABASE_ROOMS_URL = process.env.NEXT_PUBLIC_SUPABASE_IMGS_URL;

const initialState = { error: "" };

function ReservationOverview({
  paidAmount,
  deleteAction,
  reservation,
  allowDelete = true,
  reservationCancelAction,
  children,
}) {
  const [showCancel, setShowCancel] = useState(false);

  const [state, formAction] = useFormState(
    reservationCancelAction,
    initialState
  );

  async function handleCancel() {
    const cancelForm = new FormData();
    cancelForm.set("reservation_id", reservation.id);

    await formAction(cancelForm);
  }

  if (showCancel)
    return (
      <div className={styles.overviewContainer}>
        <Card>
          <Card.Thumbnail zoomOnHover={false}>
            {reservation?.thumbnail && (
              <Image
                fill
                src={`${reservation?.thumbnail}`}
                alt={`${reservation?.room?.room_number} thumbnail`}
              />
            )}

            {/* <Image fill src={"/bg.png"} /> */}
          </Card.Thumbnail>
          <Card.Description className={styles.overviewDescription}>
            <h2>Are you sure to cancel this reservation?</h2>

            <div className={styles.actionsContainer}>
              <form action={handleCancel}>
                <CancelButton />
              </form>
              <button
                className={styles.backButton}
                onClick={() => setShowCancel(false)}
              >
                Go Back
              </button>
            </div>
          </Card.Description>
        </Card>
      </div>
    );

  return (
    <div className={styles.overviewContainer}>
      <Card>
        <Card.Thumbnail zoomOnHover={false}>
          {reservation?.thumbnail && (
            <Image
              fill
              src={`${reservation?.thumbnail}`}
              alt={`${reservation?.room?.room_number} thumbnail`}
            />
          )}
          {/* <Image fill src={"/bg.png"} /> */}
        </Card.Thumbnail>

        <Card.Description className={styles.overviewDescription}>
          <h2>{reservation?.room?.room_type?.title}</h2>
          <div className={styles.bookingSummary}>
            <h3>Booking Summary</h3>
            <p>
              <span>Arrival</span>
              <span>{formatToAbrFormat(new Date(reservation.check_in))}</span>
            </p>
            <p>
              <span>Departure</span>
              <span>{formatToAbrFormat(new Date(reservation.check_out))}</span>
            </p>
            <p>
              <span>Adults</span>
              <span>
                {String(reservation.adults).padStart(2, "0")}
                {reservation.children > 0
                  ? " + " + reservation.children + " kids"
                  : ""}
              </span>
            </p>
            <p>
              <span>Reservation Date</span>
              <span>{formatToAbrFormat(new Date(reservation.created_at))}</span>
            </p>
            <p>
              <span>Total Price</span>
              <span>${Number(paidAmount).toFixed(2)}</span>
            </p>
          </div>

          <div className={styles.actionsContainer}>
            <Link
              href={`/reservations/edit/${reservation.id}`}
              className={styles.editLink}
            >
              <span>
                <FontAwesomeIcon icon={faEdit} />
              </span>
              <span>Edit</span>
            </Link>

            {allowDelete ? (
              <DeleteForm deleteAction={deleteAction} showLabel={true} />
            ) : (
              <button
                className={styles.cancelButton}
                onClick={() => setShowCancel(true)}
              >
                <span>
                  <FontAwesomeIcon icon={faBan} />
                </span>{" "}
                <span>Cancel</span>
              </button>
            )}
          </div>
        </Card.Description>
        {children}
      </Card>
    </div>
  );
}

export default ReservationOverview;
