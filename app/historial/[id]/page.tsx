import { Suspense } from "react";
import { HistoryDetailScreen } from "@/components/screens/history-detail-screen";
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
      <HistoryDetail params={params} />
    </Suspense>
  );
}

async function HistoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HistoryDetailScreen id={id} />;
}
