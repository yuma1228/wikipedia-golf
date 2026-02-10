"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoalModal } from "@/components/GoalModal";

// 1. useSearchParamsを使う部分を別コンポーネントに切り出す
function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goal = searchParams.get("goal") || "";

  const handleClose = () => {
    router.back();
  };

  if (!goal) return null;

  return (
    <GoalModal 
      goalTitle={goal} 
      onClose={handleClose} 
    />
  );
}

// 2. メインコンポーネントでSuspenseを使って囲む
export default function PreviewModal() {
  return (
    <Suspense fallback={null}>
      <PreviewContent />
    </Suspense>
  );
}