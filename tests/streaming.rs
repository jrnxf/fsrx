use std::{
    io::{BufRead, BufReader, Write},
    process::{Command, Stdio},
    sync::mpsc,
    thread,
    time::Duration,
};

/// Like `tail -f app.log | fsrx`: each stdin line must show up on stdout
/// while stdin is still open.
#[test]
fn stdin_line_appears_on_stdout_before_eof() {
    let mut child = Command::new(env!("CARGO_BIN_EXE_fsrx"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let mut stdin = child.stdin.take().unwrap();
    stdin.write_all(b"hello world\n").unwrap();
    stdin.flush().unwrap();

    let stdout = child.stdout.take().unwrap();
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let mut line = String::new();
        let _ = BufReader::new(stdout).read_line(&mut line);
        let _ = tx.send(line);
    });

    let line = rx.recv_timeout(Duration::from_secs(10));
    drop(stdin);
    child.wait().unwrap();
    let line = line.expect("no output before stdin closed");
    assert!(line.ends_with('\n'), "partial line: {line:?}");
}
