import Heading from "@/app/_ui/Heading";
import styles from "./styles.module.css";
import Image from "next/image";

function About() {
  return (
    <section className={styles.aboutSection}>
      <div className={`container ${styles.aboutContainer}`}>
        <div className={styles.description}>
          <Heading>About Us</Heading>
          <p>
            Welcome to Fuji Hotel, where luxury meets comfort. Our hotel offers
            a unique blend of modern amenities and classic elegance, ensuring a
            memorable stay for all our guests. Whether you're here for business
            or leisure, our dedicated staff is committed to providing
            exceptional service and hospitality. Enjoy our state-of-the-art
            facilities, exquisite dining options, and convenient location.
            Experience the best in accommodation at Fuji Hotel.
          </p>
        </div>
        <div className={styles.gallery}>
          <div>
            <Image fill src="/bg.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
