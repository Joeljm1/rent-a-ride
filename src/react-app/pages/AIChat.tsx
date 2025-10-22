import React, { useState, useRef, useEffect } from "react";
import client from "../lib/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VehicleRecommendation {
  id: number;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
}

export default function AIChat(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI vehicle assistant. Tell me about your needs - budget, passengers, trip type, or specific features - and I'll help you find the perfect vehicle! 🚗",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<VehicleRecommendation[]>([]);
  const userQueryRef = useRef<HTMLDivElement>(null);

  const scrollToQuery = () => {
    // Smooth scroll to show the user's query at the top of the viewport
    if (userQueryRef.current) {
      userQueryRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start", // Aligns to the top of the scrolling area
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    // Scroll to the user's query when messages change
    if (messages.length > 1) { // More than just the initial greeting
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToQuery();
      }, 100);
    }
  }, [messages]);

  
}
