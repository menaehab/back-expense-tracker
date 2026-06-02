"use client";
import type { TableColumn } from 'react-data-table-component';
import { useUserStore } from "@/store/user-state";
import DataTable from 'react-data-table-component';
import { Expense } from "@/types/expense";
export default function Home() {
  const { user } = useUserStore();
  console.log("User in Home page:", user);

  const columns: TableColumn<Expense>[] = [
    { name: 'Title', selector: row => row.title },
    { name: 'Amount', selector: row => row.amount },
    {
      name: 'Actions', cell: () =>
        <>
          <button className="text-blue-500 cursor-pointer hover:underline">Edit</button>
          <button className="text-red-500 cursor-pointer hover:underline ml-2">Delete</button>
        </>
    },
  ];

  const data: Expense[] = [
    { id: 1, title: 'The Shawshank Redemption', amount: 100 },
    { id: 2, title: 'The Godfather', amount: 150 },
    { id: 3, title: 'The Dark Knight', amount: 200 },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center my-8">Welcome, {user?.name || "Guest"}!</h1>
      <div className="bg-white p-4 rounded shadow-md mx-16">
        <div className="mb-4 flex justify-end">
          <input type="text" placeholder="Search expenses..." className='focus:outline-0 bg-slate-100 px-4 py-2 border-2 rounded-lg' />
        </div>
        <DataTable<Expense>
          columns={columns}
          data={data}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
}
