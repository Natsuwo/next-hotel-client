import { getCategoryBySlug } from "@/app/_lib/supabase/blog";
import { notFound } from "next/navigation";
import TaxomonyContent from "../../_components/TaxomonyContent";

export async function generateMetadata({ params, searchParams }, parent) {
  // read route params
  const { slug } = await params;

  // fetch data
  const category = await getCategoryBySlug(slug);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const description = category?.description
    ? category?.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 250)
    : "";
  const thumbnails =
    category?.blog_categories && category?.blog_categories?.length > 0
      ? category?.blog_categories?.map((blogCategory) => blogCategory.thumbnail)
      : [];
  return {
    title: category.name,
    description,
    openGraph: {
      images: [...thumbnails, ...previousImages],
    },
  };
}

async function Page({ params }) {
  const slug = params?.slug;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return <TaxomonyContent taxonomies={category} keyword="blog_categories" />;
}

export default Page;
