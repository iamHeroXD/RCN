import { GoogleGenAI } from "@google/genai";
import { Post, User } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateEnhancedBio = async (currentBio: string, username: string): Promise<string> => {
  const client = getAIClient();
  if (!client) return currentBio;

  try {
    const prompt = `
      You are a profile optimizer for 'RCN' (Roblox Creator Network).
      The user '${username}' has this bio: "${currentBio}".
      Rewrite this to be professional, energetic, and relevant to Roblox development or gaming.
      Keep it under 200 characters. No hashtags.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || currentBio;
  } catch (error) {
    console.error("Gemini Bio Error:", error);
    return currentBio;
  }
};

export const optimizePostContent = async (title: string, roughDraft: string): Promise<{title: string, content: string}> => {
    const client = getAIClient();
    if (!client) return { title, content: roughDraft };

    try {
      const prompt = `
        Refine the following RCN (Roblox Creator Network) post.
        Original Title: "${title}"
        Original Content: "${roughDraft}"
        
        Return a JSON object with 'title' (catchy, explicit, max 60 chars) and 'content' (professional, clear requirements/skills, formatted).
      `;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const json = JSON.parse(response.text || '{}');
      return {
          title: json.title || title,
          content: json.content || roughDraft
      };
    } catch (error) {
      console.error("Gemini Post Optimization Error:", error);
      return { title, content: roughDraft };
    }
};

export const getSmartRecommendations = async (query: string, posts: Post[]): Promise<string> => {
   const client = getAIClient();
    if (!client) return "AI unavailable. Please check API Key.";

    // Simplify posts context to save tokens
    const postsContext = posts.slice(0, 20).map(p => 
        `[ID: ${p.id}] Type: ${p.type}, Title: ${p.title}, Author: ${p.authorName}, Skills: ${p.tags.join(', ')}`
    ).join('\n');

    try {
        const prompt = `
            You are the RCN (Roblox Creator Network) AI Assistant.
            User Query: "${query}"
            
            Here are the current active posts in the database:
            ${postsContext}
            
            Based on the user query, recommend specific posts by ID and explain why. 
            If they are asking for advice (e.g. "best job for me"), analyze their implied skills.
            If they are hiring ("need a dev"), match them with 'FOR_HIRE' posts.
            If they are looking for work ("need money"), match them with 'HIRING' posts.
            
            Keep it concise and helpful. Format with bullet points.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I couldn't find any matches right now.";
    } catch (e) {
        return "Error connecting to RCN Intelligence.";
    }
}