"use client";

import React from 'react'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type formValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
export default function Register() {
  const router = useRouter();

  const schema = z.object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  }).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });
  const { handleSubmit, register } = useForm<formValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const onSubmit = async (data: formValues) => {
    try {
      setLoading(true);

      // Initialize CSRF cookie
      await api.get("/sanctum/csrf-cookie");

      // register
      const response = await api.post("/api/register", data);

      // Refresh page state and redirect to home
      router.refresh();
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <div className="mb-4">
          <Label htmlFor="name" className="block text-gray-700 mb-2">Name</Label>
          <Input type="text" id="name" {...register("name")} />
        </div>
        <div className="mb-4">
          <Label htmlFor="email" className="block text-gray-700 mb-2">Email</Label>
          <Input type="email" id="email" {...register("email")} />
        </div>
        <div className="mb-4">
          <Label htmlFor="password" className="block text-gray-700 mb-2">Password</Label>
          <Input type="password" id="password" {...register("password")} />
        </div>
        <div className="mb-4">
          <Label htmlFor="password_confirmation" className="block text-gray-700 mb-2">Confirm Password</Label>
          <Input type="password" id="password_confirmation" {...register("password_confirmation")} />
        </div>
        <Button type="submit" className="w-full cursor-pointer text-white py-2 rounded" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  )
}
