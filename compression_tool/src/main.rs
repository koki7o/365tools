use std::fs::File;
use std::io::{self, Read, Write, BufReader, BufWriter};
use std::path::Path;
use flate2::Compression;
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use indicatif::{ProgressBar, ProgressStyle};
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "compress")]
#[command(about = "A file compression tool", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Compress {
        #[arg(short, long)]
        input: String,
        
        #[arg(short, long)]
        output: Option<String>,
        
        #[arg(short, long, default_value_t = 6)]
        level: u32,
    },
    Decompress {
        #[arg(short, long)]
        input: String,
        
        #[arg(short, long)]
        output: Option<String>,
    },
}

struct CompressTool;

impl CompressTool {
    fn compress(input_path: &str, output_path: Option<String>, level: u32) -> io::Result<()> {
        // Validate input file
        let input_path = Path::new(input_path);
        if !input_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "Input file not found"));
        }

        // Determine output path
        let output_path = match output_path {
            Some(path) => path,
            None => format!("{}.gz", input_path.display())
        };

        // Open input file
        let input_file = File::open(input_path)?;
        let file_size = input_file.metadata()?.len();
        let mut reader = BufReader::new(input_file);

        // Create output file
        let output_file = File::create(&output_path)?;
        let mut encoder = GzEncoder::new(BufWriter::new(output_file), Compression::new(level));

        // Set up progress bar
        let pb = ProgressBar::new(file_size);
        pb.set_style(ProgressStyle::default_bar()
            .template("{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})")
            .unwrap()
            .progress_chars("#>-"));

        // Perform compression
        let mut buffer = [0; 8192];
        let mut total_read = 0;

        loop {
            let bytes_read = reader.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            encoder.write_all(&buffer[..bytes_read])?;
            total_read += bytes_read as u64;
            pb.set_position(total_read);
        }

        encoder.finish()?;
        pb.finish_with_message("Compression complete");

        Ok(())
    }

    fn decompress(input_path: &str, output_path: Option<String>) -> io::Result<()> {
        // Validate input file
        let input_path = Path::new(input_path);
        if !input_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "Input file not found"));
        }

        // Determine output path
        let output_path = match output_path {
            Some(path) => path,
            None => {
                let stem = input_path.file_stem().unwrap().to_str().unwrap();
                format!("{}_decompressed{}", stem, 
                    input_path.extension()
                        .and_then(|ext| ext.to_str())
                        .map(|ext| format!(".{}", ext))
                        .unwrap_or_default())
            }
        };

        // Open input file
        let input_file = File::open(input_path)?;
        let file_size = input_file.metadata()?.len();
        let mut decoder = GzDecoder::new(BufReader::new(input_file));

        // Create output file
        let output_file = File::create(&output_path)?;
        let mut writer = BufWriter::new(output_file);

        // Set up progress bar
        let pb = ProgressBar::new(file_size);
        pb.set_style(ProgressStyle::default_bar()
            .template("{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})")
            .unwrap()
            .progress_chars("#>-"));

        // Perform decompression
        let mut buffer = [0; 8192];
        let mut total_read = 0;

        loop {
            let bytes_read = decoder.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            writer.write_all(&buffer[..bytes_read])?;
            total_read += bytes_read as u64;
            pb.set_position(total_read);
        }

        writer.flush()?;
        pb.finish_with_message("Decompression complete");

        Ok(())
    }
}

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Commands::Compress { input, output, level } => {
            println!("Compressing file: {}", input);
            CompressTool::compress(&input, output, level)
        },
        Commands::Decompress { input, output } => {
            println!("Decompressing file: {}", input);
            CompressTool::decompress(&input, output)
        }
    };

    if let Err(e) = result {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}