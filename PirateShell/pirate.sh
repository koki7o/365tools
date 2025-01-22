#!/bin/bash

# Setup named pipe for system messages
PIPE="/tmp/pirate_messages"
mkfifo $PIPE 2>/dev/null

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Sea shanties for long processes
SHANTIES=(
    "♫ What shall we do with a drunken sailor... ♫"
    "♫ Yo ho ho and a bottle of rum! ♫"
    "♫ Soon may the Wellerman come... ♫"
)

# Walking the plank animation
plank_animation() {
    echo -e "\n${RED}"
    echo "  o  [=========]"
    echo "   o [=========]"
    echo "    o[=========]"
    echo "     [o========]"
    echo "     [===o====]"
    echo "     [======o=]"
    echo "     [========]"
    echo "            * "
    echo "Failed deployment walked the plank!"
    echo -e "${NC}\n"
}

# Treasure chest animation
chest_animation() {
    echo -e "\n${GREEN}"
    echo "    /=====\\"
    echo "    |     |"
    echo "    | $$$ |"
    echo "    |     |"
    echo "    \\=====/    "
    echo "Save successful, treasure secured!"
    echo -e "${NC}\n"
}

# Message translation function
translate_to_pirate() {
    local message="$1"
    
    # Basic translations
    message=${message//Starting/Weighing anchor for}
    message=${message//Started/Set sail with}
    message=${message//Stopping/Dropping anchor for}
    message=${message//Stopped/Anchored}
    message=${message//Failed/Lost to the depths:}
    message=${message//failed/walked the plank}
    message=${message//Deactivated successfully/stowed in the hold}
    message=${message//service/vessel}
    message=${message//system/ship}
    message=${message//error/blimey}
    message=${message//warning/yarr}
    message=${message//notice/ahoy}
    message=${message//success/found treasure}
    
    echo "$message"
}

# Main message processing
process_message() {
    local message="$1"
    
    # Check for events first
    if [[ "$message" == *"Failed"* ]] || [[ "$message" == *"failed"* ]] || [[ "$message" == *"ERROR"* ]]; then
        plank_animation
    fi
    
    if [[ "$message" == *"success"* ]] || [[ "$message" == *"Finished"* ]]; then
        chest_animation
    fi
    
    # Add sea shanty for long processes
    if [[ ${#message} -gt 100 ]]; then
        echo -e "${BLUE}${SHANTIES[$RANDOM % ${#SHANTIES[@]}]}${NC}"
    fi
    
    # Translate and output the message
    translated=$(translate_to_pirate "$message")
    echo "$translated"
}

# Cleanup function
cleanup() {
    echo "Abandoning ship... (pirate translation stopped)"
    logger "🏴‍☠️ Pirate message translation terminated"
    rm -f $PIPE
    exit 0
}

# Main script
case "$1" in
    "hook")
        if [ "$EUID" -ne 0 ]; then 
            echo "Please run with sudo to hook into system messages"
            exit 1
        fi
        
        trap cleanup SIGINT SIGTERM
        
        logger "🏴‍☠️ Pirate message translation initialized"
        echo "Pirate translation active! (Ctrl+C to stop)"
        
        tail -f /var/log/syslog | while read line; do
            process_message "$line"
        done
        ;;
    "unhook")
        cleanup
        ;;
    *)
        echo "Usage:"
        echo "  sudo ./pirate.sh hook   - Start intercepting system messages"
        echo "  sudo ./pirate.sh unhook - Stop intercepting system messages"
        ;;
esac