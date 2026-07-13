export const defaultResume = {
  name: 'Your Full Name',
  email: 'your.email@example.com',
  phone: '(555) 123-4567',
  location: 'City, State',
  summary:
    'Experienced IT professional with a strong background in software development, cloud infrastructure, and agile delivery. Proven track record of building scalable systems and leading cross-functional teams to deliver high-impact solutions.',
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Terraform',
    'SQL',
    'Git',
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'Tech Company Inc.',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Led development of microservices architecture serving 2M+ daily active users on AWS.',
        'Implemented CI/CD pipelines with Jenkins and Terraform, reducing deployment time by 60%.',
        'Mentored team of 5 engineers and conducted code reviews to maintain quality standards.',
        'Optimized database queries and caching, improving API response times by 40%.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Software Engineer',
      company: 'Previous Corp',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      bullets: [
        'Built RESTful APIs using Node.js and PostgreSQL for enterprise SaaS platform.',
        'Developed React frontend components used by 500+ internal users.',
        'Collaborated with product and QA teams in agile sprints to deliver features on schedule.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      school: 'University Name',
      date: 'May 2018',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      date: '2023',
    },
  ],
};

export function loadResume() {
  try {
    const saved = localStorage.getItem('resume-writer-data');
    if (saved) return JSON.parse(saved);
  } catch {
    /* use default */
  }
  return structuredClone(defaultResume);
}

export function saveResume(resume) {
  localStorage.setItem('resume-writer-data', JSON.stringify(resume));
}

export function mergeTailoredContent(resume, tailored) {
  return {
    ...resume,
    summary: tailored.summary,
    experience: resume.experience.map((exp) => {
      const match = tailored.experience.find((e) => e.id === exp.id);
      return match ? { ...exp, bullets: match.bullets } : exp;
    }),
  };
}
