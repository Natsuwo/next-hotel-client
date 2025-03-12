"use client";
import { useCallback, useState } from "react";
import CheckoutOverview from "../CheckoutOverview";
import ReservationForm from "../ReservationForm";

import FormDayPicker from "@/app/rooms/[room_slug]/_components/FormDayPicker";
import { formatISO } from "date-fns";
import { useFormState } from "react-dom";
import toast, { Toaster } from "react-hot-toast";

const initialState = {};

function EditContainer({ reservation, reservationUpdateAction, guest }) {
  const [state, formAction] = useFormState(
    reservationUpdateAction,
    initialState
  );

  const [startDate, setStartDate] = useState(new Date(reservation.check_in));
  const [endDate, setEndDate] = useState(new Date(reservation.check_out));
  const [totalPrice, setTotalPrice] = useState(0);
  const [taxPrice, setTaxPrice] = useState(0);
  const [vatPrice, setVatPrice] = useState(0);
  // const [startDate, setStartDate] = useState(
  //   formatISO(new Date(reservation?.check_in), { representation: "date" })
  // );
  // const [endDate, setEndDate] = useState(
  //   formatISO(new Date(reservation?.check_out), { representation: "date" })
  // );
  const [guests] = useState(reservation.adults);

  const handleDateSelection = useCallback((range) => {
    if (!range) return;

    const from = formatISO(range?.from, { representation: "date" });
    const to = formatISO(range?.to, { representation: "date" });

    setStartDate(from);
    setEndDate(to);
  }, []);

  async function handleSubmit() {
    const reservationFormData = new FormData();
    reservationFormData.set("check_in", startDate);
    reservationFormData.set("check_out", endDate);
    // reservationFormData.set("guests", guests);
    reservationFormData.set("total_price", totalPrice);
    reservationFormData.set("tax_price", taxPrice);
    reservationFormData.set("vat_price", vatPrice);
    reservationFormData.set("reservation_id", reservation.id);

    await formAction(reservationFormData);
  }

  if (state.status === "success")
    toast.success("Your reservation has been updated!");
  else if (state.error) toast.error(state.error);
  return (
    <>
      <ReservationForm
        handleDateSelection={handleDateSelection}
        capacity={reservation?.room?.room_type?.guest_count}
        // setGuests={setGuests}
        // guests={guests}
        handleSubmit={handleSubmit}
      >
        <FormDayPicker
          handleDateSelection={handleDateSelection}
          startDate={startDate}
          endDate={endDate}
          room_number={reservation?.room?.room_number}
        />
      </ReservationForm>
      <CheckoutOverview
        setTotalPrice={setTotalPrice}
        setTaxPrice={setTaxPrice}
        setVatPrice={setVatPrice}
        vatPrice={vatPrice}
        taxPrice={taxPrice}
        totalPrice={totalPrice}
        reservation={reservation}
        start={startDate}
        end={endDate}
        guests={guests}
        guest={guest}
      />
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
}

export default EditContainer;
