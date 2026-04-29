/**
 * Static Tailwind color class maps.
 * Tailwind v4 cannot generate classes from dynamic template literals
 * like `bg-${color}-100`, so we use a static lookup table instead.
 * All class strings here are complete and will be picked up by Tailwind's scanner.
 */

export const iconBg = {
  blue:    "bg-blue-100 dark:bg-blue-900/20",
  violet:  "bg-violet-100 dark:bg-violet-900/20",
  purple:  "bg-purple-100 dark:bg-purple-900/20",
  emerald: "bg-emerald-100 dark:bg-emerald-900/20",
  green:   "bg-green-100 dark:bg-green-900/20",
  amber:   "bg-amber-100 dark:bg-amber-900/20",
  red:     "bg-red-100 dark:bg-red-900/20",
  orange:  "bg-orange-100 dark:bg-orange-900/20",
  pink:    "bg-pink-100 dark:bg-pink-900/20",
  teal:    "bg-teal-100 dark:bg-teal-900/20",
  gray:    "bg-gray-100 dark:bg-gray-800",
};

export const iconText = {
  blue:    "text-blue-600",
  violet:  "text-violet-600",
  purple:  "text-purple-600",
  emerald: "text-emerald-600",
  green:   "text-green-600",
  amber:   "text-amber-600",
  red:     "text-red-600",
  orange:  "text-orange-600",
  pink:    "text-pink-600",
  teal:    "text-teal-600",
  gray:    "text-gray-600",
};

export const barColor = {
  blue:    "bg-blue-500",
  violet:  "bg-violet-500",
  purple:  "bg-purple-500",
  emerald: "bg-emerald-500",
  green:   "bg-green-500",
  amber:   "bg-amber-500",
  red:     "bg-red-500",
  orange:  "bg-orange-500",
  pink:    "bg-pink-500",
  teal:    "bg-teal-500",
  gray:    "bg-gray-400",
};
