const AVATAR_COLORS = [
    ["#1e66ff", "#1244bb"],
    ["#8b5cf6", "#6d28d9"],
    ["#10b981", "#047857"],
    ["#f59e0b", "#b45309"],
    ["#ef4444", "#b91c1c"],
    ["#06b6d4", "#0e7490"],
    ["#ec4899", "#be185d"],
    ["#f97316", "#c2410c"],
];

export function getAvatarColors(name) {
    if (!name) return AVATAR_COLORS[0];
    const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1
        ? parts[0].charAt(0).toUpperCase()
        : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
