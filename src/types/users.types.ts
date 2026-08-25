// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateUserPayload {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface UpdateUserProfilePayload {
  username?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

export interface UpdateUserPayload {
  username?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  role?: string;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface ISavedProject {
  _id: string;
  title: string;
  projectThumbnailUrl?: string;
  [key: string]: any;
}

export type SavedProject = ISavedProject;

export interface ISavedReel {
  _id: string;
  title: string;
  reelThumbnailUrl?: string;
  [key: string]: any;
}

export type SavedReel = ISavedReel;

export interface IUser {
  _id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  isEmailVerified?: boolean;
  savedProjects?: SavedProject[] | string[];
  savedReels?: SavedReel[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export type User = IUser;

// ==========================================
// 📤 API Responses
// ==========================================

export interface CreateUserResponse {
  message: string;
  user: IUser;
}

export interface GetUsersResponse {
  message: string;
  users: IUser[];
}

export interface GetSavedProjectsResponse {
  message: string;
  savedProjects: ISavedProject[];
}

export interface GetSavedReelsResponse {
  message: string;
  savedReels: ISavedReel[];
}

export interface GetUserProfileResponse {
  message: string;
  id: string;
}

export interface GetUserByIdResponse {
  message: string;
  id: string;
}

export interface UpdateUserResponse {
  message: string;
  user: IUser;
}

export interface DeleteUserResponse {
  message: string;
  user: Partial<IUser>;
}
