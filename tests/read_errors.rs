use std::process::Command;

#[test]
fn directory_path_fails_instead_of_hanging() {
    let dir = env!("CARGO_TARGET_TMPDIR");
    let output = Command::new(env!("CARGO_BIN_EXE_fsrx"))
        .arg(dir)
        .output()
        .unwrap();
    assert!(!output.status.success(), "exit status: {}", output.status);
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("Is a directory"), "stderr: {stderr}");
}

#[cfg(target_os = "linux")]
#[test]
fn write_failure_prints_plain_message_and_exits_1() {
    let path = std::path::Path::new(env!("CARGO_TARGET_TMPDIR")).join("full_input.txt");
    std::fs::write(&path, "hello world\n").unwrap();
    let output = Command::new(env!("CARGO_BIN_EXE_fsrx"))
        .arg(&path)
        .stdout(
            std::fs::OpenOptions::new()
                .write(true)
                .open("/dev/full")
                .unwrap(),
        )
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(1));
    assert_eq!(
        String::from_utf8_lossy(&output.stderr),
        "fsrx: No space left on device (os error 28)\n"
    );
}
