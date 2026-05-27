"use client";

/**
 * DNTRNG™ IDENTITY AUTOCOMPLETE HOOK
 * 
 * Logic node for generating and filtering student name suggestions.
 * Supports Whitelist matching and Open Mode Vietnamese pattern completion.
 */

import { useState, useMemo, useCallback } from 'react';
import { validateStudentName, VN_SURNAME_REGISTRY } from '@/lib/name-validator';

const GIVEN_NAMES_MALE = ['An', 'Bảo', 'Cường', 'Dũng', 'Đức', 'Hùng', 'Khải', 'Minh', 'Nam', 'Phong', 'Quân', 'Thành', 'Tuấn', 'Việt', 'Xuân'];
const GIVEN_NAMES_FEMALE = ['Anh', 'Chi', 'Dung', 'Hà', 'Hoa', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Nhung', 'Phương', 'Thảo', 'Thu', 'Vy'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Hoàng', 'Thanh', 'Đức', 'Minh'];

interface AutocompleteOptions {
  value: string;
  joinMode: 'open' | 'whitelist' | null;
  whitelist: string[];
  customBlacklist?: string[];
  onSelect: (val: string) => void;
}

export function useNameAutocomplete({ value, joinMode, whitelist, customBlacklist, onSelect }: AutocompleteOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const normalize = useCallback((s: string) => {
    if (!s) return "";
    return s.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return [];

    const searchStr = normalize(trimmed);
    
    // 1. WHITELIST PROTOCOL
    if (joinMode === 'whitelist' && whitelist.length > 0) {
      return whitelist
        .filter(name => {
          const normName = normalize(name);
          return normName.includes(searchStr);
        })
        .slice(0, 5)
        .map(name => ({ name, isApproved: true }));
    }

    // 2. OPEN MODE PROTOCOL
    if (joinMode === 'open' || !joinMode) {
      const words = trimmed.split(/\s+/);
      const firstWordNorm = normalize(words[0]);
      
      // Only suggest if the first word looks like a Vietnamese surname
      if (!VN_SURNAME_REGISTRY.some(s => normalize(s) === firstWordNorm)) return [];

      const generated: string[] = [];
      const isOneWord = words.length === 1;

      // Add patterns
      if (isOneWord) {
        // Pattern: [Surname] Văn [Male Name]
        GIVEN_NAMES_MALE.slice(0, 2).forEach(gn => generated.push(`${trimmed} Văn ${gn}`));
        // Pattern: [Surname] Thị [Female Name]
        GIVEN_NAMES_FEMALE.slice(0, 2).forEach(gn => generated.push(`${trimmed} Thị ${gn}`));
      } else {
        // Pattern: [Typed Start] [Random Name]
        const pool = [...GIVEN_NAMES_MALE, ...GIVEN_NAMES_FEMALE].sort(() => Math.random() - 0.5);
        pool.slice(0, 4).forEach(gn => generated.push(`${trimmed} ${gn}`));
      }

      return generated
        .filter(name => validateStudentName(name, customBlacklist).valid)
        .slice(0, 5)
        .map(name => ({ name, isApproved: false }));
    }

    return [];
  }, [value, joinMode, whitelist, normalize, customBlacklist]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(suggestions[highlightedIndex].name);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return {
    suggestions,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    handleKeyDown
  };
}
