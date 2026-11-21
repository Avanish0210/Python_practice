from decimal import Decimal, InvalidOperation
from models.bank import Bank
from models.customer import Customer


class Account:
    def __init__(
        self,
        bank: Bank,
        account_number: str,
        account_type: str,
        balance: Decimal | str | int | float,
        customer: Customer,
    ) -> None:
        if not isinstance(bank, Bank):
            raise TypeError("Account requires a valid bank.")
        if not isinstance(customer, Customer):
            raise TypeError("Account requires a valid customer.")
        if not isinstance(account_number, str) or not account_number.strip():
            raise ValueError("Account number cannot be empty.")
        if not isinstance(account_type, str) or not account_type.strip():
            raise ValueError("Account type cannot be empty.")
        try:
            opening_balance = Decimal(str(balance))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Opening balance must be a valid amount.") from error

        if not opening_balance.is_finite() or opening_balance < 0:
            raise ValueError("Opening balance must be a finite, non-negative amount.")

        self.bank = bank
        self.account_number = account_number.strip()
        self.account_type = account_type.strip()
        self.balance = opening_balance
        self.customer = customer
