use ansi_term::Style;

use atty::Stream;
use clap::{ErrorKind, IntoApp, Parser};
use regex::Regex;
use std::{
    fs::File,
    io::{self, BufRead},
    path::Path,
};
use unicode_segmentation::UnicodeSegmentation;

#[derive(Parser, Debug)]
#[clap(
    author = "Colby Thomas <coloradocolby@gmail.com>",
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
    let re = Regex::new(r"[\w\\']+").unwrap();
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
                    let styled_line = style_line(&line, &re, &cli, &mut saccade_iter, saccade_mode);
                    println!("{}", styled_line);
                }
            });
        } else {
            Cli::command().error(ErrorKind::Io, "File not found").exit();
        }
    } else if !atty::is(Stream::Stdin) {
        let mut line = String::new();
        while io::stdin().read_line(&mut line)? != 0 {
            let line = std::mem::take(&mut line);
            let styled_line = style_line(&line, &re, &cli, &mut saccade_iter, saccade_mode);
            print!("{}", styled_line);
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

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

fn style_line(
    unstyled_line: &str,
    re: &Regex,
    cli: &Cli,
    saccade_iter: &mut i32,
    saccade_mode: usize,
) -> String {
    let mut last_end_idx: usize = 0;
    let mut styled_line = "".to_owned();
    for reg_match in re.find_iter(unstyled_line) {
        let start_idx = reg_match.start();
        let end_idx = reg_match.end();
        styled_line.push_str(
            style_substr(
                &unstyled_line[last_end_idx..start_idx],
                false,
                &cli.fixation,
                cli.contrast,
                *saccade_iter % (saccade_mode as i32) == 0,
            )
            .as_str(),
        );

        *saccade_iter += 1;
        styled_line.push_str(
            style_substr(
                &unstyled_line[start_idx..end_idx],
                true,
                &cli.fixation,
                cli.contrast,
                *saccade_iter % (saccade_mode as i32) == 0,
            )
            .as_str(),
        );
        last_end_idx = end_idx;
    }
    styled_line
}

fn style_substr(
    substr: &str,
    should_process: bool,
    fixation: &Intensity,
    contrast: bool,
    saccade_hit: bool,
) -> String {
    let mid_point = (substr.len() as f32
        * match &fixation {
            Intensity::H => 0.7,
            Intensity::M => 0.5,
            Intensity::L => 0.3,
        })
    .ceil() as usize;

    let styled_text = UnicodeSegmentation::graphemes(substr, true)
        .collect::<Vec<&str>>()
        .iter()
        .enumerate()
        .map(|(i, x)| -> String {
            let curr_char = x.to_owned();
            if i < mid_point && saccade_hit && should_process {
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

    styled_text
}
