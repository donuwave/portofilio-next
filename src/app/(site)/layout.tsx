import { Unbounded, Neucha } from "next/font/google";
import { SmoothScrollProvider } from "@/shared/lib/smooth-scroll-provider";

const displayFont = Unbounded({
  variable: "--font-display",
  weight: ["700", "800", "900"],
  subsets: ["latin", "cyrillic"],
});

const handFont = Neucha({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin", "cyrillic"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // Clip horizontal animation overflow without creating a nested scroller.
    // hidden + visible computes to hidden + auto; clip keeps Y visible.
    <div className={`${displayFont.variable} ${handFont.variable} min-h-screen overflow-x-clip overflow-y-visible bg-[#141312] text-[#ece5d6] selection:bg-[#e2451f] selection:text-[#141312]`}>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </div>
  );
}
