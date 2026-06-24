export interface NotificationResponse {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  message: string;
  notificationType: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferenceResponse {
  id: string;
  notificationType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

export interface UpdatePreferenceRequest {
  notificationType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}
