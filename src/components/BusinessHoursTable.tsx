"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/types/business";
import { getTimezoneForCity, getTimezoneLabel } from "@/lib/city-timezone";

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_EMOJI: Record<string, string> = {
  Sunday: "🌤️",
  Monday: "📅",
  Tuesday: "📅",
  Wednesday: "📅",
  Thursday: "📅",
  Friday: "📅",
  Saturday: "🌤️",
};

type BusinessHoursTableProps = {
  business: Pick<Business, "city" | "state" | "timezone" | "weeklyHours" | "hoursStatus">;
};

function getNowInZone(timeZone: string) {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(now);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);
  return { weekday, time };
}

function isOpenFromHours(hours: string): boolean | null {
  const h = hours.toLowerCase();
  if (h.includes("closed")) return false;
  if (h.includes("open 24")) return true;
  return null;
}

export function BusinessHoursTable({ business }: BusinessHoursTableProps) {
  const timeZone = business.timezone ?? getTimezoneForCity(business.city, business.state);
  const [now, setNow] = useState(() => getNowInZone(timeZone));

  useEffect(() => {
    setNow(getNowInZone(timeZone));
    const id = setInterval(() => setNow(getNowInZone(timeZone)), 60_000);
    return () => clearInterval(id);
  }, [timeZone]);

  if (!business.weeklyHours?.length && !business.hoursStatus) return null;

  const todayEntry = business.weeklyHours?.find((e) => e.day === now.weekday);
  const todayOpen = todayEntry ? isOpenFromHours(todayEntry.hours) : null;
  const statusOpen =
    todayOpen ??
    (business.hoursStatus?.toLowerCase().includes("open 24") ||
      business.hoursStatus?.toLowerCase().startsWith("open"));

  return (
    <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1274c0]">🕐 Business Hours</h2>
          <p className="mt-1 text-xs text-[#717171]">
            Times shown in {getTimezoneLabel(timeZone)} · Local time now: {now.time}
          </p>
        </div>
        {business.hoursStatus && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              statusOpen ? "bg-[#e8f8ec] text-[#25a244]" : "bg-[#f5f5f5] text-[#717171]"
            }`}
          >
            {statusOpen ? "🟢 Open Now" : "🔴 Closed Now"} · {business.hoursStatus}
          </span>
        )}
      </div>

      {business.weeklyHours && business.weeklyHours.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#eee] text-left text-xs uppercase tracking-wide text-[#999]">
                <th className="py-2 pr-4 font-semibold">Day</th>
                <th className="py-2 font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {DAY_ORDER.map((day) => {
                const entry = business.weeklyHours!.find((e) => e.day === day);
                if (!entry) return null;
                const isToday = day === now.weekday;
                return (
                  <tr
                    key={day}
                    className={`border-b border-[#f0f0f0] ${isToday ? "bg-[#f5f9fd] font-semibold" : ""}`}
                  >
                    <td className="py-2.5 pr-4 text-[#333]">
                      {DAY_EMOJI[day] ?? "📅"} {day}
                      {isToday ? " (Today)" : ""}
                    </td>
                    <td className="py-2.5 text-[#555]">{entry.hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-[#333]">{business.hoursStatus}</p>
      )}
    </section>
  );
}
