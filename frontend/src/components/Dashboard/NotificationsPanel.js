import PropTypes from 'prop-types';
import Link from 'next/link';

const NotificationIcon = ({ type }) => {
    // In a real app, type would determine the icon
    return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ring/20 flex items-center justify-center">
            <svg className="feather feather-alert-circle text-primary" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
        </div>
    )
}

export default function NotificationsPanel({ notifications }) {
    return (
        <div className="bg-card p-6 rounded-2xl shadow-soft">
            <h3 className="text-xl font-bold text-card-foreground mb-4">Action Items</h3>
             <div className="space-y-4">
                {(!notifications || notifications.length === 0) ? (
                    <p className="text-muted-foreground text-sm">You have no pending action items.</p>
                ) : (
                    notifications.map(item => (
                        <div key={item._id} className="flex items-start gap-4">
                            <NotificationIcon type="action" />
                            <div>
                                <p className="font-semibold text-card-foreground">
                                    <Link href={`/claim/${item._id}`} className="hover:underline">
                                        Claim #{item.claimId || item._id.slice(-6)} requires your attention.
                                    </Link>
                                </p>
                                <p className="text-sm text-muted-foreground">Assigned to you - Status: {item.status}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

NotificationsPanel.propTypes = {
  notifications: PropTypes.array,
};
