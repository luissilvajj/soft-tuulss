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

    // Color and gradients -> primary-500 based
    content = content.replace(/from-\[var\(--color-accent-blue\)\]/g, 'from-primary-600');
    content = content.replace(/to-\[var\(--color-accent-violet\)\]/g, 'to-primary-400');
    
    // Backgrounds
    content = content.replace(/bg-\[var\(--color-accent-blue\)\]/g, 'bg-primary-500');
    content = content.replace(/bg-\[var\(--color-accent-violet\)\]/g, 'bg-primary-500');
    content = content.replace(/bg-\[var\(--color-accent-green\)\]/g, 'bg-status-success');
    content = content.replace(/bg-\[var\(--color-bg-dark\)\]/g, 'bg-surface-subtle');
    
    // Text colors
    content = content.replace(/text-\[var\(--color-accent-blue\)\]/g, 'text-primary-500');
    content = content.replace(/text-\[var\(--color-accent-violet\)\]/g, 'text-primary-600');
    content = content.replace(/text-\[var\(--color-accent-green\)\]/g, 'text-status-success');

    // Shadows
    content = content.replace(/shadow-indigo-500/g, 'shadow-primary-500');
    content = content.replace(/shadow-purple-500/g, 'shadow-primary-500');
    content = content.replace(/shadow-\[0_0_30px_rgba\(0,113,227,0\.15\)\]/g, 'shadow-[0_0_30px_rgba(234,179,8,0.15)]');
    content = content.replace(/shadow-\[0_0_15px_rgba\(0,113,227,0\.5\)\]/g, 'shadow-[0_0_15px_rgba(234,179,8,0.5)]');

    // Border colors
    content = content.replace(/border-\[var\(--color-accent-blue\)\]/g, 'border-primary-500');
    content = content.replace(/border-\[var\(--color-accent-violet\)\]/g, 'border-primary-400');

    // Custom hover hex colors (like hover:bg-[#0077ED])
    content = content.replace(/hover:bg-\[\#0077ED\]/g, 'hover:bg-primary-500');

    // Remove text-gradient class which is old and likely defines a violet-blue gradient manually
    content = content.replace(/text-gradient/g, 'text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400');

    // Form inputs and rings
    content = content.replace(/ring-\[var\(--color-accent-blue\)\]/g, 'ring-primary-500');
    content = content.replace(/focus:ring-\[var\(--color-accent-blue\)\]/g, 'focus:ring-primary-500');

    // Replace gradient hovers
    content = content.replace(/hover:from-indigo-500 hover:to-purple-600/g, 'hover:from-primary-500 hover:to-primary-500');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Refactored: ' + f);
});
