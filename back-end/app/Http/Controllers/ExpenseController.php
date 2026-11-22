<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    /**
     * List expenses
     *
     * Get a paginated list of expenses owned by the authenticated user.
     *
     * @authenticated
     * @group Expenses
     *
     * @queryParam per_page integer Number of expenses per page. Must be 10, 25, or 50. Example: 10
     * @queryParam search string Filter expenses by reason. Example: Groceries
     *
     * @response 200 scenario="success" {
     *   "current_page": 1,
     *   "data": [
     *     {
     *       "id": 1,
     *       "reason": "Groceries",
     *       "amount": "125.50",
     *       "user_id": 1,
     *       "created_at": "2026-06-02T10:53:32.000000Z",
     *       "updated_at": "2026-06-02T10:53:32.000000Z"
     *     }
     *   ],
     *   "per_page": 10,
     *   "total": 1
     * }
     */
    public function index(Request $request)
    {
        $per_page = in_array($request->per_page, [10, 25, 50]) ? $request->per_page : 10;
        $search = $request->search;

        $expenses = Expense::where('user_id', Auth::user()->id)
            ->when($search, function ($query, $search) {
                $query->where('reason', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($per_page)->withQueryString();

        return response()->json($expenses);
    }

    /**
     * Create an expense
     *
     * Create a new expense for the authenticated user.
     *
     * @authenticated
     * @group Expenses
     *
     * @bodyParam reason string required The expense reason. Example: Groceries
     * @bodyParam amount number required The expense amount. Minimum 0.01. Example: 125.50
     *
     * @response 201 scenario="success" {
     *   "message": "Expense created successfully",
     *   "data": {
     *     "expense": {
     *       "id": 1,
     *       "reason": "Groceries",
     *       "amount": "125.50",
     *       "user_id": 1,
     *       "created_at": "2026-06-02T10:53:32.000000Z",
     *       "updated_at": "2026-06-02T10:53:32.000000Z"
     *     }
     *   }
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The reason field is required.",
     *   "errors": {
     *     "reason": ["The reason field is required."]
     *   }
     * }
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $expense = Expense::create([
            'reason' => $validated['reason'],
            'amount' => $validated['amount'],
            'user_id' => Auth::user()->id,
        ]);

        return response()->json(['message' => 'Expense created successfully', 'data' => ['expense' => $expense]], 201);
    }

    /**
     * Update an expense
     *
     * Update an expense owned by the authenticated user.
     *
     * @authenticated
     * @group Expenses
     *
     * @urlParam id integer required The expense ID. Example: 1
     * @bodyParam reason string required The updated expense reason. Example: Supermarket
     * @bodyParam amount number required The updated expense amount. Minimum 0.01. Example: 150.75
     *
     * @response 200 scenario="success" {
     *   "message": "Expense updated successfully",
     *   "data": {
     *     "expense": {
     *       "id": 1,
     *       "reason": "Supermarket",
     *       "amount": "150.75",
     *       "user_id": 1,
     *       "created_at": "2026-06-02T10:53:32.000000Z",
     *       "updated_at": "2026-06-02T11:00:00.000000Z"
     *     }
     *   }
     * }
     * @response 404 scenario="expense not found" {
     *   "message": "No query results for model [App\\Models\\Expense] 1"
     * }
     */
    public function update(Request $request, string $id)
    {
        $expense = Expense::where('id', $id)->where('user_id', Auth::user()->id)->firstOrFail();

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $expense->update($validated);

        return response()->json(['message' => 'Expense updated successfully', 'data' => ['expense' => $expense]], 200);
    }

    /**
     * Delete an expense
     *
     * Delete an expense owned by the authenticated user.
     *
     * @authenticated
     * @group Expenses
     *
     * @urlParam id integer required The expense ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "message": "Expense deleted successfully"
     * }
     * @response 404 scenario="expense not found" {
     *   "message": "No query results for model [App\\Models\\Expense] 1"
     * }
     */
    public function destroy(string $id)
    {
        $expense = Expense::where('id', $id)->where('user_id', Auth::user()->id)->firstOrFail();
        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully'], 200);
    }
}
