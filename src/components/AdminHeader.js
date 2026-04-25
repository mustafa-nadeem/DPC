export default function AdminHeader({ title, subtitle }) {
  return (
    <header className="admin-header">
      <div>
        <p className="admin-header__eyebrow">Secretary admin portal</p>
        <h1 className="admin-header__title">{title}</h1>
        {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
