//- /frontend/src/components/Dashboard/StatCard.js
import PropTypes from 'prop-types';

export default function StatCard({ title, value, unit }) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-soft">
      <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
      <div className="flex items-baseline mt-6">
        <span className="text-4xl font-bold text-primary">{value}</span>
        {unit && <span className="ml-2 text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
};
