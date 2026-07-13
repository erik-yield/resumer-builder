import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { getSkillColumns, normalizeSkills } from './skills.js';
import { getContactLine } from './contact.js';

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

function sectionTitle(text) {
  return {
    text,
    style: 'sectionHeading',
    margin: [0, 14, 0, 6],
  };
}

function skillCell(skill) {
  if (!skill) return { text: '' };
  return {
    text: [
      { text: `${skill.category}: `, bold: true },
      { text: skill.items || '' },
    ],
    margin: [0, 0, 0, 8],
  };
}

function buildSkillsTable(skills) {
  const { left, right } = getSkillColumns(normalizeSkills(skills));
  const rowCount = Math.max(left.length, right.length);
  const body = [];

  for (let i = 0; i < rowCount; i++) {
    body.push([skillCell(left[i]), skillCell(right[i])]);
  }

  if (!body.length) return { text: '', margin: [0, 0, 0, 8] };

  return {
    table: {
      widths: ['*', '*'],
      body,
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 8],
  };
}

export function buildPdfBlob(resume) {
  const content = [
    { text: resume.name, style: 'name', alignment: 'center', margin: [0, 0, 0, 4] },
  ];

  if (resume.professionalTitle?.trim()) {
    content.push({
      text: resume.professionalTitle,
      style: 'professionalTitle',
      alignment: 'center',
      margin: [0, 0, 0, 6],
    });
  }

  content.push(
    { text: getContactLine(resume), style: 'contact', alignment: 'center', margin: [0, 0, 0, 16] },
    sectionTitle('Professional Summary'),
    { text: resume.summary || '', style: 'body', margin: [0, 0, 0, 8] },
    sectionTitle('Skills'),
    buildSkillsTable(resume.skills),
    sectionTitle('Work Experience'),
  );

  for (const exp of resume.experience || []) {
    content.push(
      {
        text: [
          { text: exp.title || '', bold: true },
          { text: exp.company ? `  |  ${exp.company}` : '' },
        ],
        style: 'body',
        margin: [0, 8, 0, 2],
      },
      {
        text: `${exp.startDate} – ${exp.endDate}`,
        italics: true,
        style: 'small',
        margin: [0, 0, 0, 4],
      },
    );

    const bullets = (exp.bullets || []).filter((b) => b.trim());
    if (bullets.length) {
      content.push({
        ul: bullets,
        style: 'body',
        margin: [0, 0, 0, 6],
      });
    }
  }

  if (resume.education?.length) {
    content.push(sectionTitle('Education'));
    for (const edu of resume.education) {
      content.push(
        {
          text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} — ${edu.school}`,
          bold: true,
          style: 'body',
          margin: [0, 0, 0, 2],
        },
        { text: edu.date || '', style: 'small', margin: [0, 0, 0, 8] },
      );
    }
  }

  if (resume.certifications?.length) {
    content.push(sectionTitle('Certifications'));
    content.push({
      ul: resume.certifications.map(
        (cert) => `${cert.name}${cert.date ? ` — ${cert.date}` : ''}`,
      ),
      style: 'body',
      margin: [0, 0, 0, 8],
    });
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [54, 54, 54, 54],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.25,
    },
    styles: {
      name: { fontSize: 18, bold: true },
      professionalTitle: { fontSize: 11, bold: true },
      contact: { fontSize: 10, color: '#333333' },
      sectionHeading: { fontSize: 11, bold: true, decoration: 'underline' },
      body: { fontSize: 11 },
      small: { fontSize: 10, color: '#444444' },
    },
    content,
  };

  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (err) {
      reject(err);
    }
  });
}
