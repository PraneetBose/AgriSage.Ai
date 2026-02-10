window.openSathiManager = async function () {
    const modal = document.getElementById('sathi-modal');
    modal.style.display = 'flex';
    const content = document.getElementById('sathi-content');
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-dna fa-spin" style="font-size: 3rem; color: #6a11cb; margin-bottom: 1rem;"></i>
            <p>Gathering farm data...</p>
        </div>
    `;
    const revenue = document.getElementById('res-revenue')?.textContent || "0";
    const cost = document.getElementById('res-cost')?.textContent || "0";
    const profit = document.getElementById('res-profit')?.textContent || "0";
    const context = typeof window.getDashboardContext === 'function' ? await window.getDashboardContext() : "No context available.";
    const prompt = `
    ACT AS a High-Level Financial Strategic Advisor for Farmers named "AgriSathi Manager".
    
    SYSTEM CONTEXT:
    ${context}
    
    TASK:
    Perform a "Strategic Revenue & Scaling Analysis".
    1. **Financial Health**: Analyze current revenue vs costs. If data is sparse, explain how to improve tracking.
    2. **Short-Term ROI**: Provide 3 specific steps to increase this season's profit (e.g., market timing, input cost reduction).
    3. **5-Year Scaling Vision**: Suggest long-term strategies like intercropping, livestock integration, or moving to high-value cash crops.
    4. **Risk Mitigation**: Advice on crop insurance or diversification based on the current farm profile.
    
    FORMAT:
    - Use HTML tags for formatting (<b>, <ul>, <li>).
    - No markdown.
    - Be visionary, encouraging, and data-driven.
    - Keep it under 250 words.
    `;
    try {
        const GEMINI_API_KEY = "AIzaSyB-IG24MNJU8fVglcFwVd0YTDLTTIcK17s";
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-microchip fa-pulse" style="font-size: 3rem; color: #6a11cb; margin-bottom: 1rem;"></i>
                <p>Running deep algorithms on crop cycles...</p>
            </div>
        `;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        const data = await response.json();
        const aiResponse = (data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights found. Please try again later.").replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        content.innerHTML = `
            <div style="animation: fadeIn 0.5s;">
                <h4 style="color: #00e676; margin-bottom: 1rem;"><i class="fas fa-check-circle"></i> Analysis Complete</h4>
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border-left: 3px solid #6a11cb;">
                    ${aiResponse.replace(/\*\*/g, '<b>').replace(/\*/g, '').replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p style="color: #ff4444;">Analysis Failed: ${e.message}</p>`;
    }
};
window.closeSathiModal = function () {
    document.getElementById('sathi-modal').style.display = 'none';
};
window.sendSathiMessage = async function () {
    const input = document.getElementById('sathi-input');
    const msg = input.value;
    if (!msg) return;
    const content = document.getElementById('sathi-content');
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
        const GEMINI_API_KEY = "AIzaSyB-IG24MNJU8fVglcFwVd0YTDLTTIcK17s";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Context: Previous analysis on farm revenue.\nUser Question: " + msg }]
                }]
            })
        });
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
        document.getElementById(loadingId).remove();
        content.innerHTML += `
            <div style="margin: 1rem 0; text-align: left; animation: slideIn 0.3s;">
                <div style="background: rgba(106, 17, 203, 0.2); padding: 10px 15px; border-radius: 15px 15px 15px 0; display: inline-block; border: 1px solid rgba(106, 17, 203, 0.3);">
                    ${reply.replace(/\*\*/g, '<b>').replace(/\*/g, '').replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        content.scrollTop = content.scrollHeight;
    } catch (e) {
        document.getElementById(loadingId).innerText = "Error.";
    }
};
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);