use atty::Stream;
use clap::{ErrorKind, IntoApp, Parser};
use fsrx_lib::*;
use std::{
    fs::File,
    io::{self, BufRead},
    path::Path,
};

#[derive(Parser, Debug)]
#[clap(
    author = "Colby Thomas <thatvegandev@gmail.com>",
    version,
    about = "📚(f)low (s)tate (r)eading e(x)change\nflow state reading in the terminal"
)]
struct Cli {
    /// path to file (or supply input via stdin)
    #[clap()]
    path: Option<String>,

    /// high contrast
    #[clap(short, long)]
    contrast: bool,

    /// fixation intensity
    #[clap(short, long, arg_enum, default_value_t = ClapIntensity::M)]
    fixation: ClapIntensity,

    /// saccade intensity
    #[clap(short, long, arg_enum, default_value_t = ClapIntensity::H)]
    saccade: ClapIntensity,
}

//This very likely minght be done in a better way, however,
// the conversion from high level "L, M, H" intensities to their f32 and usize values belongs in the lib
#[derive(clap::ArgEnum, Clone, Debug)]
enum ClapIntensity {
    L,
    M,
    H,
}
fn main() -> io::Result<()> {
    let cli = Cli::parse();
    let mode = match cli.saccade {
        ClapIntensity::H => Intensity::H,
        ClapIntensity::M => Intensity::M,
        ClapIntensity::L => Intensity::L,
    };
    let fix = match cli.fixation {
        ClapIntensity::H => Intensity::H,
        ClapIntensity::M => Intensity::M,
        ClapIntensity::L => Intensity::L,
    };

    let mut styling: FSRXStyler = FSRXStyler::new(fix, (cli).contrast, mode);
    if cli.path.is_some() {
        if let Ok(lines) = read_lines(cli.path.as_ref().unwrap().as_str()) {
            lines.for_each(|line| {
                if let Ok(line) = line {
                    println!("{}", styling.style_line(&line));
                }
            });
        } else {
            Cli::command().error(ErrorKind::Io, "File not found").exit();
        }
    } else if !atty::is(Stream::Stdin) {
        io::stdin().lock().lines().for_each(|line| {
            if let Ok(line) = line {
                println!("{}", styling.style_line(&line));
            }
        })
    } else {
        Cli::command()
            .error(
                ErrorKind::Io,
                "No input provided. Text must be provided via stdin or the path to a file.",
            )
            .exit();
    }

    Ok(())
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
