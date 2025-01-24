#!/usr/bin/env python3
import random
import sys
import subprocess
from datetime import datetime

COMMIT_TYPES = ["feat", "fix", "docs", "style", "refactor", "test", "chore"]
EMOJI_MAP = {
    "feat": "✨",
    "fix": "🐛",
    "docs": "📚",
    "style": "💅",
    "refactor": "♻️",
    "test": "🧪",
    "chore": "🧹"
}

SUBJECTS = [
    "quantum tunneling through legacy code",
    "reticulating splines in the matrix", 
    "upgrading hamster wheel to v2",
    "teaching AI to make coffee",
    "adding more cowbell to the pipeline",
    "replacing all bugs with features",
    "optimizing entropy generation",
    "synchronizing rubber ducks",
    "increasing technical debt interest rate",
    "refactoring spaghetti into lasagna"
]

def generate_commit_message():
    commit_type = random.choice(COMMIT_TYPES)
    subject = random.choice(SUBJECTS)
    emoji = EMOJI_MAP[commit_type]
    return f"{commit_type}{emoji}: {subject}"

def commit_changes():
    try:
        # Check if there are staged changes
        result = subprocess.run(["git", "diff", "--staged", "--quiet"], capture_output=True)
        if result.returncode == 0:
            print("No staged changes found. Stage your changes first with 'git add'")
            sys.exit(1)
        
        message = generate_commit_message()
        subprocess.run(["git", "commit", "-m", message], check=True)
        print(f"\nCommitted with message: {message}")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    commit_changes()