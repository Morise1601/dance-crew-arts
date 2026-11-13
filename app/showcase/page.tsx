import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublicShowcase } from "@/lib/showcase/queries";
import { buildShowcaseCategoryHref, getShowcaseCategories, resolveShowcaseCategory } from "@/lib/showcase/categories";
import ShowcaseClient from "./showcase-client";

export const metadata: Metadata = {
  title: "Showcase | D'Art Crew",
  description: "Step into the world of D'Art Crew. Explore our art forms through photographs and performances.",
};

export const dynamic = "force-dynamic";

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const [params, showcase] = await Promise.all([searchParams, getPublicShowcase()]);
  const categoryToken = Array.isArray(params.category) ? params.category[0] : params.category;
  const categories = getShowcaseCategories(showcase.categories, showcase.media);
  const category = resolveShowcaseCategory(categories, categoryToken);
  if (category && categoryToken !== category.slug) redirect(buildShowcaseCategoryHref(category.slug));
  const categoryId = category?.id ?? (categoryToken ? "missing-category" : null);

  return (
    <ShowcaseClient
      key={categoryId ?? "all-art-forms"}
      categories={categories}
      media={categoryId ? showcase.media.filter((item) => item.category_id === categoryId) : []}
      categoryId={categoryId ?? null}
      hasError={Boolean(showcase.error)}
    />
  );
}
