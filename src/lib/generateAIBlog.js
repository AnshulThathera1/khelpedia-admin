import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export async function generateAIBlog() {
    // Initialize API clients
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const parser = new Parser();

    // Fetch latest esports news (We use vlr.gg or a general esports feed)
    const feed = await parser.parseURL('https://www.vlr.gg/rss');
    
    if (!feed.items || feed.items.length === 0) {
        throw new Error("No news items found in RSS feed.");
    }

    // Pick the top recent article that we haven't processed (for simplicity, we take the newest)
    const topStory = feed.items[0];

    // Use Gemini to rewrite the article
    const prompt = `
    You are an expert esports journalist writing for KhelPediA.
    Please rewrite the following news story into an engaging, completely original blog post.
    Avoid plagiarism. Write in a professional yet exciting tone.
    
    Original Title: ${topStory.title}
    Original Content / Snippet: ${topStory.contentSnippet || topStory.content}
    Original Link: ${topStory.link}

    Format your response as a JSON object with the following keys:
    - "title": A catchy, SEO-optimized title for the article.
    - "excerpt": A 2-3 sentence summary of the article.
    - "content": The full rewritten HTML content of the article (use <h2>, <p>, etc.). DO NOT wrap the json output in markdown backticks, just output raw JSON.
    `;

    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const generatedData = JSON.parse(aiResponse.text);

    // Generate URL slug
    const slug = generatedData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now().toString().slice(-4);

    // Save to VPS PostgreSQL Database
    const { query } = await import('./db.js');

    // Fetch the first available user from profiles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData } = await supabase.auth.admin.listUsers({ perPage: 1 });
    const authorId = userData?.users?.[0]?.id || null;

    await query(`
      INSERT INTO blogs (
        title, slug, excerpt, content, author_id, 
        is_published, published_at, category, 
        created_at, updated_at, views
      )
      VALUES ($1, $2, $3, $4, $5, true, NOW(), 'news', NOW(), NOW(), 0)
    `, [
      generatedData.title,
      slug,
      generatedData.excerpt,
      generatedData.content,
      authorId,
    ]);

    // Send Discord Notification
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
        try {
            await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚨 **New AI Article Published!**\n**${generatedData.title}**\nhttps://khelpedia.vercel.app/blogs/${slug}`
                })
            });
        } catch (discordError) {
            console.error("Discord webhook failed:", discordError);
        }
    }

    return { slug };
}
