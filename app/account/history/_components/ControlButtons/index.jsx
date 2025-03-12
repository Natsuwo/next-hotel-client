"use client";
import styles from "./styles.module.css";
import Modal from "@/app/_components/Modal/Modal";
import ReservationOverview from "../ReservationOverview";
import DeleteForm from "../DeleteFrom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faEye } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

function ControlButtons({
  paidAmount,
  deleteAction,
  reservation,
  reservationCancelAction,
}) {
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const unpaidInvoice = reservation?.invoice?.find(
      (inv) => inv.status !== "paid"
    );

    const isPaid = reservation?.invoice?.some((inv) => inv.status === "paid");
    if (isPaid) {
      setIsPaid(true);
    }

    if (unpaidInvoice && unpaidInvoice.payment?.transaction_id) {
      (async () => {
        const response = await axios.get(
          `/api/stripe?session_id=${unpaidInvoice.payment?.transaction_id}`
        );

        if (response?.data?.url) {
          setPaymentUrl(response?.data?.url);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [reservation?.invoice]);

  return (
    <div className={styles.buttonsContainer}>
      <Modal>
        {reservation?.invoice?.some((inv) => inv.status === "paid") && (
          <Modal.ToggleOpen>
            <button className={styles.overviewButton}>
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Modal.ToggleOpen>
        )}
        {reservation?.invoice?.some((inv) => inv.status !== "paid") && (
          <>
            {paymentUrl && !loading ? (
              <Link href={paymentUrl}>
                <button className={styles.overviewButton}>Pay Now</button>
              </Link>
            ) : !paymentUrl && !loading ? (
              <button className={styles.overviewButton} disabled>
                Expired
              </button>
            ) : loading ? (
              <button className={styles.overviewButton} disabled>
                Loading...
              </button>
            ) : (
              <button className={styles.overviewButton} disabled>
                Error
              </button>
            )}
          </>
        )}

        <Modal.Overlay hideOnLargerScreens={false}>
          <Modal.Wrapper hideOnLargerScreens={false}>
            <ReservationOverview
              paidAmount={paidAmount}
              reservation={reservation}
              allowDelete={false}
              reservationCancelAction={reservationCancelAction}
              deleteAction={deleteAction}
            >
              <Modal.ToggleClose>
                <button type="button" className={styles.closeButton}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </Modal.ToggleClose>
            </ReservationOverview>
          </Modal.Wrapper>
        </Modal.Overlay>
        {!isPaid && !loading && <DeleteForm deleteAction={deleteAction} />}
      </Modal>
    </div>
  );
}

export default ControlButtons;
