import { http } from "../utils/http";
import type {
  Application,
  ApplicationDetail,
  CreateApplicationDto,
} from "@/types/api";

export const applicationsService = {
  // Get all applications
  async getApplications(): Promise<Application[]> {
    return http.get<Application[]>("/applications");
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<ApplicationDetail> {
    return http.get<ApplicationDetail>(`/applications/${id}`);
  },

  // Create a new application
  async createApplication(
    application: CreateApplicationDto
  ): Promise<Application> {
    return http.post<Application>("/applications", application);
  },
};
