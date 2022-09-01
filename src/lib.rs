use ansi_term::Style;
use regex::Regex;
use unicode_segmentation::UnicodeSegmentation;

#[derive(Clone, Debug)]
pub struct FSRXStyler {
    pub fixation: f32,
    pub contrast: bool,
    pub saccade_mode: usize,
    saccade_iter: i32,
    re: Regex,
}

pub enum Intensity {
    L, // low
    M, // medium
    H, // high
}

impl FSRXStyler {
    pub fn new(fixation: Intensity, contrast: bool, saccade_mode: Intensity) -> FSRXStyler {
        let reg = Regex::new(r"[\w\\']+").unwrap();
        let mode = match saccade_mode {
            Intensity::H => 1,
            Intensity::M => 2,
            Intensity::L => 3,
        };
        let fix = match fixation {
            Intensity::H => 0.7,
            Intensity::M => 0.5,
            Intensity::L => 0.3,
        };
        FSRXStyler {
            fixation: fix,
            contrast,
            saccade_mode: mode,
            saccade_iter: -1,
            re: reg,
        }
    }
    pub fn style_line(&mut self, unstyled_line: &str) -> String {
        let mut last_end_idx: usize = 0;
        let mut styled_line = "".to_owned();

        for reg_match in self.re.find_iter(unstyled_line) {
            let start_idx = reg_match.start();
            let end_idx = reg_match.end();
            styled_line.push_str(
                self.style_substr(&unstyled_line[last_end_idx..start_idx], false, false)
                    .as_str(),
            );

            self.saccade_iter += 1;
            // println!("{:?}", &self.saccade_iter);
            let saccade_hit = self.saccade_iter % (self.saccade_mode as i32) == 0;
            styled_line.push_str(
                self.style_substr(&unstyled_line[start_idx..end_idx], true, saccade_hit)
                    .as_str(),
            );
            last_end_idx = end_idx;
        }
        styled_line.push_str(
            self.style_substr(
                &unstyled_line[last_end_idx..unstyled_line.len()],
                false,
                false,
            )
            .as_str(),
        );
        styled_line
    }

    fn style_substr(&self, substr: &str, should_process: bool, saccade_hit: bool) -> String {
        let mid_point = (substr.len() as f32 * self.fixation).ceil() as usize;
        let styled_text = UnicodeSegmentation::graphemes(substr, true)
            .collect::<Vec<&str>>()
            .iter()
            .enumerate()
            .map(|(i, x)| -> String {
                let curr_char = x.to_owned();
                if i < mid_point && saccade_hit && should_process {
                    if self.contrast {
                        format!("{}", Style::new().bold().paint(curr_char))
                    } else {
                        String::from(curr_char)
                    }
                } else {
                    format!("{}", Style::new().dimmed().paint(curr_char))
                }
            })
            .collect::<Vec<String>>()
            .join("");

        styled_text
    }
}
