export const defaultResume = {
  name: 'Your Full Name',
  email: 'your.email@example.com',
  phone: '(555) 123-4567',
  location: 'City, State',
  links: [
    { id: 'link-1', label: 'GitHub', url: 'https://github.com/username' },
    { id: 'link-2', label: 'LinkedIn', url: 'https://linkedin.com/in/username' },
  ],
  professionalTitle: 'Senior Software Engineer | React, Node.js, AWS | Full-Stack Development',
  summary:
    'Experienced IT professional with a strong background in software development, cloud infrastructure, and agile delivery. Proven track record of building scalable systems and leading cross-functional teams to deliver high-impact solutions.',
  skills: [
    {
      id: 'skill-1',
      category: 'Frontend',
      items: 'React, TypeScript, JavaScript, HTML5, CSS3, Sass, Next.js, Redux, Context API, Material-UI, Tailwind CSS',
    },
    {
      id: 'skill-2',
      category: 'Backend',
      items: 'Node.js, Express, Fastify, NestJS, Prisma ORM, REST APIs, GraphQL, gRPC, OpenAPI, Postman, RBAC, JWT, OAuth2',
    },
    {
      id: 'skill-3',
      category: 'API & Architecture',
      items: 'RESTful APIs, GraphQL, Microservices, Event-Driven Architecture, Serverless, API Gateway, OpenAPI/Swagger',
    },
    {
      id: 'skill-4',
      category: 'Database',
      items: 'PostgreSQL, Redis, MongoDB, MySQL, PgBouncer, database schema design, indexing strategies, query optimization, partitioning',
    },
    {
      id: 'skill-5',
      category: 'DevOps & CI/CD',
      items: 'GitHub Actions, Vercel, Docker, AWS ECS, AWS Lambda, AWS S3, AWS RDS, Terraform, Cloudflare, Datadog, Sentry, CircleCI',
    },
    {
      id: 'skill-6',
      category: 'Testing',
      items: 'Jest, Vitest, React Testing Library, Playwright, Cypress, Pact, unit testing, integration testing, end-to-end testing',
    },
    {
      id: 'skill-7',
      category: 'Cloud & Hosting',
      items: 'AWS (ECS, Lambda, S3, RDS), Vercel, Netlify, Cloudflare Workers, edge caching, serverless functions, preview environments',
    },
    {
      id: 'skill-8',
      category: 'Practices',
      items: 'End-to-end feature ownership, 0-1 product development, MVP development, Agile, code review, pair programming, customer discovery, performance optimization, monitoring and alerting',
    },
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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.skills?.length && typeof parsed.skills[0] === 'string') {
        parsed.skills = [{ id: 'skill-migrated', category: 'Technical Skills', items: parsed.skills.join(', ') }];
      }
      if (!Array.isArray(parsed.links)) {
        parsed.links = [];
      }
      if (!parsed.professionalTitle) {
        parsed.professionalTitle = '';
      }
      return parsed;
    }
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
    professionalTitle: tailored.professionalTitle ?? resume.professionalTitle,
    summary: tailored.summary,
    skills: tailored.skills ?? resume.skills,
    experience: resume.experience.map((exp) => {
      const match = tailored.experience.find((e) => e.id === exp.id);
      return match ? { ...exp, bullets: match.bullets } : exp;
    }),
  };
}
