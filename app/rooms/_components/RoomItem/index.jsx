import Image from "next/image";
import styles from "./styles.module.css";
import Link from "next/link";

function RoomItem({ slug, imgPath, price, link, title }) {
  return (
    <div className={styles.roomsGrid}>
      <div className={styles.roomItem}>
        <div className={styles.imgOverlay}>
          <Image fill src={`${imgPath}`} alt={`${title}`} />
          {/* <img src={`${imgPath}`} alt={`${title}`} /> */}
        </div>
        <div className={styles.roomDescription}>
          <div>
            <h2 className={styles.roomTitle}>{title}</h2>
            <Link href={`rooms/${slug}`}>From ${price} / Night</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomItem;
