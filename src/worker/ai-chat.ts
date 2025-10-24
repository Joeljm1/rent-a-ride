import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { CloudflareBindings } from "./env";
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";

const app = new Hono<{ Bindings: CloudflareBindings }>();

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  description?: string | null;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
}

type VehicleEmbeddingParams = {
  vehicleIds?: number[];  // only process specific vehicles
  forceRefresh?: boolean;  // re-generate even if exists
}

// Initialize vector database using Workflow (async, durable, production-ready)
app.post("/initialize", async (c) => {
  try {
    if (!c.env.VEHICLE_EMBEDDING_WORKFLOW) {
      return c.json({ error: "Workflow not configured" }, 500);
    }

    const body = await c.req.json().catch(() => ({}));
    const params: VehicleEmbeddingParams = {
      vehicleIds: body.vehicleIds,
      forceRefresh: body.forceRefresh || false
    };

    // Trigger the workflow (returns immediately)
    const instance = await c.env.VEHICLE_EMBEDDING_WORKFLOW.create({ params });
    
    return c.json({ 
      success: true,
      message: "Vehicle embedding process started",
      workflowId: instance.id,
      status: "View status at /initialize/status/" + instance.id
    });
  } catch (error) {
    return c.json(
      { error: "Failed to start workflow", details: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Check workflow status
app.get("/initialize/status/:id", async (c) => {
  try {
    const workflowId = c.req.param("id");
    
    if (!c.env.VEHICLE_EMBEDDING_WORKFLOW) {
      return c.json({ error: "Workflow not configured" }, 500);
    }

    const instance = await c.env.VEHICLE_EMBEDDING_WORKFLOW.get(workflowId);
    
    return c.json({
      id: instance.id,
      status: instance.status,
      // Add more status details as needed
    });
  } catch (error) {
    return c.json(
      { error: "Failed to get workflow status", details: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// Chat endpoint for vehicle recommendations
app.post(
  "/chat",
  zValidator(
    "json",
    z.object({
      message: z.string().min(1, "Message is required"),
      conversationHistory: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        )
        .optional(),
    }),
  ),
  async (c) => {
    try {
      const { message, conversationHistory = [] } = c.req.valid("json");

      if (!c.env.AI) {
        console.log("AI service not configured");
        return c.json({ error: "Internal Server Error" }, 500);
      }

      if (!c.env.VECTORIZE) {
        console.log("Vector database not configured");
        return c.json({ error: "Internal Server Error" }, 500);
      }
      
      if (!c.env.DB) {
        return c.json({ error: "Database not configured" }, 500);
      }
      
      // Generate embedding for the user's query
      const queryEmbeddings: any = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: message,
      });
      
      if (!queryEmbeddings.data || !queryEmbeddings.data[0]) {
        console.log("Failed to get query embeddings");
        return c.json({ error: "Internal Server Error" }, 500);
      }
      
      const queryVector = queryEmbeddings.data[0];

      // Search for similar vehicles in the vector database
      const searchResults = await c.env.VECTORIZE.query(queryVector, {
        topK: 3,
        returnMetadata: true
      });

      // Get full vehicle details from D1 database
      const vehicleIds = searchResults.matches
        ?.filter((match) => match.score && match.score > 0.7)
        .map((match) => match.id) || [];

      let relevantVehicles: Vehicle[] = [];
      
      if (vehicleIds.length > 0) {
        const placeholders = vehicleIds.map(() => '?').join(',');
        const { results } = await c.env.DB.prepare(
          `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay 
           FROM cars 
           WHERE id IN (${placeholders})`
        ).bind(...vehicleIds).all<Vehicle>();
        
        if (results) {
          relevantVehicles = results;
        }
      }

      // Build context from relevant vehicles
      let contextMessage = "";
      if (relevantVehicles.length > 0) {
        contextMessage = `AVAILABLE VEHICLES IN DATABASE (YOU MUST ONLY RECOMMEND FROM THIS LIST):\n\n`;
        relevantVehicles.forEach((vehicle, index) => {
          contextMessage += `${index + 1}. ${vehicle.brand} ${vehicle.model} (${vehicle.year})\n`;
          contextMessage += `   - Price: Rs. ${vehicle.pricePerDay}/day\n`;
          contextMessage += `   - Type: ${vehicle.fuelType}, ${vehicle.transmission}\n`;
          contextMessage += `   - Seats: ${vehicle.seats}\n`;
          contextMessage += `   - Description: ${vehicle.description || 'No description available'}\n\n`;
        });
        contextMessage += `\nREMINDER: These are the ONLY ${relevantVehicles.length} vehicles available. Do NOT suggest any other vehicles.`;
      } else {
        contextMessage = `NO MATCHING VEHICLES FOUND IN DATABASE.\nYou MUST tell the user we don't have vehicles matching their criteria and ask them to adjust their requirements.`;
      }
      
      const systemPrompt = `You are a helpful vehicle rental assistant for a car rental company. Your role is to recommend vehicles ONLY from the provided database context.

CRITICAL RULES:
- You MUST ONLY recommend vehicles that are explicitly listed in the context below
- NEVER make up vehicle models, prices, or specifications
- NEVER suggest vehicles not in the provided list
- If no suitable vehicles match the user's needs, politely explain that we don't have matching vehicles in our current inventory
- NEVER invent any Vehicles, Cars, or any other models not in the database
- ALL prices and details MUST come from the context data

Guidelines:
- Use ONLY the provided vehicle context to make specific recommendations
- Ask clarifying questions if the user's needs are unclear (budget, number of passengers, trip type, etc.)
- Be friendly, concise, and helpful
- If no suitable vehicles are found in the context, say: "I don't have any vehicles matching those criteria in our current inventory. Would you like to adjust your requirements?"
- Always mention the exact price per day from the context
- Only highlight features that are actually listed in the vehicle's data`;

      interface Message {
        role: "system" | "user" | "assistant";
        content: string;
      }
      
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
      ];
      
      if (contextMessage) {
        messages.push({ role: "system", content: contextMessage });
      }

      conversationHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });

      messages.push({ role: "user", content: message });

      // Generate response using Workers AI
      const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages,
      });

      return c.json({
        response: aiResponse.response,
        relevantVehicles: relevantVehicles.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          pricePerDay: v.pricePerDay,
          seats: v.seats,
          transmission: v.transmission,
          fuelType: v.fuelType,
        })),
        metadata: {
          matchCount: searchResults.matches?.length || 0,
          topScore: searchResults.matches?.[0]?.score || 0,
        },
      });
    } catch (error) {
      return c.json(
        {
          error: "Failed to process chat request",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  },
);

// Workflow for durable, async vehicle embedding generation
export class VehicleEmbeddingWorkflow extends WorkflowEntrypoint<
  CloudflareBindings,
  VehicleEmbeddingParams
> {
  async run(event: WorkflowEvent<VehicleEmbeddingParams>, step: WorkflowStep) {
    const { vehicleIds } = event.payload;

    // Step 1: Fetch vehicles from database
    const vehicles = await step.do("fetch-vehicles", async () => {
      let query = `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay FROM cars`;
      let params: number[] = [];

      if (vehicleIds && vehicleIds.length > 0) {
        const placeholders = vehicleIds.map(() => '?').join(',');
        query += ` WHERE id IN (${placeholders})`;
        params = vehicleIds;
      }

      const { results } = await this.env.DB.prepare(query).bind(...params).all<Vehicle>();
      
      if (!results || results.length === 0) {
        throw new Error("No vehicles found in database");
      }

      return results;
    });

    // Step 2: Generate embeddings for each vehicle
    const embeddings = await step.do("generate-embeddings", async () => {
      const embeddingPromises = vehicles.map(async (vehicle) => {
        const vehicleText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}: ${vehicle.description || 'No description'}. ${vehicle.fuelType} ${vehicle.transmission} with ${vehicle.seats} seats at $${vehicle.pricePerDay}/day`;
        
        const result: any = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: vehicleText,
        });
        
        if (result.data && result.data[0]) {
          return {
            id: vehicle.id.toString(),
            values: result.data[0],
            metadata: {
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              pricePerDay: vehicle.pricePerDay
            }
          };
        }
        
        throw new Error(`Failed to generate embedding for vehicle ${vehicle.id}`);
      });

      return await Promise.all(embeddingPromises);
    });

    // Step 3: Upsert vectors to Vectorize
    const result = await step.do("upsert-vectors", async () => {
      await this.env.VECTORIZE.upsert(embeddings);
      
      return {
        success: true,
        count: embeddings.length,
        vehicleIds: embeddings.map(e => e.id)
      };
    });

    return result;
  }
}

export default app;
