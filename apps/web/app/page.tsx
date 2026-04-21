export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 16 }}>
        Vakmensen voor jouw klus. <br /> Eerlijk en snel betaald.
      </h1>
      <p style={{ fontSize: 18, color: "var(--color-muted)" }}>
        Plaats je klus met je stem, ontvang een AI-prijsinschatting, en betaal veilig via escrow.
        Geen leadkosten voor vakmensen. 10% commissie, alleen bij afgeronde opdrachten.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <a
          href="/post-job"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            padding: "12px 24px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Plaats een klus
        </a>
        <a
          href="/pros"
          style={{
            border: "1px solid var(--color-muted)",
            color: "var(--color-fg)",
            padding: "12px 24px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Ik ben vakman
        </a>
      </div>
    </main>
  );
}
