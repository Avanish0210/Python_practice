from decimal import Decimal, InvalidOperation
from models.bank import Bank
from models.customer import Customer
from models.account import Account
from models.savings_account import SavingsAccount
from models.current_account import CurrentAccount


class Account_service:

    def __init__(self) -> None:
        self.accounts: list[Account] = []

    def create_account(
        self,
        bank: Bank,
        account_type: str,
        account_number: str,
        balance: Decimal | str | int | float,
        customer: Customer,
    ) -> Account:
        if not isinstance(account_type, str):
            raise ValueError("Invalid account type. Please choose 'savings' or 'current'.")

        normalized_type = account_type.strip().casefold()
        if normalized_type not in {"savings", "current"}:
            raise ValueError("Invalid account type. Please choose 'savings' or 'current'.")
        if not isinstance(account_number, str) or not account_number.strip():
            raise ValueError("Account number cannot be empty.")
        if any(account.account_number == account_number.strip() for account in self.accounts):
            raise ValueError(f"Account number {account_number} already exists.")

        try:
            opening_balance = Decimal(str(balance))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Opening balance must be a valid amount.") from error

        if normalized_type == "savings":
            account = SavingsAccount(bank, account_number, opening_balance, customer)
        else:
            account = CurrentAccount(bank, account_number, opening_balance, customer)
        self.accounts.append(account)
        return account

    def get_account_detail(self, account_number: str) -> Account:

        for account in self.accounts:
            if account.account_number == account_number:
                return account
        raise ValueError("Account not found.")

    def get_all_accounts(self) -> list[Account]:
        return self.accounts.copy()

    def delete_account(self, account_number: str) -> str:
        for account in self.accounts:
            if account.account_number == account_number:
                self.accounts.remove(account)
                return f"Account {account_number} deleted successfully."
        raise ValueError("Account not found.")