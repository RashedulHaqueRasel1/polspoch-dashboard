
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Orders from "@/components/Dashboard/Orders/Orders";

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>

        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-20 h-8" />
      </div>}>
        <Orders />
      </Suspense>
    </div>
  );
}
