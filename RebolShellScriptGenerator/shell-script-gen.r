REBOL [
    Title: "Simple Shell Script Generator"
    File: "shell-script-gen.r"
]

script-content: {#!/bin/bash

# Generated script
# Generated on: %DATE%

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message"
}

# System health check function
check_system_health() {
    log_message "INFO" "Checking system health..."
    
    # Check disk space
    df -h | grep -vE '^tmpfs|^Filesystem' | awk '$5 > "80%" {print "WARNING: Disk usage at " $5 " for " $6}'
    
    # Check memory usage
    if [ $(free | awk '/Mem:/ {print int($3/$2 * 100)}') -gt 90 ]; then
        log_message "WARNING" "Memory usage above 90%"
    fi
    
    # Check system load
    LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1)
    if (( $(echo "$LOAD > 5" | bc -l) )); then
        log_message "WARNING" "High system load: $LOAD"
    fi
}

# Cleanup old logs
cleanup_old_files() {
    log_message "INFO" "Cleaning up old log files..."
    find /var/log -type f -name "*.log" -mtime +%DAYS% -delete
    log_message "INFO" "Cleanup completed"
}

# Service check function
check_service() {
    local service_name="$1"
    if systemctl is-active --quiet "$service_name"; then
        log_message "INFO" "Service $service_name is running"
    else
        log_message "WARNING" "Service $service_name is not running"
        log_message "INFO" "Attempting to restart $service_name..."
        systemctl restart "$service_name"
    fi
}

# Main execution
log_message "INFO" "Starting maintenance tasks"

# Run health check
check_system_health

# Clean up old files
cleanup_old_files

# Check services
%SERVICES%

log_message "INFO" "Maintenance tasks completed"
}

print "Simple Shell Script Generator"
print "-------------------------"
print ""

days: ask "Days to keep log files (default 7): "
if empty? days [days: "7"]

services: ask "Services to monitor (space-separated): "
service-checks: copy ""
if not empty? services [
    foreach service parse services " " [
        append service-checks rejoin ["check_service " {"} service {"} newline]
    ]
]

; Generate the script
output: copy script-content
replace output "%DATE%" now/date
replace output "%DAYS%" days
replace output "%SERVICES%" service-checks

write %generated-script.sh output
print "^/Script generated as 'generated-script.sh'"

call "chmod +x generated-script.sh"

print "^/Options:"
print "1. View generated script"
print "2. Exit"

forever [
    print ""
    choice: ask "Enter choice (1-2): "
    
    switch choice [
        "1" [
            print "^/Generated Script:"
            print "----------------"
            print output
        ]
        "2" [break]
    ]
]