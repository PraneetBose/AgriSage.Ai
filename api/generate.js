
export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const payload = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: { message: "Server configuration error: Missing API Key." } }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Multi-Model Fallback Logic (Server-Side)
        const models = ['gemma-3-27b-it', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        let lastError = null;

        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        console.warn(`[Server AI] ${model} rate limited.`);
                        continue;
                    }
                    throw new Error(`Upstream API Error: ${response.status}`);
                }

                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    return new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                throw new Error("No candidates returned from upstream");

            } catch (e) {
                console.warn(`[Server AI] ${model} failed:`, e);
                lastError = e;
            }
        }

        throw lastError || new Error("All AI models failed.");

    } catch (error) {
        return new Response(JSON.stringify({ error: { message: error.message || "Internal Server Error" } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
