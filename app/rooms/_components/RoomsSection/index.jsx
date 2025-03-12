import { filterRoomsByDate, getAllRooms } from "@/app/_lib/supabase/rooms";
import styles from "./styles.module.css";
import RoomItem from "../RoomItem";
import { isValid } from "date-fns";

async function RoomsSection({ filter, range }) {
  const rooms = await getAllRooms();
  // let filteredRooms = await filterRoomsByDate();
  let filteredRooms = rooms;

  if (
    range &&
    isValid(new Date(range.split("_")?.at(0))) &&
    isValid(new Date(range.split("_")?.at(1)))
  ) {
    const arrivalDate = range.split("_")?.at(0);
    const departureDate = range.split("_")?.at(1);
    filteredRooms = await getAllRooms(
      "?check_in=" + arrivalDate + "&check_out=" + departureDate
    );
  }

  switch (filter) {
    case "high-price":
      filteredRooms = filteredRooms.sort(
        (a, b) => b.price_per_night - a.price_per_night
      );
      break;
    case "low-price":
      filteredRooms = filteredRooms.sort(
        (a, b) => a.price_per_night - b.price_per_night
      );
      break;

    case "min-guests":
      filteredRooms = filteredRooms.sort(
        (a, b) => b.guest_count - a.guest_count
      );
      break;

    case "max-guests":
      filteredRooms = filteredRooms.sort(
        (a, b) => a.guest_count - b.guest_count
      );
      break;
    default:
      filteredRooms = filteredRooms;
  }

  return (
    <div className={styles.roomsGrid}>
      {filteredRooms.map((item) => (
        <RoomItem
          key={item.id}
          slug={item?.slug}
          title={item.title}
          price={item.price_per_night}
          imgPath={item.thumbnails[0]?.url}
          link="#"
        />
      ))}
    </div>
  );
}

export default RoomsSection;
