import { Route, Routes } from 'react-router-dom'
import App from '../App'
import AdminDashboard from '../admin/AdminDashboard'
import AdminRoute from '../auth/AdminRoute'

export default function AppRouter() {
  return <Routes>
    <Route path="/" element={<App />} />
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminDashboard />} />
    </Route>
    <Route path="*" element={<App />} />
  </Routes>
}
