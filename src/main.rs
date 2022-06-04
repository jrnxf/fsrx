use ansi_term::Style;
use atty::Stream;
use clap::{ErrorKind, IntoApp, Parser};
use regex::{Captures, Regex};
use std::{
    borrow::Cow,
    fs::File,
    io::{self, BufRead},
    path::Path,
};
use unicode_segmentation::UnicodeSegmentation;

#[derive(Parser, Debug)]
#[clap(
    author = "Colby Thomas <coloradocolby@gmail.com>",
    version,
    about = "📚(b)ionic (r)eading e(x)change\nflow state bionic reading in the terminal"
)]
struct Cli {
    /// path to file (or supply input via stdin)
    #[clap()]
    path: Option<String>,

    /// high contrast
    #[clap(short, long)]
    contrast: bool,

    /// fixation intensity
    #[clap(short, long, arg_enum, default_value_t = Intensity::M)]
    fixation: Intensity,

    /// saccade intensity
    #[clap(short, long, arg_enum, default_value_t = Intensity::H)]
    saccade: Intensity,
}

#[derive(clap::ArgEnum, Clone, Debug)]
enum Intensity {
    L, // low
    M, // medium
    H, // high
}

fn main() -> io::Result<()> {
    let cli = Cli::parse();
    let re = Regex::new(r"\p{L}+").unwrap();
    let mut saccade_iter = -1;
    let saccade_mode = match &cli.saccade {
        Intensity::H => 1,
        Intensity::M => 2,
        Intensity::L => 3,
    };
    if cli.path.is_some() {
        if let Ok(lines) = read_lines(cli.path.as_ref().unwrap().as_str()) {
            lines.for_each(|line| {
                if let Ok(line) = line {
                    let styled_text = re.replace_all(line.as_str(), |cap: &Captures| {
                        saccade_iter += 1;
                        style_capture(
                            line.as_str(),
                            cap,
                            &cli.fixation,
                            cli.contrast,
                            saccade_iter % saccade_mode == 0,
                        )
                    });
                    println!("{}", styled_text)
                }
            });
        } else {
            Cli::command().error(ErrorKind::Io, "File not found").exit();
        }
    } else if !atty::is(Stream::Stdin) {
        let mut line = String::new();
        while io::stdin().read_line(&mut line)? != 0 {
            let line = std::mem::take(&mut line);
            let styled_line = re.replace_all(line.as_str(), |cap: &Captures| {
                saccade_iter += 1;
                style_capture(
                    line.as_str(),
                    cap,
                    &cli.fixation,
                    cli.contrast,
                    saccade_iter % saccade_mode == 0,
                )
            });
            print!("{}", styled_line)
        }
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

fn style_capture<'a>(
    input: &'a str,
    cap: &Captures,
    fixation: &Intensity,
    contrast: bool,
    saccade_hit: bool,
) -> Cow<'a, str> {
    let range = cap.get(0).unwrap().range();
    let current_word = &input[range];
    let mid_point = (current_word.len() as f32
        * match &fixation {
            Intensity::H => 0.7,
            Intensity::M => 0.5,
            Intensity::L => 0.3,
        })
    .ceil() as usize;

    let styled_text = UnicodeSegmentation::graphemes(current_word, true)
        .collect::<Vec<&str>>()
        .iter()
        .enumerate()
        .map(|(i, x)| -> String {
            let curr_char = x.to_owned();
            if i < mid_point && saccade_hit {
                return if contrast {
                    format!("{}", Style::new().bold().paint(curr_char))
                } else {
                    String::from(curr_char)
                };
            } else {
                return format!("{}", Style::new().dimmed().paint(curr_char));
            }
        })
        .collect::<Vec<String>>()
        .join("");

    Cow::Owned(styled_text)
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
