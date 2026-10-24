use ansi_term::Style;

use atty::Stream;
use clap::{ErrorKind, IntoApp, Parser};
use std::{
    fs::File,
    io::{self, BufRead},
    path::Path,
};
use unicode_segmentation::UnicodeSegmentation;

#[derive(Parser, Debug)]
#[clap(
    author = "Colby Thomas <colby@jrnxf.co>",
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
                    println!(
                        "{}",
                        style_line(&line, &cli, &mut saccade_iter, saccade_mode)
                    );
                }
            });
        } else {
            Cli::command().error(ErrorKind::Io, "File not found").exit();
        }
    } else if !atty::is(Stream::Stdin) {
        io::stdin().lock().lines().for_each(|line| {
            if let Ok(line) = line {
                println!(
                    "{}",
                    style_line(&line, &cli, &mut saccade_iter, saccade_mode)
                );
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

fn style_line(
    unstyled_line: &str,
    cli: &Cli,
    saccade_iter: &mut i32,
    saccade_mode: usize,
) -> String {
    let mut last_end_idx: usize = 0;
    let mut styled_line = "".to_owned();

    for word_match in unstyled_line.unicode_word_indices() {
        let start_idx = word_match.0;
        let end_idx = start_idx + word_match.1.len();
        styled_line.push_str(
            style_substr(&unstyled_line[last_end_idx..start_idx], cli, false, false).as_str(),
        );

        *saccade_iter += 1;
        let saccade_hit = *saccade_iter % (saccade_mode as i32) == 0;
        styled_line.push_str(
            style_substr(&unstyled_line[start_idx..end_idx], cli, true, saccade_hit).as_str(),
        );
        last_end_idx = end_idx;
    }
    styled_line.push_str(
        style_substr(
            &unstyled_line[last_end_idx..unstyled_line.len()],
            cli,
            false,
            false,
        )
        .as_str(),
    );
    styled_line
}

fn style_substr(substr: &str, cli: &Cli, should_process: bool, saccade_hit: bool) -> String {
    let graphemes = UnicodeSegmentation::graphemes(substr, true).collect::<Vec<&str>>();

    let mid_point = (graphemes.len() as f32
        * match (*cli).fixation {
            Intensity::H => 0.7,
            Intensity::M => 0.5,
            Intensity::L => 0.3,
        })
    .ceil() as usize;

    let styled_text = graphemes
        .iter()
        .enumerate()
        .map(|(i, x)| -> String {
            let curr_char = x.to_owned();
            if i < mid_point && saccade_hit && should_process {
                return if (*cli).contrast {
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

#[cfg(test)]
mod tests {
    use super::*;

    const BOLD: &str = "\x1b[1m";
    const DIM: &str = "\x1b[2m";
    const RESET: &str = "\x1b[0m";

    fn cli(args: &[&str]) -> Cli {
        Cli::parse_from(std::iter::once("fsrx").chain(args.iter().copied()))
    }

    fn style(line: &str, args: &[&str]) -> String {
        let cli = cli(args);
        style_line(line, &cli, &mut -1, 1)
    }

    /// Renders the expected output of a single word: `bold` graphemes in bold,
    /// `dim` graphemes dimmed, one escape pair per grapheme.
    fn expected(bold: &[&str], dim: &[&str]) -> String {
        let bold = bold.iter().map(|g| format!("{BOLD}{g}{RESET}"));
        let dim = dim.iter().map(|g| format!("{DIM}{g}{RESET}"));
        bold.chain(dim).collect()
    }

    #[test]
    fn ascii_word_bolds_first_half() {
        assert_eq!(
            style("hello", &["-c"]),
            expected(&["h", "e", "l"], &["l", "o"])
        );
    }

    #[test]
    fn accented_word_counts_graphemes_not_bytes() {
        assert_eq!(style("ação", &["-c"]), expected(&["a", "ç"], &["ã", "o"]));
    }

    #[test]
    fn cyrillic_word_gets_fixation() {
        assert_eq!(
            style("булок", &["-c"]),
            expected(&["б", "у", "л"], &["о", "к"])
        );
    }

    #[test]
    fn combining_mark_stays_with_its_base() {
        let e_acute = "e\u{301}";
        assert_eq!(
            style("cafe\u{301}", &["-c"]),
            expected(&["c", "a"], &["f", e_acute])
        );
    }

    #[test]
    fn zwj_emoji_sequence_is_not_split() {
        let family = "\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}";
        let styled = style(family, &["-c"]);
        assert_eq!(styled, format!("{DIM}{family}{RESET}"));
    }

    #[test]
    fn non_word_text_is_dimmed_and_kept() {
        assert_eq!(
            style("a, b", &["-c"]),
            [
                expected(&["a"], &[]),
                expected(&[], &[",", " "]),
                expected(&["b"], &[])
            ]
            .concat()
        );
    }
}
