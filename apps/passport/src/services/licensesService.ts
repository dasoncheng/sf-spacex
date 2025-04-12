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

export const licensesService = {
  // Get all licenses
  async getLicenses(): Promise<License[]> {
    return http.get<License[]>("/licenses");
  },

  // Get license by ID
  async getLicenseById(id: string): Promise<LicenseDetail> {
    return http.get<LicenseDetail>(`/licenses/${id}`);
  },

  // Create a new license
  async createLicense(license: CreateLicenseDto): Promise<License> {
    return http.post<License>("/licenses", license);
  },

  // Create multiple licenses in batch
  async batchCreateLicenses(
    batchDto: BatchCreateLicenseDto
  ): Promise<License[]> {
    return http.post<License[]>("/licenses/batch", batchDto);
  },

  // Activate a license
  async activateLicense(activationDto: CreateActivationDto) {
    return http.post("/activations", activationDto);
  },

  // Check license validity
  async checkValidity(
    checkDto: ValidityCheckDto
  ): Promise<ValidityResponseDto> {
    return http.post<ValidityResponseDto>("/activations/check", checkDto);
  },
};
