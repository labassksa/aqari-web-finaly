'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  searchPlaceholder = 'بحث...',
  disabled = false,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.includes(query) ||
        o.value.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function select(opt: SelectOption) {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setQuery('');
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} dir="rtl">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-colors bg-white text-right ${
          disabled
            ? 'border-line text-hint cursor-not-allowed bg-surface'
            : open
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-line hover:border-secondary'
        }`}
      >
        <span className={selected ? 'text-ink' : 'text-hint'}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ms-2">
          {value && !disabled && (
            <span
              onClick={clear}
              className="p-0.5 rounded hover:bg-surface text-hint hover:text-muted cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-hint transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-line">
            <div className="relative">
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-hint pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full ps-8 pe-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:border-primary bg-white"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-hint py-4">لا توجد نتائج</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                    opt.value === value
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-ink hover:bg-surface'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
