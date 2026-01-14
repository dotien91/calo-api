/**
 * @author Tony Vu
 * @param rawContent 
 * @returns 
 */
export const parseGeminiResponse = (rawContent: string) => {
  try {
    const cleanString = rawContent.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanString);
  } catch (e) {
    console.error("Parse AI JSON Error:", e);
    return null;
  }
};
