import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from 'docx';

const FONT = 'Arial';
const BODY_SIZE = 22;
const HEADING_SIZE = 24;
const NAME_SIZE = 32;

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

export async function buildDocxBlob(resume) {
  const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean);

  const children = [
    textPara(resume.name, { size: NAME_SIZE, bold: true, center: true, after: 40 }),
    textPara(contactParts.join(' | '), { center: true, after: 200 }),
    sectionHeading('Professional Summary'),
    textPara(resume.summary),
    sectionHeading('Skills'),
    textPara(resume.skills.join(' • ')),
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
