use std::{
    fs,
    io::{BufRead, BufReader, Write},
    process::{Command, Stdio},
    thread,
};

const LINE: &str = "the quick brown fox jumps over the lazy dog\n";
const LINES: usize = 20_000;

/// Reads one line of output, then closes the pipe while fsrx is still
/// writing, like `fsrx big.txt | head -1`.
fn assert_quiet_exit_on_closed_pipe(mut cmd: Command, stdin_input: Option<String>) {
    let mut child = cmd
        .stdin(if stdin_input.is_some() {
            Stdio::piped()
        } else {
            Stdio::null()
        })
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    let writer = stdin_input.map(|input| {
        let mut stdin = child.stdin.take().unwrap();
        // fsrx may exit before reading everything, so a failed write is fine
        thread::spawn(move || {
            let _ = stdin.write_all(input.as_bytes());
        })
    });

    let mut first_line = String::new();
    BufReader::new(child.stdout.take().unwrap())
        .read_line(&mut first_line)
        .unwrap();
    assert!(first_line.ends_with('\n'));

    let output = child.wait_with_output().unwrap();
    if let Some(writer) = writer {
        writer.join().unwrap();
    }
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.is_empty(), "unexpected stderr: {stderr}");
    assert!(output.status.success(), "exit status: {}", output.status);
}

#[test]
fn file_input_exits_quietly_when_reader_closes_early() {
    let path = std::path::Path::new(env!("CARGO_TARGET_TMPDIR")).join("broken_pipe_input.txt");
    fs::write(&path, LINE.repeat(LINES)).unwrap();
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_fsrx"));
    cmd.arg(&path);
    assert_quiet_exit_on_closed_pipe(cmd, None);
}

#[test]
fn stdin_input_exits_quietly_when_reader_closes_early() {
    let cmd = Command::new(env!("CARGO_BIN_EXE_fsrx"));
    assert_quiet_exit_on_closed_pipe(cmd, Some(LINE.repeat(LINES)));
}
