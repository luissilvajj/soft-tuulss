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

    // 1. Revert any accidental `text-transparent bg-clip-text bg-gradient...` -> `text-primary-600 dark:text-primary-400` that left broken syntax
    // In our previous replace we did: content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400/g, 'text-primary-600 dark:text-primary-400');
    // We also need to remove `text-transparent` if it's drifting around text elements
    
    // 2. Mockup card backgrounds
    // The "phone floating mockup" has `border-[var(--color-bg-dark)] bg-[var(--color-bg-dark)]`
    content = content.replace(/border-\[var\(--color-bg-dark\)\]/g, 'border-surface-ground');
    content = content.replace(/bg-\[var\(--color-bg-dark\)\]/g, 'bg-surface-ground');

    // MOCKUP "total ventas" background 
    // `border-[var(--color-bg-subtle)]` 
    content = content.replace(/border-\[var\(--color-bg-subtle\)\]/g, 'border-surface-subtle');

    // The text on the mockup $12.4k is `text-[var(--color-white)]` which we already changed to `text-text-heading`. Good.

    // 3. Fix login/signup buttons and borders.
    // They are correctly `bg-surface-subtle text-white sm:text-sm` -> Wait! Text is white!
    // In light mode, inputs with `bg-surface-subtle text-white` will be invisible because bg-surface-subtle is #f1f5f9 (light gray).
    // So inputs need `bg-surface-subtle text-text-heading placeholder-text-secondary`
    content = content.replace(/bg-surface-subtle text-text-heading/g, 'bg-surface-ground text-text-heading border border-surface-border'); // already has text-heading, but it overrides "text-white"
    content = content.replace(/text-\[var\(--color-white\)\]/g, 'text-text-heading'); // Just in case any are left
    content = content.replace(/text-white/g, 'text-white'); // Leave pure text-white alone, except when it's on forms:
    
    // Fix pure text-white on Inputs
    content = content.replace(/bg-surface-subtle text-white/g, 'bg-surface-ground text-text-heading placeholder-text-secondary/50');

    // Ensure buttons have white text (bg-primary-600 text-white)
    
    // Auth Forms container: they were inside `bg-surface-subtle` but with text-white on inputs.
    content = content.replace(/placeholder-\[var\(--color-text-secondary\)\]/g, 'placeholder-text-secondary');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Deep DOM cleanup executed: ' + f);
});
