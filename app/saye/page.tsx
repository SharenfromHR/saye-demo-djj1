"use client";

import SAYEPage from "@/components/SAYEPage";
import SAYEConfig from "@/components/SAYEConfig";

export default function Page() {
  const handleConfigUpdate = (data) => {
    // this will later sync into your participant view
    console.log("CONFIG UPDATED:", data);
  };

  return (
    <div className="space-y-10 p-10">
      <SAYEConfig onUpdate={handleConfigUpdate} />
      <SAYEPage />
    </div>
  );
}
