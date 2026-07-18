interface PlaceholderProps {
  title: string;
  blurb: string;
}

/**
 * A minimal route stub. Every named screen now has its designed component; what's left on this is the
 * catch-all not-found route, until that state earns a design of its own. Visual styling comes from the
 * global body tokens — no per-screen styles land before the design pass.
 */
export function Placeholder({ title, blurb }: PlaceholderProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>{blurb}</p>
      <p>
        <a href="https://github.com/daretodave/mcplease">github.com/daretodave/mcplease</a>
      </p>
    </main>
  );
}
