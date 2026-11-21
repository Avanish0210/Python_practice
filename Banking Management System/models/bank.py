class Bank:
    def __init__(self, name: str) -> None:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Bank name cannot be empty.")
        self.name = name.strip()

