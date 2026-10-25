import { BookOpen, Home, Layers, LayoutGrid } from "lucide-react";

// Nguồn duy nhất cho sidebar và tiêu đề header của khu vực user.
export const USER_NAV_ITEMS = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/topics", label: "Chủ đề từ vựng", icon: LayoutGrid },
  { to: "/flashcard", label: "Flashcard", icon: Layers },
  { to: "/learn", label: "Học từ vựng", icon: BookOpen },
];
