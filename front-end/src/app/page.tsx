"use client";

import type { TableColumn } from "react-data-table-component";
import { useUserStore } from "@/store/user-state";
import DataTable from "react-data-table-component";
import { Expense } from "@/types/expense";
import { Search, Plus } from "lucide-react";
import api from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/common/modal";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
type formValues = {
  reason: string;
  amount: string;
}
export default function Home() {
  const { user } = useUserStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  // pagination / search state
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const schema = z.object({
    reason: z.string().min(3).max(255),
    amount: z.string().regex(/^\d+(\.\d{2})?$/, "Invalid amount format"),
  });
  const { handleSubmit, register, reset, formState: { errors } } = useForm<formValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
      amount: "",
    },
  });

  const onSubmit = async (data: formValues) => {
    try {

      if (selectedExpense) {
        await api.put(`/api/expenses/${selectedExpense.id}`, data);
      } else {
        await api.post("/api/expenses", data);
      }

      await fetchExpenses();
      reset();
      setIsOpen(false);
      setIsEditOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.log(error);
    }
  };

  const getExpenses = useCallback(async (search: string, perPage: number, page: number) => {


    const response = await api.get("/api/expenses", {
      params: { search, per_page: perPage, page },
    });

    return response.data; // payload: { data: [], total, current_page, per_page, ... }
  }, []);

  // debounce search input into `search`
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await getExpenses(search, perPage, currentPage);
      setExpenses(Array.isArray(payload.data) ? payload.data : []);
      setTotalRows(typeof payload.total === 'number' ? payload.total : (Array.isArray(payload.data) ? payload.data.length : 0));
    } catch (error) {
      console.log(error);
      setExpenses([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [getExpenses, search, perPage, currentPage]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const deleteExpense = async (id: number) => {
    await api.delete(`/api/expenses/${id}`);

    await fetchExpenses();
    setIsDeleteOpen(false);
    setSelectedExpense(null);
  };

  const columns: TableColumn<Expense>[] = [
    {
      name: "#",
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      width: "60px",
    },
    {
      name: "Reason",
      selector: (row) => row.reason,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      cell: (row) => (
        <span className="font-semibold text-green-600">
          {row.amount}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedExpense(row);
              reset({ reason: row.reason, amount: String(row.amount) });
              setIsEditOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>

          <button
            onClick={() => {
              setSelectedExpense(row);
              setIsDeleteOpen(true);
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Welcome, {user?.name || "Guest"}
            </h1>
            <p className="text-slate-500 mt-2">
              Manage and track your expenses easily.
            </p>
          </div>

          <button onClick={() => {
            setSelectedExpense(null);
            reset({ reason: "", amount: "" });
            setIsOpen(true);
          }}
            className="mt-4 md:mt-0 flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl shadow-md transition">
            <Plus size={18} />
            Add Expense
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Expenses List
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  placeholder="Search expenses..."
                  className="pl-10 pr-4 py-2 w-72 bg-slate-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={expenses}
            pagination
            paginationServer
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 25, 50]}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={(newPerPage) => {
              setPerPage(newPerPage);
              setCurrentPage(1);
            }}
            onChangePage={(page) => setCurrentPage(page)}
            progressPending={loading}
            highlightOnHover
            striped
            responsive
          />
        </div>
      </div>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Expense"
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("reason")}
            placeholder="Reason"
            className="w-full border p-2 rounded-lg"
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}

          <input
            {...register("amount")}
            placeholder="Amount"
            type="number"
            className="w-full border p-2 rounded-lg"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}

          <button className="w-full cursor-pointer hover:bg-black/80 transition bg-black text-white py-2 rounded-lg">
            Save
          </button>
        </form>
      </Modal>

      <Modal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
          reset({ reason: "", amount: "" });
        }}
        title="Edit Expense"
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("reason")}
            placeholder="Reason"
            className="w-full border p-2 rounded-lg"
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}

          <input
            {...register("amount")}
            placeholder="Amount"
            type="number"
            className="w-full border p-2 rounded-lg"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}

          <button className="w-full cursor-pointer hover:bg-black/80 transition bg-black text-white py-2 rounded-lg">
            Update
          </button>
        </form>
      </Modal>

      <Modal
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedExpense(null);
        }}
        title="Delete Expense"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete {selectedExpense?.reason || "this expense"}?
          </p>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedExpense(null);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => selectedExpense && deleteExpense(selectedExpense.id)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}