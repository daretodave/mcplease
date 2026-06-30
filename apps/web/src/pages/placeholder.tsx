interface PlaceholderProps {
  title: string;
  blurb: string;
}

/**
 * A minimal route stub for the not-yet-designed screens. Each real screen (create, share, edit, legal)
 * swaps in its designed component on its route; until then the route renders this. Visual styling comes
 * from the global body tokens — no per-screen styles land before the design pass.
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
