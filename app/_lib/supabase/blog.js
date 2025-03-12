import api from "./api";

export async function getAllBlog(query = "") {
  const { success, data: blogs } = await api.get(
    `/blog/index${query ? query : ""}`
  );
  // await new Promise((res) => setTimeout(res, 2000));

  if (!success) {
    console.log({ error: "Failed fetching!" });
    return false;
  }

  return blogs;
}

export async function getBlogBySlug(slug) {
  const {
    success,
    data: blog,
    tags,
    categories,
    related,
  } = await api.get(`/blog/show/${slug}`, {
    next: {
      revalidate: 300,
    },
  });
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ error: "Failed fetching!" });
    return false;
  }

  return { blog, tags, categories, related };
}

export async function getTagBySlug(slug) {
  const { success, data: tag } = await api.get(`/blog/tag/${slug}`, {
    next: {
      revalidate: 300,
    },
  });
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ error: "Failed fetching!" });
    return false;
  }

  return tag;
}

export async function getCategoryBySlug(slug) {
  const { success, data: category } = await api.get(`/blog/category/${slug}`, {
    next: {
      revalidate: 300,
    },
  });
  // await new Promise((res) => setTimeout(res, 2000));
  if (!success) {
    console.log({ error: "Failed fetching!" });
    return false;
  }

  return category;
}
