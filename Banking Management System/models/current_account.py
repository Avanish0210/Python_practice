from decimal import InvalidOperation
from models.account import Account
from decimal import Decimal
from models.bank import Bank
from models.customer import Customer


class CurrentAccount(Account):

    def __init__(
        self,
        bank: Bank,
        account_number: str,
        balance: Decimal | str | int | float,
        customer: Customer,
        overdraft_limit: Decimal | str | int | float = Decimal("10000.00"),
    ):
        super().__init__(
            bank,
            account_number,
            "Current",
            balance,
            customer
        )

        try:
            overdraft_limit = Decimal(str(overdraft_limit))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Overdraft limit must be a valid amount.") from error
        if not overdraft_limit.is_finite() or overdraft_limit < 0:
            raise ValueError("Overdraft limit must be a finite, non-negative amount.")

        self.overdraft_limit = overdraft_limit