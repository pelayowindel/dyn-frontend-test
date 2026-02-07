import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <Outlet />
    </div>
  )
}
