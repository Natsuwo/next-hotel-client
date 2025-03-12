"use client";

import { daysDifferCount, formatToAbrFormat } from "@/app/utils/datetime";
import styles from "./styles.module.css";
import Card from "@/app/_components/Card/Card";
import Image from "next/image";
import { getSettings } from "@/app/_lib/supabase/guests";
import { useEffect, useState } from "react";

function CheckoutOverview({
  reservation,
  guests,
  start,
  end,
  setTaxPrice,
  setVatPrice,
  setTotalPrice,
  vatPrice,
  taxPrice,
  totalPrice,
  guest,
}) {
  const totalNights = daysDifferCount(end, start);
  const [settings, setSettings] = useState(null);
  const [totalMinusPaid, setTotalMinusPaid] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings("tax,vat");
      setSettings(settings);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings && reservation?.room?.room_type?.price_per_night) {
      const taxRate = settings.tax ? parseFloat(settings.tax) / 100 : 0.05;
      const vatRate = settings.vat ? parseFloat(settings.vat) / 100 : 0.1;
      const pricePerNight = reservation.room.room_type.price_per_night;
      const totalPerNight = pricePerNight * totalNights;
      const taxPrice = totalPerNight * taxRate;
      const vatPrice = totalPerNight * vatRate;
      const totalDiscount = reservation?.invoice
        .filter((inv) => inv.status === "paid")
        .reduce((acc, inv) => acc + inv.discount_coupon, 0);
      const membershipDiscount = guest?.membership?.discount
        ? (totalPerNight + taxPrice + vatPrice) *
          (guest?.membership?.discount / 100)
        : 0;
      const total = Math.round(
        totalPerNight + taxPrice + vatPrice - membershipDiscount - totalDiscount
      );

      setSubtotal(totalPerNight + taxPrice + vatPrice);
      setTaxPrice(taxPrice);
      setVatPrice(vatPrice);
      setTotalPrice(total);

      const paidAmount = reservation?.invoice
        .filter((inv) => inv.status === "paid")
        .reduce((acc, inv) => acc + inv.amount, 0);

      setIsPaid(paidAmount > 0);
      setPaidAmount(paidAmount);
      setTotalDiscount(totalDiscount);
      setTotalMinusPaid(Math.max(total - paidAmount - totalDiscount, 0));
    }
  }, [settings, reservation, totalNights]);

  return (
    <div>
      <Card>
        <Card.Thumbnail>
          {reservation?.thumbnail && (
            <Image
              fill
              src={`${reservation?.thumbnail}`}
              alt={`${reservation?.room?.room_type?.title} thumbnail`}
            />
          )}
        </Card.Thumbnail>

        <Card.Description className={styles.overviewDescription}>
          <h2>{reservation?.room?.room_type?.title}</h2>
          <div className={styles.bookingSummary}>
            <h3>Booking Summary</h3>
            <p>
              <span>Arrival</span>
              <span>{formatToAbrFormat(new Date(start))}</span>
            </p>
            <p>
              <span>Departure</span>
              <span>{formatToAbrFormat(new Date(end))}</span>
            </p>
            <p>
              <span>Adults</span>
              <span>{String(guests).padStart(2, "0")}</span>
            </p>
            <p>
              <span>Children</span>
              <span>{String(reservation.children).padStart(2, "0")}</span>
            </p>
          </div>

          <div className={styles.bookingSummary}>
            <h3>Pricing Breakdown</h3>
            <p>
              <span>
                ${reservation.room?.room_type?.price_per_night.toFixed(2)} x
                night
              </span>
              <span>
                ${reservation.room?.room_type?.price_per_night.toFixed(2)}
              </span>
            </p>
            <p>
              <span>Tax ({settings?.tax || 5}%)</span>
              <span>${taxPrice?.toFixed(2)}</span>
            </p>
            <p>
              <span>VAT ({settings?.vat || 10}%)</span>
              <span>${vatPrice?.toFixed(2)}</span>
            </p>
            <p>
              <span>Total per Night: </span>
              <span>
                $
                {reservation.room?.room_type?.price_per_night.toFixed(2) *
                  totalNights}
              </span>
            </p>
            <p>
              <span>Subtotal</span>
              <span>
                <s>${subtotal.toFixed(2)}</s>
              </span>
            </p>
            <p>
              <span>Membership ({guest?.membership?.name || "Basic"})</span>
              <span>-{guest?.membership?.discount}%</span>
            </p>
            <p>
              <span>Coupon:</span>
              <span>-${totalDiscount}</span>
            </p>
            <p>
              <span>Total: </span>
              <span>${totalPrice.toFixed(2)}</span>
            </p>
            <p>
              <span>You Paid: </span>
              {isPaid && <span>-${paidAmount}</span>}
            </p>
          </div>

          <div className={styles.totalPrice}>
            <span>Total + Taxes ({totalNights} Nights)</span>
            <span>${totalMinusPaid.toFixed(2)}</span>
          </div>
        </Card.Description>
      </Card>
    </div>
  );
}

export default CheckoutOverview;
