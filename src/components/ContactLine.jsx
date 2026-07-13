import SocialIcon from './SocialIcon';
import { getContactDisplay, getLinkIconType } from '../utils/contact';

export default function ContactLine({ resume, iconSize = 15 }) {
  const { textParts, links } = getContactDisplay(resume);

  if (!textParts.length && !links.length) {
    return <p className="resume-contact">—</p>;
  }

  return (
    <p className="resume-contact">
      {textParts.map((part, i) => (
        <span key={`text-${i}`}>
          {i > 0 && <span className="contact-sep"> | </span>}
          {part}
        </span>
      ))}

      {links.length > 0 && textParts.length > 0 && (
        <span className="contact-sep"> | </span>
      )}

      <span className="contact-icons">
        {links.map((link) => {
          const type = getLinkIconType(link);
          return (
            <a
              key={link.id}
              href={link.url.trim()}
              target="_blank"
              rel="noreferrer"
              className="contact-icon-link"
              title={link.label ? `${link.label}: ${link.url}` : link.url}
              aria-label={link.label || link.url}
            >
              <SocialIcon type={type} size={iconSize} />
            </a>
          );
        })}
      </span>
    </p>
  );
}
