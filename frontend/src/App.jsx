import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import WordList from './pages/WordList.jsx'
import WordForm from './pages/WordForm.jsx'
import WordDetail from './pages/WordDetail.jsx'
import Practice from './pages/Practice.jsx'
import CardPool from './pages/CardPool.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/words" replace />} />
        <Route path="/words" element={<WordList />} />
        <Route path="/words/new" element={<WordForm />} />
        <Route path="/words/:id" element={<WordDetail />} />
        <Route path="/words/:id/edit" element={<WordForm />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/cards" element={<CardPool />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/words" replace />} />
      </Routes>
    </Layout>
  )
}
