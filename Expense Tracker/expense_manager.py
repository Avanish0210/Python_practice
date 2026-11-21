#This is an expense tracker that tracks my daily expenses
from expenses import Expense
from storage import load_expenses, save_expenses


class ExpenseTracker:
    def __init__(self, storage_path=None):
        self.storage_path = storage_path
        if storage_path is None:
            self.expenses = load_expenses()
        else:
            self.expenses = load_expenses(storage_path)

    def add_expenses(self):
        print("\n========== ADD NEW EXPENSE ==========")

        expense_amount = float(input("Enter the expense amount: "))


        expense_category = input("Enter the expense category: ")
        expense_description = input("Enter the expense description: ")
        expense_date = input("Enter the expense date (YYYY-MM-DD): ")

        next_expense_id = max(
            (expense.expense_id for expense in self.expenses), default=0
        ) + 1
        expense = Expense(
            next_expense_id,
            expense_amount,
            expense_category,
            expense_description,
            expense_date,
        )
        self.expenses.append(expense)
        self._save_expenses()

        print("\nExpense added successfully!")
        print(f"Expense ID: {expense.expense_id}")

    def view_expenses(self):
        print("\n========== ALL EXPENSES ==========")

        if not self.expenses:
            print("\nNo expenses recorded yet.")
            return

        for expense in self.expenses:
            print("----------------------------------")
            print("\n========== EXPENSE DETAILS ==========")
            print(f"Expense ID: {expense.expense_id}")
            print(f"Amount: ${expense.amount:.2f}")
            print(f"Category: {expense.category}")
            print(f"Description: {expense.description}")
            print(f"Date: {expense.date}")   

        print("----------------------------------")

    def update_expense(self , expense_id):
        for expense in self.expenses:
            if expense.expense_id == expense_id:
                print("\n========== UPDATE EXPENSE ==========")
                print(f"Current Amount: ${expense.amount:.2f}")
                new_amount = float(input("Enter the new amount: "))
                expense.amount = new_amount
                self._save_expenses()
                print("Expense updated successfully!")
                return
        print("Expense not found.")

    def delete_expense(self, expense_id):
        for expense in self.expenses:
            if expense.expense_id == expense_id:
                self.expenses.remove(expense)
                self._save_expenses()
                print("\n========== DELETE EXPENSE ==========")
                print("Expense deleted successfully!")
                return
        print("Expense not found.")

    def search_expenses(self, expense_id):
        for expense in self.expenses:
            if expense.expense_id == expense_id:
                print("\n========== SEARCH EXPENSE ==========")
                print(f"Expense ID: {expense.expense_id}")
                print(f"Amount: ${expense.amount:.2f}")
                print(f"Category: {expense.category}")
                print(f"Description: {expense.description}")
                print(f"Date: {expense.date}")
                return
        print("Expense not found.")

    def filter_expenses_by_category(self, category):
        expenses_by_category = []
        for expense in self.expenses:
            if expense.category.lower()==category.lower():
                expenses_by_category.append(expense)
        return expenses_by_category

    def _save_expenses(self):
        if self.storage_path is None:
            save_expenses(self.expenses)
        else:
            save_expenses(self.expenses, self.storage_path)