"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <>
      {!isAuthRoute && <Navbar />}
      {children}
    </>
  );
}