import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../styles.module.css";
import { faUser, faCalendar } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { getBlogBySlug } from "@/app/_lib/supabase/blog";
import { notFound } from "next/navigation";
import Banner from "@/app/_components/Banner";

export async function generateMetadata({ params, searchParams }, parent) {
  // read route params
  const { slug } = await params;

  // fetch data
  const { blog } = await getBlogBySlug(slug);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const description = blog.content
    .replace(/<\/?[^>]+(>|$)/g, "")
    .substring(0, 250);
  return {
    title: blog.title,
    description,
    openGraph: {
      images: [blog.thumbnail, ...previousImages],
    },
  };
}

async function Page({ params }) {
  const slug = params?.slug;
  const { blog, categories, tags, related } = await getBlogBySlug(slug);
  if (!blog) notFound();
  const formattedDate = new Date(blog.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <>
      <Banner title={"Blog"} bg={blog.thumbnail} />
      <div className={styles.wrapper}>
        <div className={styles.blogContainer}>
          <div className={styles.blogZone}>
            <h1 className={styles.headTitle}>{blog.title}</h1>
            <div className={styles.author}>
              <span>
                <FontAwesomeIcon icon={faUser} />
                <span className={styles.authorName}>{blog?.user?.name}</span>
              </span>
              <span>
                <FontAwesomeIcon icon={faCalendar} />
                <span className={styles.date}>{formattedDate}</span>
              </span>
            </div>
            <div className={styles.blogContent}>
              <p dangerouslySetInnerHTML={{ __html: blog?.content }}></p>
            </div>
            <ul className={styles.blogTag}>
              {blog?.tags?.map((tag) => (
                <li key={`tag-${tag.id}`}>
                  <Link href={`/blog/tag/${tag.slug}`} data-id={tag.id}>
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.sideBar}>
            <div className={styles.search}>
              <h2>Search</h2>
              <input type="text" placeholder="Search..." />
            </div>
            <div className={styles.category}>
              <h2>Category</h2>
              <ul>
                {categories.map((category) => (
                  <li key={`category-${category.id}`}>
                    <Link href={`/blog/category/${category.slug}`}>
                      {category.name}
                    </Link>
                    <span className={styles.count}>
                      <span>({category.blog_categories_count})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.relatedBlogs}>
              <h2>Related Blogs</h2>
              <ul>
                {related.map((blog) => (
                  <li key={`related-${blog.id}`}>
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.tags}>
              <h2>Tags</h2>
              <div className={styles.tagList}>
                {tags.map((tag) => (
                  <span className={styles.tag}>
                    <Link key={`tag-${tag.id}`} href={`/blog/tag/${tag.slug}`}>
                      {tag.name}{" "}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
