"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MultiSelectProps {
  label: string;
  options?: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export default function MultiSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Hinzufügen...",
  allowCustom = false,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState("");

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const addCustom = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#0A0A0A]">{label}</label>

      {/* Preset-Optionen */}
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                value.includes(option)
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Eigene Eingabe */}
      {allowCustom && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent min-h-[48px]"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-4 py-2 bg-[#0A0A0A] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            +
          </button>
        </div>
      )}

      {/* Ausgewählte Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.filter((v) => !options.includes(v)).map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0A0A0A] text-white rounded-full text-sm"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`${v} entfernen`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
