import math
from decimal import Decimal
from decimal import InvalidOperation
from models.bank import Bank
from models.account import Account
from models.customer import Customer


class SavingsAccount(Account):

    def __init__(
        self,
        bank: Bank,
        account_number: str,
        balance: Decimal | str | int | float,
        customer: Customer,
        interest_rate: float = 4.0,
        minimum_balance: Decimal | str | int | float = Decimal("1000.00"),
    ):
        super().__init__(
            bank,
            account_number,
            "Savings",
            balance,
            customer
        )

        try:
            minimum_balance = Decimal(str(minimum_balance))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Minimum balance must be a valid amount.") from error
        if not minimum_balance.is_finite() or minimum_balance < 0:
            raise ValueError("Minimum balance must be a finite, non-negative amount.")
        if (
            not isinstance(interest_rate, (int, float))
            or not math.isfinite(interest_rate)
            or interest_rate < 0
        ):
            raise ValueError("Interest rate must be a finite, non-negative number.")

        self.interest_rate = interest_rate
        self.minimum_balance = minimum_balance