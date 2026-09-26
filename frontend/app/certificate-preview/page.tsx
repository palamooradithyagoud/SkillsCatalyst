"use client";

import React from "react";
import CertificateDisplay from "@/components/student/CertificateDisplay";

export default function CertificatePreviewPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        <CertificateDisplay
          studentName="Palamoor Adithya"
          collegeName="Vasavi College of Engineering"
          courseTitle="Git & GitHub Basics: From Zero to Collaboration"
          score={95}
          issuedDate="2026-09-26T00:00:00Z"
          certificateNumber="SC-98214732"
          courseDuration="16 Hours"
          verificationUrl="http://localhost:3000/verify/certificate/SC-98214732"
          isPreview={false}
        />
      </div>
    </div>
  );
}
