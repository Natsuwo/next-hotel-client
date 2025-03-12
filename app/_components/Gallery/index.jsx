import Heading from "@/app/_ui/Heading";
import styles from "./styles.module.css";
import Image from "next/image";
import { getGallery } from "@/app/_lib/supabase/rooms";
async function Gallery() {
  const gallery = await getGallery();
  return (
    <section className={styles.gallerySection}>
      <div className="container">
        <Heading className="text-center">Gallery</Heading>
        <div className={styles.galleryGrid}>
          {gallery.map((item) => (
            <div key={item.id} className={styles.thumbnail}>
              <Image fill src={`${item?.url}`} alt={`${item.title}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
