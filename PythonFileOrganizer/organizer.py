import os
import shutil
from pathlib import Path
import mimetypes
import logging
from datetime import datetime
from collections import defaultdict

class FileOrganizer:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.setup_logging()
        self.file_types = defaultdict(list)  # Store files by their types
        
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
        """Determine the file type using mimetypes"""
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type:
            # Get the general type (e.g., 'image' from 'image/jpeg')
            main_type = mime_type.split('/')[0]
            return main_type
        return 'misc'  # For unknown types

    def scan_files(self):
        """Scan directory and group files by type"""
        # Initialize mimetypes database
        mimetypes.init()
        
        # Get all files in the source directory
        files = [f for f in self.source_dir.iterdir() if f.is_file()]
        
        for file_path in files:
            # Skip the log file and hidden files
            if file_path.name == 'file_organizer.log' or file_path.name.startswith('.'):
                continue
            
            # Get file type and add to appropriate group
            file_type = self.get_file_type(file_path)
            self.file_types[file_type].append(file_path)
            
        logging.info(f"Found {len(files)} files of {len(self.file_types)} different types")

    def create_type_folders(self):
        """Create folders for each discovered file type"""
        for file_type in self.file_types.keys():
            folder_path = self.source_dir / file_type
            if not folder_path.exists():
                folder_path.mkdir()
                logging.info(f"Created directory: {folder_path}")

    def organize_files(self):
        """Main function to organize files"""
        try:
            # First scan and categorize all files
            self.scan_files()
            
            # Create folders for discovered types
            self.create_type_folders()
            
            # Move files to their respective folders
            for file_type, files in self.file_types.items():
                for file_path in files:
                    try:
                        # Create destination path
                        dest_dir = self.source_dir / file_type
                        dest_path = dest_dir / file_path.name
                        
                        # Handle duplicate files
                        if dest_path.exists():
                            # Add timestamp to filename
                            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                            new_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
                            dest_path = dest_dir / new_name
                        
                        # Move the file
                        shutil.move(str(file_path), str(dest_path))
                        logging.info(f"Moved {file_path.name} to {file_type}/")
                        
                    except Exception as e:
                        logging.error(f"Error processing {file_path.name}: {str(e)}")
                    
        except Exception as e:
            logging.error(f"Error organizing files: {str(e)}")
            raise

    def get_statistics(self):
        """Generate statistics about organized files"""
        stats = {}
        for file_type in self.file_types.keys():
            type_path = self.source_dir / file_type
            if type_path.exists():
                files = list(type_path.glob('*'))
                stats[file_type] = len(files)
        return stats

def main():
    # Get directory path from user
    source_dir = input("Enter the directory path to organize: ")
    
    # Create organizer instance
    organizer = FileOrganizer(source_dir)
    
    # Organize files
    print("Organizing files...")
    organizer.organize_files()
    
    # Print statistics
    print("\nOrganization complete! Here are the statistics:")
    stats = organizer.get_statistics()
    for file_type, count in stats.items():
        print(f"{file_type}: {count} files")

if __name__ == "__main__":
    main()