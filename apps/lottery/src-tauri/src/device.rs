use sha2::{Digest, Sha256};
use std::process::Command;

pub fn get_mac_addresses() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("wmic")
            .args(["nic", "where", "PhysicalAdapter=TRUE", "get", "MACAddress"])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout)
            .to_string()
            .lines()
            .filter(|line| !line.trim().is_empty() && line.trim() != "MACAddress")
            .collect::<Vec<&str>>()
            .join(",");

        Ok(result)
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("ip")
            .args(["link", "show"])
            .output()
            .map_err(|e| e.to_string())?;

        // This is a simplified version - it would need more parsing
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(result)
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("ifconfig")
            .output()
            .map_err(|e| e.to_string())?;

        // This is a simplified version - it would need more parsing
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(result)
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Err("Unsupported OS".to_string())
    }
}

pub fn get_disk_serials() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("wmic")
            .args(["diskdrive", "get", "SerialNumber"])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout)
            .to_string()
            .lines()
            .filter(|line| !line.trim().is_empty() && line.trim() != "SerialNumber")
            .collect::<Vec<&str>>()
            .join(",");

        Ok(result)
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("lsblk")
            .args(["--nodeps", "--output", "SERIAL"])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(result)
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("diskutil")
            .args(["info", "/dev/disk0"])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(result)
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Err("Unsupported OS".to_string())
    }
}

pub fn create_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}
