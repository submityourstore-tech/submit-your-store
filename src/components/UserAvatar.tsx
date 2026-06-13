"use client";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
  verified?: boolean;
};

export function UserAvatar({ name, image, size = "md", verified }: UserAvatarProps) {
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative shrink-0">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className={`${dim} rounded-full border border-[#e0e0e0] object-cover`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${dim} flex items-center justify-center rounded-full bg-[#1274c0] font-bold text-white`}
          aria-hidden
        >
          {initials || "?"}
        </div>
      )}
      {verified && (
        <span
          className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#25a244] text-[10px] text-white"
          title="Verified account"
          aria-label="Verified account"
        >
          ✓
        </span>
      )}
    </div>
  );
}
