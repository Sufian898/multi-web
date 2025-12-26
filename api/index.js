// Vercel requires functions in root api/ directory
// This file just re-exports from backend/api/index.js
// All actual code is in backend/api/index.js
export { default } from '../backend/api/index.js';

