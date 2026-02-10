window.AgriKnowledge = {
    marketPrices: {
        lastUpdated: "2026-02-09",
        data: [
            { crop: "Wheat", state: "Punjab", price: 2450, unit: "INR/Quintal", trend: "Stable" },
            { crop: "Wheat", state: "Haryana", price: 2465, unit: "INR/Quintal", trend: "Up" },
            { crop: "Rice (Basmati)", state: "Punjab", price: 4200, unit: "INR/Quintal", trend: "Up" },
            { crop: "Rice (Common)", state: "West Bengal", price: 2100, unit: "INR/Quintal", trend: "Stable" },
            { crop: "Cotton", state: "Gujarat", price: 6800, unit: "INR/Quintal", trend: "Down" },
            { crop: "Cotton", state: "Maharashtra", price: 6750, unit: "INR/Quintal", trend: "Stable" },
            { crop: "Sugarcane", state: "Uttar Pradesh", price: 380, unit: "INR/Quintal", trend: "Up" },
            { crop: "Maize", state: "Bihar", price: 2250, unit: "INR/Quintal", trend: "Up" },
            { crop: "Soybean", state: "Madhya Pradesh", price: 4900, unit: "INR/Quintal", trend: "Down" },
            { crop: "Mustard", state: "Rajasthan", price: 5600, unit: "INR/Quintal", trend: "Stable" },
            { crop: "Onion", state: "Maharashtra (Lasalgaon)", price: 1800, unit: "INR/Quintal", trend: "Volatile" },
            { crop: "Potato", state: "Uttar Pradesh", price: 950, unit: "INR/Quintal", trend: "Down" },
            { crop: "Tomato", state: "Karnataka", price: 1200, unit: "INR/Quintal", trend: "Up" }
        ]
    },
    govSchemes: [
        {
            name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            benefit: "₹6,000 per year income support in 3 installments.",
            eligibility: "All landholding farmer families.",
            status: "Active (2026)",
            application: "Online via PM-KISAN portal or CSCs."
        },
        {
            name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            benefit: "Crop insurance against non-preventable natural risks. Premium: 2% (Kharif), 1.5% (Rabi), 5% (Commercial/Horticulture).",
            eligibility: "Farmers with insurable interest in the crop.",
            status: "Active (Revamped 2025)",
            updates: "Faster claim settlement via AI/Drone assessment."
        },
        {
            name: "Kisan Credit Card (KCC)",
            benefit: "Short-term credit for crops at 4% interest (with subvention). Limit up to ₹3 Lakh without collateral (enhanced in 2026).",
            status: "Active",
            updates: "Digital KCC rollout completed in 2025."
        },
        {
            name: "PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)",
            benefit: "Subsidy for solar pumps and grid-connected solar power plants. Up to 60% subsidy.",
            objective: "Energy security and de-dieselization of farm sector.",
            status: "Active (Phase III)"
        },
        {
            name: "Agriculture Infrastructure Fund (AIF)",
            benefit: "Financing facility for post-harvest management infrastructure. 3% interest subvention up to ₹2 Crore loan.",
            eligibility: "Farmers, FPOs, PACS, Startups.",
            status: "Active until 2032-33"
        }
    ],
    budget2026: {
        highlights: [
            "Increased MSP (Minimum Support Price) for all major crops by 1.5x of production cost confirmed.",
            "₹2.5 Lakh Crore allocated for rural infrastructure development.",
            "Launch of 'Agri-Stack' digital public infrastructure for farmer services.",
            "Special focus on 'Natural Farming' with a mission mode support for 2 crore farmers.",
            "Drone Didi Scheme expanded: 50,000 more drones for women SHGs for fertilizer spraying.",
            "Credit target for agriculture sector raised to ₹25 Lakh Crore.",
            "New 'Oilseeds Mission' to reduce import dependency designated ₹15,000 Crore.",
            "Tax incentives for Agri-Tech startups extended for 3 more years."
        ],
        impact: "Focus implies a shift towards tech-integration (Drones, AI) and sustainability (Natural Farming) while ensuring price stability via MSP."
    },
    cropCalendar: {
        'Wheat': { sowing: "Nov-Dec", harvest: "Mar-Apr", seasons: ["Rabi"] },
        'Rice': { sowing: "Jun-Jul", harvest: "Oct-Nov", seasons: ["Kharif"] },
        'Cotton': { sowing: "May-Jun", harvest: "Oct-Feb", seasons: ["Kharif"] },
        'Maize': { sowing: "Jun-Jul", harvest: "Sep-Oct", seasons: ["Kharif", "Rabi"] },
        'Soybean': { sowing: "Jun-Jul", harvest: "Sep-Oct", seasons: ["Kharif"] },
        'Mustard': { sowing: "Oct-Nov", harvest: "Feb-Mar", seasons: ["Rabi"] },
        'Sugarcane': { sowing: "Oct-Mar", harvest: "Dec-Mar", seasons: ["Year-round"] },
        'Tomato': { sowing: "Aug-Sep", harvest: "Dec-Jan", seasons: ["Rabi", "Kharif"] },
        'Potato': { sowing: "Oct-Nov", harvest: "Feb-Mar", seasons: ["Rabi"] },
        'Onion': { sowing: "Oct-Nov", harvest: "Mar-Apr", seasons: ["Rabi", "Kharif"] }
    }
};