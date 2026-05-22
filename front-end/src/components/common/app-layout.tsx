"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/navbar";
import { useEffect } from "react";
import { useUserStore } from "@/store/user-state";
import api from "@/lib/api";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  const { user, setUser } = useUserStore();
  useEffect(() => {
    const getUser = async () => {
      if (!user) {
        try {
          const response = await api.get("/api/user");
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    getUser();
  }, [user, setUser]);

  return (
    <>
      {!isAuthRoute && <Navbar />}
      {children}
    </>
  );
}