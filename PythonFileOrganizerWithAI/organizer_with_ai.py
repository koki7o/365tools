import os
import shutil
import magic
from pathlib import Path
import logging
from datetime import datetime
import mimetypes
from openai import OpenAI
from collections import defaultdict

class SmartFileOrganizer:
    def __init__(self, source_dir, openai_api_key):
        self.source_dir = Path(source_dir)
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.setup_logging()
        self.file_groups = defaultdict(list)
        
    def setup_logging(self):
        """Set up logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('file_organizer.log'),
                logging.StreamHandler()
            ]
        )

    def get_file_type(self, file_path):
        """Determine the file type using python-magic"""
        try:
            mime = magic.Magic(mime=True)
            file_type = mime.from_file(str(file_path))
            return file_type.split('/')[0]  # Return main type (e.g., 'image' from 'image/jpeg')
        except Exception as e:
            logging.error(f"Error determining file type for {file_path}: {str(e)}")
            return 'unknown'

    def suggest_folder_name(self, file_names, file_type):
        """Use OpenAI API to suggest an appropriate folder name based on file names and type"""
        try:
            # Create a prompt for OpenAI
            prompt = f"""Based on these files of type '{file_type}':
            {', '.join(file_names)}
            
            Suggest a single, specific folder name that best categorizes these files.
            The name should be:
            - Short (1-2 words)
            - Descriptive
            - Use standard characters (no spaces, use underscores)
            - Lowercase
            
            Respond with ONLY the folder name, nothing else."""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a file organization assistant. Respond only with the suggested folder name."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=20
            )
            
            folder_name = response.choices[0].message.content.strip().lower()
            return folder_name
        except Exception as e:
            logging.error(f"Error getting folder suggestion from OpenAI: {str(e)}")
            return file_type + "_files"

    def group_files(self):
        """Group files by their type"""
        files = [f for f in self.source_dir.iterdir() if f.is_file()]
        
        for file_path in files:
            # Skip the log file and hidden files
            if file_path.name == 'file_organizer.log' or file_path.name.startswith('.'):
                continue
                
            file_type = self.get_file_type(file_path)
            self.file_groups[file_type].append(file_path)

    def organize_files(self):
        """Main function to organize files"""
        try:
            # First group all files by type
            self.group_files()
            
            # Process each group
            for file_type, files in self.file_groups.items():
                if not files:  # Skip if no files of this type
                    continue
                    
                # Get file names for the group
                file_names = [f.name for f in files]
                
                # Get suggested folder name from OpenAI
                folder_name = self.suggest_folder_name(file_names, file_type)
                
                # Create folder
                folder_path = self.source_dir / folder_name
                folder_path.mkdir(exist_ok=True)
                logging.info(f"Created/Using directory: {folder_path}")
                
                # Move files
                for file_path in files:
                    try:
                        dest_path = folder_path / file_path.name
                        
                        # Handle duplicate files
                        if dest_path.exists():
                            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                            new_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
                            dest_path = folder_path / new_name
                        
                        shutil.move(str(file_path), str(dest_path))
                        logging.info(f"Moved {file_path.name} to {folder_name}/")
                        
                    except Exception as e:
                        logging.error(f"Error moving {file_path.name}: {str(e)}")
                    
        except Exception as e:
            logging.error(f"Error organizing files: {str(e)}")
            raise

    def get_statistics(self):
        """Generate statistics about organized files"""
        stats = {}
        for folder in self.source_dir.iterdir():
            if folder.is_dir() and not folder.name.startswith('.'):
                files = list(folder.glob('*'))
                stats[folder.name] = len(files)
        return stats

def main():
    # Get directory path and API key from user
    source_dir = input("Enter the directory path to organize: ")
    api_key = input("Enter your OpenAI API key: ")
    
    # Create organizer instance
    organizer = SmartFileOrganizer(source_dir, api_key)
    
    # Organize files
    print("Organizing files...")
    organizer.organize_files()
    
    # Print statistics
    print("\nOrganization complete! Here are the statistics:")
    stats = organizer.get_statistics()
    for category, count in stats.items():
        print(f"{category}: {count} files")

if __name__ == "__main__":
    main()