/*
  Biblioteca de componentes — Atomic Design (Brad Frost).
  Camadas: atoms -> molecules -> organisms -> templates. As páginas (src/pages) são o 5º nível.
  Importe sempre deste barril: `import { Button, Field, DataTable } from '../../components';`
  Mapa completo em src/components/README.md.
*/

/* ---------------- Atoms ---------------- */
export { default as Icon } from './atoms/Icon.jsx';
export { default as IconSprite } from './atoms/IconSprite.jsx';
export { default as GoogleIcon } from './atoms/GoogleIcon.jsx';
export { Button } from './atoms/Button.jsx';
export { Card } from './atoms/Card.jsx';
export { Badge } from './atoms/Badge.jsx';
export { Tag } from './atoms/Tag.jsx';
export { Avatar } from './atoms/Avatar.jsx';
export { Bar } from './atoms/Bar.jsx';
export { Spark } from './atoms/Spark.jsx';
export { Skeleton } from './atoms/Skeleton.jsx';
export { default as Spinner } from './atoms/Spinner.jsx';
export { Divider } from './atoms/Divider.jsx';

/* ---------------- Molecules ---------------- */
export {
  Field, Input, PasswordInput, Select, Textarea, Checkbox, Radio, FieldRow,
} from './molecules/Field.jsx';
export { DefList } from './molecules/DefList.jsx';
export { AvatarGroup } from './molecules/AvatarGroup.jsx';
export { StatCard } from './molecules/StatCard.jsx';
export { Alert } from './molecules/Alert.jsx';
export { EmptyState } from './molecules/EmptyState.jsx';
export { Breadcrumb } from './molecules/Breadcrumb.jsx';
export { Pagination } from './molecules/Pagination.jsx';
export { SkeletonRows } from './molecules/SkeletonRows.jsx';
export { GoogleButton } from './molecules/GoogleButton.jsx';

/* ---------------- Organisms ---------------- */
export { default as DataTable } from './organisms/DataTable.jsx';
export { Modal, ConfirmDialog } from './organisms/Modal.jsx';
export { Drawer } from './organisms/Drawer.jsx';
export { Tabs } from './organisms/Tabs.jsx';
export { Timeline, CoverageBanner, AgingBars, PrintDocument } from './organisms/Domain.jsx';
export { default as PageHeader } from './organisms/PageHeader.jsx';
export { default as NavRail } from './organisms/NavRail.jsx';
export { default as NavPanel } from './organisms/NavPanel.jsx';
export { default as MobileNav } from './organisms/MobileNav.jsx';
export { default as TopBar } from './organisms/TopBar.jsx';
export { default as RoleSwitcher } from './organisms/RoleSwitcher.jsx';
export { default as UserMenu } from './organisms/UserMenu.jsx';
export { default as RequireAuth } from './organisms/RequireAuth.jsx';
export { default as LoginForm } from './organisms/auth/LoginForm.jsx';
export { default as RegisterForm } from './organisms/auth/RegisterForm.jsx';

/* ---------------- Templates ---------------- */
export { default as AppLayout } from './templates/AppLayout.jsx';
export { default as AuthLayout } from './templates/AuthLayout.jsx';
