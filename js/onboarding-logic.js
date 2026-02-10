window.addEventListener('load', async () => {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.href='login.html';
    }
});
function selectOption(step, value) {
    let inputId;
    if (step === 1) inputId='primary_crop';
    else if (step === 2) inputId='land_size';
    else if (step === 3) inputId='farming_difficulty';
    else if (step === 4) inputId='current_stage';
    else inputId='soil_type';
    const input = document.getElementById(inputId);
    if (input) input.value = value;
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        const cards = currentStepEl.querySelectorAll('.option-card');
        cards.forEach(card => card.classList.remove('selected'));
        if (event && event.currentTarget) event.currentTarget.classList.add('selected');
    }
    const btn = document.getElementById(`btn-${step}`);
    if (btn) btn.disabled = false;
}
function nextStep(step) {
    const percentages = { 1: '20%', 2: '40%', 3: '60%', 4: '80%', 5: '100%' };
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = percentages[step] || '0%';
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');
}
function prevStep(step) {
    nextStep(step);
}
async function submitOnboarding() {
    const btn = document.getElementById('btn-5');
    if (btn) {
        btn.textContent='Saving...';
        btn.disabled = true;
    }
    const primaryCrop = document.getElementById('primary_crop').value;
    const landSize = document.getElementById('land_size').value;
    const farmingDifficulty = document.getElementById('farming_difficulty').value;
    const currentStage = document.getElementById('current_stage').value;
    const soilType = document.getElementById('soil_type').value;
    const user = (await window.supabaseClient.auth.getUser()).data.user;
    try {
        console.log('Onboarding: Starting profile & metadata sync...');

        // Critical: Use upsert to support social login users who don't have a profile yet
        const { error: profileError } = await window.supabaseClient
            .from('profiles')
            .upsert([
                {
                    id: user.id,
                    email: user.email,
                    primary_crop: primaryCrop,
                    land_size: landSize,
                    farming_difficulty: farmingDifficulty,
                    farming_stage: currentStage,
                    soil_type: soilType,
                    updated_at: new Date().toISOString()
                }
            ], { onConflict: 'id' });

        if (profileError) {
            console.warn("Profile upsert partially failed (likely schema drift):", profileError);
        }
        const { error: metaError } = await window.supabaseClient.auth.updateUser({
            data: {
                current_stage: currentStage,
                primary_crop: primaryCrop,
                land_size: landSize,
                farming_difficulty: farmingDifficulty,
                soil_type: soilType
            }
        });
        if (metaError) throw metaError;
        console.log('Profile & Metadata updated successfully');
        window.location.href='dashboard.html';
    } catch (err) {
        console.error('Onboarding save error:', err);
        alert('Error saving profile. Please try again.');
        if (btn) {
            btn.textContent='Finish';
            btn.disabled = false;
        }
    }
}