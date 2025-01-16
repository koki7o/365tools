const std = @import("std");
const print = std.debug.print;
const Allocator = std.mem.Allocator;

const BYTES_PER_LINE = 16;

const ViewMode = enum {
    hex,
    binary,
    ascii,
    all,
};

const BinaryViewer = struct {
    allocator: Allocator,
    file_path: []const u8,
    mode: ViewMode,
    offset: usize,
    length: ?usize,

    pub fn init(allocator: Allocator, file_path: []const u8, mode: ViewMode, offset: usize, length: ?usize) BinaryViewer {
        return BinaryViewer{
            .allocator = allocator,
            .file_path = file_path,
            .mode = mode,
            .offset = offset,
            .length = length,
        };
    }

    pub fn view(self: *const BinaryViewer) !void {
        // Open file
        const file = try std.fs.cwd().openFile(self.file_path, .{});
        defer file.close();

        // Get file size
        const file_size = try file.getEndPos();
        if (self.offset >= file_size) {
            print("Offset exceeds file size\n", .{});
            return;
        }

        // Calculate how many bytes to read
        const bytes_to_read = if (self.length) |len|
            @min(len, file_size - self.offset)
        else
            file_size - self.offset;

        // Allocate buffer for reading
        const buffer = try self.allocator.alloc(u8, bytes_to_read);
        defer self.allocator.free(buffer);

        // Seek to offset and read
        try file.seekTo(self.offset);
        const bytes_read = try file.readAll(buffer);

        // Display header
        print("\nFile: {s}\n", .{self.file_path});
        print("Size: {} bytes\n", .{file_size});
        print("Viewing {} bytes from offset {}\n\n", .{ bytes_read, self.offset });

        // Display content based on mode
        switch (self.mode) {
            .hex => try self.displayHex(buffer),
            .binary => try self.displayBinary(buffer),
            .ascii => try self.displayAscii(buffer),
            .all => {
                try self.displayHex(buffer);
                print("\n", .{});
                try self.displayBinary(buffer);
                print("\n", .{});
                try self.displayAscii(buffer);
            },
        }
    }

    fn displayHex(self: *const BinaryViewer, buffer: []const u8) !void {
        print("Hex View:\n", .{});
        print("Offset    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII\n", .{});
        print("--------  -----------------------------------------------  ----------------\n", .{});

        var i: usize = 0;
        while (i < buffer.len) {
            // Print offset
            print("{X:0>8}  ", .{i + self.offset});

            // Print hex values
            var j: usize = 0;
            while (j < BYTES_PER_LINE) : (j += 1) {
                if (i + j < buffer.len) {
                    print("{X:0>2} ", .{buffer[i + j]});
                } else {
                    print("   ", .{});
                }
            }

            // Print ASCII representation
            print(" ", .{});
            j = 0;
            while (j < BYTES_PER_LINE) : (j += 1) {
                if (i + j < buffer.len) {
                    const c = buffer[i + j];
                    if (isPrintable(c)) {
                        print("{c}", .{c});
                    } else {
                        print(".", .{});
                    }
                } else {
                    print(" ", .{});
                }
            }
            print("\n", .{});
            i += BYTES_PER_LINE;
        }
    }

    fn displayBinary(self: *const BinaryViewer, buffer: []const u8) !void {
        print("Binary View:\n", .{});
        print("Offset    Binary\n", .{});
        print("--------  ----------------------------------------------------------------\n", .{});

        var i: usize = 0;
        while (i < buffer.len) {
            // Print offset
            print("{X:0>8}  ", .{i + self.offset});

            // Print binary values (8 bytes per line)
            var j: usize = 0;
            while (j < 8 and i + j < buffer.len) : (j += 1) {
                print("{b:0>8} ", .{buffer[i + j]});
            }
            print("\n", .{});
            i += 8;
        }
    }

    fn displayAscii(self: *const BinaryViewer, buffer: []const u8) !void {
        print("ASCII View:\n", .{});
        print("Offset    Text\n", .{});
        print("--------  ----------------------------------------------------------------\n", .{});

        var i: usize = 0;
        while (i < buffer.len) {
            // Print offset
            print("{X:0>8}  ", .{i + self.offset});

            // Print ASCII representation
            var j: usize = 0;
            while (j < 32 and i + j < buffer.len) : (j += 1) {
                const c = buffer[i + j];
                if (isPrintable(c)) {
                    print("{c}", .{c});
                } else {
                    print(".", .{});
                }
            }
            print("\n", .{});
            i += 32;
        }
    }

    fn isPrintable(c: u8) bool {
        return c >= 32 and c <= 126;
    }
};

pub fn main() !void {
    // Get allocator
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Get args
    var args = try std.process.argsWithAllocator(allocator);
    defer args.deinit();

    // Skip program name
    _ = args.skip();

    // Parse arguments
    const file_path = args.next() orelse {
        print("Usage: binary_viewer <file> [options]\n", .{});
        print("Options:\n", .{});
        print("  --mode <hex|binary|ascii|all>  Display mode (default: hex)\n", .{});
        print("  --offset <bytes>               Start offset (default: 0)\n", .{});
        print("  --length <bytes>               Number of bytes to display\n", .{});
        return;
    };

    var mode = ViewMode.hex;
    var offset: usize = 0;
    var length: ?usize = null;

    while (args.next()) |arg| {
        if (std.mem.eql(u8, arg, "--mode")) {
            const mode_str = args.next() orelse {
                print("Missing mode value\n", .{});
                return;
            };
            mode = if (std.mem.eql(u8, mode_str, "hex"))
                ViewMode.hex
            else if (std.mem.eql(u8, mode_str, "binary"))
                ViewMode.binary
            else if (std.mem.eql(u8, mode_str, "ascii"))
                ViewMode.ascii
            else if (std.mem.eql(u8, mode_str, "all"))
                ViewMode.all
            else {
                print("Invalid mode: {s}\n", .{mode_str});
                return;
            };
        } else if (std.mem.eql(u8, arg, "--offset")) {
            const offset_str = args.next() orelse {
                print("Missing offset value\n", .{});
                return;
            };
            offset = try std.fmt.parseInt(usize, offset_str, 0);
        } else if (std.mem.eql(u8, arg, "--length")) {
            const length_str = args.next() orelse {
                print("Missing length value\n", .{});
                return;
            };
            length = try std.fmt.parseInt(usize, length_str, 0);
        }
    }

    // Create viewer and display content
    var viewer = BinaryViewer.init(allocator, file_path, mode, offset, length);
    try viewer.view();
}