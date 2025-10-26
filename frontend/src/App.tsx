import { Outlet, NavLink } from 'react-router-dom'
import Layout from '@/components/Layout'

export default function App() {
  return (
    <Layout>
      <nav className="border-b mb-4">
        <ul className="flex gap-4 p-2">
          <li><NavLink to="/" className={({isActive})=> isActive ? 'text-blue-600' : ''}>Products</NavLink></li>
          <li><NavLink to="/categories" className={({isActive})=> isActive ? 'text-blue-600' : ''}>Categories</NavLink></li>
        </ul>
      </nav>
      <Outlet />
    </Layout>
  )
}
