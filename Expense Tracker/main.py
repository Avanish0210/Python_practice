from expense_manager import ExpenseTracker
from analytics import Analytics
from storage import export_to_csv

tracker = ExpenseTracker()
analytics = Analytics()

def display_menu():
    print("\n========================================")
    print("       PERSONAL EXPENSE TRACKER")
    print("========================================")
    print("1. Add Expense")
    print("2. View All Expenses")
    print("3. Update Expense")
    print("4. Delete Expense")
    print("5. Search Expenses")

    print("6. View Total Expenses")
    print("7. Category-wise Expense Summary")
    print("8. Monthly Expense Report")

    print("9. Set Monthly Budget")
    print("10. Export Expenses to CSV")
    print("0. Exit")
    print("========================================")





def main():
    while True:
        display_menu()
        user_input = int(input("Enter your Choice: "))

        if user_input ==1 :
            tracker.add_expenses()
        elif user_input == 2:
            tracker.view_expenses()
        elif user_input == 3:
            expense_id = int(input("Enter the expense ID to update: "))
            tracker.update_expense(expense_id)
        elif user_input == 4:
            expense_id = int(input("Enter the expense ID to delete: "))
            tracker.delete_expense(expense_id)
        elif user_input == 5:
            expense_id = int(input("Enter the expense ID to search: "))
            tracker.search_expenses(expense_id)
        elif user_input == 6:
            total = analytics.calculate_total_expenses(tracker.expenses)
            print(f"Total expenses: ${total:.2f}")
        elif user_input == 7:
            category = input("Enter the category to filter: ")
            category_expenses = tracker.filter_expenses_by_category(category)
            summary = analytics.category_wise_summary(category_expenses)
            if not summary:
                print(f"No expenses found in category '{category}'.")
            else:
                print("\n========== CATEGORY-WISE SUMMARY ==========")
                for category, total in summary.items():
                    print(f"{category}: ${total:.2f}")
        elif user_input == 8:
            report = analytics.monthly_expense_report(tracker.expenses)
            if not report:
                print("No expenses recorded yet.")
            else:
                print("\n========== MONTHLY EXPENSE REPORT ==========")
                for month, total in sorted(report.items()):
                    print(f"{month}: ${total:.2f}")
        elif user_input == 9:
            budget = float(input("Enter your monthly budget: "))
            if budget < 0:
                print("Monthly budget cannot be negative.")
            else:
                analytics.set_monthly_budget(budget)
                print(f"Monthly budget set to ${budget:.2f}.")
        elif user_input == 10:
            filename = input("Enter the filename to export (e.g., expenses.csv): ")
            export_to_csv(tracker.expenses, filename)
        elif user_input == 0:
            print("Exiting the program. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()