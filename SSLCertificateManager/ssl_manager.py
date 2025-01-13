#!/usr/bin/env python3

import socket
import ssl
import datetime
import json
import os
import argparse
from pathlib import Path
import customtkinter as ctk
from CTkMessagebox import CTkMessagebox
from typing import Dict, List, Optional
import threading
import time
from urllib.parse import urlparse
import requests
from dataclasses import dataclass, asdict
import logging
from datetime import datetime, timedelta
import tkinter as tk
from tkinter import ttk


@dataclass
class Certificate:
    domain: str
    issuer: str
    not_before: datetime
    not_after: datetime
    serial_number: str
    subject: str
    version: int
    added_date: datetime
    last_checked: datetime
    alert_threshold: int  # days before expiration to start alerting
    notes: str = ""


class SSLCertificateManager:
    def __init__(self):
        self.certificates: Dict[str, Certificate] = {}
        self.data_file = Path("certificates.json")
        self.load_certificates()
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='ssl_manager.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def load_certificates(self):
        """Load certificates from JSON file"""
        if self.data_file.exists():
            try:
                data = json.loads(self.data_file.read_text())
                for domain, cert_data in data.items():
                    # Convert string dates to datetime objects
                    cert_data['not_before'] = datetime.fromisoformat(
                        cert_data['not_before'])
                    cert_data['not_after'] = datetime.fromisoformat(
                        cert_data['not_after'])
                    cert_data['added_date'] = datetime.fromisoformat(
                        cert_data['added_date'])
                    cert_data['last_checked'] = datetime.fromisoformat(
                        cert_data['last_checked'])
                    self.certificates[domain] = Certificate(**cert_data)
            except Exception as e:
                logging.error(f"Error loading certificates: {e}")

    def save_certificates(self):
        """Save certificates to JSON file"""
        try:
            data = {domain: asdict(cert)
                                   for domain, cert in self.certificates.items()}
            # Convert datetime objects to ISO format strings
            for cert_data in data.values():
                cert_data['not_before'] = cert_data['not_before'].isoformat()
                cert_data['not_after'] = cert_data['not_after'].isoformat()
                cert_data['added_date'] = cert_data['added_date'].isoformat()
                cert_data['last_checked'] = cert_data['last_checked'].isoformat()

            self.data_file.write_text(json.dumps(data, indent=2))
            logging.info("Certificates saved successfully")
        except Exception as e:
            logging.error(f"Error saving certificates: {e}")

    def get_certificate_info(self, domain: str) -> Optional[Certificate]:
        """Fetch SSL certificate information for a domain"""
        try:
            # Remove protocol if present
            domain = urlparse(domain).netloc or domain

            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()

                    return Certificate(
                        domain=domain,
                        issuer=dict(x[0]
                                    for x in cert['issuer'])['commonName'],
                        not_before=datetime.strptime(
                            cert['notBefore'], '%b %d %H:%M:%S %Y %Z'),
                        not_after=datetime.strptime(
                            cert['notAfter'], '%b %d %H:%M:%S %Y %Z'),
                        serial_number=cert['serialNumber'],
                        subject=dict(x[0]
                                     for x in cert['subject'])['commonName'],
                        version=cert['version'],
                        added_date=datetime.now(),
                        last_checked=datetime.now(),
                        alert_threshold=30  # Default 30 days alert threshold
                    )
        except Exception as e:
            logging.error(f"Error fetching certificate for {domain}: {e}")
            return None

    def add_certificate(self, domain: str, alert_threshold: int = 30) -> bool:
        """Add a new certificate to monitor"""
        try:
            cert = self.get_certificate_info(domain)
            if cert:
                cert.alert_threshold = alert_threshold
                self.certificates[domain] = cert
                self.save_certificates()
                logging.info(f"Added certificate for {domain}")
                return True
            return False
        except Exception as e:
            logging.error(f"Error adding certificate for {domain}: {e}")
            return False

    def remove_certificate(self, domain: str) -> bool:
        """Remove a certificate from monitoring"""
        try:
            if domain in self.certificates:
                del self.certificates[domain]
                self.save_certificates()
                logging.info(f"Removed certificate for {domain}")
                return True
            return False
        except Exception as e:
            logging.error(f"Error removing certificate for {domain}: {e}")
            return False

    def check_expiration(self, domain: str) -> Dict:
        """Check certificate expiration status"""
        cert = self.certificates.get(domain)
        if not cert:
            return {"status": "error", "message": "Certificate not found"}

        now = datetime.now()
        days_until_expiry = (cert.not_after - now).days

        if days_until_expiry <= 0:
            return {
                "status": "expired",
                "days": abs(days_until_expiry),
                "message": f"Certificate expired {abs(days_until_expiry)} days ago"
            }
        elif days_until_expiry <= cert.alert_threshold:
            return {
                "status": "warning",
                "days": days_until_expiry,
                "message": f"Certificate expires in {days_until_expiry} days"
            }
        else:
            return {
                "status": "ok",
                "days": days_until_expiry,
                "message": f"Certificate valid for {days_until_expiry} days"
            }

    def refresh_certificate(self, domain: str) -> bool:
        """Refresh certificate information"""
        try:
            new_cert = self.get_certificate_info(domain)
            if new_cert:
                # Preserve existing alert threshold and notes
                new_cert.alert_threshold = self.certificates[domain].alert_threshold
                new_cert.notes = self.certificates[domain].notes
                self.certificates[domain] = new_cert
                self.save_certificates()
                logging.info(f"Refreshed certificate for {domain}")
                return True
            return False
        except Exception as e:
            logging.error(f"Error refreshing certificate for {domain}: {e}")
            return False


class SSLManagerGUI:
    def __init__(self):
        self.manager = SSLCertificateManager()

        self.root = ctk.CTk()
        self.root.title("SSL Certificate Manager")
        self.root.geometry("1000x600")

        # Set dark theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.setup_gui()
        self.start_monitoring()

    def setup_gui(self):
        # Main container
        main_frame = ctk.CTkFrame(self.root)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Control Panel
        control_frame = ctk.CTkFrame(main_frame)
        control_frame.pack(fill="x", pady=(0, 20))

        # Add Certificate Section (Left side)
        add_frame = ctk.CTkFrame(control_frame)
        add_frame.pack(side="left", padx=10)

        self.domain_entry = ctk.CTkEntry(
            add_frame,
            placeholder_text="Enter domain",
            width=200
        )
        self.domain_entry.pack(side="left", padx=5)

        self.threshold_entry = ctk.CTkEntry(
            add_frame,
            placeholder_text="Alert days",
            width=80
        )
        self.threshold_entry.pack(side="left", padx=5)

        add_btn = ctk.CTkButton(
            add_frame,
            text="Add Certificate",
            command=self.add_certificate
        )
        add_btn.pack(side="left", padx=5)

        # Action Buttons (Right side)
        remove_btn = ctk.CTkButton(
            control_frame,
            text="Remove Certificate",
            fg_color="red",
            hover_color="darkred",
            command=self.remove_selected
        )
        remove_btn.pack(side="right", padx=10)

        refresh_btn = ctk.CTkButton(
            control_frame,
            text="Refresh All",
            command=self.refresh_all
        )
        refresh_btn.pack(side="right", padx=10)

        # Certificate List with Headers
        list_frame = ctk.CTkFrame(main_frame)
        list_frame.pack(fill="both", expand=True)

        # Define and set up columns
        columns = ("Domain", "Issuer", "Expires", "Days Left", "Status")
        self.cert_tree = ttk.Treeview(
            list_frame,
            columns=columns,
            show="headings"
        )

        # Configure columns with better widths
        self.cert_tree.heading("Domain", text="Domain", anchor=tk.W)
        self.cert_tree.heading("Issuer", text="Issuer", anchor=tk.W)
        self.cert_tree.heading("Expires", text="Expires", anchor=tk.W)
        self.cert_tree.heading("Days Left", text="Days Left", anchor=tk.E)
        self.cert_tree.heading("Status", text="Status", anchor=tk.W)

        self.cert_tree.column("Domain", width=200, stretch=True)
        self.cert_tree.column("Issuer", width=200, stretch=True)
        self.cert_tree.column("Expires", width=100, stretch=False)
        self.cert_tree.column("Days Left", width=80, stretch=False)
        self.cert_tree.column("Status", width=200, stretch=True)

        # Add scrollbar
        scrollbar = ttk.Scrollbar(
            list_frame,
            orient="vertical",
            command=self.cert_tree.yview
        )
        self.cert_tree.configure(yscrollcommand=scrollbar.set)

        self.cert_tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Bind events
        self.cert_tree.bind("<Double-1>", self.show_certificate_details)
        self.cert_tree.bind('<<TreeviewSelect>>', self.on_select)

        # Info Panel at the bottom
        info_frame = ctk.CTkFrame(main_frame)
        info_frame.pack(fill="x", pady=(10, 0))

        # Selected certificate info
        self.quick_info = ctk.CTkLabel(
            info_frame,
            text="Select a certificate to see details",
            anchor="w",
            height=40
        )
        self.quick_info.pack(fill="x", padx=10, pady=5)

        # Status bar
        self.status_bar = ctk.CTkLabel(
            info_frame,
            text="Ready",
            anchor="w",
            height=30,
            fg_color=("gray85", "gray25")
        )
        self.status_bar.pack(fill="x", padx=10, pady=(0, 5))

        # Initial update
        self.update_certificate_list()
    
    def on_select(self, event):
        selection = self.cert_tree.selection()
        if selection:
            item = selection[0]
            domain = self.cert_tree.item(item)['values'][0]
            cert = self.manager.certificates[domain]
            expiry_info = self.manager.check_expiration(domain)

            info_text = (f"Selected: {domain} | "
                        f"Issuer: {cert.issuer} | "
                        f"Alert Threshold: {cert.alert_threshold} days | "
                        f"Status: {expiry_info['message']}")
            self.quick_info.configure(text=info_text)
            self.status_bar.configure(text="Double-click for more details")
        else:
            self.quick_info.configure(text="Select a certificate to see details")
            self.status_bar.configure(text="Ready")
            
    def add_certificate(self):
        domain = self.domain_entry.get().strip()
        threshold = self.threshold_entry.get().strip()

        if not domain:
            CTkMessagebox(title="Error", message="Please enter a domain")
            return

        try:
            threshold = int(threshold) if threshold else 30
        except ValueError:
            CTkMessagebox(
                title="Error", message="Alert threshold must be a number")
            return

        if self.manager.add_certificate(domain, threshold):
            self.update_certificate_list()
            self.domain_entry.delete(0, 'end')
            self.threshold_entry.delete(0, 'end')
            CTkMessagebox(title="Success",
                          message=f"Added certificate for {domain}")
        else:
            CTkMessagebox(
                title="Error",
                message=f"Could not fetch certificate for {domain}"
            )
    
    def remove_selected(self):
        selection = self.cert_tree.selection()
        if not selection:
            CTkMessagebox(
                title="Error", message="Please select a certificate to remove")
            return

        item = selection[0]
        domain = self.cert_tree.item(item)['values'][0]

        if CTkMessagebox(
            title="Confirm Removal",
            message=f"Are you sure you want to remove certificate for {domain}?",
            icon="warning",
            option_1="Yes",
            option_2="No"
        ).get() == "Yes":
            self.remove_certificate(domain)

    def update_certificate_list(self):
        # Clear existing items
        for item in self.cert_tree.get_children():
            self.cert_tree.delete(item)

        # Add certificates to list
        for domain, cert in self.manager.certificates.items():
            expiry_info = self.manager.check_expiration(domain)

            # Set row color based on status
            tags = (expiry_info['status'],)

            self.cert_tree.insert(
                "",
                "end",
                values=(
                    domain,
                    cert.issuer,
                    cert.not_after.strftime('%Y-%m-%d'),
                    expiry_info['days'],
                    expiry_info['message']
                ),
                tags=tags
            )

        # Configure tag colors
        self.cert_tree.tag_configure('expired', foreground='red')
        self.cert_tree.tag_configure('warning', foreground='orange')
        self.cert_tree.tag_configure('ok', foreground='green')

    def show_certificate_details(self, event):
        item = self.cert_tree.selection()[0]
        domain = self.cert_tree.item(item)['values'][0]
        cert = self.manager.certificates[domain]

        details_window = ctk.CTkToplevel(self.root)
        details_window.title(f"Certificate Details - {domain}")
        details_window.geometry("600x400")

        frame = ctk.CTkFrame(details_window)
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        details = [
            ("Domain", cert.domain),
            ("Issuer", cert.issuer),
            ("Subject", cert.subject),
            ("Valid From", cert.not_before.strftime('%Y-%m-%d %H:%M:%S')),
            ("Valid Until", cert.not_after.strftime('%Y-%m-%d %H:%M:%S')),
            ("Serial Number", cert.serial_number),
            ("Version", cert.version),
            ("Added Date", cert.added_date.strftime('%Y-%m-%d %H:%M:%S')),
            ("Last Checked", cert.last_checked.strftime('%Y-%m-%d %H:%M:%S')),
            ("Alert Threshold", f"{cert.alert_threshold} days")
        ]

        for label, value in details:
            row = ctk.CTkFrame(frame)
            row.pack(fill="x", pady=2)

            ctk.CTkLabel(row, text=label + ":", width=120).pack(side="left")
            ctk.CTkLabel(row, text=str(value)).pack(side="left", padx=10)

        # Notes section
        notes_frame = ctk.CTkFrame(frame)
        notes_frame.pack(fill="both", expand=True, pady=(20, 0))

        ctk.CTkLabel(notes_frame, text="Notes:").pack(anchor="w")

        notes_text = ctk.CTkTextbox(notes_frame, height=100)
        notes_text.pack(fill="both", expand=True, pady=5)
        notes_text.insert("1.0", cert.notes)

        def save_notes():
            cert.notes = notes_text.get("1.0", "end-1c")
            self.manager.save_certificates()
            CTkMessagebox(title="Success", message="Notes saved")

        ctk.CTkButton(notes_frame, text="Save Notes",
                      command=save_notes).pack()

        # Action buttons
        button_frame = ctk.CTkFrame(frame)
        button_frame.pack(fill="x", pady=(20, 0))

        ctk.CTkButton(
            button_frame,
            text="Refresh",
            command=lambda: self.refresh_certificate(domain)
        ).pack(side="left", padx=5)

        ctk.CTkButton(
            button_frame,
            text="Remove",
            text_color="white",
            fg_color="red",
            hover_color="darkred",
            command=lambda: self.remove_certificate(domain, details_window)
        ).pack(side="right", padx=5)

    def refresh_certificate(self, domain):
        if self.manager.refresh_certificate(domain):
            self.update_certificate_list()
            CTkMessagebox(title="Success",
                          message=f"Refreshed certificate for {domain}")
        else:
            CTkMessagebox(
                title="Error",
                message=f"Could not refresh certificate for {domain}"
            )

    def remove_certificate(self, domain, details_window=None):
        if self.manager.remove_certificate(domain):
            self.update_certificate_list()
            CTkMessagebox(title="Success",
                          message=f"Removed certificate for {domain}")
            if details_window:
                details_window.destroy()
        else:
            CTkMessagebox(
                title="Error",
                message=f"Could not remove certificate for {domain}"
            )

    def refresh_all(self):
        success = 0
        failed = 0

        for domain in list(self.manager.certificates.keys()):
            if self.manager.refresh_certificate(domain):
                success += 1
            else:
                failed += 1

        self.update_certificate_list()
        CTkMessagebox(
            title="Refresh Complete",
            message=f"Successfully refreshed {success} certificates\nFailed to refresh {failed} certificates"
        )

    def start_monitoring(self):
        """Start background monitoring thread"""
        def monitor():
            while True:
                for domain in list(self.manager.certificates.keys()):
                    expiry_info = self.manager.check_expiration(domain)
                    if expiry_info['status'] in ['expired', 'warning']:
                        self.show_notification(domain, expiry_info['message'])
                self.update_certificate_list()
                time.sleep(3600)  # Check every hour

        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()

    def show_notification(self, domain: str, message: str):
        """Show system notification for certificate issues"""
        CTkMessagebox(
            title="Certificate Alert",
            message=f"{domain}: {message}",
            icon="warning"
        )

    def run(self):
        self.root.mainloop()


def main():
    parser = argparse.ArgumentParser(description='SSL Certificate Manager')
    parser.add_argument('--cli', action='store_true',
                        help='Run in command-line mode')
    args = parser.parse_args()

    if args.cli:
        manager = SSLCertificateManager()
        while True:
            print("\nSSL Certificate Manager")
            print("1. Add certificate")
            print("2. List certificates")
            print("3. Check expiration")
            print("4. Remove certificate")
            print("5. Refresh certificate")
            print("6. Exit")

            choice = input("\nEnter your choice (1-6): ")

            if choice == '1':
                domain = input("Enter domain: ")
                threshold = input("Enter alert threshold (days) [30]: ")
                threshold = int(threshold) if threshold else 30
                if manager.add_certificate(domain, threshold):
                    print(f"Added certificate for {domain}")
                else:
                    print(f"Failed to add certificate for {domain}")

            elif choice == '2':
                print("\nCertificates:")
                for domain, cert in manager.certificates.items():
                    expiry_info = manager.check_expiration(domain)
                    print(f"\nDomain: {domain}")
                    print(f"Status: {expiry_info['message']}")
                    print(f"Issuer: {cert.issuer}")
                    print(f"Expires: {cert.not_after.strftime('%Y-%m-%d')}")

            elif choice == '3':
                domain = input("Enter domain: ")
                if domain in manager.certificates:
                    expiry_info = manager.check_expiration(domain)
                    print(f"\nStatus: {expiry_info['message']}")
                else:
                    print("Certificate not found")

            elif choice == '4':
                domain = input("Enter domain: ")
                if manager.remove_certificate(domain):
                    print(f"Removed certificate for {domain}")
                else:
                    print("Certificate not found")

            elif choice == '5':
                domain = input("Enter domain: ")
                if manager.refresh_certificate(domain):
                    print(f"Refreshed certificate for {domain}")
                else:
                    print("Failed to refresh certificate")

            elif choice == '6':
                break

            else:
                print("Invalid choice")
    else:
        app = SSLManagerGUI()
        app.run()


if __name__ == "__main__":
    main()
