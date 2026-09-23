// Helper to generate compilable Overleaf / sb2nov LaTeX code from resume data

export interface ResumeData {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    dates: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    tech: string;
    link?: string;
    bullets: string[];
  }>;
  skills: {
    languages?: string;
    frameworks?: string;
    tools?: string;
    libraries?: string;
    all?: string;
  };
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
  const cleanLocation = sanitize(data.location);

  const contactItems: string[] = [];
  if (cleanPhone) contactItems.push(cleanPhone);
  if (cleanEmail) contactItems.push(`\\href{mailto:${cleanEmail}}{${cleanEmail}}`);
  if (cleanLinkedIn) contactItems.push(`\\href{https://${cleanLinkedIn.replace(/^https?:\/\//, "")}}{${cleanLinkedIn}}`);
  if (cleanGithub) contactItems.push(`\\href{https://${cleanGithub.replace(/^https?:\/\//, "")}}{${cleanGithub}}`);
  if (cleanLocation) contactItems.push(cleanLocation);

  const contactLine = contactItems.join(" $|$ ");

  const experienceItems = (data.experience || [])
    .map((exp) => {
      const bulletItems = (exp.bullets || [])
        .filter((b) => b.trim().length > 0)
        .map((b) => `      \\resumeItem{${sanitize(b)}}`)
        .join("\n");

      return `    \\resumeSubheading
      {${sanitize(exp.role)}}{${sanitize(exp.dates)}}
      {${sanitize(exp.company)}}{${sanitize(exp.location)}}
      \\resumeItemListStart
${bulletItems || "        \\resumeItem{Spearheaded core feature development and reduced system latency.}"}
      \\resumeItemListEnd`;
    })
    .join("\n\n");

  const projectItems = (data.projects || [])
    .map((proj) => {
      const bulletItems = (proj.bullets || [])
        .filter((b) => b.trim().length > 0)
        .map((b) => `      \\resumeItem{${sanitize(b)}}`)
        .join("\n");

      return `    \\resumeProjectHeading
      {\\textbf{${sanitize(proj.name)}} $|$ \\emph{${sanitize(proj.tech)}}}{${sanitize(proj.link || "")}}
      \\resumeItemListStart
${bulletItems || "        \\resumeItem{Designed and implemented scalable application architecture.}"}
      \\resumeItemListEnd`;
    })
    .join("\n\n");

  const educationItems = (data.education || [])
    .map((edu) => {
      return `    \\resumeSubheading
      {${sanitize(edu.institution)}}{${sanitize(edu.location)}}
      {${sanitize(edu.degree)}}{${sanitize(edu.dates)}}`;
    })
    .join("\n\n");

  const skillsBlock = data.skills?.all
    ? `    \\small{\\item{
     \\textbf{Skills}{: ${sanitize(data.skills.all)}}
    }}`
    : `    \\small{\\item{
     \\textbf{Languages}{: ${sanitize(data.skills?.languages || "JavaScript, TypeScript, Python, C++, SQL")}} \\\\
     \\textbf{Frameworks}{: ${sanitize(data.skills?.frameworks || "React, Next.js, FastAPI, Node.js, Tailwind CSS")}} \\\\
     \\textbf{Developer Tools}{: ${sanitize(data.skills?.tools || "Git, Docker, PostgreSQL, Supabase, Linux, Vercel")}}
    }}`;

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
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${educationItems || "    \\resumeSubheading{University of Engineering & Technology}{Hyderabad, India}{Bachelor of Technology in Computer Science; GPA: 8.9/10.0}{2021 -- 2025}"}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceItems || `    \\resumeSubheading
      {Fullstack Software Engineer}{June 2024 -- Present}
      {Tech Corp}{Remote}
      \\resumeItemListStart
        \\resumeItem{Architected high-throughput backend APIs processing 100k+ requests daily.}
        \\resumeItem{Implemented Next.js frontend optimizing Largest Contentful Paint by 40\\%.}
      \\resumeItemListEnd`}
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectItems || `    \\resumeProjectHeading
      {\\textbf{SkillsCatalyst} $|$ \\emph{React, Next.js, FastAPI, PostgreSQL}}{github.com/skillscatalyst}
      \\resumeItemListStart
        \\resumeItem{Developed interactive AI career acceleration portal with real-time scoring.}
      \\resumeItemListEnd`}
  \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
${skillsBlock}
 \\end{itemize}

\\end{document}
`;
}
