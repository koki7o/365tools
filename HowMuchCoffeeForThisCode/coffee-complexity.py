#!/usr/bin/env python3
import os
import sys
import ast
from openai import OpenAI
from pathlib import Path

OPENAI_API_KEY = "your-key-here"
client = OpenAI(api_key=OPENAI_API_KEY)

def count_complexity_metrics(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
        tree = ast.parse(content)
        
    metrics = {
        'classes': len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]),
        'functions': len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]),
        'loops': len([node for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While))]),
        'conditionals': len([node for node in ast.walk(tree) if isinstance(node, ast.If)]),
        'lines': len(content.splitlines()),
        'imports': len([node for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))])
    }
    return metrics

def analyze_code_complexity(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return

    metrics = count_complexity_metrics(file_path)
    
    prompt = f"""As a humorous code complexity analyzer, analyze these Python code metrics and provide a coffee-based complexity rating. 
    Use wit and developer humor. Consider each metric's impact on code readability and maintenance.
    
    Metrics:
    - Classes: {metrics['classes']}
    - Functions: {metrics['functions']}
    - Loops: {metrics['loops']}
    - Conditionals: {metrics['conditionals']}
    - Total Lines: {metrics['lines']}
    - Imports: {metrics['imports']}
    
    Provide:
    1. Coffee cups rating (☕) from 1-5
    2. A witty explanation why
    3. A humorous recommendation"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        print(f"\nAnalyzing: {Path(file_path).name}")
        print("=" * 50)
        print(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Error getting AI analysis: {e}")
        print("\nFallback analysis:")
        coffee_cups = min(5, max(1, sum([
            metrics['classes'] * 0.5,
            metrics['functions'] * 0.3,
            metrics['loops'] * 0.4,
            metrics['conditionals'] * 0.4
        ])))
        print(f"Complexity Rating: {'☕' * int(coffee_cups)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: coffee-complexity.py <path_to_python_file>")
        sys.exit(1)
        
    analyze_code_complexity(sys.argv[1])