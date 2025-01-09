#!/usr/bin/wish

# Configure the main window
wm title . "Digital Clock"
wm resizable . 0 0

# Create and configure the clock label
label .clock -font {Arial 48} -padx 20 -pady 10
pack .clock

# Update function for the clock
proc update_clock {} {
    set time [clock format [clock seconds] -format "%H:%M:%S"]
    .clock configure -text $time
    after 1000 update_clock
}

# Start the clock
update_clock