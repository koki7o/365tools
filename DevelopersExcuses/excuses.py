#!/usr/bin/env python3
import random
import sys
import requests
from datetime import datetime

HTTP_EXCUSES = {
    "4xx": [
        "The user must have done something wrong, not my code",
        "It works perfectly on my machine",
        "Must be a client-side issue",
        "The user probably didn't read the documentation",
        "That's clearly a feature, not a bug",
        "The requirements weren't clear enough",
    ],
    "5xx": [
        "Mercury must be in retrograde",
        "The cloud must be full",
        "Quantum fluctuations in the server room",
        "The server is having an existential crisis",
        "Our servers run on renewable energy - must be cloudy",
        "The load balancer is practicing social distancing",
    ]
}

SPECIFIC_EXCUSES = {
    404: [
        "The page was there yesterday, must be playing hide and seek",
        "Have you tried looking under the couch?",
        "The resource probably took a coffee break"
    ],
    500: [
        "The server is meditating, please try later",
        "Coffee machine is broken, server refuses to work",
        "Server hamsters are on strike"
    ],
    403: [
        "The server doesn't like your attitude",
        "Computer says no",
        "You didn't say the magic word"
    ],
    418: [
        "I'm a teapot, what did you expect?",
        "Coffee is not my cup of tea",
        "Brewing not implemented"
    ]
}

def get_status_description(status_code):
    try:
        response = requests.get(f'https://httpstatuses.com/{status_code}')
        if response.status_code == 200:
            # This is a mock parsing, actual implementation would need HTML parsing
            return f"HTTP {status_code}: A real status code that means something went wrong"
    except:
        pass
    return f"HTTP {status_code}"

def generate_excuse(status_code=None):
    if not status_code:
        status_code = random.choice([400, 401, 403, 404, 418, 500, 501, 502, 503, 504])
    
    excuses = []
    
    # Add specific excuses for this status code if they exist
    if status_code in SPECIFIC_EXCUSES:
        excuses.extend(SPECIFIC_EXCUSES[status_code])
    
    # Add general category excuses
    if 400 <= status_code < 500:
        excuses.extend(HTTP_EXCUSES["4xx"])
    elif 500 <= status_code < 600:
        excuses.extend(HTTP_EXCUSES["5xx"])
    
    excuse = random.choice(excuses)
    status_desc = get_status_description(status_code)
    
    return f"{status_desc}\nExcuse: {excuse}"

def main():
    if len(sys.argv) > 1:
        try:
            status_code = int(sys.argv[1])
            if not (400 <= status_code < 600):
                print("Status code must be between 400 and 599")
                sys.exit(1)
        except ValueError:
            print("Please provide a valid HTTP status code")
            sys.exit(1)
    else:
        status_code = None
    
    print("\n" + generate_excuse(status_code))

if __name__ == "__main__":
    main()