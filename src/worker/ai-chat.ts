import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { CloudflareBindings } from "./env";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const VEHICLE_DATA = [
  {
    id: 1,
    description: "Toyota Camry 2022 - Luxury sedan with excellent fuel efficiency, automatic transmission, 5 seats, leather interior, GPS navigation, and advanced safety features. Perfect for business trips and comfortable family travel.",
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    fuelType: "Hybrid",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 75,
    features: ["GPS", "Leather Seats", "Bluetooth", "Backup Camera", "Lane Assist"]
  },
  {
    id: 2,
    description: "Honda CR-V 2023 - Spacious SUV ideal for family trips and outdoor adventures, automatic transmission, 7 seats, all-wheel drive, excellent cargo space, and advanced safety technology.",
    brand: "Honda",
    model: "CR-V",
    year: 2023,
    fuelType: "Gasoline",
    transmission: "Automatic",
    seats: 7,
    pricePerDay: 95,
    features: ["AWD", "GPS", "Third Row Seating", "Roof Rack", "Apple CarPlay"]
  },
  {
    id: 3,
    description: "Tesla Model 3 2023 - Electric sedan with autopilot, zero emissions, instant acceleration, premium sound system, and cutting-edge technology. Great for eco-conscious city driving.",
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    fuelType: "Electric",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 120,
    features: ["Autopilot", "Premium Audio", "Glass Roof", "Supercharging", "Over-the-air Updates"]
  },
  {
    id: 4,
    description: "Ford F-150 2022 - Powerful pickup truck perfect for heavy-duty work, towing, and off-road adventures. 4x4 capability, large cargo bed, manual transmission option.",
    brand: "Ford",
    model: "F-150",
    year: 2022,
    fuelType: "Diesel",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 110,
    features: ["4x4", "Towing Package", "Cargo Bed Liner", "Off-road Tires", "Heavy Duty Suspension"]
  },
  {
    id: 5,
    description: "BMW 3 Series 2023 - Premium luxury sedan with sporty performance, automatic transmission, heated seats, premium sound, and elegant design. Perfect for special occasions.",
    brand: "BMW",
    model: "3 Series",
    year: 2023,
    fuelType: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 140,
    features: ["Sport Mode", "Heated Seats", "Premium Audio", "Sunroof", "Parking Assist"]
  },
  {
    id: 6,
    description: "Chevrolet Malibu 2021 - Affordable and reliable sedan with good fuel economy, automatic transmission, comfortable interior, modern safety features. Great budget option for daily use.",
    brand: "Chevrolet",
    model: "Malibu",
    year: 2021,
    fuelType: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 55,
    features: ["Bluetooth", "Backup Camera", "Cruise Control", "USB Ports", "Air Conditioning"]
  },
  {
    id: 7,
    description: "Mazda CX-5 2023 - Compact SUV with excellent handling, automatic transmission, 5 seats, premium interior, good cargo space, and sporty driving dynamics.",
    brand: "Mazda",
    model: "CX-5",
    year: 2023,
    fuelType: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 85,
    features: ["GPS", "Leather Seats", "Bose Audio", "Blind Spot Monitor", "Adaptive Cruise Control"]
  },
  {
    id: 8,
    description: "Volkswagen Passat 2022 - Spacious family sedan with premium features, automatic transmission, comfortable ride, large trunk, and German engineering quality.",
    brand: "Volkswagen",
    model: "Passat",
    year: 2022,
    fuelType: "Gasoline",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 70,
    features: ["GPS", "Heated Seats", "Digital Cockpit", "Parking Sensors", "Keyless Entry"]
  }
];

// Chat endpoint for vehicle recommendations
app.post(
  "/chat",
  zValidator(
    "json",
    z.object({
      message: z.string().min(1, "Message is required"),
      conversationHistory: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ).optional(),
    })
  ),
  async (c) => {
    try {
      const { message, conversationHistory = [] } = c.req.valid("json");
      
      if (!c.env.AI) {
        return c.json({ error: "AI service not configured" }, 500);
      }
      
      if (!c.env.VECTORIZE) {
        return c.json({ error: "Vector database not configured" }, 500);
      }
      
      const queryEmbeddings: { data?: number[][] } = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: message,
      }) as { data?: number[][] };
      
      if (!queryEmbeddings.data || !queryEmbeddings.data[0]) {
        return c.json({ error: "Failed to generate query embedding" }, 500);
      }
      
      
      
      // System prompt for the AI
      const systemPrompt = `
        You are a helpful vehicle rental assistant. Your role is to recommend vehicles based on customer needs.
        Guidelines:
        - Use the provided vehicle context to make specific recommendations
        - Ask clarifying questions if the user's needs are unclear (budget, number of passengers, trip type, etc.)
        - Be friendly, concise, and helpful
        - If no suitable vehicles are found in the context, politely explain and ask for different criteria
        - Always mention the price per day when recommending vehicles
        - Highlight key features that match the user's needs
      `;

      // Build messages array for the LLM
      interface Message {
        role: "system" | "user" | "assistant";
        content: string;
      }
      
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
      ];
      
      // Add context if we have relevant vehicles
      if (contextMessage) {
        messages.push({ role: "system", content: contextMessage });
      }
      
      // Add conversation history
      conversationHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });
      
      // Add current user message
      messages.push({ role: "user", content: message });
      
      // Generate response using Workers AI
      const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages,
      });
      
      return c.json({
        response: aiResponse.response,
        relevantVehicles: relevantVehicles?.map((v) => ({
          id: v?.id,
          brand: v?.brand,
          model: v?.model,
          year: v?.year,
          pricePerDay: v?.pricePerDay,
          seats: v?.seats,
          transmission: v?.transmission,
          fuelType: v?.fuelType,
        })),
        metadata: {
          matchCount: searchResults.matches?.length || 0,
          topScore: searchResults.matches?.[0]?.score || 0,
        },
      });
    } catch (error) {
      return c.json(
        { error: "Failed to process chat request", details: error instanceof Error ? error.message : "Unknown error" },
        500
      );
    }
  }
);

// Get all vehicle data (for reference)
app.get("/vehicles", async (c) => {
  return c.json({ vehicles: VEHICLE_DATA });
});

export default app;
