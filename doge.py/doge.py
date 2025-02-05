import random
import sys
import logging
from typing import List, Optional
from datetime import datetime

class DogeLogger:
    DOGE_PREFIXES = ["such", "much", "very", "so", "many", "how"]
    DOGE_SUFFIXES = ["wow", "amaze", "excite"]
    ERROR_WORDS = ["fail", "error", "broke", "crash", "bad"]
    SUCCESS_WORDS = ["win", "good", "nice", "awesome", "great"]
    
    def __init__(self, comic_sans: bool = True, wow_level: int = 3):
        self.comic_sans = comic_sans
        self.wow_level = max(1, min(wow_level, 5))  # 1-5 scale
        self.setup_logger()

    def setup_logger(self):
        self.logger = logging.getLogger('DogeLogger')
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(DogeFormatter())
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

    def _generate_doge_speak(self, message: str, is_error: bool = False) -> str:
        words = message.lower().split()
        prefix = random.choice(self.DOGE_PREFIXES)
        
        if is_error:
            words.extend(random.sample(self.ERROR_WORDS, 1))
        else:
            words.extend(random.sample(self.SUCCESS_WORDS, 1))
            
        # Add extra "wow" based on wow_level
        wows = [random.choice(self.DOGE_SUFFIXES) for _ in range(self.wow_level)]
        
        return f"{prefix} {' '.join(words)}. {'. '.join(wows)}"

    def log(self, message: str, level: str = "info"):
        doge_message = self._generate_doge_speak(message, level == "error")
        if self.comic_sans:
            doge_message = self._apply_comic_sans(doge_message)
        
        if level == "error":
            self.logger.error(doge_message)
        else:
            self.logger.info(doge_message)

    def error(self, message: str):
        self.log(message, "error")

    def success(self, message: str):
        self.log(message, "success")

    @staticmethod
    def _apply_comic_sans(text: str) -> str:
        # This is a simple mock of comic sans using unicode
        # In a real implementation, you might want to use a proper font rendering
        return f"📝 {text}"

class DogeFormatter(logging.Formatter):
    def format(self, record):
        timestamp = datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')
        return f"🐕 {timestamp} | {record.levelname} | {record.getMessage()}"

# Example usage
if __name__ == "__main__":
    doge = DogeLogger(comic_sans=True, wow_level=3)
    
    # Success message
    doge.success("Code deployed successfully")
    # Output: 🐕 2024-02-05 12:34:56 | INFO | 📝 such code deployed successfully great. wow. amaze. excite.
    
    # Error message
    doge.error("Database connection failed")
    # Output: 🐕 2024-02-05 12:34:56 | ERROR | 📝 very database connection failed crash. wow. wow. wow.

# Custom error handler
def doge_exception_handler(exc_type, exc_value, exc_traceback):
    doge = DogeLogger()
    doge.error(f"{exc_type.__name__}: {str(exc_value)}")

# Set as default exception handler
sys.excepthook = doge_exception_handler