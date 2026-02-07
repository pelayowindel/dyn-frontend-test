import { Route, Routes } from 'react-router-dom'
import Timer from './pages/Timer'
import Recordings from './pages/Recordings'
import NotFound from './pages/NotFound'
import Layout from './pages/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Timer />} />
        <Route path="recordings" element={<Recordings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
