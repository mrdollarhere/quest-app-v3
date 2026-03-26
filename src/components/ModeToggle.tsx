"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/context/language-context"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border-none hover:bg-slate-100 dark:hover:bg-slate-800">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl border-none">
        <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold cursor-pointer rounded-xl p-3">
          {t('lightMode')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold cursor-pointer rounded-xl p-3">
          {t('darkMode')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="font-bold cursor-pointer rounded-xl p-3">
          {t('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
