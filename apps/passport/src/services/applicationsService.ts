import { api } from "./api";
import type {
  Application,
  ApplicationDetail,
  CreateApplicationDto,
} from "@/types/api";

export const applicationsService = {
  // Get all applications
  async getApplications(): Promise<Application[]> {
    return api.get<Application[]>("/applications");
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<ApplicationDetail> {
    return api.get<ApplicationDetail>(`/applications/${id}`);
  },

  // Create a new application
  async createApplication(
    application: CreateApplicationDto
  ): Promise<Application> {
    return api.post<Application>("/applications", application);
  },
};
