"use client";

import React, { useState, useRef, useEffect } from "react";
import { Building2, Search, ChevronDown, Check } from "lucide-react";
import { TOP_COMPANIES } from "@/data/practice/constants";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";

interface CompanyControlsPanelProps {
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  filteredCompaniesDropdown: string[];
  companySearchInput: string;
  onCompanySearchChange: (val: string) => void;
}

export function CompanyControlsPanel({
  selectedCompany,
  onSelectCompany,
  filteredCompaniesDropdown,
  companySearchInput,
  onCompanySearchChange,
}: CompanyControlsPanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-[#18191F] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-md space-y-4 relative overflow-visible">
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Select Any Company Dropdown + Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-20">
        {/* Dropdown for 660+ companies (White background, black text, purple on cursor hover) */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-[#C084FC]" />
          </div>

          <div ref={dropdownRef} className="relative w-full max-w-md">
            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full bg-white dark:bg-[#121318] text-slate-900 dark:text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs outline-none ${
                isDropdownOpen
                  ? "border-purple-600 dark:border-purple-500 ring-2 ring-purple-500/20 text-purple-700 dark:text-purple-300"
                  : "border-slate-300 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              <span className="truncate">
                {formatCompanyName(selectedCompany)} ({selectedCompany})
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ml-2 ${
                  isDropdownOpen
                    ? "rotate-180 text-purple-600 dark:text-purple-400"
                    : "text-slate-500 dark:text-neutral-400 group-hover:text-purple-600"
                }`}
              />
            </button>

            {/* Dropdown Options Popup */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-[#18191F] border border-purple-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="overflow-y-auto max-h-72 divide-y divide-slate-100 dark:divide-neutral-800 scrollbar-thin">
                  {filteredCompaniesDropdown.map((comp) => {
                    const isSelected = selectedCompany === comp;
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          onSelectCompany(comp);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-purple-100/70 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold"
                            : "text-slate-900 dark:text-neutral-200 bg-white dark:bg-[#18191F] hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white dark:hover:text-white"
                        }`}
                      >
                        <span className="truncate">
                          {formatCompanyName(comp)}{" "}
                          <span
                            className={
                              isSelected
                                ? "text-purple-600 dark:text-purple-400 font-normal"
                                : "text-slate-400 dark:text-neutral-500 group-hover:text-purple-200 font-normal"
                            }
                          >
                            ({comp})
                          </span>
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-700 dark:text-[#C084FC] shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-400" />
          <input
            type="text"
            value={companySearchInput}
            onChange={(e) => onCompanySearchChange(e.target.value)}
            placeholder="Filter 660+ companies..."
            className="w-full bg-white dark:bg-[#121318] border border-slate-300 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-2xs outline-none"
          />
        </div>
      </div>

      {/* Popular Companies Quick Selector Pills */}
      <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin relative z-10">
        <span className="text-[11px] font-black text-slate-400 dark:text-neutral-400 uppercase tracking-widest mr-1 shrink-0">
          POPULAR:
        </span>
        {TOP_COMPANIES.map((slug) => {
          const isSelected = selectedCompany === slug;
          return (
            <button
              key={slug}
              onClick={() => onSelectCompany(slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400 font-black scale-105"
                  : "bg-white dark:bg-[#121318] text-slate-800 dark:text-neutral-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-[#C084FC] hover:border-purple-300 dark:hover:border-purple-800/60 border border-slate-200/90 dark:border-neutral-700 shadow-2xs"
              }`}
            >
              {formatCompanyName(slug)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
