"use client";

import ConfirmationButton from "../ConfirmationButton";
import styles from "./styles.module.css";

const initialState = {
  fullname: "",
  email: "",
  phone: "",
  nationalID: "",
  message: "",
  criticalError: "",
};

function ReservationForm({
  capacity,
  setGuests,
  guests,
  handleSubmit,
  children,
}) {
  return (
    <form action={handleSubmit} className={styles.form}>
      <div>{children}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
        }}
      >
        <ConfirmationButton />
      </div>
    </form>
  );
}

export default ReservationForm;
