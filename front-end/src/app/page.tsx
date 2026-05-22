"use client";
import { useUserStore } from "@/store/user-state";
export default function Home() {
  const { user } = useUserStore();
  console.log("User in Home page:", user);
  return (
    <div>
      <h1>Welcome, {user?.name || "Guest"}!</h1>
    </div>
  );
}
