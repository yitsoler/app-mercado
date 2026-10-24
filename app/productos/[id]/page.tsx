import { Suspense } from "react";
import { ProductDetailScreen } from "@/components/screens/product-detail-screen";
export function generateStaticParams() {
  return [];
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailScreen id={id} />;
}
