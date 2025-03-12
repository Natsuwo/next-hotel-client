import Heading from "@/app/_ui/Heading";
import styles from "./styles.module.css";
import Card from "../Card/Card";
import Image from "next/image";
import { getAllBlog } from "@/app/_lib/supabase/blog";
import Link from "next/link";
async function Blog() {
  const blogs = await getAllBlog();

  return (
    <section className={styles.blogSection}>
      <div className="container">
        <Heading className={styles.heading}>Blog</Heading>
        <p className={styles.description}>
          Welcome to our blog! Here, we share the latest updates, stories, and
          insights about our hotel. Whether you're looking for travel tips,
          behind-the-scenes looks, or the latest news, you'll find it all here.
          Stay tuned and happy reading!
        </p>

        <div className={styles.blogGrid}>
          {blogs?.data?.length > 0 &&
            blogs.data.map((blog) => (
              <Card key={blog.id}>
                <Card.Thumbnail>
                  <Image fill src={blog.thumbnail} alt={blog.title} />
                </Card.Thumbnail>
                <Card.Description className={styles.blogDescriptionContainer}>
                  <h2 className={styles.blogHeading}>
                    <Link href={`/blog/${blog?.slug}`}>{blog.title}</Link>
                  </h2>
                  <div className={styles.blogLabels}>
                    {blog?.categories &&
                      blog?.categories.slice(0, 3).map((category) => (
                        <p className={styles.blogLabel} key={category}>
                          {category}
                        </p>
                      ))}
                  </div>

                  <p className={styles.blogDescription}>{blog.description}</p>
                </Card.Description>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}

export default Blog;
