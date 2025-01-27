#!/usr/bin/env python3
import sys
from openai import OpenAI
import textwrap

# Replace with your API key
OPENAI_API_KEY = "your-key-here"
client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a sarcastic translator that converts corporate-speak into honest developer language. 
Your translations should be:
1. Humorous and slightly cynical
2. Based on real developer experiences
3. Technical but understandable
4. Include references to programming concepts, tools, or tech culture when relevant

For example:
- "Let's circle back" → "Let's git revert this conversation"
- "We need to be agile" → "Prepare for daily standups that aren't actually daily"
- "It's a critical priority" → "Someone promised this to the client without asking us"
"""

def translate_corporate_speak(text):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Translate this corporate speak to honest developer language: '{text}'"}
            ],
            temperature=0.8,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def print_help():
    help_text = """
    Corporate Speak to Developer Translator
    -------------------------------------
    Usage:
        ./translator.py                     # Interactive mode
        ./translator.py "your text here"    # Translate specific text
        ./translator.py -h                  # Show this help
        
    Pro tip: The more corporate buzzwords you use, the funnier the translation!
    """
    print(textwrap.dedent(help_text))

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print_help()
            return
        
        text = ' '.join(sys.argv[1:])
        print("\nCorporate Speak:", text)
        print("\nDev Translation:", translate_corporate_speak(text))
        return

    print("🤖 Corporate Speak to Developer Translator 🤖")
    print("Enter corporate speak (Ctrl+C to exit):")
    print("-" * 50)
    
    try:
        while True:
            text = input("\n> ")
            if text.strip():
                translation = translate_corporate_speak(text)
                print("\nDev Translation:", translation)
                print("-" * 50)
    except KeyboardInterrupt:
        print("\nExiting... Remember to update your Jira tickets! (Just kidding, we know you won't)")

if __name__ == "__main__":
    main()