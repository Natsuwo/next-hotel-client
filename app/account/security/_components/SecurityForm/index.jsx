"use client";

import SubmitButton from "@/app/_ui/SubmitButton";
import styles from "./styles.module.css";
import { useFormState } from "react-dom";
import { confirmPassword as zConfirmPassword } from "@/app/_lib/zodSchemas";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { confirmPassword } from "@/app/_lib/supabase/guests";

const initialState = {};

function SecurityForm({ guestUpdateAction, guest, accessToken }) {
  const [state, formAction] = useFormState(guestUpdateAction, initialState);
  const [isConfirming, setIsConfirming] = useState(false);

  const errors = Object.values(state ?? {})?.filter((item) => item.length);
  if (errors.length)
    errors.forEach((item) =>
      toast.error(item ?? "Failed to update your profile, please try again")
    );

  async function handleConfirmPassword() {
    const email = guest.email;
    const current_password = document.querySelector(
      'input[name="current_password"]'
    ).value;

    try {
      zConfirmPassword.parse({
        confirm_password: current_password,
      });
    } catch (err) {
      console.log("Caugth Validation");
      console.log(err.errors);
      err.errors.forEach((element) => {
        toast.error(element.message);
      });
      return;
    }

    const { success, message } = await confirmPassword(
      accessToken,
      email,
      current_password
    );
    if (!success) {
      return toast.error(message ? message : "Error confirming password");
    }

    toast.success("Password confirmed successfully");
    setIsConfirming(true);
  }

  if (guest.provider) {
    return (
      <div className={styles.profileFormInputs}>
        <div>
          <label className={styles.formLabel}>
            You are signed in with a social account
          </label>
          <p className={styles.formLabel}>You can't change your password</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className={styles.profileFormInputs}>
        <div style={{ display: isConfirming ? "none" : "" }}>
          {!isConfirming && (
            <label className={styles.formLabel}>Confirm Password</label>
          )}
          <input
            className={styles.formControl}
            type={isConfirming ? "hidden" : "password"}
            placeholder="********"
            name="current_password"
          />
          {state?.current_password && (
            <span className={styles.errorMessage}>
              {state.current_password}
            </span>
          )}
        </div>
        {isConfirming && (
          <>
            <div>
              <label className={styles.formLabel}>New Password</label>
              <input
                className={styles.formControl}
                type="password"
                placeholder="********"
                name="password"
              />
              {state?.password && (
                <span className={styles.errorMessage}>{state.password}</span>
              )}
            </div>
            <div>
              <label className={styles.formLabel}>Confirm new Password</label>
              <input
                className={styles.formControl}
                type="password"
                placeholder="********"
                name="confirm_password"
              />
              {state?.confirm_password && (
                <span className={styles.errorMessage}>
                  {state.confirm_password}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.formButtonContainer}>
        {!isConfirming && (
          <SubmitButton
            type="button"
            onClick={handleConfirmPassword}
            className={styles.formButton}
          >
            Confirm Password
          </SubmitButton>
        )}
        {isConfirming && (
          <SubmitButton
            type="submit"
            className={styles.formButton}
            content={{ pending: "Saving...", base: "Save" }}
          />
        )}
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
}

export default SecurityForm;
