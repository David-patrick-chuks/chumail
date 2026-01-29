import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { generateContent } from './ai/geminiService.js';

interface ScrapedLead {
    email: string;
    name?: string;
    role?: string;
    source: string;
    context?: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const scrapeWebsite = async (targetUrl: string): Promise<ScrapedLead[]> => {
    try {
        logger.info(`Starting scrape for: ${targetUrl}`);

        // Ensure URL has protocol
        const url = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
        const domain = new URL(url).hostname;

        // 1. Fetch main page
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const leads: Map<string, ScrapedLead> = new Map();

        // 2. Discover potential contact pages
        const secondaryLinks: string[] = [];
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && (href.toLowerCase().includes('contact') || href.toLowerCase().includes('about') || href.toLowerCase().includes('team'))) {
                const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).toString();
                if (absoluteUrl.includes(domain) && !secondaryLinks.includes(absoluteUrl)) {
                    secondaryLinks.push(absoluteUrl);
                }
            }
        });

        // 3. Extract from main page
        extractFromHtml(response.data, url, leads);

        // 4. Extract from contact pages (limit to 3 more)
        for (const link of secondaryLinks.slice(0, 3)) {
            try {
                const res = await axios.get(link, { timeout: 5000 });
                extractFromHtml(res.data, link, leads);
            } catch (e) {
                logger.warn(`Failed to scrape secondary link ${link}`);
            }
        }

        const foundLeads = Array.from(leads.values());

        // 5. AI Enrichment for the found leads
        if (foundLeads.length > 0) {
            const enrichedLeads = await enrichLeadsWithAI(foundLeads);
            return enrichedLeads;
        }

        return foundLeads;
    } catch (error: any) {
        logger.error(`Scraping failed for ${targetUrl}: ${error.message}`);
        throw new Error(`Failed to scrape website: ${error.message}`);
    }
};

const extractFromHtml = (html: string, source: string, leads: Map<string, ScrapedLead>) => {
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $('script, style').remove();
    const text = $('body').text();

    const matches = text.match(EMAIL_REGEX);
    if (!matches) return;

    matches.forEach(email => {
        const emailLower = email.toLowerCase();
        if (!leads.has(emailLower)) {
            // Find context (surrounding text)
            const index = text.indexOf(email);
            const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 150)).replace(/\s+/g, ' ').trim();

            leads.set(emailLower, {
                email: emailLower,
                source,
                context
            });
        }
    });
};

const enrichLeadsWithAI = async (leads: ScrapedLead[]): Promise<ScrapedLead[]> => {
    try {
        const leadData = leads.map(l => ({ email: l.email, context: l.context }));

        const prompt = `
        I have scraped the following emails and their surrounding text context from a website. 
        Please identify the Person's Name and their Job Role/Title for each email where possible.
        Return the result as a JSON array of objects with keys: "email", "name", "role".
        If you can't find a name or role, use null for those fields.

        Data:
        ${JSON.stringify(leadData)}
        `;

        const aiResponse = await generateContent(prompt);
        // Clean up markdown code blocks if present
        const jsonStr = aiResponse.replace(/```json|```/g, '').trim();
        const enriched = JSON.parse(jsonStr);

        return leads.map(lead => {
            const data = enriched.find((e: any) => e.email === lead.email);
            return {
                ...lead,
                name: data?.name || null,
                role: data?.role || null
            };
        });
    } catch (error) {
        logger.error('AI lead enrichment failed, returning raw leads');
        return leads;
    }
};
