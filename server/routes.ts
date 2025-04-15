import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTravelPreferenceSchema, insertItinerarySchema, messageSchema } from "@shared/schema";
import { generateItineraryWithAI, processNaturalLanguageWithAI, generateChatResponseWithAI } from "./openai";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.chatanywhere.tech/v1"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({ status: "ok" });
  });

  // Travel preferences endpoints
  app.post(`${apiPrefix}/preferences`, async (req, res) => {
    try {
      const validatedData = insertTravelPreferenceSchema.parse(req.body);
      const newPreference = await storage.createPreference(validatedData);
      res.status(201).json(newPreference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create travel preference" });
      }
    }
  });

  app.get(`${apiPrefix}/preferences/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid preference ID" });
    }

    const preference = await storage.getPreference(id);
    if (!preference) {
      return res.status(404).json({ error: "Preference not found" });
    }

    res.json(preference);
  });

  app.put(`${apiPrefix}/preferences/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid preference ID" });
    }

    try {
      const validatedData = insertTravelPreferenceSchema.partial().parse(req.body);
      const updatedPreference = await storage.updatePreference(id, validatedData);

      if (!updatedPreference) {
        return res.status(404).json({ error: "Preference not found" });
      }

      res.json(updatedPreference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update travel preference" });
      }
    }
  });

  app.get(`${apiPrefix}/user/:userId/preferences`, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const preferences = await storage.getUserPreferences(userId);
    res.json(preferences);
  });

  // Itinerary endpoints
  app.post(`${apiPrefix}/itineraries`, async (req, res) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const newItinerary = await storage.createItinerary(validatedData);
      res.status(201).json(newItinerary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create itinerary" });
      }
    }
  });

  app.get(`${apiPrefix}/itineraries/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid itinerary ID" });
    }

    const itinerary = await storage.getItinerary(id);
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    res.json(itinerary);
  });

  app.get(`${apiPrefix}/user/:userId/itineraries`, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const itineraries = await storage.getUserItineraries(userId);
    res.json(itineraries);
  });

  // Chat conversation endpoints
  app.post(`${apiPrefix}/conversations`, async (req, res) => {
    try {
      // Create a new conversation
      const { preferenceId, userId } = req.body;

      if (!preferenceId || !userId) {
        return res.status(400).json({ error: "Preference ID and User ID are required" });
      }

      const newConversation = await storage.createConversation({
        preferenceId,
        userId,
        messages: []
      });

      res.status(201).json(newConversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get(`${apiPrefix}/conversations/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await storage.getConversation(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  });

  app.get(`${apiPrefix}/preferences/:preferenceId/conversation`, async (req, res) => {
    const preferenceId = parseInt(req.params.preferenceId);
    if (isNaN(preferenceId)) {
      return res.status(400).json({ error: "Invalid preference ID" });
    }

    const conversation = await storage.getConversationByPreferenceId(preferenceId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  });

  app.post(`${apiPrefix}/conversations/:id/messages`, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    try {
      // Parse the incoming message
      const message = messageSchema.parse({
        ...req.body,
        timestamp: Date.now()
      });

      // Add the message to the conversation
      const updatedConversation = await storage.addMessage(id, message);

      if (!updatedConversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Only generate an AI response if this is a user message
      if (message.role === "user" && updatedConversation.preferenceId) {
        const preference = await storage.getPreference(updatedConversation.preferenceId);

        if (preference) {
          // Default response in case the AI fails
          let responseContent = "I'll help you plan your perfect trip. Could you tell me more about what you're looking for?";

          try {
            // Generate AI response with OpenAI
            responseContent = await generateChatResponseWithAI(preference, updatedConversation);
          } catch (error) {
            console.error("Error generating AI response:", error);
          }

          // Create and add the AI's response to the conversation
          const aiResponse = {
            role: "assistant" as const,
            content: responseContent,
            timestamp: Date.now()
          };

          const finalConversation = await storage.addMessage(id, aiResponse);
          return res.json(finalConversation);
        }
      }

      // If we didn't generate an AI response, return the conversation as is
      return res.json(updatedConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(500).json({ error: "Failed to add message to conversation" });
      }
    }
  });

  // Process natural language input
  app.post(`${apiPrefix}/process-natural-language`, async (req, res) => {
    try {
      const { input } = req.body;

      if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: "Valid input text is required" });
      }

      // Process with OpenAI
      const extractedPreferences = await processNaturalLanguageWithAI(input);
      res.json(extractedPreferences);
    } catch (error) {
      console.error("Error processing natural language input:", error);
      res.status(500).json({ error: "Failed to process natural language input" });
    }
  });

  // LiveChatbot endpoint
  app.post(`${apiPrefix}/chat`, async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Valid messages array is required" });
      }

      // Default user values for chatbot - not tied to specific travel preferences
      const defaultPreference = {
        id: 0,
        userId: 0,
        destinationType: "",
        customDestination: "",
        duration: "",
        budget: "",
        interests: "",
        pace: "",
        companions: "",
        activities: "",
        mealPreferences: "",
        dietaryRestrictions: "",
        accommodation: "",
        transportationMode: "",
        createdAt: new Date()
      };

      // Create a conversation object to pass to the AI
      const conversationForAI = {
        id: 0,
        userId: 0,
        preferenceId: 0,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: Date.now()
        })),
        createdAt: new Date()
      };

      // Call OpenAI to get a response
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful travel assistant called Triponic. You help users plan their trips by providing travel tips, destination information, and personalized recommendations. Keep responses concise, friendly, and focused on travel-related topics. If users ask about non-travel topics, gently redirect the conversation to travel planning. You should introduce yourself as Triponic's AI-powered travel assistant."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const message = response.choices[0].message.content ||
        "I'm having trouble connecting right now. How else can I help with your travel plans?";

      res.json({ message });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({
        error: "Failed to generate chat response",
        message: "I'm having trouble connecting right now. Please try again later."
      });
    }
  });

  // Generate itinerary using OpenAI
  app.post(`${apiPrefix}/generate-itinerary`, async (req, res) => {
    try {
      console.log("Generate itinerary request body:", req.body);
      const { preferenceId } = req.body;

      if (!preferenceId) {
        console.log("Missing preferenceId in request");
        return res.status(400).json({ error: "Preference ID is required" });
      }

      console.log("Looking up preference with ID:", preferenceId);
      const preference = await storage.getPreference(preferenceId);

      if (!preference) {
        console.log("Preference not found with ID:", preferenceId);
        console.log("Available preferences:", Array.from(storage.getPreferencesMap().keys()));
        return res.status(404).json({ error: "Preference not found" });
      }

      console.log("Found preference:", preference);

      // Get conversation if it exists
      const conversation = await storage.getConversationByPreferenceId(preferenceId);

      // Generate itinerary using OpenAI
      const generatedItinerary = await generateItineraryWithAI(preference, conversation);

      // Store the generated itinerary
      const savedItinerary = await storage.createItinerary({
        preferenceId,
        userId: preference.userId || 1, // Default to 1 if no user ID
        title: generatedItinerary.title,
        destination: generatedItinerary.destination,
        duration: generatedItinerary.duration,
        summary: generatedItinerary.summary,
        content: generatedItinerary
      });

      console.log("Successfully generated and saved itinerary");
      res.json(savedItinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
