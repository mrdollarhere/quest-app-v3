"use client";

/**
 * DNTRNG™ IDENTITY AUTOCOMPLETE HOOK
 * 
 * Logic node for generating and filtering student name suggestions.
 * Supports Whitelist matching and Open Mode Vietnamese pattern completion.
 * Refactored v19.5: Title Case enforcement, diacritic preservation, and surname filtering.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { validateStudentName, VN_SURNAME_REGISTRY } from '@/lib/name-validator';

const GIVEN_NAMES_MALE = ['An', 'Bảo', 'Cường', 'Dũng', 'Đức', 'Hùng', 'Khải', 'Minh', 'Nam', 'Phong', 'Quân', 'Thành', 'Tuấn', 'Việt', 'Xuân'];
const GIVEN_NAMES_FEMALE = ['Anh', 'Chi', 'Dung', 'Hà', 'Hoa', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Nhung', 'Phương', 'Thảo', 'Thu', 'Vy'];

/**
 * Requirement 1: Proper Title Case Helper
 * Each word starts with uppercase, rest lowercase.
 */
const toTitleCase = (name: string): string => {
  if (!name) return "";
  return name
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => {
      // Handle Vietnamese characters correctly in case conversion
      const first = w.charAt(0).toUpperCase();
      const rest = w.slice(1).toLowerCase();
      return first + rest;
    })
    .join(' ');
};

interface AutocompleteOptions {
  value: string;
  joinMode: 'open' | 'whitelist' | null;
  whitelist: string[];
  customBlacklist?: string[];
  onSelect: (val: string) => void;
}

export function useNameAutocomplete({ value, joinMode, whitelist, customBlacklist, onSelect }: AutocompleteOptions) {
  const [isOpen, setIsOpen] = useState(false);
  // Requirement 4: Initialized to -1 to avoid auto-selection/highlighting
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

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
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // 1. WHITELIST PROTOCOL
    if (joinMode === 'whitelist' && whitelist.length > 0) {
      return whitelist
        .filter(name => {
          const normName = normalize(name);
          return normName.includes(searchStr);
        })
        .slice(0, 5)
        .map(name => ({ 
          // Requirement 1 & 3: Proper formatting + Diacritic preservation
          name: toTitleCase(name), 
          isApproved: true 
        }));
    }

    // 2. OPEN MODE PROTOCOL
    if (joinMode === 'open' || !joinMode) {
      if (wordCount === 0) return [];

      const firstWordNorm = normalize(words[0]);
      // Requirement 5: Suggest only if first word looks like a Vietnamese surname
      const isVietnameseSurname = VN_SURNAME_REGISTRY.some(s => normalize(s) === firstWordNorm);
      
      if (!isVietnameseSurname) return [];

      // Case 1: User typed exactly one word (Surname) -> Suggest completions
      if (wordCount === 1) {
        const generated: string[] = [];
        
        // Use typed text for surname, add common completions with proper diacritics
        GIVEN_NAMES_MALE.slice(0, 2).forEach(gn => generated.push(`${words[0]} Văn ${gn}`));
        GIVEN_NAMES_FEMALE.slice(0, 2).forEach(gn => generated.push(`${words[0]} Thị ${gn}`));
        generated.push(`${words[0]} Minh Anh`);

        return generated
          .map(name => toTitleCase(name))
          .filter(name => validateStudentName(name, customBlacklist).valid)
          .slice(0, 5)
          .map(name => ({ name, isApproved: false }));
      }

      // Case 2: User already typed 2 or more words -> Show one Title Case version only
      if (wordCount >= 2) {
        const formattedInput = toTitleCase(trimmed);
        // Only suggest if valid, otherwise user is typing something unacceptable
        if (validateStudentName(formattedInput, customBlacklist).valid) {
          return [{ name: formattedInput, isApproved: false }];
        }
      }
    }

    return [];
  }, [value, joinMode, whitelist, normalize, customBlacklist]);

  // Requirement 4: Reset highlight whenever suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        break;
      case 'Enter':
        // Requirement 4: Only select if there is a deliberate highlight (>= 0)
        if (highlightedIndex >= 0) {
          e.preventDefault();
          onSelect(suggestions[highlightedIndex].name);
          setIsOpen(false);
        }
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
