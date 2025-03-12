import Heading from "@/app/_ui/Heading";

import styles from "./styles.module.css";
import RoomCard from "../RoomCard";
import { getAllRooms } from "@/app/_lib/supabase/rooms";

async function Rooms() {
  const rooms = await getAllRooms();
  // rooms.length = 6;
  return (
    <section className={styles.roomsSection}>
      <div className="container">
        <Heading className="text-center">Our Rooms</Heading>
        <p className="text-center">
          Welcome to our exquisite selection of hotel rooms, each designed to
          provide you with the utmost comfort and luxury. Whether you're here
          for a relaxing getaway or a business trip, our rooms offer the perfect
          blend of elegance and convenience to make your stay unforgettable.
        </p>
        <div className={styles.roomsGrid}>
          {rooms.map((item, index) => (
            <RoomCard key={index} room={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Rooms;
