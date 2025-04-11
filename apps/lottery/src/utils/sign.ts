import md5 from "md5";

// Types
interface DeviceInfo {
  appv: string;
  device: string;
  deviceId: string;
  [key: string]: any;
}

// Constants
const ALPHANUMERIC = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const SECRET_KEY_NORMAL = "7PZJImoeAE5Dnjb6pCYu8Ja5Buhb2urL";
const SECRET_KEY_SPECIAL = "8e12130c7d4611eebd1100163e381040";

/**
 * Generates a timestamp for rqtime
 */
export function generateRqtime(): number {
  return Date.parse(String(new Date()));
}

/**
 * Generates a random string for rqrandom
 */
export function generateRqrandom(): string {
  let result = "";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.ceil(35 * Math.random());
    result += ALPHANUMERIC[randomIndex];
  }
  return result;
}

/**
 * Gets box version number from app version string
 */
export function getBoxVersion(appVersion: string = "3.6.0"): number {
  const version = appVersion || "2.9.0";
  const cleanVersion = version.replace(/&.+/, "");
  const versionNums = cleanVersion.replace(/[^0-9]/g, "");
  const boxVersion = versionNums.slice(0, 3);
  return Number(boxVersion);
}

/**
 * Determines if new sign algorithm should be used
 */
export function getNewSign(): boolean {
  const boxVersion = getBoxVersion();
  const deviceType = "ios";

  return (deviceType === "ios" && boxVersion >= 371) || boxVersion >= 382;
}

/**
 * Formats device info for header
 */
export function headerBoxAgent(deviceInfo: DeviceInfo): string {
  const keys = Object.keys(deviceInfo);
  const values = Object.values(deviceInfo);
  let result = "";

  keys.forEach((key, index) => {
    const value = values[index] === undefined ? "" : values[index];
    result += `${key}:${value};`;
  });

  return result;
}

/**
 * Sorts object values recursively
 */
export function sortObjectValues(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectValues);

  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};

  sortedKeys.forEach((key) => {
    result[key] = sortObjectValues(obj[key]);
  });

  return result;
}

/**
 * Prepares object for signing by removing existing sign properties
 */
export function returnResetInfo(boxVersion: number, obj: any): any {
  let data = typeof obj === "string" ? JSON.parse(obj) : { ...obj };

  delete data.rqrandom;
  delete data.rqtime;
  delete data.sign;

  return getNewSign() ? sortObjectValues(data) : data;
}

/**
 * Main function to generate sign parameters for an object
 */
export function toSign(params: any, deviceInfo?: DeviceInfo): any {
  const boxVersion = getBoxVersion(deviceInfo?.appv);
  const cleanParams = returnResetInfo(
    boxVersion,
    JSON.parse(JSON.stringify(params))
  );

  // Sort keys
  const sortedKeys = Object.keys(cleanParams).sort();
  const sortedObj: Record<string, any> = {};

  sortedKeys.forEach((key, index) => {
    sortedObj[sortedKeys[index]] = cleanParams[sortedKeys[index]];
  });

  // Create values array
  const values: any[] = [];
  for (const key in sortedObj) {
    const value = sortedObj[key];
    values.push(value);

    if (sortedObj[key] === undefined || sortedObj[key] === null) {
      sortedObj[key] = "";
    }
  }

  // Add timestamp and random
  sortedObj.rqtime = generateRqtime();
  sortedObj.rqrandom = generateRqrandom();

  // Add values for sign
  if (deviceInfo) {
    values.push(sortedObj.rqtime);
    values.push(sortedObj.rqrandom);
    getNewSign(); // Original code calls this but doesn't use return value
    values.push(SECRET_KEY_SPECIAL);
  } else {
    values.push(SECRET_KEY_NORMAL);
    values.push(sortedObj.rqtime);
    values.push(sortedObj.rqrandom);
  }

  // Create string to sign
  let signString = "";

  values.forEach(function (value) {
    if (typeof value === "object" && value !== null) {
      signString += JSON.stringify(value);
    } else if (value === undefined || value === null) {
      values.push("");
    } else {
      signString += value;
    }
  });

  // Generate sign
  if (deviceInfo) {
    const jsonSignString = JSON.parse(JSON.stringify(signString));
    const finalSignString = `appv=${deviceInfo.appv}&device=${
      deviceInfo.device
    }&deviceId=${deviceInfo.deviceId}&box-agent=${headerBoxAgent(deviceInfo)}&${
      getNewSign() ? jsonSignString : signString
    }`;
    sortedObj.sign = md5(finalSignString);
  } else {
    sortedObj.sign = md5(signString);
  }

  return sortedObj;
}

export default {
  generateRqtime,
  generateRqrandom,
  toSign,
  getBoxVersion,
  getNewSign,
  headerBoxAgent,
  sortObjectValues,
};
