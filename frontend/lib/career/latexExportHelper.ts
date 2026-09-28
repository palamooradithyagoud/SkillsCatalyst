// Helper to generate compilable Overleaf / sb2nov LaTeX code from resume data

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location: string;
  startDate?: string;
  endDate?: string;
  dates: string;
  gpaType?: string; // "CGPA" | "GPA" | "Percentage"
  gpa?: string;
  activities?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  location: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  dates: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  tech: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  link?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface CertificateItem {
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface SpokenLanguageItem {
  name: string;
  proficiency: string; // "Native" | "Fluent" | "Conversational" | "Basic"
}

export interface AchievementItem {
  title: string;
  description?: string;
  date?: string;
}

export interface ResumeSkills {
  languages?: string;
  frameworks?: string;
  databases?: string;
  tools?: string;
  cloudDevOps?: string;
  softSkills?: string;
  custom?: string;
  libraries?: string;
  all?: string;
}

export interface ResumeData {
  // Contact
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  leetcode?: string;
  codechef?: string;
  hackerrank?: string;
  portfolio?: string;

  // Summary
  summary: string;

  // Education
  education: EducationItem[];

  // Work Experience
  experience: ExperienceItem[];

  // Projects
  projects: ProjectItem[];

  // Skills
  skills: ResumeSkills;

  // Certifications
  certifications?: CertificateItem[];

  // Languages (spoken)
  spokenLanguages?: SpokenLanguageItem[];

  // Achievements
  achievements?: AchievementItem[];
}

export function hasAnySkill(skills?: ResumeSkills): boolean {
  if (!skills) return false;
  return Boolean(
    (skills.languages && skills.languages.trim().length > 0) ||
    (skills.frameworks && skills.frameworks.trim().length > 0) ||
    (skills.databases && skills.databases.trim().length > 0) ||
    (skills.tools && skills.tools.trim().length > 0) ||
    (skills.cloudDevOps && skills.cloudDevOps.trim().length > 0) ||
    (skills.softSkills && skills.softSkills.trim().length > 0) ||
    (skills.custom && skills.custom.trim().length > 0) ||
    (skills.libraries && skills.libraries.trim().length > 0) ||
    (skills.all && skills.all.trim().length > 0)
  );
}

export function generateSB2NovLaTeX(data: ResumeData): string {
  const sanitize = (text: string) =>
    (text || "")
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/\$/g, "\\$")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}");

  const cleanPhone = sanitize(data.phone);
  const cleanEmail = sanitize(data.email);
  const cleanLinkedIn = sanitize(data.linkedin);
  const cleanGithub = sanitize(data.github);
  const cleanLeetCode = sanitize(data.leetcode || "");
  const cleanCodeChef = sanitize(data.codechef || "");
  const cleanHackerRank = sanitize(data.hackerrank || "");
  const cleanPortfolio = sanitize(data.portfolio || "");
  const cleanLocation = sanitize(data.location);

  const contactItems: string[] = [];
  if (cleanPhone) contactItems.push(cleanPhone);
  if (cleanEmail) contactItems.push(`\\href{mailto:${cleanEmail}}{${cleanEmail}}`);
  if (cleanLinkedIn) contactItems.push(`\\href{https://${cleanLinkedIn.replace(/^https?:\/\//, "")}}{LinkedIn}`);
  if (cleanGithub) contactItems.push(`\\href{https://${cleanGithub.replace(/^https?:\/\//, "")}}{GitHub}`);
  if (cleanLeetCode) contactItems.push(`\\href{https://${cleanLeetCode.replace(/^https?:\/\//, "")}}{LeetCode}`);
  if (cleanCodeChef) contactItems.push(`\\href{https://${cleanCodeChef.replace(/^https?:\/\//, "")}}{CodeChef}`);
  if (cleanHackerRank) contactItems.push(`\\href{https://${cleanHackerRank.replace(/^https?:\/\//, "")}}{HackerRank}`);
  if (cleanPortfolio) contactItems.push(`\\href{https://${cleanPortfolio.replace(/^https?:\/\//, "")}}{Portfolio}`);
  if (cleanLocation) contactItems.push(cleanLocation);

  const contactLine = contactItems.join(" $|$ ");

  const experienceItems = (data.experience || [])
    .filter((exp) => (exp.company && exp.company.trim().length > 0) || (exp.role && exp.role.trim().length > 0))
    .map((exp) => {
      const bulletItems = (exp.bullets || [])
        .filter((b) => b.trim().length > 0)
        .map((b) => `      \\resumeItem{${sanitize(b)}}`)
        .join("\n");

      const displayDates = exp.dates || (exp.startDate ? `${exp.startDate} -- ${exp.currentlyWorking ? "Present" : exp.endDate || "Present"}` : "");

      return `    \\resumeSubheading
      {${sanitize(exp.role)}}{${sanitize(displayDates)}}
      {${sanitize(exp.company)}}{${sanitize(exp.location)}}
      \\resumeItemListStart
${bulletItems || "        \\resumeItem{Spearheaded core feature development and reduced system latency.}"}
      \\resumeItemListEnd`;
    })
    .join("\n\n");

  const projectItems = (data.projects || [])
    .filter((proj) => (proj.name && proj.name.trim().length > 0) || (proj.tech && proj.tech.trim().length > 0))
    .map((proj) => {
      const bulletItems = (proj.bullets || [])
        .filter((b) => b.trim().length > 0)
        .map((b) => `      \\resumeItem{${sanitize(b)}}`)
        .join("\n");

      const linkParts: string[] = [];
      if (proj.link) {
        linkParts.push(`\\href{https://${proj.link.replace(/^https?:\/\//, "")}}{Live Demo}`);
      }
      if (proj.githubUrl) {
        linkParts.push(`\\href{https://${proj.githubUrl.replace(/^https?:\/\//, "")}}{GitHub}`);
      }
      const linkPart = linkParts.join(" $|$ ");

      const headingTitle = proj.name && proj.tech
        ? `{\\textbf{${sanitize(proj.name)}} $|$ \\emph{${sanitize(proj.tech)}}}`
        : proj.name
        ? `{\\textbf{${sanitize(proj.name)}}}`
        : `{\\emph{${sanitize(proj.tech)}}}`;

      return `    \\resumeProjectHeading
      ${headingTitle}{${linkPart}}
      \\resumeItemListStart
${bulletItems || "        \\resumeItem{Designed and implemented scalable application architecture.}"}
      \\resumeItemListEnd`;
    })
    .join("\n\n");

  const educationItems = (data.education || [])
    .filter((edu) => (edu.institution && edu.institution.trim().length > 0) || (edu.degree && edu.degree.trim().length > 0))
    .map((edu) => {
      const degreeLine = edu.fieldOfStudy
        ? `${edu.degree} in ${edu.fieldOfStudy}`
        : edu.degree;
      const gpaLine = edu.gpa ? `; ${edu.gpaType || "GPA"}: ${edu.gpa}` : "";
      const displayDates = edu.dates || (edu.startDate ? `${edu.startDate} -- ${edu.endDate || "Present"}` : "");

      return `    \\resumeSubheading
      {${sanitize(edu.institution)}}{${sanitize(edu.location)}}
      {${sanitize(degreeLine)}${sanitize(gpaLine)}}{${sanitize(displayDates)}}` +
      (edu.activities
        ? `\n      \\resumeItemListStart\n        \\resumeItem{Activities: ${sanitize(edu.activities)}}\n      \\resumeItemListEnd`
        : "");
    })
    .join("\n\n");

  // Skills block with all categories
  const skillLines: string[] = [];
  if (data.skills?.languages?.trim()) {
    skillLines.push(`\\textbf{Languages}{: ${sanitize(data.skills.languages.trim())}}`);
  }
  if (data.skills?.frameworks?.trim()) {
    skillLines.push(`\\textbf{Frameworks}{: ${sanitize(data.skills.frameworks.trim())}}`);
  }
  if (data.skills?.databases?.trim()) {
    skillLines.push(`\\textbf{Databases}{: ${sanitize(data.skills.databases.trim())}}`);
  }
  if (data.skills?.tools?.trim()) {
    skillLines.push(`\\textbf{Developer Tools}{: ${sanitize(data.skills.tools.trim())}}`);
  }
  if (data.skills?.cloudDevOps?.trim()) {
    skillLines.push(`\\textbf{Cloud \\& DevOps}{: ${sanitize(data.skills.cloudDevOps.trim())}}`);
  }
  if (data.skills?.softSkills?.trim()) {
    skillLines.push(`\\textbf{Soft Skills}{: ${sanitize(data.skills.softSkills.trim())}}`);
  }
  if (data.skills?.custom?.trim()) {
    skillLines.push(`\\textbf{Other}{: ${sanitize(data.skills.custom.trim())}}`);
  }
  if (data.skills?.libraries?.trim()) {
    skillLines.push(`\\textbf{Libraries}{: ${sanitize(data.skills.libraries.trim())}}`);
  }

  let skillsBlock = "";
  if (skillLines.length > 0) {
    skillsBlock = `    \\small{\\item{
     ${skillLines.join(" \\\\\n     ")}
    }}`;
  } else if (data.skills?.all?.trim()) {
    skillsBlock = `    \\small{\\item{
     \\textbf{Skills}{: ${sanitize(data.skills.all.trim())}}
    }}`;
  }

  // Certifications section
  const certItems = (data.certifications || [])
    .filter((c) => c.name.trim().length > 0)
    .map((cert) => {
      const urlPart = cert.credentialUrl
        ? ` $|$ \\href{https://${cert.credentialUrl.replace(/^https?:\/\//, "")}}{Verify}`
        : "";
      return `    \\resumeProjectHeading
      {\\textbf{${sanitize(cert.name)}} -- \\emph{${sanitize(cert.issuer)}}${urlPart}}{${sanitize(cert.date)}}`;
    })
    .join("\n");

  // Achievements section
  const achItems = (data.achievements || [])
    .filter((a) => a.title.trim().length > 0)
    .map((ach) => {
      const datePart = ach.date ? `{${sanitize(ach.date)}}` : "{}";
      const descPart = ach.description
        ? `\\resumeItemListStart\n        \\resumeItem{${sanitize(ach.description)}}\n      \\resumeItemListEnd`
        : "";
      return `    \\resumeProjectHeading
      {\\textbf{${sanitize(ach.title)}}}{${datePart}}` + (descPart ? `\n      ${descPart}` : "");
    })
    .join("\n");

  // Spoken languages
  const spokenLanguagesLine = (data.spokenLanguages || [])
    .filter((l) => l.name.trim().length > 0)
    .map((l) => `${sanitize(l.name)} (${sanitize(l.proficiency)})`)
    .join(", ");

  return `%-------------------------
% Resume in Latex (SB2Nov Template)
% Author : Sourabh Bajaj (Adapted for SkillsCatalyst)
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${sanitize(data.fullName)}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}

${
  data.summary
    ? `%-----------SUMMARY-----------
\\section{Summary}
\\small{${sanitize(data.summary)}}
\\vspace{2pt}
`
    : ""
}
${
  educationItems
    ? `%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${educationItems}
  \\resumeSubHeadingListEnd
`
    : ""
}
${
  experienceItems
    ? `%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceItems}
  \\resumeSubHeadingListEnd
`
    : ""
}
${
  projectItems
    ? `%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectItems}
  \\resumeSubHeadingListEnd
`
    : ""
}
${
  skillsBlock
    ? `%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
${skillsBlock}
 \\end{itemize}
`
    : ""
}

${
  certItems
    ? `%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
${certItems}
  \\resumeSubHeadingListEnd
`
    : ""
}
${
  achItems
    ? `%-----------ACHIEVEMENTS-----------
\\section{Achievements \\& Honors}
  \\resumeSubHeadingListStart
${achItems}
  \\resumeSubHeadingListEnd
`
    : ""
}
${
  spokenLanguagesLine
    ? `%-----------LANGUAGES-----------
\\section{Languages}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Spoken Languages}{: ${spokenLanguagesLine}}
    }}
 \\end{itemize}
`
    : ""
}

\\end{document}
`;
}
