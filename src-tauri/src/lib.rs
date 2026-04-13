use keyring::Entry;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_keychain_secret(service: &str, account: &str, secret: &str) -> Result<(), String> {
    let entry = Entry::new(service, account).map_err(|e| e.to_string())?;
    entry.set_password(secret).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_keychain_secret(service: &str, account: &str) -> Result<String, String> {
    let entry = Entry::new(service, account).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_pty::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            set_keychain_secret, 
            get_keychain_secret
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
