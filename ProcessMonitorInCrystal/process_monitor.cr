require "process"
require "option_parser"
require "colorize"

# ProcessInfo class to store process information
class ProcessInfo
  getter pid : Int32
  getter name : String
  getter cpu_usage : Float64
  getter memory_kb : Int64
  getter state : String
  getter user : String
  getter start_time : String

  def initialize(@pid, @name, @cpu_usage, @memory_kb, @state, @user, @start_time)
  end
end

# ProcessMonitor class to handle process monitoring functionality
class ProcessMonitor
  @top_n : Int32
  @interval : Float64
  @sort_by : String
  @processes : Hash(Int32, ProcessInfo)

  def initialize
    @interval = 2.0_f64
    @sort_by = "cpu"
    @processes = {} of Int32 => ProcessInfo
    @top_n = 10_i32
  end

  # Get process information using ps command
  private def get_processes : Hash(Int32, ProcessInfo)
    processes = {} of Int32 => ProcessInfo
    
    # Get process info using ps command
    command = "ps aux --no-headers"
    process = Process.new(command, shell: true, output: :pipe)
    output = process.output.gets_to_end
    process.close
    
    output.each_line do |line|
      fields = line.split(/\s+/)
      next if fields.size < 11

      user = fields[0]
      pid = fields[1].to_i
      cpu = fields[2].to_f
      memory = (fields[5].to_f * 1024).to_i64  # Convert to KB
      state = fields[7]
      start_time = fields[8]
      name = fields[10..-1].join(" ")

      processes[pid] = ProcessInfo.new(
        pid: pid,
        name: name,
        cpu_usage: cpu,
        memory_kb: memory,
        state: state,
        user: user,
        start_time: start_time
      )
    end

    processes
  end

  # Calculate CPU usage between updates
  private def calculate_cpu_usage(old_processes : Hash(Int32, ProcessInfo), new_processes : Hash(Int32, ProcessInfo)) : Hash(Int32, Float64)
    cpu_usage = {} of Int32 => Float64
    
    new_processes.each do |pid, new_info|
      if old_info = old_processes[pid]?
        cpu_usage[pid] = new_info.cpu_usage
      else
        cpu_usage[pid] = 0.0
      end
    end

    cpu_usage
  end

  # Format memory size for display
  private def format_memory(kb : Int64) : String
    if kb < 1024
      "#{kb}K"
    elsif kb < 1024 * 1024
      "#{(kb / 1024.0).round(1)}M"
    else
      "#{(kb / 1024.0 / 1024.0).round(1)}G"
    end
  end

  # Clear screen
  private def clear_screen
    print "\e[2J\e[H"
  end

  # Display header
  private def display_header(total_processes : Int32)
    puts "Process Monitor".colorize(:cyan).bold
    puts "Total Processes: #{total_processes}".colorize(:yellow)
    puts "Sorting by: #{@sort_by}".colorize(:yellow)
    puts "Refresh interval: #{@interval} seconds".colorize(:yellow)
    puts
    puts "PID     CPU%    MEM     STATE   USER     START    NAME".colorize(:green).bold
    puts "-" * 80
  end

  # Display process information
  private def display_process(process : ProcessInfo)
    printf("%-7d %6.1f %7s %7s %-8s %-8s %s\n",
      process.pid,
      process.cpu_usage,
      format_memory(process.memory_kb),
      process.state,
      process.user,
      process.start_time,
      process.name
    )
  end

  # Main monitoring loop
  def monitor
    previous_processes = {} of Int32 => ProcessInfo

    loop do
      begin
        clear_screen
        current_processes = get_processes
        cpu_usage = calculate_cpu_usage(previous_processes, current_processes)

        # Sort processes based on selected criteria
        sorted_processes = case @sort_by
          when "cpu"
            current_processes.values.sort_by { |p| -p.cpu_usage }
          when "memory"
            current_processes.values.sort_by { |p| -p.memory_kb }
          when "pid"
            current_processes.values.sort_by { |p| p.pid }
          else
            current_processes.values.sort_by { |p| -p.cpu_usage }
          end

        display_header(current_processes.size)

        # Display top N processes
        sorted_processes.first(@top_n).each do |process|
          display_process(process)
        end

        previous_processes = current_processes
        sleep @interval

      rescue e : Exception
        puts "Error: #{e.message}".colorize(:red)
        break
      end
    end
  end

  # Set monitor options
  def set_options(interval : Float64? = nil, sort_by : String? = nil, top_n : Int32? = nil)
    @interval = interval.not_nil! if interval
    @sort_by = sort_by.not_nil! if sort_by
    @top_n = top_n.not_nil! if top_n
  end
end

# Parse command line arguments
interval = 2.0_f64
sort_by = "cpu"
top_n = 10_i32

OptionParser.parse do |parser|
  parser.banner = "Usage: process_monitor [arguments]"

  parser.on("-i SECONDS", "--interval=SECONDS", "Update interval in seconds") { |i| interval = i.to_f64 }
  parser.on("-s FIELD", "--sort=FIELD", "Sort by field (cpu, memory, pid)") { |s| sort_by = s }
  parser.on("-n NUMBER", "--number=NUMBER", "Number of processes to show") { |n| top_n = n.to_i32 }
  parser.on("-h", "--help", "Show this help") do
    puts parser
    exit
  end
end

# Create and run monitor
monitor = ProcessMonitor.new
monitor.set_options(interval: interval, sort_by: sort_by, top_n: top_n)
monitor.monitor