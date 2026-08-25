import type { IProject } from "./projects.types";

// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateDeveloperPayload {
  name: string;
  location: string;
  email?: string;
  phone?: string;
  socialMediaLink?: string;
  logo?: File | null;
}

export interface UpdateDeveloperPayload {
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  socialMediaLink?: string;
  logo?: File | null;
}

export interface UpdateDeveloperScriptPayload {
  script: string;
}

export interface JoinDeveloperPayload {
  name: string;
  address: string;
  phoneNumber: string;
  numberOfProjects: number;
  socialmediaLink: string;
  notes?: string;
}

export interface CreateDeveloperAccountPayload {
  developerId: string;
  password: string;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IDeveloper {
  _id: string;
  name: string;
  logo?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  location: string;
  socialMediaLink?: string;
  projects?: string[] | IProject[];
  deletedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type Developer = IDeveloper;

// ==========================================
// 📤 API Responses
// ==========================================

export interface DeveloperActionResponse {
  message: string;
  developer?: IDeveloper;
}
