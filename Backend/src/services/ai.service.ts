import Groq from 'groq-sdk';

// Initialize the SDK. We use a fallback if not provided to prevent crashes on startup.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY' });

export interface ClassificationResult {
  department: string;
  priority: string;
}

/**
 * Invokes Llama 3 via Groq to extract structured routing data from a natural language complaint.
 * Incorporates strict validations, 4-second timeout, and dynamic DB mapping.
 * 
 * @param text The resident's complaint text
 * @param validDepartments Active departments array to constrain hallucination
 * @returns { department, priority } or null if error/timeout triggers fallback
 */
export const classifyComplaint = async (
  text: string,
  validDepartments: { name: string; keywords: string[] }[]
): Promise<ClassificationResult | null> => {

  const allowedPriorities = ["low", "medium", "high", "critical"];
  
  const prompt = `You are an expert autonomous dispatcher system.
Analyze the following user complaint and strictly classify it.

ALLOWED DEPARTMENTS AND THEIR KEYWORDS: 
${JSON.stringify(validDepartments)}

ALLOWED PRIORITIES: ${JSON.stringify(allowedPriorities)}

RULES:
1. Return ONLY the department name exactly as provided. No guessing.
2. Prefer the MOST SPECIFIC keyword match over generic words.
3. If completely unsure, choose the closest valid department based on context. NEVER return unknown values.
Return exactly ONE valid JSON object with the following keys. Do no wrap in markdown blocks, do not explain. 
{
  "department": "<choose exactly one from ALLOWED DEPARTMENTS based on context>",
  "priority": "<choose exactly one from ALLOWED PRIORITIES>"
}

Complaint Text: "${text}"`;

  console.log(`\n[AI INPUT] Departments: ${validDepartments.map(d => d.name).join(', ')}`);

  try {
    const aiPromise = groq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI Classification Timeout (4s)")), 4000)
    );

    // Race the AI against the strict 4s timeout
    const completion = await Promise.race([aiPromise, timeoutPromise]) as any;

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from Llama 3");

    const parsed = JSON.parse(content);

    // Schema enforcement
    if (!parsed.department || !parsed.priority) {
      throw new Error("Missing required structural keys in JSON output");
    }

    console.log(`[AI OUTPUT] Department: [${parsed.department}] | Priority: [${parsed.priority}]\n`);

    return {
      department: parsed.department,
      priority: parsed.priority.toLowerCase()
    };
  } catch (error: any) {
    // Explicitly logging error internally without exposing to frontend
    console.error(`[AI Service Fault]: ${error.message} - Enforcing Default Fallback`);
    return null;
  }
};
