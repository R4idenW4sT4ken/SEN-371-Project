export default function EmptyState({ icon: Icon, title, copy, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon" aria-hidden="true">
          <Icon />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {copy && <p className="empty-copy">{copy}</p>}
      {action}
    </div>
  );
}