mod device;
mod forge;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_device_identifiers() -> Result<String, String> {
    // Get MAC addresses
    let mac_addresses = device::get_mac_addresses().unwrap_or_else(|_| "unknown_mac".to_string());
    println!("mac_addresses: {}", mac_addresses);
    // Get disk serial numbers
    let disk_serials = device::get_disk_serials().unwrap_or_else(|_| "unknown_disk".to_string());
    println!("disk_serials: {}", disk_serials);

    // Combine and hash the identifiers
    let combined = format!("{}:{}", mac_addresses, disk_serials);
    let hash = device::create_hash(&combined);

    Ok(hash)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_device_identifiers,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
