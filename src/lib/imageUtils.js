/**
 * Image URL resolver — handles Cloudinary, local dev, and broken Render URLs
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://fitzone-backend-vis3.onrender.com";

// Fallback images for classes
export const CLASS_FALLBACKS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=450&fit=crop",
];

// Fallback images for trainers
export const TRAINER_FALLBACKS = [
  "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop",
];

/**
 * Resolve an image URL:
 * - Cloudinary URLs (res.cloudinary.com) → pass through
 * - Unsplash URLs → pass through
 * - Render /uploads/ URLs → these 404 after redeploy, use fallback
 * - Relative paths → prepend BASE_URL
 * - Empty/null → use fallback
 */
export const resolveImageUrl = (img, fallbacks = CLASS_FALLBACKS, idx = 0) => {
  if (!img) return fallbacks[idx % fallbacks.length];

  // Cloudinary — always works
  if (img.includes("res.cloudinary.com")) return img;

  // Unsplash — always works
  if (img.includes("unsplash.com")) return img;

  // Render /uploads/ — ephemeral, will 404 after redeploy
  // Return the URL anyway — onError handler will show fallback
  if (img.startsWith("http")) return img;

  // Relative path — prepend backend URL
  return `${BASE_URL}/${img.replace(/^\//, "")}`;
};

/**
 * Get a deterministic fallback image based on a string (e.g. class name)
 */
export const getFallback = (seed = "", fallbacks = CLASS_FALLBACKS) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return fallbacks[Math.abs(hash) % fallbacks.length];
};
