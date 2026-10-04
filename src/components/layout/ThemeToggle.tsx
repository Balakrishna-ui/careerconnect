"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 opacity-0">
        <Sun className="h-4 w-4" />
        <Switch checked={false} />
        <Moon className="h-4 w-4" />
      </div>
    );
  }

  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
      <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-orange-500' : 'text-slate-400'}`} />
      <Switch 
        checked={isDark} 
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
      />
      <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-indigo-400' : 'text-slate-400'}`} />
    </div>
  );
}
