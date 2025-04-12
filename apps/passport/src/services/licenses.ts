import { http } from "../utils/http";
import type {
  BatchCreateLicenseDto,
  CreateLicenseDto,
  License,
  LicenseDetail,
  CreateActivationDto,
  ValidityCheckDto,
  ValidityResponseDto,
} from "@/types/api";

// Get all licenses
export async function getLicenses(): Promise<License[]> {
  return http.get<License[]>("/licenses");
}

// Get license by ID
export async function getLicenseById(id: string): Promise<LicenseDetail> {
  return http.get<LicenseDetail>(`/licenses/${id}`);
}

// Create a new license
export async function createLicense(
  license: CreateLicenseDto
): Promise<License> {
  return http.post<License>("/licenses", license);
}

// Create multiple licenses in batch
export async function batchCreateLicenses(
  batchDto: BatchCreateLicenseDto
): Promise<License[]> {
  return http.post<License[]>("/licenses/batch", batchDto);
}

// Activate a license
export async function activateLicense(activationDto: CreateActivationDto) {
  return http.post("/activations", activationDto);
}

// Check license validity
export async function checkValidity(
  checkDto: ValidityCheckDto
): Promise<ValidityResponseDto> {
  return http.post<ValidityResponseDto>("/activations/check", checkDto);
}
