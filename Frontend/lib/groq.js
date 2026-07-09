import baseurl from '../store/baseurl';

/**
 * Generate chatbot response via backend
 */
export async function generateContent(prompt, options = {}) {
  try {
    const isChatbotSession = options.session_id && options.chatbot_id;
    const endpoint = isChatbotSession ? 'getResponse' : 'generate';

    const response = await fetch(`${baseurl}/chatbot/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message: options.message || prompt,
        prompt: prompt,
        messages: options.messages || [],
        session_id: options.session_id,
        chatbot_id: options.chatbot_id,
      }),
    });

    const data = await response.json();
    if (data.success) return data.data;
    throw new Error(data.message || 'Backend error');
  } catch (error) {
    console.error('API Error:', error);
    return "Sorry, I'm unable to respond right now. Please try again later.";
  }
}

/**
 * Generate streaming content (simulate streaming)
 */
export async function generateContentStream(prompt, onUpdate, options = {}) {
  try {
    const response = await generateContent(prompt, options);
    const words = response.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      if (onUpdate) onUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return response;
  } catch (error) {
    console.error('Streaming Error:', error);
    throw error;
  }
}

/**
 * Generate JSON content
 */
export async function generateJSONContent(prompt, options = {}) {
  try {
    const response = await generateContent(prompt, options);
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } 
      catch (e) { return response; }
    }
    return response;
  } catch (error) {
    console.error('JSON Generation Error:', error);
    throw error;
  }
}

/**
 * Groq AI Client Wrapper
 */
export class GroqAI {
  constructor(config = {}) {
    this.backendUrl = config.backendUrl || baseurl;
  }

  async generateContent(prompt, options = {}) {
    return generateContent(prompt, { ...options, backendUrl: this.backendUrl });
  }

  async generateContentStream(prompt, onUpdate, options = {}) {
    return generateContentStream(prompt, onUpdate, { ...options, backendUrl: this.backendUrl });
  }

  async generateJSONContent(prompt, options = {}) {
    return generateJSONContent(prompt, { ...options, backendUrl: this.backendUrl });
  }
}

export default GroqAI;
