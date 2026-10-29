import { useEffect, useState } from 'react';

const apiBase = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiBase}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('API is not reachable'));

    fetch(`${apiBase}/api/users`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  return (
    <main className="page">
      <header>
        <h1>learnstack</h1>
        <p className="subtitle">Delivery Engineering Lab</p>
      </header>

      <section className="card">
        <h2>API health</h2>
        {error && <p className="error">{error}</p>}
        {!error && !health && <p>Loading...</p>}
        {health && (
          <dl>
            <dt>Status</dt>
            <dd>{health.status}</dd>
            <dt>Environment</dt>
            <dd>{health.env}</dd>
            <dt>Database</dt>
            <dd>{health.db}</dd>
            <dt>Uptime</dt>
            <dd>{health.uptimeSeconds}s</dd>
          </dl>
        )}
      </section>

      <section className="card">
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
