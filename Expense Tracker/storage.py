import csv
import json
from pathlib import Path

from expenses import Expense


DEFAULT_EXPENSES_FILE = Path(__file__).with_name("expenses.json")


def load_expenses(filename=DEFAULT_EXPENSES_FILE):
    path = Path(filename)
    if not path.exists():
        return []

    with path.open(mode="r", encoding="utf-8") as file:
        contents = file.read()

    if not contents.strip():
        return []

    records = json.loads(contents)
    if not isinstance(records, list):
        raise ValueError(f"Expense data in {path} must be a JSON list.")

    expenses = []
    required_fields = ("expense_id", "amount", "category", "description", "date")
    for index, record in enumerate(records):
        if not isinstance(record, dict) or any(
            field not in record for field in required_fields
        ):
            raise ValueError(f"Invalid expense record at index {index} in {path}.")

        try:
            expense_id = int(record["expense_id"])
            amount = float(record["amount"])
        except (TypeError, ValueError) as error:
            raise ValueError(
                f"Invalid ID or amount in expense record at index {index} in {path}."
            ) from error

        text_fields = ("category", "description", "date")
        if any(not isinstance(record[field], str) for field in text_fields):
            raise ValueError(
                f"Invalid text field in expense record at index {index} in {path}."
            )

        expenses.append(
            Expense(
                expense_id,
                amount,
                record["category"],
                record["description"],
                record["date"],
            )
        )

    return expenses


def save_expenses(expenses, filename=DEFAULT_EXPENSES_FILE):
    path = Path(filename)
    records = [
        {
            "expense_id": expense.expense_id,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "date": expense.date,
        }
        for expense in expenses
    ]

    with path.open(mode="w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)


def export_to_csv(expenses, filename):
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow([
            "Expense ID",
            "Amount",
            "Category",
            "Description",
            "Date"
        ])

        for expense in expenses:
            writer.writerow([
                expense.expense_id,
                expense.amount,
                expense.category,
                expense.description,
                expense.date
            ])  

    print(f"\nExpenses exported successfully to {filename}!")