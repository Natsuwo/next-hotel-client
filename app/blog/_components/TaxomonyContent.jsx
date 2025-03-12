import React from "react";
import styles from "./styles.module.css";
import Link from "next/link";

const TaxomonyContent = ({ taxonomies, keyword }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.relatedBlogs}>
        <h2>{taxonomies.name}</h2>
        <ul className={styles.relatedBlogList}>
          {taxonomies[keyword]?.map((taxonomy) => (
            <li key={taxonomy.id} className={styles.relatedBlogItem}>
              <Link href={`/blog/${taxonomy?.blog?.slug}`}>
                <div className={styles.thumbnail}>
                  <img src={taxonomy.thumbnail} alt={taxonomy?.blog?.title} />
                </div>
                <div className={styles.blogInfo}>
                  <h3>{taxonomy?.blog?.title}</h3>
                  <p>{taxonomy?.blog?.description}</p>
                  <p className={styles.date}>
                    {new Date(taxonomy?.blog?.updated_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaxomonyContent;
