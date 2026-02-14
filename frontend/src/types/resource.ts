export type ResourceType = 'PHYSICAL' | 'DIGITAL';

export type ResourceCategory =
  'OFFICE' | 'MEETING_ROOM' | 'PARKING' | 'EQUIPMENT' |
  'APPLICATION' | 'FILE_SHARE' | 'VPN' | 'DATABASE';

export type RequestStatus =
  'PENDING' | 'APPROVED' | 'DENIED' | 'COLLISION' | 'REVOKED' | 'EXPIRED';

export interface ResourceResponse {
  id: string;
  name: string;
  description: string;
  resourceType: ResourceType;
  resourceCategory: ResourceCategory;
  location?: string;
  capacity?: number;
  active: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  name: string;
  description?: string;
  resourceType: ResourceType;
  resourceCategory: ResourceCategory;
  location?: string;
  capacity?: number;
  requiresApproval?: boolean;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  requiresApproval?: boolean;
  active?: boolean;
}

export interface AccessRequestResponse {
  id: string;
  userId: string;
  userEmail: string;
  resource: ResourceResponse;
  status: RequestStatus;
  accessLevel: string;
  justification: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessRequestRequest {
  resourceId: string;
  accessLevel?: string;
  justification?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

export interface ReviewAccessRequestRequest {
  decision: 'APPROVED' | 'DENIED';
  reviewComment?: string;
}
