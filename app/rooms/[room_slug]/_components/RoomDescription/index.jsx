import Heading from "@/app/_ui/Heading";
import styles from "./styles.module.css";

function RoomDescription({ description }) {
  return (
    <div className={styles.description}>
      <Heading className="text-center">Room Description</Heading>

      <hr className="decriptionDivider" />

      <div className={styles.descriptionContent}>
        <p dangerouslySetInnerHTML={{ __html: description }}></p>
      </div>
    </div>
  );
}

export default RoomDescription;
