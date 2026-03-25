import './Account.css';

const AccountSkeleton = () => (
    <div className="account-page container account-skeleton-page">
      <div className="account-header-wrapper">
        <div className="account-header">
          <div className="account-skeleton-title"></div>
          <div className="account-skeleton-badge-pill"></div>
        </div>
        <div className="account-tabs">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="account-skeleton-tab"></div>
          ))}
        </div>
      </div>
      <div className="tab-content-container">
        <div className="account-skeleton-card-large">
          <div className="account-skeleton-card-header">
            <div className="account-skeleton-avatar-lg"></div>
            <div className="account-skeleton-title-sm"></div>
          </div>
          <div className="account-skeleton-grid-sm">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="account-skeleton-item-sm"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
);

export default AccountSkeleton;
