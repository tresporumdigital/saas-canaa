import { Breadcrumb } from '../ui/Feedback.jsx';

export default function PageHeader({ crumbs, title, subtitle, actions }) {
  return (
    <div className="page-header">
      {crumbs?.length ? <Breadcrumb items={crumbs} /> : null}
      <div className="ph-top">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p className="ph-sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="ph-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
