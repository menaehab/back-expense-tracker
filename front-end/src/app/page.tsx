"use client";
import { useUserStore } from "@/store/user-state";
export default function Home() {
  const { user } = useUserStore();
  console.log("User in Home page:", user);
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center my-8">Welcome, {user?.name || "Guest"}!</h1>
    </div>
  );
}
