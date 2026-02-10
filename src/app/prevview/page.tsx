'use client';

import { useSearchParams } from "next/navigation";
import { GoalModal } from "@/components/GoalModal";
import { Suspense } from "react";

function PreviewContent() {
  const searchParams = useSearchParams();
  const goal = searchParams.get("goal") || "";

  if (!goal) return null;

  return <GoalModal goalTitle={goal} onClose={() => {}} />;
}


export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}