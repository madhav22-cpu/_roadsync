import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up json parsing with body limits (since photos can be large)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Gemini client with custom HTTP telemetry header
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("[RoadSync] GEMINI_API_KEY is not set. AI analysis will fall back to heuristic defaults. Add GEMINI_API_KEY=your_key to your .env file in the project root.");
}
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Issues Database File Path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "issues.json");

// Seed Issues for realistic initial look
const SEED_ISSUES = [
  {
    id: "seed-1",
    title: "Deep Pothole Near Pari Chowk",
    description: "Huge pothole causing cars to swerve dangerously near the Pari Chowk exit.",
    category: "pothole",
    severity: "high",
    status: "reported",
    lat: 28.4684,
    lng: 77.5135,
    address: "Pari Chowk Crossing, Greater Noida, UP, India",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    upvotes: 34,
    upvotedByUserIds: ["user-alpha", "user-beta"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: "High-danger road hazard detected. Deep crater structure in the asphalt of a high-speed lane. Recommended immediate repair to prevent axle failure in passenger vehicles.",
    priorityScore: 82,
    confidenceScore: 94,
    suggestedDepartment: "Greater Noida Industrial Development Authority (GNIDA)",
    summary: "Significant 4-inch deep asphalt depression in high-speed travel lane near Pari Chowk.",
    recommendedAction: "Deploy immediate public works hot-patch repairs to prevent passenger car axle or tire failure.",
    verifiedByUserIds: ["user-alpha", "user-beta", "user-gamma"],
    duplicateFlagUserIds: [],
    comments: [
      {
        id: "comment-1",
        author: "Marcus Vance",
        text: "Almost lost a tire here yesterday. Be very careful!",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "comment-2",
        author: "Sarah Jenkins",
        text: "Reported this manually too. Glad to see it is logged here.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "seed-2",
    title: "Entire Block Streetlights Blackout",
    description: "The streetlights on this entire block of Knowledge Park III have been out for 3 days. Very dark and unsafe at night.",
    category: "streetlight",
    severity: "critical",
    status: "in_progress",
    lat: 28.4601,
    lng: 77.4916,
    address: "Knowledge Park Road, Knowledge Park III, Greater Noida, UP, India",
    imageUrl: "https://images.unsplash.com/photo-1509803874385-db7c23652552?auto=format&fit=crop&q=80&w=600",
    upvotes: 56,
    upvotedByUserIds: ["user-gamma"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: "Urgent safety alert: Multi-fixture failure. High pedestrian/vehicle traffic area is completely unlit, elevating crime and collision risk. Recommended dispatcher dispatch within 4 hours.",
    priorityScore: 94,
    confidenceScore: 98,
    suggestedDepartment: "GNIDA Electrical Department",
    summary: "Complete electrical dark zone covering four blocks of student residential/institutional lines.",
    recommendedAction: "Assign duty electricians to evaluate substation fuses and replace damaged wiring grids.",
    verifiedByUserIds: ["user-gamma"],
    duplicateFlagUserIds: [],
    comments: [
      {
        id: "comment-3",
        author: "David K.",
        text: "City services truck is on-site today tracing a blown transformer.",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "seed-3",
    title: "Illegal Construction Waste Disposal",
    description: "Illegal dumping of a large pile of bricks and cement bags blocking the sidewalk near Sector Alpha I.",
    category: "garbage",
    severity: "medium",
    status: "resolved",
    lat: 28.4842,
    lng: 77.5094,
    address: "Sector Road, Sector Alpha I, Greater Noida, UP, India",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    upvotes: 12,
    upvotedByUserIds: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: "Visual check: Solid waste obstruction. Sidewalk width reduced below ADA-compliance. No hazardous bio-waste visible but rapid cleanup recommended to prevent neighborhood escalation.",
    priorityScore: 48,
    confidenceScore: 87,
    suggestedDepartment: "GNIDA Sanitation & Waste Management",
    summary: "Large discarded wooden assembly and commercial mattresses blocking accessible sidewalks.",
    recommendedAction: "Dispatch sanitation flatbed collectors during scheduled district recycling pickups.",
    verifiedByUserIds: [],
    duplicateFlagUserIds: [],
    comments: [
      {
        id: "comment-4",
        author: "Elena R.",
        text: "City picked it up! Sidewalk is clear again.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1005).toISOString()
      }
    ]
  }
];

// Helper to load issues from disk
function loadIssues(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_ISSUES, null, 2), "utf-8");
      return SEED_ISSUES;
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    let loaded = JSON.parse(data);
    
    // Auto-migrate keys for hackathon schemas
    let migrated = false;
    loaded = loaded.map((issue: any) => {
      let changed = false;
      if (issue.status === "open") {
        issue.status = "reported";
        changed = true;
      } else if (issue.status === "fixed") {
        issue.status = "resolved";
        changed = true;
      }
      
      const priorityMapping: Record<string, number> = {
        critical: 90,
        high: 75,
        medium: 50,
        low: 25
      };

      if (issue.priorityScore === undefined) {
        issue.priorityScore = priorityMapping[issue.severity as string] || 50;
        changed = true;
      }
      if (issue.confidenceScore === undefined) {
        issue.confidenceScore = 85 + Math.floor(Math.random() * 15);
        changed = true;
      }
      if (issue.suggestedDepartment === undefined) {
        issue.suggestedDepartment = "Department of Public Works";
        changed = true;
      }
      if (issue.summary === undefined) {
        issue.summary = issue.description || "Reported public impediment.";
        changed = true;
      }
      if (issue.recommendedAction === undefined) {
        issue.recommendedAction = "Inspect hazard zone and proceed with routine municipal dispatch.";
        changed = true;
      }
      if (issue.verifiedByUserIds === undefined) {
        issue.verifiedByUserIds = issue.upvotedByUserIds || [];
        changed = true;
      }
      if (issue.duplicateFlagUserIds === undefined) {
        issue.duplicateFlagUserIds = [];
        changed = true;
      }
      if (changed) migrated = true;
      return issue;
    });

    if (migrated) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(loaded, null, 2), "utf-8");
    }
    return loaded;
  } catch (err) {
    console.error("Error loading issues, falling back to seed", err);
    return SEED_ISSUES;
  }
}

// Helper to save issues to disk
function saveIssues(issues: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving issues to disk", err);
  }
}

// Ensure database file is initialized
let activeIssues = loadIssues();

// API Endpoints
// 1. GET all issues
app.get("/api/issues", (req, res) => {
  res.json({ success: true, issues: activeIssues });
});

// 1.5. POST analyze issue details (for step-by-step preview)
app.post("/api/analyze", async (req, res) => {
  try {
    const { description, category, severity, base64Image } = req.body;

    let detectedCategory = category || "other";
    let detectedSeverity = severity || "medium";
    let autoTitle = "Reported Issue";
    let aiExplanation = "Categorized based on details provided.";
    let priorityScore = 45;
    let confidenceScore = 88;
    let suggestedDepartment = "Department of Public Works";
    let summary = description || "Road & civic anomaly reported by citizen.";
    let recommendedAction = "Dispatch district supervisor for active hazard inspection.";

    // Apply heuristic defaults first
    const cleanCat = detectedCategory.trim().toLowerCase();
    if (cleanCat === "pothole") {
      suggestedDepartment = "Department of Transportation (Maintenance Division)";
    } else if (cleanCat === "streetlight") {
      suggestedDepartment = "Bureau of Street Lighting & Power";
    } else if (cleanCat === "garbage") {
      suggestedDepartment = "Public Works Operations & Sanitation";
    }

    const cleanSev = detectedSeverity.trim().toLowerCase();
    if (cleanSev === "critical") priorityScore = 95;
    else if (cleanSev === "high") priorityScore = 78;
    else if (cleanSev === "medium") priorityScore = 50;
    else priorityScore = 25;

    // Run Gemini model if key and image/description is present
    if (base64Image && apiKey) {
      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

        const systemInstruction = `You are a high-accuracy government AI trained to process citizens' photo reports of infrastructure/civic issues.
Classify the issue based on the uploaded photo and description.
Choose the closest category: 'pothole', 'streetlight', 'garbage', or 'other'.
Choose the severity level: 'low', 'medium', 'high', or 'critical'.
Generate a concise title for the report (max 5-6 words).
Provide a priority score from 1 to 100 based on public risk and hazard levels.
Provide an AI confidence score from 1 to 100 on the visual inspection accuracy.
Identify the appropriate city department to handle the repair.
Provide a 1-sentence public-facing summary.
Provide a professional action recommendation.
Provide a professional paragraph of visual engineering assessment details for the analysis property.`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: `Please analyze this civic report photo and describe it with the following supplementary details:
User Description: "${description || "None provided"}"
Categorize and analyze the image accurately.`,
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                priorityScore: { type: Type.INTEGER },
                confidenceScore: { type: Type.INTEGER },
                suggestedDepartment: { type: Type.STRING },
                summary: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                analysis: { type: Type.STRING },
              },
              required: ["category", "severity", "title", "priorityScore", "confidenceScore", "suggestedDepartment", "summary", "recommendedAction", "analysis"],
            },
          },
        });

        const geminiText = geminiResponse.text;
        if (geminiText) {
          const parsed = JSON.parse(geminiText.trim());
          detectedCategory = parsed.category?.toLowerCase() || detectedCategory;
          detectedSeverity = parsed.severity?.toLowerCase() || detectedSeverity;
          autoTitle = parsed.title || autoTitle;
          priorityScore = Number(parsed.priorityScore) || priorityScore;
          confidenceScore = Number(parsed.confidenceScore) || confidenceScore;
          suggestedDepartment = parsed.suggestedDepartment || suggestedDepartment;
          summary = parsed.summary || summary;
          recommendedAction = parsed.recommendedAction || recommendedAction;
          aiExplanation = parsed.analysis || "Photo analyzed successfully.";
        }
      } catch (geminiError: any) {
        console.error("Gemini Vision processing failed in /api/analyze", geminiError);
        aiExplanation = `Offline/Assessed locally: ${geminiError?.message || geminiError}`;
      }
    } else if (description && apiKey) {
      try {
        const textResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Analyze this civic report text and structure it as JSON. Make sure to provide an AI confidence score between 1 and 100.
Description: "${description}"`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                priorityScore: { type: Type.INTEGER },
                confidenceScore: { type: Type.INTEGER },
                suggestedDepartment: { type: Type.STRING },
                summary: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["category", "severity", "title", "priorityScore", "confidenceScore", "suggestedDepartment", "summary", "recommendedAction", "analysis"]
            }
          }
        });
        const resultText = textResponse.text;
        if (resultText) {
          const parsed = JSON.parse(resultText.trim());
          detectedCategory = parsed.category || "other";
          detectedSeverity = parsed.severity || "medium";
          autoTitle = parsed.title || description.slice(0, 30);
          priorityScore = Number(parsed.priorityScore) || priorityScore;
          confidenceScore = Number(parsed.confidenceScore) || confidenceScore;
          suggestedDepartment = parsed.suggestedDepartment || suggestedDepartment;
          summary = parsed.summary || summary;
          recommendedAction = parsed.recommendedAction || recommendedAction;
          aiExplanation = parsed.analysis || "Processed using Gemini semantic analysis.";
        }
      } catch (err) {
        console.error("Gemini text analysis failed in /api/analyze", err);
      }
    }

    res.json({
      success: true,
      analysis: {
        category: detectedCategory,
        severity: detectedSeverity,
        title: autoTitle,
        priorityScore,
        confidenceScore,
        suggestedDepartment,
        summary,
        recommendedAction,
        aiAnalysis: aiExplanation
      }
    });
  } catch (error: any) {
    console.error("Error in /api/analyze", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST report of community problem
app.post("/api/issues", async (req, res) => {
  try {
    const { title, description, category, severity, lat, lng, address, base64Image, creatorSessionId } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: "GPS Location (latitude & longitude) is required." });
    }

    let detectedCategory = category || "other";
    let detectedSeverity = severity || "medium";
    let autoTitle = title || "Reported Issue";
    let aiExplanation = req.body.aiAnalysis || "Categorized based on user input details.";
    let priorityScore = req.body.priorityScore !== undefined ? Number(req.body.priorityScore) : 45;
    let confidenceScore = req.body.confidenceScore !== undefined ? Number(req.body.confidenceScore) : 88; // Default confidence
    let suggestedDepartment = req.body.suggestedDepartment || "Department of Public Works";
    let summary = req.body.summary || description || "Road & civic anomaly reported by citizen.";
    let recommendedAction = req.body.recommendedAction || "Dispatch district supervisor for active hazard inspection.";

    const hasPreAnalyzed = req.body.priorityScore !== undefined;

    // Apply heuristic defaults first if not pre-analyzed
    if (!hasPreAnalyzed) {
      const cleanCat = detectedCategory.trim().toLowerCase();
      if (cleanCat === "pothole") {
        suggestedDepartment = "Department of Transportation (Maintenance Division)";
      } else if (cleanCat === "streetlight") {
        suggestedDepartment = "Bureau of Street Lighting & Power";
      } else if (cleanCat === "garbage") {
        suggestedDepartment = "Public Works Operations & Sanitation";
      }

      const cleanSev = detectedSeverity.trim().toLowerCase();
      if (cleanSev === "critical") priorityScore = 95;
      else if (cleanSev === "high") priorityScore = 78;
      else if (cleanSev === "medium") priorityScore = 50;
      else priorityScore = 25;
    }

    // If we have an image AND a Gemini API Key is available AND not pre-analyzed
    if (!hasPreAnalyzed && base64Image && apiKey) {
      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

        const systemInstruction = `You are a high-accuracy government AI trained to process citizens' photo reports of infrastructure/civic issues.
Classify the issue based on the uploaded photo and description.
Choose the closest category: 'pothole', 'streetlight', 'garbage', or 'other'.
Choose the severity level: 'low', 'medium', 'high', or 'critical'.
Generate a concise title for the report (max 5-6 words).
Provide a priority score from 1 to 100 based on public risk and hazard levels.
Provide an AI confidence score from 1 to 100 on the visual inspection accuracy.
Identify the appropriate city department to handle the repair.
Provide a 1-sentence public-facing summary.
Provide a professional action recommendation.
Provide a professional paragraph of visual engineering assessment details for the analysis property.`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: `Please analyze this civic report photo and describe it with the following supplementary details:
User Description: "${description || "None provided"}"
Categorize and analyze the image accurately.`,
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: "One of: pothole, streetlight, garbage, other",
                },
                severity: {
                  type: Type.STRING,
                  description: "One of: low, medium, high, critical",
                },
                title: {
                  type: Type.STRING,
                  description: "Clean literal title describing the exact visual issue",
                },
                priorityScore: {
                  type: Type.INTEGER,
                  description: "Integer score from 1 to 100 on public danger and repair urgency",
                },
                confidenceScore: {
                  type: Type.INTEGER,
                  description: "Integer score from 1 to 100 on visual analysis accuracy confidence",
                },
                suggestedDepartment: {
                  type: Type.STRING,
                  description: "E.g., Department of Transportation, Bureau of Street Lighting, Bureau of Sanitation",
                },
                summary: {
                  type: Type.STRING,
                  description: "Short 1-sentence summary",
                },
                recommendedAction: {
                  type: Type.STRING,
                  description: "Recommended dispatcher field remedy",
                },
                analysis: {
                  type: Type.STRING,
                  description: "Brief professional visual assessment details",
                },
              },
              required: ["category", "severity", "title", "priorityScore", "confidenceScore", "suggestedDepartment", "summary", "recommendedAction", "analysis"],
            },
          },
        });

        const geminiText = geminiResponse.text;
        if (geminiText) {
          try {
            const parsed = JSON.parse(geminiText.trim());
            detectedCategory = parsed.category?.toLowerCase() || detectedCategory;
            detectedCategory = detectedCategory.trim();
            if (!["pothole", "streetlight", "garbage", "other"].includes(detectedCategory)) {
              detectedCategory = "other";
            }
            detectedSeverity = parsed.severity?.toLowerCase() || detectedSeverity;
            if (!["low", "medium", "high", "critical"].includes(detectedSeverity)) {
              detectedSeverity = "medium";
            }
            autoTitle = parsed.title || autoTitle;
            priorityScore = Number(parsed.priorityScore) || priorityScore;
            confidenceScore = Number(parsed.confidenceScore) || confidenceScore;
            suggestedDepartment = parsed.suggestedDepartment || suggestedDepartment;
            summary = parsed.summary || summary;
            recommendedAction = parsed.recommendedAction || recommendedAction;
            aiExplanation = parsed.analysis || "Photo analyzed successfully.";
          } catch (e) {
            console.error("Failed to parse Gemini JSON output", geminiText, e);
          }
        }
      } catch (geminiError: any) {
        console.error("Gemini Vision processing failed", geminiError);
        aiExplanation = `Offline/Assessed locally. Error contacting Gemini Vision: ${geminiError?.message || geminiError}`;
      }
    } else if (description && apiKey) {
      // Analyze text descriptions using Gemini if no image is attached
      try {
        const textResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Analyze this civic report text and structure it as JSON. Make sure to provide an AI confidence score between 1 and 100 on the categorization and department matching.
Description: "${description}"`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "pothole, streetlight, garbage, or other" },
                severity: { type: Type.STRING, description: "low, medium, high, critical" },
                title: { type: Type.STRING },
                priorityScore: { type: Type.INTEGER, description: "Urgency score 1-100" },
                confidenceScore: { type: Type.INTEGER, description: "Confidence score 1-100" },
                suggestedDepartment: { type: Type.STRING },
                summary: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["category", "severity", "title", "priorityScore", "confidenceScore", "suggestedDepartment", "summary", "recommendedAction", "analysis"]
            }
          }
        });
        const resultText = textResponse.text;
        if (resultText) {
          const parsed = JSON.parse(resultText.trim());
          detectedCategory = parsed.category || "other";
          detectedSeverity = parsed.severity || "medium";
          autoTitle = parsed.title || description.slice(0, 30);
          priorityScore = Number(parsed.priorityScore) || priorityScore;
          confidenceScore = Number(parsed.confidenceScore) || confidenceScore;
          suggestedDepartment = parsed.suggestedDepartment || suggestedDepartment;
          summary = parsed.summary || summary;
          recommendedAction = parsed.recommendedAction || recommendedAction;
          aiExplanation = parsed.analysis || "Processed using Gemini semantic analysis.";
        }
      } catch (err) {
        console.error("Gemini text analysis failed", err);
      }
    }

    const newIssue = {
      id: "issue-" + Date.now(),
      title: title || autoTitle,
      description: description || "No additional details provided.",
      category: detectedCategory,
      severity: detectedSeverity,
      status: "reported",
      lat: Number(lat),
      lng: Number(lng),
      address: address || "Pin dropped on map",
      imageUrl: base64Image || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=600",
      upvotes: 0,
      upvotedByUserIds: [],
      createdAt: new Date().toISOString(),
      aiAnalysis: aiExplanation,
      priorityScore: priorityScore,
      confidenceScore: confidenceScore,
      suggestedDepartment: suggestedDepartment,
      summary: summary,
      recommendedAction: recommendedAction,
      verifiedByUserIds: [],
      duplicateFlagUserIds: [],
      comments: [],
      creatorSessionId: creatorSessionId || undefined
    };

    activeIssues.unshift(newIssue);
    saveIssues(activeIssues);

    res.json({ success: true, issue: newIssue });
  } catch (error: any) {
    console.error("Error creating issue", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST upvote
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: "SessionID is required to vote." });
  }

  const issue = activeIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, error: "Issue not found." });
  }

  if (!issue.upvotedByUserIds) {
    issue.upvotedByUserIds = [];
  }

  const votedIndex = issue.upvotedByUserIds.indexOf(sessionId);
  if (votedIndex === -1) {
    // Add vote
    issue.upvotedByUserIds.push(sessionId);
    issue.upvotes = issue.upvotedByUserIds.length;
  } else {
    // Revoke vote (toggle)
    issue.upvotedByUserIds.splice(votedIndex, 1);
    issue.upvotes = issue.upvotedByUserIds.length;
  }

  saveIssues(activeIssues);
  res.json({ success: true, upvotes: issue.upvotes, upvotedByUserIds: issue.upvotedByUserIds });
});

// 4. POST update status
app.post("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, suggestedDepartment, resolutionNote } = req.body;

  const validStatuses = ["reported", "verified", "assigned", "in_progress", "resolved"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status value." });
  }

  const issue = activeIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, error: "Issue not found." });
  }

  if (!issue.comments) {
    issue.comments = [];
  }

  // Update status if passed
  if (status && status !== issue.status) {
    issue.status = status;
    const statusLabels = {
      reported: "Reported",
      verified: "Verified",
      assigned: "Assigned",
      in_progress: "In Progress",
      resolved: "Resolved"
    };
    issue.comments.push({
      id: "hist-status-" + Date.now(),
      author: "System Dispatcher",
      text: `Status updated to [${statusLabels[status as keyof typeof statusLabels]}].`,
      createdAt: new Date().toISOString()
    });
  }

  // Assign department if passed
  if (suggestedDepartment !== undefined && suggestedDepartment !== issue.suggestedDepartment) {
    const oldDept = issue.suggestedDepartment || "None";
    issue.suggestedDepartment = suggestedDepartment;
    issue.comments.push({
      id: "hist-dept-" + Date.now(),
      author: "System Dispatcher",
      text: `Allocated to [${suggestedDepartment}] (reassigned from ${oldDept}).`,
      createdAt: new Date().toISOString()
    });
  }

  // Add resolution note if passed
  if (resolutionNote !== undefined) {
    issue.resolutionNote = resolutionNote;
    issue.comments.push({
      id: "hist-res-" + Date.now(),
      author: "System Dispatcher",
      text: `Administrative Resolution Note added: "${resolutionNote}"`,
      createdAt: new Date().toISOString()
    });
  }

  saveIssues(activeIssues);
  res.json({ 
    success: true, 
    status: issue.status, 
    suggestedDepartment: issue.suggestedDepartment,
    resolutionNote: issue.resolutionNote,
    comments: issue.comments 
  });
});

// 4.5 POST toggle verify
app.post("/api/issues/:id/verify", (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: "SessionID is required to verify." });
  }

  const issue = activeIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, error: "Issue not found." });
  }

  if (!issue.verifiedByUserIds) {
    issue.verifiedByUserIds = [];
  }

  const index = issue.verifiedByUserIds.indexOf(sessionId);
  if (index === -1) {
    issue.verifiedByUserIds.push(sessionId);
  } else {
    issue.verifiedByUserIds.splice(index, 1);
  }

  // Auto escalate to verified status if the report gains user verification in 'reported' phase
  if (issue.status === "reported" && issue.verifiedByUserIds.length >= 3) {
    issue.status = "verified";
    if (!issue.comments) {
      issue.comments = [];
    }
    issue.comments.push({
      id: "hist-auto-" + Date.now(),
      author: "System Dispatcher",
      text: "Issue automatically escalated to [Verified] via receiving 3 community verification audits.",
      createdAt: new Date().toISOString()
    });
  }

  saveIssues(activeIssues);
  res.json({
    success: true,
    verifiedByUserIds: issue.verifiedByUserIds,
    status: issue.status,
    comments: issue.comments
  });
});

// 4.6 POST toggle duplicate flag
app.post("/api/issues/:id/flag-duplicate", (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: "SessionID is required to flag." });
  }

  const issue = activeIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, error: "Issue not found." });
  }

  if (!issue.duplicateFlagUserIds) {
    issue.duplicateFlagUserIds = [];
  }

  const index = issue.duplicateFlagUserIds.indexOf(sessionId);
  if (index === -1) {
    issue.duplicateFlagUserIds.push(sessionId);
  } else {
    issue.duplicateFlagUserIds.splice(index, 1);
  }

  saveIssues(activeIssues);
  res.json({
    success: true,
    duplicateFlagUserIds: issue.duplicateFlagUserIds
  });
});

// 5. POST comment
app.post("/api/issues/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ success: false, error: "Author and comment text are required." });
  }

  const issue = activeIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, error: "Issue not found." });
  }

  if (!issue.comments) {
    issue.comments = [];
  }

  const newComment = {
    id: "comment-" + Date.now(),
    author: author.trim().slice(0, 50),
    text: text.trim().slice(0, 500),
    createdAt: new Date().toISOString()
  };

  issue.comments.push(newComment);
  saveIssues(activeIssues);

  res.json({ success: true, comments: issue.comments });
});

// 6. POST reset issues to SEED_ISSUES
app.post("/api/issues/reset", (req, res) => {
  activeIssues = JSON.parse(JSON.stringify(SEED_ISSUES));
  saveIssues(activeIssues);
  res.json({ success: true, issues: activeIssues });
});

// Start express server with Vite support or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integration of Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production format
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RoadSync server running on http://localhost:${PORT}`);
  });
}

startServer();