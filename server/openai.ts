import OpenAI from "openai";
import dotenv from 'dotenv'; // Ensure you have this import
import { type TravelPreference, type Conversation, type Message } from "@shared/schema";
import { GeneratedItinerary } from "../client/src/lib/openai";

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI with API key from environment variables and custom base URL
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY, // Ensure this reads the key correctly
  baseURL: "https://api.chatanywhere.tech/v1"
});

// Your remaining code...

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Generate a travel itinerary based on user preferences and conversation history
 */
export async function generateItineraryWithAI(
  preference: TravelPreference,
  conversation?: Conversation
): Promise<GeneratedItinerary> {
  try {
    // Calculate the number of days from startDate and endDate
    let duration = 3; // default fallback
    if (preference.startDate && preference.endDate) {
      const start = new Date(preference.startDate);
      const end = new Date(preference.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Format the preference and conversation history into a prompt
    const systemPrompt = `You are an expert travel planner. Create a detailed travel itinerary based on the following preferences:
Destination type: ${preference.destinationType || 'Not specified'}
Custom destination: ${preference.customDestination || 'Not specified'}
Duration: ${duration} days
Budget: ${preference.budget || 'Not specified'}
Interests: ${preference.interests || 'Not specified'}
Pace: ${preference.pace || 'Not specified'}

IMPORTANT: You MUST generate exactly ${duration} days of activities. Each day MUST include morning, afternoon, and evening activities.
Do not abbreviate or summarize the itinerary.

The response MUST be a valid JSON object with the following structure:
{
  "title": "string",
  "destination": "string",
  "duration": "string",
  "summary": "string",
  "tripOverview": {
    "budget": "string",
    "pace": "string",
    "travelStyle": "string"
  },
  "days": [
    {
      "dayNumber": "number",
      "title": "string",
      "morning": {
        "activity": "string",
        "description": "string"
      },
      "afternoon": {
        "activity": "string",
        "description": "string"
      },
      "evening": {
        "activity": "string",
        "description": "string"
      },
      "travelTips": ["string"],
      "image": "string (Unsplash URL)"
    }
  ],
  "accommodations": [
    {
      "name": "string",
      "rating": "number",
      "priceRange": "string",
      "description": "string",
      "type": "string",
      "image": "string (Unsplash URL)"
    }
  ]
}`;

    // Include conversation history if available
    let userConversation = "";
    if (Array.isArray(conversation?.messages) && conversation.messages.length > 0) {
      userConversation = "Additional context from conversation:\n" +
        (Array.isArray(conversation?.messages) ? conversation.messages : [])
          .map((msg: { role: string; content: string }) => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join('\n');
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userConversation || "Generate a detailed travel itinerary based on my preferences." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const itinerary = JSON.parse(content) as GeneratedItinerary;
    
    // Validate that we have the correct number of days
    if (itinerary.days.length !== duration) {
      throw new Error(`Generated itinerary has ${itinerary.days.length} days instead of the requested ${duration} days`);
    }

    return itinerary;
  } catch (error) {
    console.error("Error generating itinerary with OpenAI:", error);
    throw new Error("Failed to generate itinerary with AI");
  }
}

/**
 * Process natural language input to extract travel preferences
 */
export async function processNaturalLanguageWithAI(
  input: string
): Promise<Partial<TravelPreference>> {
  try {
    const systemPrompt = `You are an expert travel assistant. Analyze the user's natural language input and extract structured travel preferences.
Extract the following information if present:
- Destination type (beach, city, mountains, culture, adventure, countryside)
- Custom destination (specific location or country)
- Duration (weekend, short, standard, long)
- Budget (budget, midrange, luxury)
- Interests
- Pace (relaxed, moderate, active)
- Companions (solo, couple, family, friends, group)
- Activities
- Meal preferences (local, fine-dining, street-food, international)
- Dietary restrictions (none, vegetarian, vegan, gluten-free, dairy-free, halal, kosher)
- Accommodation (hotel, resort, vacation-rental, boutique, hostel, camping)
- Transportation mode (rental-car, public-transit, walking-biking, guided-tours, ride-services)
- Additional notes

Output ONLY a JSON object with these fields. If information is not present, don't include the field.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const preferences = JSON.parse(content) as Partial<TravelPreference>;
    return preferences;
  } catch (error) {
    console.error("Error processing natural language with OpenAI:", error);
    throw new Error("Failed to process natural language input");
  }
}

/**
 * Generate AI response for the chat conversation
 */
export async function generateChatResponseWithAI(
  preference: TravelPreference,
  conversation: Conversation
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful travel assistant helping a user plan their trip.
    
The user has these travel preferences:
Destination type: ${preference.destinationType || 'Not specified'}
Custom destination: ${preference.customDestination || 'Not specified'}
Duration: ${preference.duration || 'Not specified'}
Budget: ${preference.budget || 'Not specified'}
Interests: ${preference.interests || 'Not specified'}
Pace: ${preference.pace || 'Not specified'}
Companions: ${preference.companions || 'Not specified'}
Activities: ${preference.activities || 'Not specified'}
Meal Preferences: ${preference.mealPreferences || 'Not specified'}
Dietary Restrictions: ${preference.dietaryRestrictions || 'Not specified'}
Accommodation Type: ${preference.accommodation || 'Not specified'}
Transportation Mode: ${preference.transportationMode || 'Not specified'}

Provide helpful, friendly advice for their trip planning. Ask follow-up questions to gather more details about their interests, preferred activities, must-see attractions, dietary preferences, and any specific requirements. Your goal is to collect enough information to create a personalized travel itinerary.
Keep responses conversational, concise, and focused on helping the user plan their perfect trip. You work for Triponic, an AI-powered travel assistant.`;

    // Format the conversation history
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add up to the last 10 messages from conversation history
    if (conversation && Array.isArray(conversation.messages)) {
      const recentMessages = conversation.messages.slice(-10);
      recentMessages.forEach((msg: {role: string, content: string}) => {
        messages.push({
          role: msg.role as any,
          content: msg.content
        });
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error generating chat response with OpenAI:", error);
    return "I'm having trouble processing your request right now. Could you try asking something else?";
  }
}
