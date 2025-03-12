"use client";

import Alert from "@/app/_ui/Alert";
import ConfirmationButton from "../ConfirmationButton";
import styles from "./styles.module.css";
import { useFormState } from "react-dom";

import CancelButton from "../CancelButton";
import { useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

const initialState = {
  fullname: "",
  email: "",
  phone: "",
  nationalID: "",
  message: "",
  criticalError: "",
};

function CheckoutForm({
  guest,
  createReservationAction,
  bookingCancelAction,
  children,
}) {
  const [state, formAction] = useFormState(
    createReservationAction,
    initialState
  );

  const [isPending, setTransition] = useTransition();

  function handleCancel() {
    setTransition(async () => await bookingCancelAction());
  }

  const errors = Object.values(state)?.filter((item) => item.length);
  if (errors.length)
    errors.forEach((item) =>
      toast.error(item ?? "Failed to confirm you booking, please try again")
    );

  return (
    <form action={formAction} className={styles.form}>
      <h2 className={styles.formHeading}>Reservation Confirmation</h2>

      {state?.criticalError && <Alert>{state?.criticalError}</Alert>}

      <div className={styles.formControlRow}>
        <div className={styles.formControl}>
          <label htmlFor="" className={styles.formLabel}>
            Fullname
          </label>
          <input
            type="text"
            name="name"
            defaultValue={guest.name}
            className={styles.formInput}
          />
          {state?.name && (
            <span className={styles.errorMessage}>{state?.name}</span>
          )}
        </div>

        <div className={styles.formControl}>
          <label htmlFor="" className={styles.formLabel}>
            NationalID
          </label>
          <input
            type="text"
            name="nationalID"
            defaultValue={guest.passport}
            className={styles.formInput}
          />
          {state?.nationalID && (
            <span className={styles.errorMessage}>{state?.passport}</span>
          )}
        </div>
      </div>

      <div className={styles.formControl}>
        <label htmlFor="" className={styles.formLabel}>
          Email Address
        </label>
        <input
          type="email"
          defaultValue={guest.email}
          className={styles.formInput}
          disabled
          readOnly
        />
        {state?.email && (
          <span className={styles.errorMessage}>{state?.email}</span>
        )}
      </div>

      <div className={styles.formControl}>
        <label htmlFor="" className={styles.formLabel}>
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={guest.phone}
          className={styles.formInput}
        />
        {state?.phone && (
          <span className={styles.errorMessage}>{state?.phone}</span>
        )}
      </div>
      <div className={styles.formControl}>
        <label htmlFor="" className={styles.formLabel}>
          Address
        </label>
        <input
          type="text"
          name="address"
          defaultValue={guest.address}
          className={styles.formInput}
        />
        {state?.address && (
          <span className={styles.errorMessage}>{state?.address}</span>
        )}
      </div>

      <div className={styles.formControl}>
        <label htmlFor="" className={styles.formLabel}>
          <span>Where are you from?</span>{" "}
        </label>
        {children}
        {state?.nationality && (
          <span className={styles.errorMessage}>{state?.nationality}</span>
        )}
      </div>

      <div className={styles.formControl}>
        <label htmlFor="" className={styles.formLabel}>
          More Informations
        </label>
        <textarea
          name="notes"
          id=""
          className={styles.formTextArea}
          rows={5}
        ></textarea>
        {state?.notes && (
          <span className={styles.errorMessage}>{state?.notes}</span>
        )}
      </div>

      <div className={styles.checkOutButtons}>
        <ConfirmationButton disabled={isPending} />
        <CancelButton isLoading={isPending} handleCancel={handleCancel} />
      </div>
      <Toaster position="top-center" reverseOrder={true} />
    </form>
  );
}

export default CheckoutForm;
