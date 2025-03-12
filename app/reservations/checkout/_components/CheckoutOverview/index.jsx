"use client";
import { calculateDiscount, formatToAbrFormat } from "@/app/utils/datetime";
import styles from "./styles.module.css";
import Card from "@/app/_components/Card/Card";
import Image from "next/image";
import { useFormState } from "react-dom";
import toast, { Toaster } from "react-hot-toast";

const initialState = {
  coupon: "",
};

function CheckoutOverview({
  room,
  data,
  pending_reservation,
  guest,
  couponAction,
}) {
  const [state, formAction] = useFormState(couponAction, initialState);
  if (state.coupon) {
    state.coupon.error
      ? toast.error(
          state.coupon.payload ?? "Coupon code is invalid, please try again"
        )
      : toast.success(
          state.coupon.payload ?? "Coupon code applied successfully"
        );
  }

  const {
    totalNights,
    totalPrice,
    taxPrice,
    vatPrice,
    tax,
    vat,
    finalTotalPrice,
  } = data;

  const coupon = pending_reservation?.coupon
    ? pending_reservation?.coupon
    : state?.coupon?.data;

  return (
    <div>
      <Card>
        <Card.Thumbnail>
          <Image
            fill
            src={`${room.thumbnails[0]?.url}`}
            alt={`${room?.room_type?.title} thumbnail`}
          />
        </Card.Thumbnail>

        <Card.Description className={styles.overviewDescription}>
          <h2>{room?.room_type?.title}</h2>
          <div className={styles.bookingSummary}>
            <h3>Booking Summary</h3>
            <p>
              <span>Arrival</span>
              <span>{formatToAbrFormat(pending_reservation.check_in)}</span>
            </p>
            <p>
              <span>Departure</span>
              <span>{formatToAbrFormat(pending_reservation.check_out)}</span>
            </p>
            <p>
              <span>Adults</span>
              <span>{String(pending_reservation.adults).padStart(2, "0")}</span>
            </p>
            <p>
              <span>Children</span>
              <span>{String(pending_reservation.child).padStart(2, "0")}</span>
            </p>
          </div>

          <div className={styles.bookingSummary}>
            <h3>Pricing Breakdown</h3>
            <p>
              <span>${room?.room_type?.price_per_night} x night</span>
              <span>${room?.room_type?.price_per_night.toFixed(2)}</span>
            </p>
            <p>
              <span>Tax ({tax || 5}%)</span>
              <span>${taxPrice}</span>
            </p>
            <p>
              <span>VAT ({vat || 10}%)</span>
              <span>${vatPrice}</span>
            </p>
            <p>
              <span>Membership ({guest?.membership?.name || "Basic"})</span>
              <span>-{guest?.membership?.discount}%</span>
            </p>
            <p>
              <span>Subtotal</span>
              <span>
                <s>${totalPrice + taxPrice + vatPrice}</s>
              </span>
            </p>

            {(state?.coupon?.error === false || coupon) && (
              <p>
                <span>{coupon?.code}</span>
                <span>
                  {coupon?.discount_type === "percentage"
                    ? `-${coupon?.discount}% ${
                        coupon?.usage_limit_per_coupon
                          ? `(Max $${coupon?.usage_limit_per_coupon})`
                          : ""
                      }`
                    : `-$${coupon?.discount} ${
                        coupon?.usage_limit_per_coupon
                          ? `(Max $${coupon?.usage_limit_per_coupon})`
                          : ""
                      }`}
                </span>
              </p>
            )}
            <form action={formAction}>
              <div className={styles.formControl}>
                <div className={styles.formItem}>
                  <input
                    type="text"
                    name="coupon"
                    className={styles.formInput}
                    placeholder="Coupon Code"
                    autoComplete="off"
                  />
                  <button type="submit" className={styles.formButton}>
                    Apply Coupon
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className={styles.totalPrice}>
            <span>Total ({totalNights} Nights)</span>
            {state?.coupon?.data || coupon ? (
              <>
                <span>
                  $
                  {finalTotalPrice -
                    calculateDiscount(finalTotalPrice, coupon) >
                  0
                    ? finalTotalPrice -
                      calculateDiscount(finalTotalPrice, coupon)
                    : 0}
                </span>
              </>
            ) : (
              <span>${finalTotalPrice}</span>
            )}
          </div>
        </Card.Description>
      </Card>
      <Toaster position="top-center" reverseOrder={true} />
    </div>
  );
}

export default CheckoutOverview;
