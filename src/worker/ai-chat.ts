import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { CloudflareBindings } from "./env";
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
  //@ts-ignore
} from "cloudflare:workers";

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
  vehicleIds?: number[]; // only process specific vehicles
  forceRefresh?: boolean; // re-generate even if exists
};

// Initialize vector database using Workflow (async, durable, production-ready)
app.post(
  "/initialize",
  zValidator(
    "json",
    z.object({
      vehicleIds: z.array(z.number()).optional(),
      forceRefresh: z.boolean().optional().default(false),
    }),
  ),
  async (c) => {
    try {
      if (!c.env.VEHICLE_EMBEDDING_WORKFLOW) {
        return c.json({ error: "Workflow not configured" }, 500);
      }
      const { vehicleIds, forceRefresh } = c.req.valid("json");
      const params: VehicleEmbeddingParams = {
        vehicleIds: vehicleIds,
        forceRefresh: forceRefresh,
      };

      // Trigger the workflow (returns immediately)
      const instance = await c.env.VEHICLE_EMBEDDING_WORKFLOW.create({
        params,
      });

      return c.json({
        success: true,
        message: "Vehicle embedding process started",
        workflowId: instance.id,
        status: "View status at /initialize/status/" + instance.id,
      });
    } catch (error) {
      console.log("Error starting workflow:", error);
      return c.json(
        {
          error: "Internal Server Error",
        },
        500,
      );
    }
  },
);

// Direct initialization (for local development / testing)
app.post("/initialize-direct", async (c) => {
  try {
    const { results: vehicles } = await c.env.DB.prepare(
      `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay FROM cars`,
    ).all<Vehicle>();

    if (!vehicles || vehicles.length === 0) {
      return c.json({ error: "No vehicles found in database" }, 404);
    }
    console.log(`Fetched ${vehicles.length} vehicles from database.`);
    // Generate embeddings
    const embeddingPromises = vehicles.map(async (vehicle) => {
      const vehicleText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}: ${vehicle.description || "No description"}. ${vehicle.fuelType} ${vehicle.transmission} with ${vehicle.seats} seats at Rs.${vehicle.pricePerDay}/day`;

      const result: any = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: vehicleText,
      });
      console.log("Embedding result for vehicle", vehicle.id, result);
      if (result.data && result.data[0]) {
        return {
          id: vehicle.id.toString(),
          values: result.data[0],
          metadata: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            pricePerDay: vehicle.pricePerDay,
          },
        };
      }

      throw new Error(`Failed to generate embedding for vehicle ${vehicle.id}`);
    });

    const embeddings = await Promise.all(embeddingPromises);
    console.log(`Generated embeddings for ${embeddings.length} vehicles.`);
    // Upsert to Vectorize
    const upsertResult = await c.env.VECTORIZE.upsert(embeddings);
    console.log("Upsert result:", upsertResult);
    return c.json({
      success: true,
      message: "Initialization complete",
      count: embeddings.length,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
      })),
    });
  } catch (error) {
    console.error("Direct initialization failed:", error);
    return c.json(
      {
        error: "Initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
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
    const s = await instance.status();

    return c.json({
      id: instance.id,
      status: s,
      // Add more status details as needed
    });
  } catch (error) {
    return c.json(
      {
        error: "Failed to get workflow status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
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
      const queryEmbeddings = (await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: message,
      })) as {
        shape?: number[];
        data?: number[][];
        pooling?: "mean" | "cls";
      };
      if (!queryEmbeddings.data || !queryEmbeddings.data[0]) {
        console.log("Failed to get query embeddings");
        return c.json({ error: "Internal Server Error" }, 500);
      }

      const queryVector = queryEmbeddings.data[0];

      // Search for similar vehicles in the vector database
      const searchResults = await c.env.VECTORIZE.query(queryVector, {
        topK: 3,
        returnMetadata: true,
      });
      console.log("Vector search results:", searchResults);
      // Get full vehicle details from D1 database
      const vehicleIds =
        searchResults.matches
          //@ts-ignore
          ?.filter((match) => match.score && match.score > 0.71)
          //@ts-ignore
          .map((match) => match.id) || [];

      let relevantVehicles: Vehicle[] = [];

      if (vehicleIds.length > 0) {
        const placeholders = vehicleIds.map(() => "?").join(",");
        const { results } = await c.env.DB.prepare(
          `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay 
           FROM cars 
           WHERE id IN (${placeholders})`,
        )
          .bind(...vehicleIds)
          .all<Vehicle>();

        if (results) {
          relevantVehicles = results;
        }
      }
      console.log("Relevant vehicles from vector search:", relevantVehicles);

      // Fallback: If vector search didn't find anything, try keyword search
      if (relevantVehicles.length === 0) {
        const lowerMessage = message.toLowerCase();
        let whereClause = "";

        // Priority 1: Check for fuel types (most specific)
        if (
          lowerMessage.includes("electric") ||
          lowerMessage.match(/\bev\b/) ||
          lowerMessage.includes("tesla")
        ) {
          whereClause = "fuel_type LIKE '%electric%'";
        } else if (lowerMessage.includes("diesel")) {
          whereClause = "fuel_type LIKE '%diesel%'";
        } else if (
          lowerMessage.includes("petrol") ||
          lowerMessage.includes("gasoline")
        ) {
          whereClause = "fuel_type LIKE '%petrol%'";
        }
        // Priority 2: Check for brands
        else if (lowerMessage.includes("bmw")) {
          whereClause = "brand LIKE '%bmw%'";
        } else if (lowerMessage.includes("toyota")) {
          whereClause = "brand LIKE '%toyota%'";
        } else if (lowerMessage.includes("honda")) {
          whereClause = "brand LIKE '%honda%'";
        } else if (lowerMessage.includes("ford")) {
          whereClause = "brand LIKE '%ford%'";
        } else if (lowerMessage.includes("chevrolet")) {
          whereClause = "brand LIKE '%chevrolet%'";
        } else if (lowerMessage.includes("mazda")) {
          whereClause = "brand LIKE '%mazda%'";
        }
        // Priority 3: Check for vehicle types
        else if (lowerMessage.includes("suv")) {
          whereClause =
            "(description LIKE '%SUV%' OR model LIKE '%SUV%' OR model LIKE '%cr-v%' OR model LIKE '%cx-%')";
        } else if (lowerMessage.includes("sedan")) {
          whereClause = "(description LIKE '%sedan%')";
        } else if (
          lowerMessage.includes("truck") ||
          lowerMessage.includes("pickup")
        ) {
          whereClause =
            "(description LIKE '%truck%' OR description LIKE '%pickup%' OR model LIKE '%f-150%')";
        }

        if (whereClause) {
          const { results } = await c.env.DB.prepare(
            `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay 
             FROM cars 
             WHERE ${whereClause}
             LIMIT 10`,
          ).all<Vehicle>();

          if (results && results.length > 0) {
            relevantVehicles = results;
          }
        }
      }

      // Build context from relevant vehicles
      let contextMessage = "";
      if (relevantVehicles.length > 0) {
        contextMessage = `=== COMPLETE VEHICLE INVENTORY (ONLY THESE EXIST) ===\n\n`;
        relevantVehicles.forEach((vehicle, index) => {
          contextMessage += `Vehicle ${index + 1}:\n`;
          contextMessage += `- EXACT Brand: ${vehicle.brand.toUpperCase()}\n`;
          contextMessage += `- EXACT Model: ${vehicle.model.toUpperCase()}\n`;
          contextMessage += `- EXACT Year: ${vehicle.year}\n`;
          contextMessage += `- EXACT Price: Rs. ${vehicle.pricePerDay}/day\n`;
          contextMessage += `- Fuel: ${vehicle.fuelType}\n`;
          contextMessage += `- Transmission: ${vehicle.transmission}\n`;
          contextMessage += `- Seats: ${vehicle.seats} Seats\n`;
          contextMessage += `- Description: ${vehicle.description || "No description"}\n\n`;
        });
        contextMessage += `=== END OF INVENTORY ===\n`;
        contextMessage += `\nYou MUST respond with recommendations using ONLY the vehicles listed above.\n`;
        contextMessage += `Copy the EXACT brand, model, year, and price. Do NOT change any numbers or models.\n`;
        contextMessage += `If you mention a vehicle, it MUST be copied word-for-word from the list above.`;
      } else {
        contextMessage = `NO MATCHING VEHICLES FOUND IN DATABASE.\nYou MUST tell the user we don't have vehicles matching their criteria and ask them to adjust their requirements.`;
      }

      const systemPrompt = `You are a vehicle rental assistant with access to a limited inventory.

🚫 ABSOLUTE RESTRICTIONS:
- Your ENTIRE inventory is listed in the next message
- You CANNOT recommend ANY vehicle not in that list
- You CANNOT recommend ANY vehicle not related to the latest content with role as user even if present in the list 
- You CANNOT recomend ANY vehichle not asked by user. (For example if user asks for Ford car only recomend ford car)
- You MUST copy vehicle details EXACTLY (brand, model, year, price)
- DO NOT invent models like "X3", "X5", "320i" - only use models from the list
- DO NOT change prices - use EXACT prices from the list
- DO NOT change years - use EXACT years from the list

✅ CORRECT Example:
List shows: "BMW m3 (2023) - Rs. 5000/day"
Your response: "BMW M3 (2023) for Rs. 5000 per day"

❌ WRONG Example:
List shows: "BMW m3 (2023) - Rs. 5000/day"
Your response: "BMW X3 (2020) for $120/day" ← This is FORBIDDEN

When recommending, copy from the list EXACTLY.`;

      interface Message {
        role: "system" | "user" | "assistant";
        content: string;
      }

      const messages: Message[] = [{ role: "system", content: systemPrompt }];

      if (contextMessage) {
        messages.push({ role: "system", content: contextMessage });
      }

      conversationHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });

      messages.push({ role: "user", content: message });
      console.log(messages);
      // Generate response using Workers AI
      const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages,
      });

      // POST-PROCESS: Remove any hallucinated content by ensuring only our vehicles are mentioned
      let finalResponse = aiResponse.response || "";

      // If we have relevant vehicles, append a structured list to prevent hallucinations
      if (relevantVehicles.length > 0) {
        finalResponse = `Based on your requirements, here are the available vehicles:\n\n`;

        relevantVehicles.forEach((vehicle, index) => {
          finalResponse +=
            `${index + 1}. ${vehicle.brand.toUpperCase()} ${vehicle.model.toUpperCase()} (${vehicle.year})` +
            "";
          finalResponse += `   - Price: Rs. ${vehicle.pricePerDay}/day\n`;
          finalResponse += `   - Seats: ${vehicle.seats} passengers\n`;
          finalResponse += `   - Transmission: ${vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1)}\n`;
          finalResponse += `   - Fuel Type: ${vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}\n`;
          if (vehicle.description) {
            finalResponse += `   - ${vehicle.description}\n`;
          }
          finalResponse += `\n`;
        });

        finalResponse += `These are all the available options in our current inventory. Would you like to know more about any of these vehicles?`;
      }

      return c.json({
        response: finalResponse,
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
    try {
      const { vehicleIds } = event.payload;
      // Step 1: Fetch vehicles from database
      const vehicles = await step.do("fetch-vehicles", async () => {
        try {
          let query = `SELECT id, brand, model, year, description, fuel_type as fuelType, transmission, seats, price_per_day as pricePerDay FROM cars`;
          let params: number[] = [];

          if (vehicleIds && vehicleIds.length > 0) {
            const placeholders = vehicleIds.map(() => "?").join(",");
            query += ` WHERE id IN (${placeholders})`;
            params = vehicleIds;
          }

          const { results } = await this.env.DB.prepare(query)
            .bind(...params)
            .all<Vehicle>();

          if (!results || results.length === 0) {
            throw new Error("No vehicles found in database");
          }

          return results;
        } catch (error) {
          console.error("Step 1 failed:", error);
          throw error;
        }
      });

      // Step 2: Generate embeddings for each vehicle
      const embeddings = await step.do("generate-embeddings", async () => {
        try {
          const embeddingPromises = vehicles.map(async (vehicle) => {
            const vehicleText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}: ${vehicle.description || "No description"}. ${vehicle.fuelType} ${vehicle.transmission} with ${vehicle.seats} seats at $${vehicle.pricePerDay}/day`;

            const result: any = await this.env.AI.run(
              "@cf/baai/bge-base-en-v1.5",
              {
                text: vehicleText,
              },
            );

            if (result.data && result.data[0]) {
              return {
                id: vehicle.id.toString(),
                values: result.data[0],
                metadata: {
                  brand: vehicle.brand,
                  model: vehicle.model,
                  year: vehicle.year,
                  pricePerDay: vehicle.pricePerDay,
                },
              };
            }

            throw new Error(
              `Failed to generate embedding for vehicle ${vehicle.id}`,
            );
          });

          const results = await Promise.all(embeddingPromises);
          return results;
        } catch (error) {
          console.error("Step 2 failed:", error);
          throw error;
        }
      });

      // Step 3: Upsert vectors to Vectorize
      const result = await step.do("upsert-vectors", async () => {
        try {
          await this.env.VECTORIZE.upsert(embeddings);

          return {
            success: true,
            count: embeddings.length,
            vehicleIds: embeddings.map((e) => e.id),
          };
        } catch (error) {
          console.error("Step 3 failed:", error);
          throw error;
        }
      });

      return result;
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }
  }
}

export default app;
