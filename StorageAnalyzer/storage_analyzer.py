#!/usr/bin/env python3
import os
import time
import json
import asyncio
import argparse
from datetime import datetime
import customtkinter as ctk
from pathlib import Path
import humanize
from typing import Dict, List, Optional
from openai import AsyncOpenAI
import threading
from CTkMessagebox import CTkMessagebox

# Set appearance mode and default color theme
ctk.set_appearance_mode("system")  # Follows system theme
ctk.set_default_color_theme("blue")

class FileAnalyzer:
    def __init__(self):
        self.stats = {
            'total_size': 0,
            'total_files': 0,
            'total_dirs': 0,
            'file_types': {},
            'unused_files': [],  # files not accessed in last 6 months
            'large_files': [],   # files > 100MB
            'newest_file': None,
            'oldest_file': None
        }

    def scan_directory(self, path: str, progress_callback=None) -> Dict:
        """Scan directory and collect statistics"""
        self.stats = {
            'total_size': 0,
            'total_files': 0,
            'total_dirs': 0,
            'file_types': {},
            'unused_files': [],
            'large_files': [],
            'newest_file': None,
            'oldest_file': None
        }

        # First count total files for progress
        total_files = sum([len(files) for _, _, files in os.walk(path)])
        processed_files = 0

        for root, dirs, files in os.walk(path):
            self.stats['total_dirs'] += len(dirs)

            for file in files:
                file_path = os.path.join(root, file)
                try:
                    # Update progress
                    processed_files += 1
                    if progress_callback:
                        progress = (processed_files / total_files) * 100
                        progress_callback(progress)

                    # Get file stats
                    stat = os.stat(file_path)
                    size = stat.st_size
                    modified_time = stat.st_mtime
                    accessed_time = stat.st_atime

                    # Update total size and count
                    self.stats['total_size'] += size
                    self.stats['total_files'] += 1

                    # Track file types
                    ext = os.path.splitext(file)[1].lower() or 'no_extension'
                    self.stats['file_types'][ext] = self.stats['file_types'].get(ext, 0) + 1

                    # Track newest/oldest files
                    if not self.stats['newest_file'] or modified_time > self.stats['newest_file']['time']:
                        self.stats['newest_file'] = {
                            'path': file_path,
                            'time': modified_time
                        }
                    if not self.stats['oldest_file'] or modified_time < self.stats['oldest_file']['time']:
                        self.stats['oldest_file'] = {
                            'path': file_path,
                            'time': modified_time
                        }

                    # Check for unused files (not accessed in 6 months)
                    six_months_ago = time.time() - (180 * 24 * 60 * 60)
                    if accessed_time < six_months_ago:
                        self.stats['unused_files'].append({
                            'path': file_path,
                            'last_accessed': accessed_time,
                            'size': size
                        })

                    # Check for large files (>100MB)
                    if size > 100 * 1024 * 1024:  # 100MB in bytes
                        self.stats['large_files'].append({
                            'path': file_path,
                            'size': size
                        })

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    continue

        return self.stats

    async def analyze_with_ai(self, api_key: str) -> str:
        """Analyze directory statistics using OpenAI"""
        client = AsyncOpenAI(api_key=api_key)

        stats_summary = f"""
        Directory Analysis Summary:
        - Total Size: {humanize.naturalsize(self.stats['total_size'])}
        - Total Files: {self.stats['total_files']}
        - Total Directories: {self.stats['total_dirs']}

        File Types Distribution:
        {json.dumps(self.stats['file_types'], indent=2)}

        Unused Files (>6 months): {len(self.stats['unused_files'])}
        Large Files (>100MB): {len(self.stats['large_files'])}

        Oldest File: {self.stats['oldest_file']['path']}
        ({datetime.fromtimestamp(self.stats['oldest_file']['time']).strftime('%Y-%m-%d')})

        Newest File: {self.stats['newest_file']['path']}
        ({datetime.fromtimestamp(self.stats['newest_file']['time']).strftime('%Y-%m-%d')})
        """

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "user",
                    "content": f"Analyze this directory structure and provide insights:\n{stats_summary}\n\n"
                    "Please provide:\n"
                    "1. Overall structure analysis\n"
                    "2. Storage efficiency recommendations\n"
                    "3. Cleanup opportunities\n"
                    "4. File organization suggestions\n"
                    "5. Potential issues or risks\n"
                    "6. Best practices recommendations"
                }]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error getting AI analysis: {str(e)}"


class ModernFileAnalyzerGUI(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Modern File System Analyzer")
        self.geometry("1000x800")
        
        # Initialize analyzer
        self.analyzer = FileAnalyzer()
        
        # Create the main container with padding
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        self.setup_gui()

    def setup_gui(self):
        # Create main container
        main_container = ctk.CTkFrame(self)
        main_container.grid(row=0, column=0, sticky="nsew", padx=30, pady=30)
        main_container.grid_columnconfigure(0, weight=1)

        # Header
        header_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(20, 30), padx=(20, 30))
        
        header_label = ctk.CTkLabel(
            header_frame, 
            text="File System Analyzer", 
            font=ctk.CTkFont(size=24, weight="bold")
        )
        header_label.grid(row=0, column=0, sticky="w")

        # Select folder button with modern styling
        self.select_button = ctk.CTkButton(
            header_frame,
            text="Select Folder",
            command=self.select_folder,
            font=ctk.CTkFont(size=14)
        )
        self.select_button.grid(row=0, column=1, padx=20)

        # Progress bar
        self.progress_bar = ctk.CTkProgressBar(header_frame)
        self.progress_bar.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(10, 0))
        self.progress_bar.set(0)

        # Create tabview for organizing content
        self.tabview = ctk.CTkTabview(main_container)
        self.tabview.grid(row=1, column=0, sticky="nsew")
        main_container.grid_rowconfigure(1, weight=1)

        # Add tabs
        self.tab_overview = self.tabview.add("Overview")
        self.tab_details = self.tabview.add("File Details")
        self.tab_ai = self.tabview.add("AI Analysis")

        # Setup tab contents
        self.setup_overview_tab()
        self.setup_details_tab()
        self.setup_ai_tab()

    def setup_overview_tab(self):
        # Overview frame
        self.overview_frame = ctk.CTkFrame(self.tab_overview)
        self.overview_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Stats labels with modern styling
        self.total_size_label = ctk.CTkLabel(
            self.overview_frame,
            text="Total Size: -",
            font=ctk.CTkFont(size=16)
        )
        self.total_size_label.pack(anchor="w", pady=10, padx=15)

        self.total_files_label = ctk.CTkLabel(
            self.overview_frame,
            text="Total Files: -",
            font=ctk.CTkFont(size=16)
        )
        self.total_files_label.pack(anchor="w", pady=10, padx=15)

        self.total_dirs_label = ctk.CTkLabel(
            self.overview_frame,
            text="Total Directories: -",
            font=ctk.CTkFont(size=16)
        )
        self.total_dirs_label.pack(anchor="w", pady=10, padx=15)


    def setup_details_tab(self):
        # Details frame with scrollable sections
        self.details_frame = ctk.CTkFrame(self.tab_details)
        self.details_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # File types section
        file_types_label = ctk.CTkLabel(
            self.details_frame,
            text="File Types Distribution:",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        file_types_label.pack(anchor="w", pady=(0, 10), padx=15)

        self.file_types_text = ctk.CTkTextbox(
            self.details_frame,
            height=150,
            font=ctk.CTkFont(size=14)
        )
        self.file_types_text.pack(fill="both", pady=(0, 20), padx=15)

        # Large files section
        large_files_label = ctk.CTkLabel(
            self.details_frame,
            text="Large Files (>100MB):",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        large_files_label.pack(anchor="w", pady=(0, 10), padx=15)

        self.large_files_text = ctk.CTkTextbox(
            self.details_frame,
            height=150,
            font=ctk.CTkFont(size=14)
        )
        self.large_files_text.pack(fill="both", pady=(0, 20), padx=15)

        # Unused files section
        unused_files_label = ctk.CTkLabel(
            self.details_frame,
            text="Unused Files (Not Accessed in 6 Months):",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        unused_files_label.pack(anchor="w", pady=(0, 10), padx=15)

        self.unused_files_text = ctk.CTkTextbox(
            self.details_frame,
            height=150,
            font=ctk.CTkFont(size=14)
        )
        self.unused_files_text.pack(fill="both", pady=(0, 20), padx=15)

        # Timestamps section
        timestamps_label = ctk.CTkLabel(
            self.details_frame,
            text="File Timestamps:",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        timestamps_label.pack(anchor="w", pady=(0, 10), padx=15)

        self.timestamps_text = ctk.CTkTextbox(
            self.details_frame,
            height=100,
            font=ctk.CTkFont(size=14)
        )
        self.timestamps_text.pack(fill="both", pady=(0, 20), padx=15)

    def setup_ai_tab(self):
        # AI Analysis frame
        self.ai_frame = ctk.CTkFrame(self.tab_ai)
        self.ai_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # API Key entry
        api_key_frame = ctk.CTkFrame(self.ai_frame, fg_color="transparent")
        api_key_frame.pack(fill="x", pady=(15, 25))

        self.api_key_entry = ctk.CTkEntry(
            api_key_frame,
            placeholder_text="Enter OpenAI API Key",
            width=300,
            show="*"
        )
        self.api_key_entry.pack(side="left", padx=(10, 10))

        self.analyze_button = ctk.CTkButton(
            api_key_frame,
            text="Get AI Analysis",
            command=self.get_ai_analysis
        )
        self.analyze_button.pack(side="left")

        # AI Results
        self.ai_results_text = ctk.CTkTextbox(
            self.ai_frame,
            wrap="word",
            font=ctk.CTkFont(size=14)
        )
        self.ai_results_text.pack(fill="both", expand=True)

    def select_folder(self):
        folder_path = ctk.filedialog.askdirectory()
        if folder_path:
            self.select_button.configure(state="disabled")
            self.progress_bar.set(0)
            
            # Create a thread for scanning
            scan_thread = threading.Thread(
                target=self.scan_directory_thread,
                args=(folder_path,)
            )
            scan_thread.start()

    def scan_directory_thread(self, folder_path):
        def update_progress(progress):
            self.progress_bar.set(progress / 100)
            
        try:
            stats = self.analyzer.scan_directory(folder_path, update_progress)
            self.after(0, self.update_gui_with_stats, stats)
        finally:
            self.after(0, lambda: self.select_button.configure(state="normal"))


    def update_gui_with_stats(self, stats):
        # Update overview tab
        self.total_size_label.configure(
            text=f"Total Size: {humanize.naturalsize(stats['total_size'])}")
        self.total_files_label.configure(
            text=f"Total Files: {stats['total_files']}")
        self.total_dirs_label.configure(
            text=f"Total Directories: {stats['total_dirs']}")

        # Update file types text
        self.file_types_text.delete("1.0", "end")
        self.file_types_text.insert("1.0", "Distribution by extension:\n\n")
        sorted_types = sorted(stats['file_types'].items(),
                            key=lambda x: x[1],
                            reverse=True)
        for ext, count in sorted_types:
            self.file_types_text.insert(
                "end",
                f"{ext}: {count} files\n"
            )

        # Update large files text
        self.large_files_text.delete("1.0", "end")
        if stats['large_files']:
            sorted_large_files = sorted(stats['large_files'],
                                        key=lambda x: x['size'],
                                        reverse=True)
            for file in sorted_large_files:
                self.large_files_text.insert(
                    "end",
                    f"{os.path.basename(file['path'])}\n"
                    f"Size: {humanize.naturalsize(file['size'])}\n"
                    f"Path: {file['path']}\n\n"
                )
        else:
            self.large_files_text.insert(
                "end", "No files larger than 100MB found.\n")

        # Update unused files text
        self.unused_files_text.delete("1.0", "end")
        if stats['unused_files']:
            sorted_unused = sorted(stats['unused_files'],
                                key=lambda x: x['last_accessed'])
            for file in sorted_unused:
                last_access = datetime.fromtimestamp(file['last_accessed'])
                self.unused_files_text.insert(
                    "end",
                    f"{os.path.basename(file['path'])}\n"
                    f"Last accessed: {last_access.strftime('%Y-%m-%d %H:%M:%S')}\n"
                    f"Size: {humanize.naturalsize(file['size'])}\n"
                    f"Path: {file['path']}\n\n"
                )
        else:
            self.unused_files_text.insert("end", "No unused files found.\n")

        # Update timestamps text
        self.timestamps_text.delete("1.0", "end")
        if stats['newest_file'] and stats['oldest_file']:
            newest_time = datetime.fromtimestamp(stats['newest_file']['time'])
            oldest_time = datetime.fromtimestamp(stats['oldest_file']['time'])

            self.timestamps_text.insert(
                "end",
                f"Newest File:\n"
                f"- {os.path.basename(stats['newest_file']['path'])}\n"
                f"- Modified: {newest_time.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                f"Oldest File:\n"
                f"- {os.path.basename(stats['oldest_file']['path'])}\n"
                f"- Modified: {oldest_time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            )
    async def _get_ai_analysis(self):
        if not self.api_key_entry.get():
            CTkMessagebox(
                title="Error",
                message="Please enter an OpenAI API key",
                icon="warning"
            )
            return

        self.analyze_button.configure(state="disabled")
        self.ai_results_text.delete("1.0", "end")
        self.ai_results_text.insert("1.0", "Getting AI analysis... Please wait.\n")

        try:
            analysis = await self.analyzer.analyze_with_ai(self.api_key_entry.get())
            self.ai_results_text.delete("1.0", "end")
            self.ai_results_text.insert("1.0", analysis)
        except Exception as e:
            self.ai_results_text.delete("1.0", "end")
            self.ai_results_text.insert("1.0", f"Error: {str(e)}")
        finally:
            self.analyze_button.configure(state="normal")

    def get_ai_analysis(self):
        asyncio.run(self._get_ai_analysis())

def main():
    parser = argparse.ArgumentParser(description='Analyze file system structure')
    parser.add_argument('--cli', action='store_true', help='Run in command-line mode')
    parser.add_argument('--path', type=str, help='Path to analyze')
    parser.add_argument('--api-key', type=str, help='OpenAI API key')

    args = parser.parse_args()

    if args.cli:
        if not args.path:
            print("Please provide a path to analyze with --path")
            return

        analyzer = FileAnalyzer()
        stats = analyzer.scan_directory(args.path)

        print(f"\nAnalysis Results:")
        print(f"Total Size: {humanize.naturalsize(stats['total_size'])}")
        print(f"Total Files: {stats['total_files']}")
        print(f"Total Directories: {stats['total_dirs']}")

        print("\nFile Types:")
        for ext, count in stats['file_types'].items():
            print(f"{ext}: {count}")

        if args.api_key:
            print("\nGetting AI analysis...")
            analysis = asyncio.run(analyzer.analyze_with_ai(args.api_key))
            print("\nAI Analysis:")
            print(analysis)
    else:
        app = ModernFileAnalyzerGUI()
        app.mainloop()

if __name__ == "__main__":
    main()