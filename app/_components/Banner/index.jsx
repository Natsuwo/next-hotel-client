import styles from "./styles.module.css";

function Banner({ title, bg }) {
  return (
    <div
      className={styles.banner}
      style={{ "--banner": `url(${bg ? bg : "/bg.png"})` }}
    >
      <div className={styles.overlay}>
        <h1 className={styles.bannerHeading}>{title}</h1>
      </div>
    </div>
  );
}

export default Banner;
