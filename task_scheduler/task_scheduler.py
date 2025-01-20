from datetime import datetime, timedelta
import json
from typing import List, Dict
import os
from dataclasses import dataclass, asdict

@dataclass
class Task:
    id: int
    title: str
    description: str
    priority: int
    due_date: str
    status: str = "Pending"
    category: str = "General"
    recurring: bool = False
    recurring_interval: int = 0  # days

class TaskScheduler:
    def __init__(self):
        self.tasks: List[Task] = []
        self.next_id = 1
        self.load_tasks()

    def add_task(self, title: str, description: str, priority: int, 
                 due_date: str, category: str = "General", 
                 recurring: bool = False, interval: int = 0) -> None:
        task = Task(
            id=self.next_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            category=category,
            recurring=recurring,
            recurring_interval=interval
        )
        self.tasks.append(task)
        self.next_id += 1
        self.save_tasks()
        print(f"\nTask added: {title}")

    def complete_task(self, task_id: int) -> None:
        for task in self.tasks:
            if task.id == task_id:
                if task.recurring:
                    # Create new instance of recurring task
                    new_due_date = (datetime.strptime(task.due_date, "%Y-%m-%d") + 
                                  timedelta(days=task.recurring_interval)).strftime("%Y-%m-%d")
                    self.add_task(
                        task.title,
                        task.description,
                        task.priority,
                        new_due_date,
                        task.category,
                        task.recurring,
                        task.recurring_interval
                    )
                task.status = "Completed"
                self.save_tasks()
                print(f"\nTask {task_id} marked as completed")
                return
        print(f"\nTask {task_id} not found")

    def delete_task(self, task_id: int) -> None:
        self.tasks = [task for task in self.tasks if task.id != task_id]
        self.save_tasks()
        print(f"\nTask {task_id} deleted")

    def get_tasks_by_status(self, status: str) -> List[Task]:
        return [task for task in self.tasks if task.status == status]

    def get_tasks_by_priority(self, priority: int) -> List[Task]:
        return [task for task in self.tasks if task.priority == priority]

    def get_tasks_by_category(self, category: str) -> List[Task]:
        return [task for task in self.tasks if task.category == category]

    def get_overdue_tasks(self) -> List[Task]:
        today = datetime.now().date()
        return [
            task for task in self.tasks 
            if task.status == "Pending" and 
            datetime.strptime(task.due_date, "%Y-%m-%d").date() < today
        ]

    def save_tasks(self) -> None:
        with open("tasks.json", "w") as f:
            json.dump([asdict(task) for task in self.tasks], f, indent=2)

    def load_tasks(self) -> None:
        if os.path.exists("tasks.json"):
            with open("tasks.json", "r") as f:
                data = json.load(f)
                self.tasks = [Task(**task_data) for task_data in data]
                if self.tasks:
                    self.next_id = max(task.id for task in self.tasks) + 1

    def display_tasks(self, tasks: List[Task]) -> None:
        if not tasks:
            print("\nNo tasks found")
            return

        for task in tasks:
            print("\n" + "="*50)
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            print(f"Description: {task.description}")
            print(f"Priority: {task.priority}")
            print(f"Due Date: {task.due_date}")
            print(f"Status: {task.status}")
            print(f"Category: {task.category}")
            if task.recurring:
                print(f"Recurring: Every {task.recurring_interval} days")

def main():
    scheduler = TaskScheduler()
    
    while True:
        print("\n" + "="*50)
        print("Task Scheduler Menu")
        print("="*50)
        print("1. Add Task")
        print("2. Complete Task")
        print("3. Delete Task")
        print("4. View All Tasks")
        print("5. View Pending Tasks")
        print("6. View Completed Tasks")
        print("7. View Tasks by Priority")
        print("8. View Tasks by Category")
        print("9. View Overdue Tasks")
        print("0. Exit")

        choice = input("\nEnter your choice: ")

        if choice == "1":
            title = input("Enter task title: ")
            description = input("Enter task description: ")
            priority = int(input("Enter priority (1-5): "))
            due_date = input("Enter due date (YYYY-MM-DD): ")
            category = input("Enter category: ")
            recurring = input("Is this a recurring task? (y/n): ").lower() == 'y'
            interval = 0
            if recurring:
                interval = int(input("Enter interval in days: "))
            scheduler.add_task(title, description, priority, due_date, 
                             category, recurring, interval)

        elif choice == "2":
            task_id = int(input("Enter task ID to complete: "))
            scheduler.complete_task(task_id)

        elif choice == "3":
            task_id = int(input("Enter task ID to delete: "))
            scheduler.delete_task(task_id)

        elif choice == "4":
            print("\nAll Tasks:")
            scheduler.display_tasks(scheduler.tasks)

        elif choice == "5":
            print("\nPending Tasks:")
            scheduler.display_tasks(scheduler.get_tasks_by_status("Pending"))

        elif choice == "6":
            print("\nCompleted Tasks:")
            scheduler.display_tasks(scheduler.get_tasks_by_status("Completed"))

        elif choice == "7":
            priority = int(input("Enter priority level (1-5): "))
            print(f"\nTasks with Priority {priority}:")
            scheduler.display_tasks(scheduler.get_tasks_by_priority(priority))

        elif choice == "8":
            category = input("Enter category: ")
            print(f"\nTasks in Category {category}:")
            scheduler.display_tasks(scheduler.get_tasks_by_category(category))

        elif choice == "9":
            print("\nOverdue Tasks:")
            scheduler.display_tasks(scheduler.get_overdue_tasks())

        elif choice == "0":
            print("\nGoodbye!")
            break

        else:
            print("\nInvalid choice")

if __name__ == "__main__":
    main()