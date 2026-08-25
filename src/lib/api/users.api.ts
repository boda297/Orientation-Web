import { httpClient } from "../http/httpClient";
import { extractErrorMessage } from "../http/apiError";
import type {
  User,
  CreateUserPayload,
  CreateUserResponse,
  GetUsersResponse,
  GetSavedProjectsResponse,
  GetSavedReelsResponse,
  GetUserProfileResponse,
  GetUserByIdResponse,
  UpdateUserProfilePayload,
  UpdateUserPayload,
  UpdateUserResponse,
  DeleteUserResponse,
} from "../../types/users.types";
export * from "../../types/users.types";

// create user
export async function createUser(
  payload: CreateUserPayload
): Promise<CreateUserResponse> {
  try {
    const response = await httpClient.post<CreateUserResponse>("/users", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to create user"));
  }
}

// get all users
export async function getUsers(): Promise<GetUsersResponse> {
  try {
    const response = await httpClient.get<GetUsersResponse>("/users");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch users"));
  }
}

// get saved projects
export async function getSavedProjects(): Promise<GetSavedProjectsResponse> {
  try {
    const response = await httpClient.get<GetSavedProjectsResponse>("/users/saved-projects");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch saved projects"));
  }
}

// get saved reels
export async function getSavedReels(): Promise<GetSavedReelsResponse> {
  try {
    const response = await httpClient.get<GetSavedReelsResponse>("/users/saved-reels");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch saved reels"));
  }
}

// get my profile
export async function getMyProfile(): Promise<GetUserProfileResponse> {
  try {
    const response = await httpClient.get<GetUserProfileResponse>("/users/profile");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch profile"));
  }
}

// get user 
export async function getUserById(id: string): Promise<GetUserByIdResponse> {
  try {
    const response = await httpClient.get<GetUserByIdResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch user by ID"));
  }
}

// update my profile
export async function updateMyProfile(
  payload: UpdateUserProfilePayload
): Promise<UpdateUserResponse> {
  try {
    const response = await httpClient.patch<UpdateUserResponse>("/users/profile", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to update profile"));
  }
}

// update user
export async function updateUserById(
  id: string,
  payload: UpdateUserPayload
): Promise<UpdateUserResponse> {
  try {
    const response = await httpClient.patch<UpdateUserResponse>(`/users/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to update user"));
  }
}

// delete user 
export async function deleteUserById(id: string): Promise<DeleteUserResponse> {
  try {
    const response = await httpClient.delete<DeleteUserResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to delete user"));
  }
}

/** Grouped users service */
export const usersApi = {
  list: async (): Promise<User[]> => {
    const res = await getUsers();
    return Array.isArray(res) ? res : ((res as any)?.users || (res as any)?.data || []);
  },
  get: async (id: string): Promise<User> => {
    const res = await getUserById(id);
    return (res as any)?.user || (res as any)?.data || (res as any);
  },
  create: createUser,
  update: updateUserById,
  updateProfile: updateMyProfile,
  delete: deleteUserById,
  getProfile: getMyProfile,
  getSavedProjects,
  getSavedReels,
};

