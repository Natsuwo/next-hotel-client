import { getTagBySlug } from "@/app/_lib/supabase/blog";
import { notFound } from "next/navigation";
import TaxomonyContent from "../../_components/TaxomonyContent";

export async function generateMetadata({ params, searchParams }, parent) {
  // read route params
  const { slug } = await params;

  // fetch data
  const tag = await getTagBySlug(slug);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const description = tag?.description
    ? tag?.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 250)
    : "";
  const thumbnails =
    tag?.blog_tags && tag?.blog_tags?.length > 0
      ? tag?.blog_tags?.map((blogTag) => blogTag.thumbnail)
      : [];
  return {
    title: tag.name,
    description,
    openGraph: {
      images: [...thumbnails, ...previousImages],
    },
  };
}

async function Page({ params }) {
  const slug = params?.slug;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  return <TaxomonyContent taxonomies={tag} keyword="blog_tags" />;
}

export default Page;
