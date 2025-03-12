"use client";

import SubmitButton from "@/app/_ui/SubmitButton";
import styles from "./styles.module.css";
import { useFormState } from "react-dom";

import SelectCountry from "@/app/_ui/SelectCountry";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

// import "react-toastify/dist/ReactToastify.css";

const initialState = {
  fullnameErr: "",
  nationalityErr: "",
  phoneErr: "",
};

function ProfileForm({ guestUpdateAction, guest }) {
  const [state, formAction] = useFormState(guestUpdateAction, initialState);
  const [flag, setFlag] = useState("");

  const handleFlag = (flag) => {
    setFlag(flag);
  };

  const errors = Object.values(state ?? {})?.filter((item) => item.length);
  if (errors.length)
    errors.forEach((item) =>
      toast.error(item ?? "Failed to update your profile, please try again")
    );

  return (
    <form action={formAction}>
      <div className={styles.profileFormInputs}>
        <div>
          <label className={styles.formLabel}>Fullname</label>
          <input
            className={styles.formControl}
            type="text"
            placeholder="Alaoui Hassan"
            name="name"
            defaultValue={guest.name}
          />
          {state?.fullname && (
            <span className={styles.errorMessage}>{state.fullname}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Email Address</label>
          <input
            className={styles.formControl}
            defaultValue={guest.email}
            placeholder="john.doe@mail.com"
            disabled
            readOnly
          />
        </div>
        <div>
          {flag && (
            <label className={styles.formLabel}>
              <span>Nationality</span>
              <span className={styles.countryFlag}>
                <img
                  src={flag}
                  alt={`${guest.nationality ?? "country"} flag`}
                />
              </span>
            </label>
          )}

          <SelectCountry
            handleFlag={handleFlag}
            id="select-country"
            className={styles.formControl}
            name={"nationality"}
            defaultCountry={guest.nationality}
          />
          {state?.nationality && (
            <span className={styles.errorMessage}>{state.nationality}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Phone Number</label>
          <input
            className={styles.formControl}
            defaultValue={guest.phone}
            type="tel"
            placeholder="+212 6 879900830"
            name="phone"
          />
          {state?.phone && (
            <span className={styles.errorMessage}>{state.phone}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Address</label>
          <input
            className={styles.formControl}
            defaultValue={guest.address}
            type="text"
            placeholder="1234 Main St"
            name="address"
          />
          {state?.address && (
            <span className={styles.errorMessage}>{state.address}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Passport</label>
          <input
            className={styles.formControl}
            defaultValue={guest.passport}
            type="text"
            placeholder="123456789"
            name="passport"
          />
          {state?.passport && (
            <span className={styles.errorMessage}>{state.passport}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Date of Birth</label>
          <input
            className={styles.formControl}
            defaultValue={guest.dob}
            type="date"
            placeholder="1990-01-01"
            name="dob"
          />
          {state?.dob && (
            <span className={styles.errorMessage}>{state.dob}</span>
          )}
        </div>
        <div>
          <label className={styles.formLabel}>Gender</label>
          <select
            name="gender"
            id="gender-select"
            defaultValue={`${guest.gender}`}
            className={styles.formControl}
          >
            <option value="">Select gender...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {state?.gender && (
            <span className={styles.errorMessage}>{state.gender}</span>
          )}
        </div>
      </div>
      <div className={styles.formButtonContainer}>
        <SubmitButton
          type="submit"
          className={styles.formButton}
          content={{ pending: "Saving...", base: "Save" }}
        />
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
}

export default ProfileForm;
