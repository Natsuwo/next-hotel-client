import styles from "./styles.module.css";

import EditContainer from "../EditContainer";
import { reservationUpdateAction } from "@/app/_lib/actions";

async function EditSection({ reservation, guest }) {
  return (
    <div className={`${styles.formSection} container`}>
      <EditContainer
        reservation={reservation}
        reservationUpdateAction={reservationUpdateAction}
        guest={guest}
      />
    </div>
  );
}

export default EditSection;
