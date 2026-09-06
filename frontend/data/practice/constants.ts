import { QuestionPeriod } from "@/lib/api";

export const SPECIAL_COMPANY_MAP: Record<string, string> = {
  "at-t": "AT&T",
  "bookingcom": "Booking.com",
  "c3-ai": "C3 AI",
  "f5-networks": "F5 Networks",
  "ge-digital": "GE Digital",
  "ge-healthcare": "GE Healthcare",
  "hp": "HP",
  "hpe": "HPE",
  "hrt": "HRT",
  "hsbc": "HSBC",
  "htc": "HTC",
  "ibm": "IBM",
  "imc": "IMC",
  "ivp": "IVP",
  "ixl": "IXL",
  "jd": "JD.com",
  "jpmorgan": "JPMorgan",
  "jtg": "JTG",
  "kla": "KLA",
  "kpit": "KPIT",
  "kpmg": "KPMG",
  "lti": "LTI",
  "maq-software": "MAQ Software",
  "msci": "MSCI",
  "nasdaq": "NASDAQ",
  "ncr": "NCR",
  "npci": "NPCI",
  "nvidia": "NVIDIA",
  "okx": "OKX",
  "olx": "OLX",
  "pwc": "PwC",
  "rbc": "RBC",
  "sap": "SAP",
  "sig": "SIG",
  "tcs": "TCS",
  "ubs": "UBS",
  "ukg": "UKG",
  "ust": "UST",
  "vk": "VK",
};

export const TOP_COMPANIES = [
  "google",
  "amazon",
  "meta",
  "microsoft",
  "apple",
  "netflix",
  "uber",
  "adobe",
  "goldman-sachs",
  "tcs",
  "accenture",
  "deloitte",
  "wipro",
  "infosys",
  "flipkart",
];

export const PERIODS: { value: QuestionPeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "thirty-days", label: "30 Days" },
  { value: "three-months", label: "3 Months" },
  { value: "six-months", label: "6 Months" },
  { value: "more-than-six-months", label: "> 6 Months" },
];

export const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
export type PracticeDifficulty = typeof DIFFICULTIES[number];

export const STATUS_OPTIONS = ["All", "Unsolved", "Completed"] as const;
export type PracticeStatus = typeof STATUS_OPTIONS[number];
