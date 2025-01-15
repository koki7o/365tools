// expense_tracker.d
import std.stdio;
import std.datetime;
import std.conv;
import std.string;
import std.file;
import std.array;
import std.algorithm;
import std.format;

struct Expense {
    SysTime date;
    string category;
    double amount;
    string description;

    string toString() const {
        return format("%s,%s,%.2f,%s", 
            date.toISOExtString(), 
            category, 
            amount, 
            description);
    }

    static Expense fromString(string line) {
        auto parts = line.split(",");
        if (parts.length < 4) {
            throw new Exception("Invalid expense format");
        }
        
        return Expense(
            SysTime.fromISOExtString(parts[0]),
            parts[1],
            to!double(parts[2]),
            parts[3]
        );
    }
}

class ExpenseTracker {
    private {
        Expense[] expenses;
        string filename = "expenses.csv";
        string[] categories = [
            "Food",
            "Transport",
            "Entertainment",
            "Bills",
            "Shopping",
            "Other"
        ];
    }

    this() {
        loadExpenses();
    }

    void addExpense() {
        writeln("\nAdd New Expense");
        writeln("--------------");

        // Show categories
        writeln("\nCategories:");
        foreach (i, category; categories) {
            writefln("%d. %s", i + 1, category);
        }

        // Get category
        write("\nSelect category (1-", categories.length, "): ");
        auto categoryIndex = readln().strip().to!int - 1;
        if (categoryIndex < 0 || categoryIndex >= categories.length) {
            writeln("Invalid category!");
            return;
        }

        // Get amount
        write("Enter amount: ");
        auto amount = readln().strip().to!double;

        // Get description
        write("Enter description: ");
        auto description = readln().strip();

        // Create and add expense
        auto expense = Expense(
            Clock.currTime(),
            categories[categoryIndex],
            amount,
            description
        );
        expenses ~= expense;
        saveExpenses();

        writeln("\nExpense added successfully!");
    }

    void viewExpenses() {
        if (expenses.length == 0) {
            writeln("\nNo expenses recorded yet.");
            return;
        }

        writeln("\nAll Expenses");
        writeln("-----------");
        printExpenses(expenses);
    }

    void viewByCategory() {
        if (expenses.length == 0) {
            writeln("\nNo expenses recorded yet.");
            return;
        }

        writeln("\nExpenses by Category");
        writeln("-------------------");

        foreach (category; categories) {
            auto categoryExpenses = expenses.filter!(e => e.category == category).array;
            if (categoryExpenses.length > 0) {
                writefln("\n%s:", category);
                printExpenses(categoryExpenses);
                auto total = categoryExpenses.map!(e => e.amount).sum;
                writefln("Total: %.2f", total);
            }
        }
    }

    void viewMonthlyReport() {
        if (expenses.length == 0) {
            writeln("\nNo expenses recorded yet.");
            return;
        }

        writeln("\nMonthly Report");
        writeln("--------------");

        // Group expenses by month
        auto now = Clock.currTime();
        auto monthStart = SysTime(Date(now.year, now.month, 1));
        
	auto monthEnd = SysTime(Date(
	    now.month == 12 ? now.year + 1 : now.year,
	    now.month == 12 ? 1 : now.month + 1,
	    1
	)) - dur!"seconds"(1);

        auto monthlyExpenses = expenses.filter!(
            e => e.date >= monthStart && e.date <= monthEnd
        ).array;

        if (monthlyExpenses.length == 0) {
            writeln("No expenses for current month.");
            return;
        }

        // Show expenses by category
        double monthlyTotal = 0;
        foreach (category; categories) {
            auto categoryExpenses = monthlyExpenses.filter!(e => e.category == category).array;
            if (categoryExpenses.length > 0) {
                auto total = categoryExpenses.map!(e => e.amount).sum;
                monthlyTotal += total;
                writefln("%s: %.2f", category, total);
            }
        }

        writefln("\nTotal Monthly Expenses: %.2f", monthlyTotal);
    }

    private void printExpenses(Expense[] expenseList) {
        foreach (expense; expenseList) {
            writefln("%s | %s | %.2f | %s",
                expense.date.toSimpleString(),
                expense.category,
                expense.amount,
                expense.description);
        }
    }

    private void loadExpenses() {
        if (!exists(filename)) {
            return;
        }

        try {
            auto lines = File(filename).byLine();
            foreach (line; lines) {
                try {
                    expenses ~= Expense.fromString(line.idup);
                } catch (Exception e) {
                    writefln("Warning: Skipping invalid expense entry: %s", line);
                }
            }
        } catch (Exception e) {
            writefln("Error loading expenses: %s", e.msg);
        }
    }

    private void saveExpenses() {
        try {
            auto f = File(filename, "w");
            foreach (expense; expenses) {
                f.writeln(expense.toString());
            }
        } catch (Exception e) {
            writefln("Error saving expenses: %s", e.msg);
        }
    }
}

void main() {
    auto tracker = new ExpenseTracker();
    bool running = true;

    while (running) {
        writeln("\nExpense Tracker");
        writeln("--------------");
        writeln("1. Add Expense");
        writeln("2. View All Expenses");
        writeln("3. View by Category");
        writeln("4. Monthly Report");
        writeln("5. Exit");
        write("\nSelect option (1-5): ");

        try {
            auto choice = readln().strip().to!int;
            
            switch (choice) {
                case 1:
                    tracker.addExpense();
                    break;
                case 2:
                    tracker.viewExpenses();
                    break;
                case 3:
                    tracker.viewByCategory();
                    break;
                case 4:
                    tracker.viewMonthlyReport();
                    break;
                case 5:
                    running = false;
                    break;
                default:
                    writeln("Invalid option!");
            }
        } catch (Exception e) {
            writeln("Invalid input! Please try again.");
        }
    }
}