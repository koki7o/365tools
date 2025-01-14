using Gtk;
using GLib;

public class AlarmClock : Gtk.Application {
    private ApplicationWindow window;
    private SpinButton hour_spin;
    private SpinButton minute_spin;
    private Switch alarm_switch;
    private Label current_time_label;
    private Label alarm_status_label;
    private bool alarm_active = false;
    private int alarm_hour = 0;
    private int alarm_minute = 0;

    public AlarmClock() {
        Object(application_id: "com.example.alarmclock",
               flags: ApplicationFlags.FLAGS_NONE);
    }

    protected override void activate() {
        window = new ApplicationWindow(this);
        window.title = "Alarm Clock";
        window.set_default_size(300, 200);
        window.window_position = WindowPosition.CENTER;

        // Main container
        var box = new Box(Orientation.VERTICAL, 10);
        box.margin = 20;

        // Current time display
        current_time_label = new Label("");
        current_time_label.get_style_context().add_class("time-label");
        current_time_label.margin = 10;
        box.pack_start(current_time_label, false, false, 0);

        // Alarm time settings
        var time_box = new Box(Orientation.HORIZONTAL, 10);
        
        var hour_label = new Label("Hour:");
        hour_spin = new SpinButton.with_range(0, 23, 1);
        
        var minute_label = new Label("Minute:");
        minute_spin = new SpinButton.with_range(0, 59, 1);

        time_box.pack_start(hour_label, false, false, 0);
        time_box.pack_start(hour_spin, false, false, 0);
        time_box.pack_start(minute_label, false, false, 0);
        time_box.pack_start(minute_spin, false, false, 0);

        box.pack_start(time_box, false, false, 0);

        // Alarm switch
        var switch_box = new Box(Orientation.HORIZONTAL, 10);
        var switch_label = new Label("Alarm:");
        alarm_switch = new Switch();
        alarm_switch.active = false;

        switch_box.pack_start(switch_label, false, false, 0);
        switch_box.pack_start(alarm_switch, false, false, 0);

        box.pack_start(switch_box, false, false, 0);

        // Alarm status
        alarm_status_label = new Label("");
        alarm_status_label.margin = 10;
        box.pack_start(alarm_status_label, false, false, 0);

        window.add(box);

        // Connect signals
        alarm_switch.notify["active"].connect(on_alarm_switch_toggled);
        hour_spin.value_changed.connect(on_time_changed);
        minute_spin.value_changed.connect(on_time_changed);

        // Start the clock update timer
        Timeout.add_seconds(1, update_clock);

        window.destroy.connect(() => {
            quit();
        });

        window.show_all();
    }

    private bool update_clock() {
        var now = new DateTime.now_local();
        current_time_label.label = now.format("%H:%M:%S");

        if (alarm_active) {
            if (now.get_hour() == alarm_hour && now.get_minute() == alarm_minute) {
                trigger_alarm();
            }
        }

        return true;
    }

    private void on_alarm_switch_toggled() {
        alarm_active = alarm_switch.active;
        alarm_hour = (int)hour_spin.value;
        alarm_minute = (int)minute_spin.value;

        if (alarm_active) {
            alarm_status_label.label = @"Alarm set for $(alarm_hour.to_string("%02d")):$(alarm_minute.to_string("%02d"))";
        } else {
            alarm_status_label.label = "Alarm disabled";
        }
    }

    private void on_time_changed() {
        if (alarm_active) {
            alarm_hour = (int)hour_spin.value;
            alarm_minute = (int)minute_spin.value;
            alarm_status_label.label = @"Alarm set for $(alarm_hour.to_string("%02d")):$(alarm_minute.to_string("%02d"))";
        }
    }

    private void trigger_alarm() {
        var dialog = new MessageDialog(window,
                                     DialogFlags.MODAL,
                                     MessageType.INFO,
                                     ButtonsType.OK,
                                     "Wake up! Alarm time!");
        dialog.response.connect(() => {
            dialog.destroy();
            alarm_switch.active = false;
        });
        
        dialog.show();
        
        // Play system alert sound
        try {
            string[] spawn_args = {"paplay", "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga"};
            string[] spawn_env = Environ.get();
            Process.spawn_async(null, spawn_args, spawn_env, SpawnFlags.SEARCH_PATH, null, null);
        } catch (SpawnError e) {
            stderr.printf("Error playing alarm sound: %s\n", e.message);
        }
    }

    public static int main(string[] args) {
        return new AlarmClock().run(args);
    }
}

/*
Build and run instructions:

1. Save this file as alarm_clock.vala
2. Install required packages:
   sudo apt install valac libgtk-3-dev

3. Compile:
   valac --pkg gtk+-3.0 alarm_clock.vala

4. Run:
   ./alarm_clock
*/