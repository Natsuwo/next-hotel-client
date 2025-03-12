import Accordion from "@/app/_components/Accordion";
import Heading from "@/app/_ui/Heading";

import styles from "./styles.module.css";

function BookingPolicy() {
  return (
    <section className={styles.BookingPolicySection}>
      <Heading className="text-center">Booking Policy</Heading>

      <hr className="decriptionDivider" />

      <div className={styles.accordion}>
        <Accordion
          className={styles.accordionItem}
          label={"Check-in and Check-out"}
        >
          <p>
            Check-in time is from 3:00 PM, and check-out time is until 11:00 AM.
            Early check-in and late check-out are subject to availability and
            may incur additional charges.
          </p>
        </Accordion>
        <Accordion
          className={styles.accordionItem}
          label={"Cancellation Policy"}
        >
          <p>
            Cancellations made 48 hours before the check-in date will receive a
            full refund. Cancellations made within 48 hours of the check-in date
            will be charged for the first night's stay.
          </p>
        </Accordion>
        <Accordion
          className={styles.accordionItem}
          label={"Children and Extra Beds"}
        >
          <p>
            Children of all ages are welcome. Extra beds are available upon
            request and may incur additional charges. Please contact the hotel
            in advance to arrange extra beds.
          </p>
        </Accordion>
        <Accordion className={styles.accordionItem} label={"Pets"}>
          <p>
            Only dogs and cats are allowed in the hotel premises. Service
            animals are permitted with prior notification.
          </p>
        </Accordion>
        <Accordion className={styles.accordionItem} label={"Payment Methods"}>
          <p>
            We accept all major credit cards, including Visa, MasterCard, and
            American Express. Cash payments are also accepted.
          </p>
        </Accordion>
      </div>
    </section>
  );
}

export default BookingPolicy;
