window.openGrowthAssistant = async function () {
    const modal = document.getElementById('growth-modal');
    modal.style.display = 'flex';
    const content = document.getElementById('growth-content');
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-seedling fa-spin" style="font-size: 3rem; color: #00C853; margin-bottom: 1rem;"></i>
            <p>Analyzing crop health & growth stages...</p>
        </div>
    `;
    const crop = document.getElementById('profile-crop')?.textContent || "Unknown Crop";
    const stage = document.getElementById('profile-stage')?.textContent || "Unknown Stage";
    const temp = document.getElementById('val-temp')?.textContent || "--";
    const humid = document.getElementById('val-humid')?.textContent || "--";
    const soil = document.getElementById('val-moist')?.textContent || "--";
    const context = typeof window.getDashboardContext === 'function' ? await window.getDashboardContext() : "No context available.";
    const prompt = `
    ACT AS an expert Agronomist & Growth Strategist named "AgriSage Growth Engine".
    
    SYSTEM CONTEXT:
    ${context}
    
    TASK:
    Perform a "Deep Growth & Strategic Analysis".
    1. **30-Day Outlook**: Predict vegetation health and growth milestones based on current weather trends.
    2. **Pest & Disease Risk**: Identify specific risks for this crop stage (e.g., if humid/warm) and suggest organic/chemical preventions.
    3. **Soil & Nutrition**: Suggest specific fertility optimization steps (NPK balance) based on the soil type and crop stage.
    4. **Yield Optimization**: Provide 3-4 specific, actionable STEPS to maximize yield right now.
    5. **Pro Tip**: Provide a "Climate-Smart" farming tip specific to this region/crop.
    
    FORMAT:
    - Use HTML tags for formatting (<b>, <ul>, <li>).
    - No markdown.
    - Be extremely specific, strategic, and professional.
    - Keep it under 250 words.
    `;
    try {
        const data = await window.callAIWithFallback({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

        if (!aiResponse) {
            throw new Error("AI returned empty text");
        }

        content.innerHTML = `
            <div style="animation: fadeIn 0.5s;">
                <h4 style="color: #00E676; margin-bottom: 1rem;"><i class="fas fa-clipboard-check"></i> Optimization Steps</h4>
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border-left: 3px solid #00C853; font-size: 0.95rem; line-height: 1.6;">
                    ${typeof marked !== 'undefined' ? marked.parse(aiResponse) : aiResponse.replace(/\*\*/g, '<b>').replace(/\*/g, '').replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    } catch (e) {
        console.error("Growth Logic Fatal Error:", e);
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ff5252; margin-bottom: 1rem;"></i>
                <p style="color: #ff8a80;">Could not generate insights.</p>
                <p style="font-size: 0.8rem; color: #888; margin-top: 5px;">${e.message || "Connection Issue"}</p>
                 <button onclick="window.openGrowthAssistant()" style="margin-top: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid #ff5252; color: #ff5252; padding: 8px 16px; border-radius: 20px; cursor: pointer;">Try Again</button>
            </div>
        `;
    }
};
window.closeGrowthModal = function () {
    document.getElementById('growth-modal').style.display = 'none';
};
window.sendGrowthMessage = async function () {
    const input = document.getElementById('growth-input');
    const msg = input.value;
    if (!msg) return;
    const content = document.getElementById('growth-content');
    content.innerHTML += `
        <div style="margin: 1rem 0; text-align: right;">
            <span style="background: #333; padding: 8px 15px; border-radius: 15px 15px 0 15px; display: inline-block;">${msg}</span>
        </div>
    `;
    input.value = '';
    const loadingId = 'loading-' + Date.now();
    content.innerHTML += `
        <div id="${loadingId}" style="margin: 1rem 0; text-align: left;">
            <span style="color: #bbb;"><i class="fas fa-circle-notch fa-spin"></i> Thinking...</span>
        </div>
    `;
    content.scrollTop = content.scrollHeight;
    try {
        const apiKey = window.GEMINI_API_KEY || "AIzaSyB-IG24MNJU8fVglcFwVd0YTDLTTIcK17s";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Context: Previous growth analysis.\nUser Question: " + msg + "\nAnswer in steps if applicable." }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "API Error");
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";

        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        content.innerHTML += `
            <div style="margin: 1rem 0; text-align: left; animation: slideIn 0.3s;">
                <div style="background: rgba(0, 200, 83, 0.2); padding: 10px 15px; border-radius: 15px 15px 15px 0; display: inline-block; border: 1px solid rgba(0, 200, 83, 0.3); font-size: 0.95rem; line-height: 1.5;">
                    ${typeof marked !== 'undefined' ? marked.parse(reply) : reply.replace(/\*\*/g, '<b>').replace(/\*/g, '').replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        content.scrollTop = content.scrollHeight;
    } catch (e) {
        console.error("Growth Chat Error:", e);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        content.innerHTML += `
            <div style="margin: 1rem 0; text-align: left;">
                <span style="color: #ff5252;"><i class="fas fa-exclamation-triangle"></i> Error: ${e.message}</span>
            </div>
        `;
    }
};