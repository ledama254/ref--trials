"use client";
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(prefers);
    document.documentElement.classList.toggle('dark', prefers);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', dark);
  }, [mounted, dark]);
  if (!mounted) return null;
  return (
    <button className="px-3 py-1 rounded border dark:border-gray-700" onClick={() => setDark(d => !d)}>
      {dark ? 'Light' : 'Dark'} Mode
    </button>
  );
}
