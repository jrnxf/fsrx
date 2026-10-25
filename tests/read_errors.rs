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
