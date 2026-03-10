const fs = require('fs');
const files = [
    'pages/index.vue', 
    'pages/login.vue', 
    'pages/signup.vue', 
    'pages/forgot-password.vue', 
    'pages/onboarding.vue'
];

files.forEach(f => {
    if(!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');

    // 1. Fix broken gradient text (In light mode from-primary-600 to-primary-400 is not well contrasted if the background is also light/white. We need it slightly darker, or we drop the text-transparent).
    // Let's change the gradient text to just be primary-600 in light mode and primary-400 in dark mode.
    content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400/g, 'text-primary-600 dark:text-primary-400');
    content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-400/g, 'text-primary-600 dark:text-primary-400');

    // 2. Fix the "Ver Planes Ahora" button (which was text-surface-ground bg-text-heading). It should be a solid primary button instead. 
    content = content.replace(/bg-text-heading text-surface-ground/g, 'bg-primary-600 text-white hover:bg-primary-700');
    
    // 3. Fix Mockup headers that have "bg-[var(--color-bg-subtle)]" -> now it's "bg-surface-subtle" which in Light Mode is #f1f5f9 (very light). For mockups we want it to be distinct.
    content = content.replace(/bg-surface-subtle\/50/g, 'bg-surface-border/50');
    content = content.replace(/bg-surface-subtle\/30/g, 'bg-surface-border/30');

    // 4. Logo stroke opacity issue
    content = content.replace(/text-white/g, 'text-white'); // Leave white icons inside solid primary blocks

    // 5. Ensure the main background is clean
    // The wrapper `bg-surface-subtle text-text-heading` is correct, but let's make sure it transitions smoothly.

    fs.writeFileSync(f, content, 'utf8');
    console.log('Light Mode contrasts patched: ' + f);
});
