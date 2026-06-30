export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: "pothole" | "streetlight" | "garbage" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "verified" | "assigned" | "in_progress" | "resolved";
  lat: number;
  lng: number;
  address: string;
  imageUrl: string;
  upvotes: number;
  upvotedByUserIds: string[];
  createdAt: string;
  aiAnalysis: string;
  comments: Comment[];
  
  // New Gemini evaluation fields
  priorityScore: number;
  suggestedDepartment: string;
  summary: string;
  recommendedAction: string;
  confidenceScore?: number; // 1-100 score on Gemini AI evaluation confidence

  // New validation fields
  verifiedByUserIds: string[];
  duplicateFlagUserIds: string[];
  resolutionNote?: string; // Admin note describing work done during resolution
  creatorSessionId?: string; // Track which session submitted this issue
}
