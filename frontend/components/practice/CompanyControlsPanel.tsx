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

  const displayedCompanies = React.useMemo(() => {
    if (companySearchInput.trim()) {
      return filteredCompaniesDropdown;
    }
    return filteredCompaniesDropdown.slice(0, 80);
  }, [filteredCompaniesDropdown, companySearchInput]);

  return (
    <div className="bg-white dark:bg-[#18191F] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-[#24271F] shadow-none space-y-4 relative overflow-visible">
      {/* Top row: Select Any Company Dropdown + Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-20">
        {/* Dropdown for 660+ companies */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] flex items-center justify-center shrink-0 shadow-none">
            <Building2 className="w-5 h-5 text-slate-800 dark:text-[#D5FF38]" />
          </div>

          <div ref={dropdownRef} className="relative w-full max-w-md">
            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full bg-white dark:bg-[#121318] text-slate-900 dark:text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-none outline-none ${
                isDropdownOpen
                  ? "border-[#D5FF38] ring-1 ring-[#D5FF38]/20 text-slate-900 dark:text-white"
                  : "border-slate-300 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 hover:text-slate-900 dark:hover:text-[#D5FF38]"
              }`}
            >
              <span className="truncate">
                {formatCompanyName(selectedCompany)} ({selectedCompany})
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ml-2 ${
                  isDropdownOpen
                    ? "rotate-180 text-slate-900 dark:text-[#D5FF38]"
                    : "text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white"
                }`}
              />
            </button>

            {/* Dropdown Options Popup */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-[#18191F] border border-slate-200 dark:border-[#24271F] rounded-2xl shadow-2xl z-50 overflow-hidden py-1 max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="overflow-y-auto max-h-72 divide-y divide-slate-100 dark:divide-[#24271F] scrollbar-thin">
                  {displayedCompanies.map((comp) => {
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
                            ? "bg-[#D5FF38] text-black font-black"
                            : "text-slate-900 dark:text-neutral-200 bg-white dark:bg-[#18191F] hover:bg-neutral-100 dark:hover:bg-[#121318] hover:text-black dark:hover:text-[#D5FF38]"
                        }`}
                      >
                        <span className="truncate">
                          {formatCompanyName(comp)}{" "}
                          <span
                            className={
                              isSelected
                                ? "text-neutral-800 font-semibold"
                                : "text-slate-400 dark:text-neutral-500 group-hover:text-slate-600 dark:group-hover:text-neutral-400 font-normal"
                            }
                          >
                            ({comp})
                          </span>
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-black shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                  {!companySearchInput.trim() && filteredCompaniesDropdown.length > 80 && (
                    <div className="p-2 text-center text-[11px] font-semibold text-slate-400 dark:text-neutral-500 bg-slate-50 dark:bg-[#121318]">
                      Use the search bar on the right to filter across all {filteredCompaniesDropdown.length} companies
                    </div>
                  )}
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
            className="w-full bg-white dark:bg-[#121318] border border-slate-300 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-none outline-none"
          />
        </div>
      </div>

      {/* Popular Companies Quick Selector Pills */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#24271F] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin relative z-10">
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
                  ? "bg-[#D5FF38] text-black shadow-none border border-[#D5FF38] font-black scale-105"
                  : "bg-white dark:bg-[#121318] text-slate-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-[#D5FF38] hover:border-slate-300 dark:hover:border-neutral-600 border border-slate-200/90 dark:border-[#24271F] shadow-none"
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
