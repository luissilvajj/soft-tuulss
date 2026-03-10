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

    // Replace explicit white text with semantic text-heading (adapts to light/dark)
    content = content.replace(/text-\[var\(--color-white\)\]/g, 'text-text-heading');
    
    // Sometimes text-white is explicit but we want it to adapt unless it's on a brand color
    // For primary buttons (which are now gold), text-white is fine.
    
    // Replace text-secondary variables
    content = content.replace(/text-\[var\(--color-text-secondary\)\]/g, 'text-text-secondary');
    
    // Replace surface colors
    content = content.replace(/bg-\[var\(--color-bg-subtle\)\]/g, 'bg-surface-subtle');
    content = content.replace(/border-\[var\(--color-border-subtle\)\]/g, 'border-surface-border');
    
    // Replace bg-dark in buttons: `text-[var(--color-bg-dark)]` -> `text-surface-ground`
    content = content.replace(/text-\[var\(--color-bg-dark\)\]/g, 'text-surface-ground');
    
    // Replace `bg-[var(--color-white)]` -> `bg-text-heading`
    content = content.replace(/bg-\[var\(--color-white\)\]/g, 'bg-text-heading');
    
    // Replace `var(--glass-bg)` -> `bg-surface-ground/80`
    content = content.replace(/bg-\[var\(--glass-bg\)\]/g, 'bg-surface-ground/80');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Semantic colors finalized: ' + f);
});
