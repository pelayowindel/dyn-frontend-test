import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Page not found.</p>
      <p>
        Go to <Link to="/">Home</Link>.
      </p>
    </section>
  )
}
