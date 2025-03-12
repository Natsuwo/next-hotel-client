"use client";
import styles from "./styles.module.css";
import Card from "@/app/_components/Card/Card";
import Image from "next/image";

import { formatToAbrFormat } from "@/app/utils/datetime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import DeleteForm from "../DeleteFrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import CancelButton from "../CancelButton";

import { useFormState } from "react-dom";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import api from "@/app/_lib/supabase/api";

const initialState = { error: "" };

function ReservationOverview({
  session,
  paidAmount,
  deleteAction,
  reservation,
  allowDelete = true,
  reservationCancelAction,
  children,
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(reservation.rating || 0);
  const [hover, setHover] = useState(0);

  const handleRating = async (newRating) => {
    setRating(newRating);
    setShowRating(true);
  };

  const handleSubmitRating = async () => {
    const accessToken = session?.accessToken;
    const user = session?.user;
    const booking_id = reservation.id;
    const guest_id = user.id;
    const room_id = reservation.room_id;
    const room_type_id = reservation.room.room_type_id;
    await api.post(
      "/guest/rating",
      {
        booking_id,
        guest_id,
        room_id,
        room_type_id,
        rating,
        comment,
      },
      {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    );
    setShowRating(false);
  };

  const [state, formAction] = useFormState(
    reservationCancelAction,
    initialState
  );

  async function handleCancel() {
    const cancelForm = new FormData();
    cancelForm.set("reservation_id", reservation.id);

    await formAction(cancelForm);
  }

  useEffect(() => {
    if (session) {
      (async () => {
        const accessToken = session?.accessToken;
        const user = session?.user;
        const booking_id = reservation.id;
        const guest_id = user.id;
        const room_id = reservation.room_id;
        const room_type_id = reservation.room.room_type_id;
        const query = `?booking_id=${booking_id}&guest_id=${guest_id}&room_id=${room_id}&room_type_id=${room_type_id}`;
        const { data, success } = await api.get("/guest/rating" + query, {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        });

        if (success) {
          setRating(data?.rating);
          setComment(data?.comment);
        }
      })();
    }
  }, [session]);

  if (showRating)
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
            <h2>Rating</h2>
            <div className={styles.ratingContainer}>
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={
                      index <= (hover || rating) ? styles.on : styles.off
                    }
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "1.5rem",
                      color: index <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        index <= (hover || rating) ? solidStar : regularStar
                      }
                    />
                  </button>
                );
              })}
            </div>
            <textarea
              name="comment"
              id="comment"
              className={styles.formComment}
              placeholder="Leave a comment"
              onChange={(e) => setComment(e.target.value)}
            >
              {comment}
            </textarea>
            <div className={styles.actionsContainer}>
              <button
                className={styles.acceptButton}
                onClick={handleSubmitRating}
              >
                Confirm
              </button>
              <button
                className={styles.backButton}
                onClick={() => setShowRating(false)}
              >
                Go Back
              </button>
            </div>
          </Card.Description>
        </Card>
      </div>
    );

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
          <div className="ratings">
            <div className={styles.ratingContainer}>
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={
                      index <= (hover || rating) ? styles.on : styles.off
                    }
                    onClick={() => handleRating(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "1.5rem",
                      color: index <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        index <= (hover || rating) ? solidStar : regularStar
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
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
