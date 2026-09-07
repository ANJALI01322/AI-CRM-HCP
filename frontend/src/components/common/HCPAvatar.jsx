import React, { useState } from "react";

// Deterministic color palette for avatar fallback
const COLOR_VARIANTS = [
  { bg: "bg-teal-950", text: "text-teal-200", border: "border-teal-700/60" },
  { bg: "bg-indigo-950", text: "text-indigo-200", border: "border-indigo-700/60" },
  { bg: "bg-slate-900", text: "text-slate-200", border: "border-slate-700/60" },
  { bg: "bg-emerald-950", text: "text-emerald-200", border: "border-emerald-700/60" },
  { bg: "bg-sky-950", text: "text-sky-200", border: "border-sky-700/60" },
  { bg: "bg-purple-950", text: "text-purple-200", border: "border-purple-700/60" },
];

export const getInitials = (name = "") => {
  if (!name) return "DR";
  // Remove title prefixes like Dr., Prof., etc.
  const cleanName = name.replace(/^(Dr\.|Prof\.|Doctor|Mr\.|Ms\.|Mrs\.)\s+/i, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_VARIANTS.length;
  return COLOR_VARIANTS[index];
};

const SIZE_MAP = {
  xs: {
    container: "w-7 h-7 text-[11px]",
    img: "w-7 h-7",
    rounded: "rounded-full",
  },
  sm: {
    container: "w-9 h-9 text-xs",
    img: "w-9 h-9",
    rounded: "rounded-full",
  },
  md: {
    container: "w-11 h-11 text-sm",
    img: "w-11 h-11",
    rounded: "rounded-full",
  },
  lg: {
    container: "w-13 h-13 text-base",
    img: "w-13 h-13",
    rounded: "rounded-2xl",
  },
  xl: {
    container: "w-16 h-16 text-lg",
    img: "w-16 h-16",
    rounded: "rounded-2xl",
  },
};

export default function HCPAvatar({
  src,
  name = "Doctor",
  size = "md",
  className = "",
  showStatus = false,
  statusColor = "bg-emerald-500",
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initials = getInitials(name);
  const colorScheme = getColorForName(name);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const showImage = src && !hasError;

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`${sizeConfig.container} ${sizeConfig.rounded} font-mono font-bold flex items-center justify-center overflow-hidden border shadow-xs ${
          showImage ? "border-slate-200 bg-slate-100" : `${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`
        }`}
      >
        {showImage ? (
          <>
            <img
              src={src}
              alt={name}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`${sizeConfig.img} object-cover transition-opacity duration-200 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!isLoaded && (
              <span className={`absolute inset-0 flex items-center justify-center ${colorScheme.bg} ${colorScheme.text}`}>
                {initials}
              </span>
            )}
          </>
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColor} shadow-xs`}
        />
      )}
    </div>
  );
}
