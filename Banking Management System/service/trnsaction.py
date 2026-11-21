from decimal import Decimal, InvalidOperation

from models.account import Account

transaction_details: dict[Account, list["Transaction"]] = {}


class Transaction:

    def __init__(self, transaction_type: str, amount: Decimal | str | int | float, account):
        if not isinstance(transaction_type, str):
            raise ValueError("Transaction type must be 'deposit', 'withdraw', or 'transfer'.")
        normalized_type = transaction_type.strip().casefold()
        if normalized_type not in {"deposit", "withdraw", "transfer"}:
            raise ValueError("Transaction type must be 'deposit', 'withdraw', or 'transfer'.")
        try:
            transaction_amount = Decimal(str(amount))
        except (InvalidOperation, ValueError) as error:
            raise ValueError("Transaction amount must be a valid amount.") from error
        if not transaction_amount.is_finite() or transaction_amount <= 0:
            raise ValueError("Transaction amount must be finite and greater than zero.")
        if not isinstance(account, Account):
            raise TypeError("Transactions require a valid account.")

        self.transaction_type = normalized_type
        self.amount = transaction_amount
        self.account = account
        self.target_account = None
        self._processed = False

    def _ensure_unprocessed(self) -> None:
        if self._processed:
            raise ValueError("This transaction has already been processed.")

    def _record(self, *accounts) -> None:
        for account in accounts:
            history = transaction_details.setdefault(account, [])
            if self not in history:
                history.append(self)
        self._processed = True

    def _minimum_allowed_balance(self) -> Decimal:
        if hasattr(self.account, "overdraft_limit"):
            return -self.account.overdraft_limit
        return getattr(self.account, "minimum_balance", Decimal("0"))


    def deposit(self):
        if self.transaction_type != "deposit":
            raise ValueError("Transaction type must be 'deposit' for deposit transactions.")
        self._ensure_unprocessed()
        self.account.balance += self.amount
        self._record(self.account)
        return self.account.balance

    def withdraw(self):
        if self.transaction_type != "withdraw":
            raise ValueError("Transaction type must be 'withdraw' for withdrawal transactions.")
        self._ensure_unprocessed()
        if self.account.balance - self.amount < self._minimum_allowed_balance():
            raise ValueError("Withdrawal would exceed the available balance.")
        self.account.balance -= self.amount
        self._record(self.account)
        return self.account.balance

    def transfer(self, target_account):
        if self.transaction_type != "transfer":
            raise ValueError("Transaction type must be 'transfer' for transfer transactions.")
        self._ensure_unprocessed()
        if not isinstance(target_account, Account):
            raise TypeError("The destination must be a valid account.")
        if target_account is self.account or target_account.account_number == self.account.account_number:
            raise ValueError("Source and destination accounts must be different.")
        if self.account.balance - self.amount < self._minimum_allowed_balance():
            raise ValueError("Transfer would exceed the available balance.")
        self.account.balance -= self.amount
        target_account.balance += self.amount
        self.target_account = target_account
        self._record(self.account, target_account)
        return self.account.balance, target_account.balance

    def get_transaction_details(self):
        history = transaction_details.get(self.account, [])
        return history[-1] if history else None

    def get_transaction_history(self):
        return transaction_details.get(self.account, []).copy()
