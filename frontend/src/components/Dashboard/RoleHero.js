//- /frontend/src/components/Dashboard/RoleHero.js
import PropTypes from 'prop-types';

export default function RoleHero({ user }) {
  if (!user) return null;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user.displayName}!</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-card hover:bg-muted transition-colors">
            {/* Bell Icon */}
        </button>
        <img alt="User avatar" className="w-10 h-10 rounded-full" src={`https://i.pravatar.cc/150?u=${user._id}`} />
      </div>
    </header>
  );
}

RoleHero.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  }),
};
