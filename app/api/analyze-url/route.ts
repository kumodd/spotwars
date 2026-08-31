import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 2. Ensure URL has a protocol
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // 3. Fetch the website HTML
    let html = "";
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(12000), // 12 second timeout
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      html = await response.text();
    } catch (e: any) {
      console.warn("Fetch URL Warning (falling back to URL-only inference):", e.message);
      // We don't return 400 here; we let html remain "" so OpenAI can guess from the URL alone
    }

    // 4. Parse with Cheerio
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, noscript, etc to get clean text
    $("script, style, noscript, iframe, img, svg").remove();
    
    const title = $("title").text().trim() || $("meta[property='og:title']").attr("content") || "";
    const metaDescription = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    
    // Get body text, normalize whitespace, limit to 3000 chars to save tokens
    const bodyText = $("body").text().replace(/\s+/g, " ").trim().substring(0, 3000);

    // 5. Call OpenAI to extract and summarize
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is missing. Please configure it in .env.local" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are an expert product marketer and directory curator. 
Your task is to analyze the provided website metadata and text content to extract information for a product directory listing.
You MUST respond with valid JSON matching this schema:
{
  "name": "The name of the product/company",
  "tagline": "A short, punchy tagline (max 10 words)",
  "description": "A clear, engaging description of what the product does (max 250 characters)",
  "category": "Must be exactly one of: 'global', 'ai-ml', 'saas', 'dev-tools', 'ecommerce', 'fintech', 'education', 'consumer-apps', 'creator-tools'",
  "tags": "A comma-separated string of 3-5 relevant tags (e.g. 'productivity, ai, startup')"
}`;

    const userPrompt = `URL: ${targetUrl}
Title: ${title}
Meta Description: ${metaDescription}

Body Text Snippet:
${bodyText}

Analyze this and output the JSON.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedData = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      data: {
        name: parsedData.name || "",
        tagline: parsedData.tagline || "",
        description: parsedData.description || "",
        category: parsedData.category || "",
        tags: parsedData.tags || "",
      }
    });

  } catch (error: any) {
    console.error("Analyze URL error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze URL" }, { status: 500 });
  }
}
