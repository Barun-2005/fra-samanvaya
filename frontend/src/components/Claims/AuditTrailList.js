const AuditTrailList = ({ auditTrail }) => {
    return (
      <div className="space-y-4">
        {auditTrail.map((entry, index) => (
          <div key={entry._id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-primary/20 ring-4 ring-background dark:ring-card-dark"></div>
              {index < auditTrail.length - 1 && <div className="w-px flex-1 bg-border dark:border-border-dark"></div>}
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-text-primary-dark">{entry.action}</p>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">by {entry.user} on {new Date(entry.timestamp).toLocaleString()}</p>
              <p className="text-sm mt-1">{entry.notes}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default AuditTrailList;