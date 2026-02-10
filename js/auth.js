document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleLinks = document.querySelectorAll('.toggle-auth');
    const authMessage = document.getElementById('auth-message');
    if (toggleLinks.length> 0) {
        toggleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const loginContainer = document.getElementById('login-container');
                const signupContainer = document.getElementById('signup-container');
                if (loginContainer && signupContainer) {
                    const isLoginVisible = !loginContainer.classList.contains('hidden');
                    if (isLoginVisible) {
                        loginContainer.classList.add('hidden');
                        signupContainer.classList.remove('hidden');
                    } else {
                        signupContainer.classList.add('hidden');
                        loginContainer.classList.remove('hidden');
                    }
                    if (authMessage) {
                        authMessage.textContent='';
                        authMessage.className='hidden';
                    }
                }
            });
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('[name="email"]').value;
            const password = loginForm.querySelector('[name="password"]').value;
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;
            if (authMessage) {
                authMessage.textContent='';
                authMessage.className='hidden';
            }
            btn.textContent="Logging in...";
            btn.disabled = true;
            try {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                const { data: profile, error: profileError } = await window.supabaseClient
                    .from('profiles')
                    .select('primary_crop, full_name')
                    .eq('id', data.user.id)
                    .single();
                if (profileError && profileError.code === 'PGRST116') {
                    await window.supabaseClient
                        .from('profiles')
                        .upsert([{
                            id: data.user.id,
                            email: email,
                            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
                            role: 'Farmer',
                            role_title: 'Estate Manager'
                        }], { onConflict: 'id' });
                    window.location.href='onboarding.html';
                    return;
                }
                await notifyLogin(data.user);
                window.location.href='dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                if (authMessage) {
                    authMessage.textContent = error.message || 'Login failed. Please check your credentials.';
                    authMessage.className='error';
                }
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signupForm.email.value;
            const password = signupForm.password.value;
            const fullName = signupForm.fullName ? signupForm.fullName.value : signupForm.querySelector('[name="fullName"]').value;
            const btn = signupForm.querySelector('button');
            const originalText = btn.textContent;
            if (authMessage) {
                authMessage.textContent='';
                authMessage.className='hidden';
            }
            btn.textContent="Creating Account...";
            btn.disabled = true;
            try {
                const { data, error } = await window.supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });
                if (error) throw error;
                if (data.user && !data.session) {
                    if (authMessage) {
                        authMessage.innerHTML = `Account created! Please check ${email} for confirmation link.`;
                        authMessage.className='success';
                    }
                    btn.textContent = originalText;
                    btn.disabled = false;
                    return;
                }
                if (data.session && data.user) {
                    const { data: existingProfile } = await window.supabaseClient
                        .from('profiles')
                        .select('id, full_name, primary_crop')
                        .eq('id', data.user.id)
                        .single();
                    if (existingProfile && existingProfile.primary_crop) {
                        if (authMessage) {
                            authMessage.textContent='Account already exists. Logging you in...';
                            authMessage.className='success';
                        }
                        setTimeout(() => {
                            window.location.href='dashboard.html';
                        }, 800);
                        return;
                    }
                    const { error: profileError } = await window.supabaseClient
                        .from('profiles')
                        .upsert([
                            {
                                id: data.user.id,
                                full_name: fullName,
                                email: email,
                                role: 'Farmer',
                                role_title: 'Estate Manager',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }
                        ], { onConflict: 'id' });
                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                    }
                    if (authMessage) {
                        authMessage.textContent='Account created! Redirecting to onboarding...';
                        authMessage.className='success';
                    }
                    setTimeout(() => {
                        window.location.href='onboarding.html';
                    }, 800);
                }
            } catch (error) {
                console.error('Signup error:', error);
                if (authMessage) {
                    authMessage.textContent = error.message || 'Signup failed. Please try again.';
                    authMessage.className='error';
                }
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});
async function notifyLogin(user) {
    try {
        const timestamp = new Date().toLocaleString();
        console.log(`Login notification for ${user.email} at ${timestamp}`);
        const { data, error } = await window.supabaseClient.functions.invoke('login-notification', {
            body: {
                email: user.email,
                timestamp: timestamp
            }
        });
        if (error) throw error;
    } catch (err) {
        console.warn("Login notification skipped/failed:", err.message);
    }
}
window.signInWithGoogle = async () => {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Google Sign-in Error:', error);
        alert('Google Sign-in failed: ' + error.message);
    }
};
window.signInWithApple = async () => {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Apple Sign-in Error:', error);
        alert('Apple Sign-in failed: ' + error.message);
    }
};