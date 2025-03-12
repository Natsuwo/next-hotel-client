"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./styles.module.css";
import {
  faBed,
  faCalendar,
  faUsers,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import { formatISO } from "date-fns";
import FormDayPicker from "../FormDayPicker";

import { useFormState } from "react-dom";
import ReservationButton from "../ReservationButton";
import { useCallback, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const initialState = {
  dateError: "",
  guestsError: "",
  criticalError: "",
  isBooking: false,
};

function RoomBookingForm({ bookingAction, room }) {
  const [state, formAction] = useFormState(bookingAction, initialState);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomLeft, setRoomLeft] = useState(0);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [adults, setAdults] = useState(0);
  const [child, setChild] = useState(0);

  const handleAvailableRooms = useCallback((rooms) => {
    setAvailableRooms(rooms);
  }, []);

  const handleDateSelection = useCallback((range) => {
    if (!range) return;
    const from = formatISO(range?.from, { representation: "date" });
    const to = formatISO(range?.to, { representation: "date" });

    setStartDate(from);
    setEndDate(to);
  }, []);

  const handleRoomLeft = useCallback((left) => {
    setRoomLeft(left);
  }, []);

  function handleSubmit() {
    if (!(startDate && endDate)) {
      toast.error("Please select a date range from the calendar");
      return;
    }

    if (!adults || parseInt(adults) < 1 || parseInt(adults) > room?.capacity) {
      toast.error("Please provide guests number");
      return;
    }

    const newForm = new FormData();
    newForm.set("check_in", startDate);
    newForm.set("check_out", endDate);
    newForm.set("adults", adults);
    newForm.set("children", child);
    newForm.set("room_id", availableRooms[0]?.id);
    formAction(newForm);
  }

  return (
    <form action={handleSubmit} className={styles.roomBookingForm}>
      <FormDayPicker
        roomId={room.id}
        endDate={endDate}
        startDate={startDate}
        handleDateSelection={handleDateSelection}
        handleAvailableRooms={handleAvailableRooms}
        handleRoomLeft={handleRoomLeft}
      />

      <div className={styles.formItem}>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faBed} />
          </div>
          <div className={styles.formControl}>
            <label>Room Type</label>
            <input type="text" value={room.title} readOnly disabled />
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
          <div className={styles.formControl}>
            <label>Left</label>
            <input
              type="text"
              value={roomLeft ? roomLeft + " Rooms" : 0}
              readOnly
              disabled
            />
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faCalendar} />
          </div>
          <div className={styles.formControl}>
            <label>Check In</label>
            <input type="date" value={startDate} disabled />
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faCalendar} />
          </div>
          <div className={styles.formControl}>
            <label>Check Out</label>
            <input type="date" value={endDate} disabled />
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={styles.formControl}>
            <label>Adults</label>
            <select name="" id="" onChange={(e) => setAdults(e.target.value)}>
              <option value="">Select adults number</option>
              {Array.from(Array(room?.guest_count ?? 0)).map((item, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formInput}>
          <div className={styles.formIcon}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={styles.formControl}>
            <label>Children</label>
            <select name="" id="" onChange={(e) => setChild(e.target.value)}>
              <option value="0">0</option>
              {Array.from(Array(room?.guest_count ?? 0)).map((item, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ReservationButton status={roomLeft} />
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
}

export default RoomBookingForm;
