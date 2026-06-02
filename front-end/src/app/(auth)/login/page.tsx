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
import { useUserStore } from '@/store/user-state';

type formValues = {
  email: string;
  password: string;
}
export default function Login() {
  const router = useRouter();

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  const { handleSubmit, register } = useForm<formValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const { setUser } = useUserStore();

  const onSubmit = async (data: formValues) => {
    try {
      setLoading(true);

      // get csrf cookie
      await api.get("/sanctum/csrf-cookie");

      // login
      const response = await api.post("/api/login", data);
      const user = response.data.data.user;

      setUser(user);

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
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <Label htmlFor="email" className="block text-gray-700 mb-2">Email</Label>
          <Input type="email" id="email" {...register("email")} />
        </div>
        <div className="mb-4">
          <Label htmlFor="password" className="block text-gray-700 mb-2">Password</Label>
          <Input type="password" id="password" {...register("password")} />
        </div>
        <div className='mb-4'>
          <p className='text-sm text-gray-500'>Don't have an account? <a href="/register" className='text-blue-500 hover:underline'>Register</a></p>
        </div>
        <Button type="submit" className="w-full cursor-pointer text-white py-2 rounded" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  )
}
