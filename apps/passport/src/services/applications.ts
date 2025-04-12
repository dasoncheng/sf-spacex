import { http } from "../utils/http";
import type {
  Application,
  ApplicationDetail,
  CreateApplicationDto,
} from "@/types/api";

// Get all applications
export async function getApplications(): Promise<Application[]> {
  return http.get<Application[]>("/applications");
}

// Get application by ID
export async function getApplicationById(
  id: string
): Promise<ApplicationDetail> {
  return http.get<ApplicationDetail>(`/applications/${id}`);
}

// Create a new application
export async function createApplication(
  application: CreateApplicationDto
): Promise<Application> {
  return http.post<Application>("/applications", application);
}
