import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts, getProductBySlug, getMerchCategories, getMerchShopEnabled } from "@/lib/data/merch";
import { ProductDetail } from "./ProductDetail";

const SITE_URL = "https://www.festivalul-lupilor.md";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const isRu = locale === "ru";
  const title = isRu ? product.nameRu : product.nameRo;
  const description = (isRu ? product.descriptionRu : product.descriptionRo) ?? title;
  const path = `/shop/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: {
        ro: `${SITE_URL}/ro${path}`,
        ru: `${SITE_URL}/ru${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      images: product.images.length > 0 ? [product.images[0]] : [`${SITE_URL}/og.png`],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  if (!(await getMerchShopEnabled())) notFound();

  const { locale, slug } = await params;
  const [product, allProducts, categories] = await Promise.all([
    getProductBySlug(slug),
    getActiveProducts(),
    getMerchCategories(),
  ]);
  if (!product) notFound();

  const isRu = locale === "ru";
  const category = categories.find((c) => c.id === product.categoryId);
  const categoryName = category ? (isRu ? category.nameRu : category.nameRo) : null;

  // Related: same category first, otherwise other products; exclude current.
  const others = allProducts.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => product.categoryId && p.categoryId === product.categoryId);
  const related = (sameCategory.length > 0 ? sameCategory : others).slice(0, 4);

  return <ProductDetail product={product} categoryName={categoryName} related={related} />;
}
