import { MerchProductEditor } from "@/components/admin/MerchProductEditor";
import { getMerchCategories } from "@/lib/data/merch";

export const dynamic = "force-dynamic";

export default async function NewMerchProductPage() {
  const categories = await getMerchCategories();
  return <MerchProductEditor categories={categories} />;
}
