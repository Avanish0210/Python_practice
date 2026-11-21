class Analytics:
    def __init__(self):
        self.monthly_budget = None

    @staticmethod
    def calculate_total_expenses(expenses):
        return sum(expense.amount for expense in expenses)

    @staticmethod
    def category_wise_summary(expenses):
        category_summary = {}
        for expense in expenses:
            if expense.category in category_summary:
                category_summary[expense.category] += expense.amount
            else:
                category_summary[expense.category] = expense.amount

        return category_summary

    @staticmethod
    def monthly_expense_report(expenses):
        monthly_summary = {}
        for expense in expenses:
            month = expense.date[:7]  # Extracting YYYY-MM from the date
            if month in monthly_summary:
                monthly_summary[month] += expense.amount
            else:
                monthly_summary[month] = expense.amount

        return monthly_summary

    @staticmethod
    def daily_expense_report(expenses):
        daily_summary = {}
        for expense in expenses:
            day = expense.date  # Using the full date (YYYY-MM-DD)
            if day in daily_summary:
                daily_summary[day] += expense.amount
            else:
                daily_summary[day] = expense.amount

        return daily_summary

    @staticmethod
    def highest_expense(expenses):
        if not expenses:
            return None

        highest = max(expenses, key=lambda x: x.amount)
        return highest

    def set_monthly_budget(self, budget):
        if budget < 0:
            raise ValueError("Monthly budget cannot be negative.")
        self.monthly_budget = budget