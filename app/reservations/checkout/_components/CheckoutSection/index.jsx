import CheckoutForm from "../CheckoutForm";
import CheckoutOverview from "../CheckoutOverview";
import styles from "./styles.module.css";
import { cookies } from "next/headers";
import { getRoomById } from "@/app/_lib/supabase/rooms";
import {
  getGuestById,
  getSettings,
  updateGuest,
} from "@/app/_lib/supabase/guests";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { reservationSchema } from "@/app/_lib/zodSchemas";
import { bookingCancelAction } from "@/app/_lib/actions";
import SelectCountry from "@/app/_ui/SelectCountry";
import { revalidatePath } from "next/cache";
import axios from "axios";
import { calculateDiscount, daysDifferCount } from "@/app/utils/datetime";
import { getCoupon } from "@/app/_lib/supabase/reservations";
// import { NextResponse } from "next/server";

async function CheckoutSection() {
  const session = await auth();

  const reservation_cookies = cookies();
  if (!reservation_cookies.has("pending_reservation")) {
    redirect("/rooms");
  }

  const pending_reservation = JSON.parse(
    reservation_cookies.get("pending_reservation").value
  );

  const [room, guest, settings] = await Promise.all([
    getRoomById(pending_reservation?.room_id),
    getGuestById(session.accessToken),
    getSettings("tax,vat"),
  ]);

  if (!room) notFound();

  const totalNights = daysDifferCount(
    pending_reservation.check_out,
    pending_reservation.check_in
  );

  const totalPrice = room?.room_type?.price_per_night * totalNights;
  const taxPrice =
    totalPrice * (settings.tax ? parseFloat(settings.tax) / 100 : 0);
  const vatPrice =
    totalPrice * (settings.vat ? parseFloat(settings.vat) / 100 : 0);
  const finalTotalPrice = Math.round(
    totalPrice +
      taxPrice +
      vatPrice -
      (guest?.membership?.discount
        ? (totalPrice + taxPrice + vatPrice) *
          (guest?.membership?.discount / 100)
        : 0)
  );

  async function createCouponAction(prevState, formData) {
    "use server";
    const coupon = formData.get("coupon");
    try {
      const {
        success,
        message,
        coupon: response,
      } = await getCoupon(session?.accessToken, coupon);
      if (!success) {
        return {
          ...prevState,
          coupon: {
            error: true,
            payload: message ?? "Failed to apply coupon!",
          },
        };
      }
      pending_reservation.coupon = response;
      cookies().set(
        "pending_reservation",
        JSON.stringify(pending_reservation),
        {
          maxAge: 60 * 60 * 2,
          httpOnly: true,
        }
      );

      return {
        ...prevState,
        coupon: {
          error: false,
          payload: "Coupon applied successfully!",
          data: response,
        },
      };
    } catch (error) {
      return {
        ...prevState,
        coupon: {
          error: true,
          payload: error.message ?? "Failed to apply coupon!",
        },
      };
    }
  }
  async function createReservationAction(prevState, formData) {
    "use server";
    console.log("state", prevState);
    prevState = { ...prevState, isConfirming: true };
    const name = formData.get("name");
    const nationalID = formData.get("nationalID");
    const address = formData.get("address");
    const phone = formData.get("phone");
    const nationalityWithFlag = formData.get("nationality");
    const notes = formData.get("notes");

    try {
      reservationSchema.parse({
        name,
        address,
        phone,
        nationality: nationalityWithFlag,
        nationalID,
        notes,
      });
    } catch (err) {
      prevState = {};
      err?.errors.forEach((element) => {
        prevState[element?.path[0] ?? "unknown"] = element.notes;
      });

      return { ...prevState };
    }

    const [nationality] = nationalityWithFlag.split("%");

    let flagError = { error: false, payload: "" };
    try {
      const session = await auth();

      await updateGuest(
        session?.accessToken,
        guest.id,
        name,
        nationality,
        phone,
        null,
        address,
        nationalID
      );

      if (!pending_reservation?.guest_id) {
        pending_reservation.guest_id = guest.id;
      }

      if (pending_reservation?.coupon) {
        pending_reservation.coupon_id = pending_reservation?.coupon?.id;
        const discount = calculateDiscount(
          finalTotalPrice,
          pending_reservation?.coupon
        );
        pending_reservation.total_price =
          finalTotalPrice - discount > 0 ? finalTotalPrice - discount : 0;

        delete pending_reservation.coupon;
      } else {
        pending_reservation.total_price = finalTotalPrice;
      }

      pending_reservation.notes = notes;
      pending_reservation.price = room?.room_type?.price_per_night;

      pending_reservation.tax_price = taxPrice;
      pending_reservation.vat_price = vatPrice;

      cookies().set(
        "pending_reservation",
        JSON.stringify(pending_reservation),
        {
          maxAge: 60 * 60 * 2,
          httpOnly: true,
        }
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe`,
        { pending_reservation },
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      // console.log({ STRIPE: response.data, KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY });
      // redirect(response.checkout_url); // CANNOT BE USED WITH TRY BLOCK
      flagError.payload = response.data?.checkout_url;
    } catch (err) {
      console.log(err);
      flagError.error = true;
      console.log("CHECKOUT COOKIE ERROR");
      return { ...prevState, criticalErr: "Failed to confirm your booking!" };
    } finally {
      revalidatePath("/account/history");
      // TODO: PREVENT REDIRECTING WHEN AN UNHANDLED ERROR OCCURS
      if (!flagError.error && flagError.payload) {
        console.log({ URL: flagError.payload });
        redirect(flagError.payload);
      }
    }
  }

  return (
    <div className={`${styles.formSection} container`}>
      <CheckoutForm
        createReservationAction={createReservationAction}
        guest={guest}
        bookingCancelAction={bookingCancelAction}
      >
        {/* PASSING THIS AS CHILD TO PREVENT UNCESSACERY RERENDERS FOR THIS COMPONENT SINCE:
          1 - ITS A SERVER COMPONENT AND NEEDED TO BE RENDERED INSIDE A CLIENT COMPONENT
          2 - IT HAS SOME INNER API CALLS, SO RENDERING AS A CHILD WOULD PREVENT WASTING RENDERES
        */}
        <SelectCountry
          name={"nationality"}
          className={styles.formInput}
          defaultCountry={guest.nationality}
        />
      </CheckoutForm>

      <CheckoutOverview
        guest={guest}
        room={room}
        pending_reservation={pending_reservation}
        couponAction={createCouponAction}
        data={{
          tax: settings.tax,
          vat: settings.vat,
          totalNights,
          totalPrice,
          taxPrice,
          vatPrice,
          finalTotalPrice,
        }}
      />
    </div>
  );
}

export default CheckoutSection;
