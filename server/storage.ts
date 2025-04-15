import {
  type User,
  type InsertUser,
  type TravelPreference,
  type InsertTravelPreference,
  type Itinerary,
  type InsertItinerary,
  type Conversation,
  type InsertConversation,
  type Message
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Travel Preferences methods
  getPreference(id: number): Promise<TravelPreference | undefined>;
  getUserPreferences(userId: number): Promise<TravelPreference[]>;
  createPreference(preference: InsertTravelPreference): Promise<TravelPreference>;
  updatePreference(id: number, preference: Partial<InsertTravelPreference>): Promise<TravelPreference | undefined>;
  getPreferencesMap(): Map<number, TravelPreference>;

  // Itinerary methods
  getItinerary(id: number): Promise<Itinerary | undefined>;
  getUserItineraries(userId: number): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;

  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByPreferenceId(preferenceId: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  addMessage(conversationId: number, message: Message): Promise<Conversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<number, TravelPreference>;
  private itineraries: Map<number, Itinerary>;
  private conversations: Map<number, Conversation>;

  private currentUserId: number;
  private currentPreferenceId: number;
  private currentItineraryId: number;
  private currentConversationId: number;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.itineraries = new Map();
    this.conversations = new Map();

    this.currentUserId = 1;
    this.currentPreferenceId = 1;
    this.currentItineraryId = 1;
    this.currentConversationId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Getting user with ID: ${id}`);
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Getting user by username: ${username}`);
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      createdAt: new Date()
    };
    console.log(`Creating new user:`, user);
    this.users.set(id, user);
    return user;
  }

  // Travel Preferences methods
  async getPreference(id: number): Promise<TravelPreference | undefined> {
    console.log(`Attempting to get preference with ID: ${id}`);
    console.log(`Available preferences: ${Array.from(this.preferences.keys())}`);
    const preference = this.preferences.get(id);
    console.log(`Found preference:`, preference);
    return preference;
  }

  async getUserPreferences(userId: number): Promise<TravelPreference[]> {
    console.log(`Getting preferences for user ID: ${userId}`);
    return Array.from(this.preferences.values()).filter(
      (preference) => preference.userId === userId
    );
  }

  async createPreference(insertPreference: InsertTravelPreference): Promise<TravelPreference> {
    const id = this.currentPreferenceId++;
    const preference: TravelPreference = {
      id,
      createdAt: new Date(),
      userId: insertPreference.userId ?? null,
      destinationType: insertPreference.destinationType ?? null,
      customDestination: insertPreference.customDestination ?? null,
      duration: insertPreference.duration ?? null,
      startDate: insertPreference.startDate ?? null,
      endDate: insertPreference.endDate ?? null,
      budget: insertPreference.budget ?? null,
      interests: insertPreference.interests ?? null,
      pace: insertPreference.pace ?? null,
      companions: insertPreference.companions ?? null,
      activities: insertPreference.activities ?? null,
      mealPreferences: insertPreference.mealPreferences ?? null,
      dietaryRestrictions: insertPreference.dietaryRestrictions ?? null,
      accommodation: insertPreference.accommodation ?? null,
      transportationMode: insertPreference.transportationMode ?? null,
      additionalNotes: insertPreference.additionalNotes ?? null
    };
    console.log(`Creating new preference with ID: ${id}`, preference);
    this.preferences.set(id, preference);
    return preference;
  }

  async updatePreference(id: number, preferenceUpdate: Partial<InsertTravelPreference>): Promise<TravelPreference | undefined> {
    console.log(`Updating preference with ID: ${id}`, preferenceUpdate);
    const currentPreference = this.preferences.get(id);
    if (!currentPreference) {
      console.log(`Preference not found with ID: ${id}`);
      return undefined;
    }

    const updatedPreference: TravelPreference = {
      ...currentPreference,
      userId: preferenceUpdate.userId ?? currentPreference.userId,
      destinationType: preferenceUpdate.destinationType ?? currentPreference.destinationType,
      customDestination: preferenceUpdate.customDestination ?? currentPreference.customDestination,
      duration: preferenceUpdate.duration ?? currentPreference.duration,
      startDate: preferenceUpdate.startDate ?? currentPreference.startDate,
      endDate: preferenceUpdate.endDate ?? currentPreference.endDate,
      budget: preferenceUpdate.budget ?? currentPreference.budget,
      interests: preferenceUpdate.interests ?? currentPreference.interests,
      pace: preferenceUpdate.pace ?? currentPreference.pace,
      companions: preferenceUpdate.companions ?? currentPreference.companions,
      activities: preferenceUpdate.activities ?? currentPreference.activities,
      mealPreferences: preferenceUpdate.mealPreferences ?? currentPreference.mealPreferences,
      dietaryRestrictions: preferenceUpdate.dietaryRestrictions ?? currentPreference.dietaryRestrictions,
      accommodation: preferenceUpdate.accommodation ?? currentPreference.accommodation,
      transportationMode: preferenceUpdate.transportationMode ?? currentPreference.transportationMode,
      additionalNotes: preferenceUpdate.additionalNotes ?? currentPreference.additionalNotes
    };

    this.preferences.set(id, updatedPreference);
    console.log(`Updated preference:`, updatedPreference);
    return updatedPreference;
  }

  getPreferencesMap(): Map<number, TravelPreference> {
    return this.preferences;
  }

  // Itinerary methods
  async getItinerary(id: number): Promise<Itinerary | undefined> {
    console.log(`Getting itinerary with ID: ${id}`);
    return this.itineraries.get(id);
  }

  async getUserItineraries(userId: number): Promise<Itinerary[]> {
    console.log(`Getting itineraries for user ID: ${userId}`);
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.userId === userId
    );
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.currentItineraryId++;
    const itinerary: Itinerary = {
      id,
      createdAt: new Date(),
      userId: insertItinerary.userId ?? null,
      preferenceId: insertItinerary.preferenceId ?? null,
      title: insertItinerary.title,
      destination: insertItinerary.destination,
      duration: insertItinerary.duration,
      summary: insertItinerary.summary ?? null,
      content: insertItinerary.content
    };
    console.log(`Creating new itinerary:`, itinerary);
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    console.log(`Getting conversation with ID: ${id}`);
    return this.conversations.get(id);
  }

  async getConversationByPreferenceId(preferenceId: number): Promise<Conversation | undefined> {
    console.log(`Getting conversation by preference ID: ${preferenceId}`);
    return Array.from(this.conversations.values()).find(
      (conversation) => conversation.preferenceId === preferenceId
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      id,
      createdAt: new Date(),
      userId: insertConversation.userId ?? null,
      preferenceId: insertConversation.preferenceId ?? null,
      messages: insertConversation.messages || []
    };
    console.log(`Creating new conversation:`, conversation);
    this.conversations.set(id, conversation);
    return conversation;
  }

  async addMessage(conversationId: number, message: Message): Promise<Conversation | undefined> {
    console.log(`Adding message to conversation ${conversationId}:`, message);
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      console.log(`Conversation not found with ID: ${conversationId}`);
      return undefined;
    }

    const updatedConversation: Conversation = {
      ...conversation,
      messages: [...(Array.isArray(conversation.messages) ? conversation.messages : []), message]
    };

    this.conversations.set(conversationId, updatedConversation);
    console.log(`Updated conversation:`, updatedConversation);
    return updatedConversation;
  }

  // Debug helper method
  debug() {
    return {
      userCount: this.users.size,
      preferenceCount: this.preferences.size,
      itineraryCount: this.itineraries.size,
      conversationCount: this.conversations.size,
      currentIds: {
        user: this.currentUserId,
        preference: this.currentPreferenceId,
        itinerary: this.currentItineraryId,
        conversation: this.currentConversationId
      },
      preferences: Array.from(this.preferences.entries()),
      users: Array.from(this.users.entries()),
      itineraries: Array.from(this.itineraries.entries()),
      conversations: Array.from(this.conversations.entries())
    };
  }
}

// Create and export the storage instance
export const storage = new MemStorage();

// Debug endpoint for development
if (process.env.NODE_ENV === 'development') {
  (global as any).debugStorage = storage;
}
