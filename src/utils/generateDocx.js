import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { getSkillColumns, normalizeSkills } from './skills.js';

const FONT = 'Arial';
const BODY_SIZE = 22;
const HEADING_SIZE = 24;
const NAME_SIZE = 32;
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

function textPara(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 80 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? BODY_SIZE,
        bold: opts.bold ?? false,
        italics: opts.italics ?? false,
      }),
    ],
  });
}

function sectionHeading(title) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333' },
    },
    children: [
      new TextRun({
        text: title,
        font: FONT,
        size: HEADING_SIZE,
        bold: true,
      }),
    ],
  });
}

function bulletPara(text) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: BODY_SIZE,
      }),
    ],
  });
}

function skillCategoryPara(category, items) {
  if (!category?.trim() && !items?.trim()) {
    return new Paragraph({ children: [] });
  }
  return new Paragraph({
    spacing: { after: 140 },
    children: [
      new TextRun({ text: `${category}: `, font: FONT, size: BODY_SIZE, bold: true }),
      new TextRun({ text: items || '', font: FONT, size: BODY_SIZE }),
    ],
  });
}

function buildSkillsSection(skills) {
  const { left, right } = getSkillColumns(skills);
  const rowCount = Math.max(left.length, right.length);
  const rows = [];

  for (let i = 0; i < rowCount; i++) {
    const leftSkill = left[i];
    const rightSkill = right[i];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
            },
            children: [
              leftSkill
                ? skillCategoryPara(leftSkill.category, leftSkill.items)
                : new Paragraph({ children: [] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
            },
            children: [
              rightSkill
                ? skillCategoryPara(rightSkill.category, rightSkill.items)
                : new Paragraph({ children: [] }),
            ],
          }),
        ],
      }),
    );
  }

  if (!rows.length) {
    return [textPara('')];
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: NO_BORDER,
        bottom: NO_BORDER,
        left: NO_BORDER,
        right: NO_BORDER,
        insideHorizontal: NO_BORDER,
        insideVertical: NO_BORDER,
      },
      rows,
    }),
  ];
}

export async function buildDocxBlob(resume) {
  const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean);
  const skillsSection = buildSkillsSection(normalizeSkills(resume.skills));

  const children = [
    textPara(resume.name, { size: NAME_SIZE, bold: true, center: true, after: 40 }),
    textPara(contactParts.join(' | '), { center: true, after: 200 }),
    sectionHeading('Professional Summary'),
    textPara(resume.summary),
    sectionHeading('Skills'),
    ...skillsSection,
    sectionHeading('Work Experience'),
  ];

  for (const exp of resume.experience) {
    const dateRange = `${exp.startDate} – ${exp.endDate}`;
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: exp.title, font: FONT, size: BODY_SIZE, bold: true }),
          new TextRun({ text: `  |  ${exp.company}`, font: FONT, size: BODY_SIZE }),
        ],
      }),
      textPara(dateRange, { italics: true, after: 60 }),
    );
    for (const bullet of exp.bullets) {
      if (bullet.trim()) children.push(bulletPara(bullet.trim()));
    }
  }

  if (resume.education?.length) {
    children.push(sectionHeading('Education'));
    for (const edu of resume.education) {
      children.push(
        textPara(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''} — ${edu.school}`, { bold: true, after: 40 }),
        textPara(edu.date, { after: 120 }),
      );
    }
  }

  if (resume.certifications?.length) {
    children.push(sectionHeading('Certifications'));
    for (const cert of resume.certifications) {
      children.push(textPara(`${cert.name}${cert.date ? ` — ${cert.date}` : ''}`, { after: 80 }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function downloadDocxBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
