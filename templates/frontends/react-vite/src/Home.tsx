export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.5', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#111' }}>
          Welcome to <span style={{ color: '#0070f3' }}>StuckonStack</span>
        </h1>
        <p style={{ color: '#666', fontSize: '1.25rem', marginTop: '0.5rem' }}>
          The smartest, fastest scaffolding CLI for full-stack developers.
        </p>
      </header>
      
      <main>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem' }}>Next Steps</h2>
          <ul style={{ paddingLeft: '1.5rem', color: '#333' }}>
            <li>Edit <code>client/src/Home.tsx</code> to start building your UI.</li>
            <li>Check <code>package.json</code> for available scripts.</li>
            <li>Read the generated <code>docs/status.md</code> (if available) for project details.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem' }}>Learn More</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer" style={cardStyle}>
              <h3>React Docs &rarr;</h3>
              <p>Learn how to build user interfaces with React.</p>
            </a>
            <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" style={cardStyle}>
              <h3>Vite Docs &rarr;</h3>
              <p>Next Generation Frontend Tooling.</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

const cardStyle = {
  padding: '1.5rem',
  border: '1px solid #eaeaea',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s',
};