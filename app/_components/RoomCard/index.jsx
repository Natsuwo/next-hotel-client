import Image from "next/image";
import styles from "./styles.module.css";
import Card from "../Card/Card";
import Link from "next/link";

function RoomCard({ room }) {
  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <Card>
      <Card.Thumbnail>
        <Image fill src={`${room?.thumbnails[0]?.url}`} alt={`${room.title}`} />
      </Card.Thumbnail>

      <Card.Description className={styles.roomDescription}>
        <Link href={`/rooms/${room?.slug}`}>
          <h2 className={styles.roomTitle}>{room.title}</h2>
        </Link>

        <p
          dangerouslySetInnerHTML={{
            __html: truncateDescription(room.description, 150),
          }}
        ></p>
      </Card.Description>
    </Card>
  );
}

export default RoomCard;
