import Link from 'next/link';
import PropTypes from 'prop-types';

export default function ActionCard({ title, description, value, unit, href, linkText, children }) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-soft flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {value !== undefined && (
        <div className="flex items-baseline mt-4">
          <span className="text-4xl font-bold text-primary">{value}</span>
          {unit && <span className="ml-2 text-muted-foreground">{unit}</span>}
        </div>
      )}
      
      {children && <div className="mt-4 flex-1">{children}</div>}

      {href && linkText && (
        <Link href={href} className="block text-center mt-6 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors">
            {linkText}
        </Link>
      )}
    </div>
  );
}

ActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  href: PropTypes.string,
  linkText: PropTypes.string,
  children: PropTypes.node,
};
