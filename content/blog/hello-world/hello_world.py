class Greeting:
    def __init__(self, target="World"):
        self.target = target

    def __str__(self):
        return f"Hello, {self.target}!"

class EnthusiasticGreeting(Greeting):
    def __str__(self):
        base = super().__str__()
        return base.upper() + "!!" + " 🎉" * 3

class ShyGreeting(Greeting):
    def __str__(self):
        return f"oh... um... hi, {self.target}... i guess"

def main():
    for cls in [Greeting, EnthusiasticGreeting, ShyGreeting]:
        print(cls())

if __name__ == "__main__":
    main()
