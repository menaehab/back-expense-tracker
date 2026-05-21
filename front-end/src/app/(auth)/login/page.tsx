"use client";

import React from 'react'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
type formValues = {
  email: string;
  password: string;
}
export default function Login() {
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
  const onSubmit = async (data: formValues) => {
    await console.log(data);
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
        <Button type="submit" className="w-full cursor-pointer text-white py-2 rounded">Login</Button>
      </form>
    </div>
  )
}
