## 2025-05-27 - [Missing ARIA Labels on Auth Forms]
**Learning:** The authentication pages (login, signup, update password) used icon-only buttons for password visibility without any accessibility labels. This makes them inaccessible to screen readers.
**Action:** Always check icon-only buttons (especially in forms) for `aria-label` or `aria-labelledby`. For toggles, ensure the label reflects the current state or action (e.g., "Show password" vs "Hide password").
