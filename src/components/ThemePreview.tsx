import React, { useEffect, useState } from "react";

type SwatchProps = {
  name: string;
  cssVar: string;
  border?: boolean;
};

const Swatch: React.FC<SwatchProps> = ({ name, cssVar, border }) => (
  <div
    className="rounded-md overflow-hidden shadow-sm"
    style={{
      background: `hsl(var(${cssVar}))`,
      border: border ? `1px solid hsl(var(--border))` : undefined,
    }}
  >
    <div className="p-3 text-xs flex items-center justify-between">
      <span className="text-foreground/70">{name}</span>
      <code className="text-foreground/60">{cssVar}</code>
    </div>
    <div className="h-10" />
  </div>
);

export const ThemePreview: React.FC = () => {
  const [experiment, setExperiment] = useState<"none" | "light" | "dark">("none");

  useEffect(() => {
    const el = document.body;
    el.classList.remove("theme-experiment-light", "theme-experiment-dark");
    if (experiment === "light") el.classList.add("theme-experiment-light");
    if (experiment === "dark") el.classList.add("theme-experiment-dark");
    return () => {
      el.classList.remove("theme-experiment-light", "theme-experiment-dark");
    };
  }, [experiment]);

  const lightGrays = [
    { name: "gray-l-1", var: "--gray-l-1" },
    { name: "gray-l-2", var: "--gray-l-2" },
    { name: "gray-l-3", var: "--gray-l-3" },
    { name: "gray-l-4", var: "--gray-l-4" },
    { name: "gray-l-5", var: "--gray-l-5" },
  ];
  const darkGrays = [
    { name: "gray-d-1", var: "--gray-d-1" },
    { name: "gray-d-2", var: "--gray-d-2" },
    { name: "gray-d-3", var: "--gray-d-3" },
    { name: "gray-d-4", var: "--gray-d-4" },
    { name: "gray-d-5", var: "--gray-d-5" },
  ];

  const surfaces = [
    { name: "background", var: "--background" },
    { name: "card", var: "--card" },
    { name: "secondary", var: "--secondary" },
    { name: "accent", var: "--accent" },
    { name: "border", var: "--border" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Experiment mapping:</span>
        <button
          className={`px-3 py-1.5 rounded-md text-sm border ${experiment === "none" ? "bg-accent text-accent-foreground" : "bg-transparent"}`}
          onClick={() => setExperiment("none")}
        >
          None
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm border ${experiment === "light" ? "bg-accent text-accent-foreground" : "bg-transparent"}`}
          onClick={() => setExperiment("light")}
        >
          Light experiment
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm border ${experiment === "dark" ? "bg-accent text-accent-foreground" : "bg-transparent"}`}
          onClick={() => setExperiment("dark")}
        >
          Dark experiment
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Light theme grays</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {lightGrays.map((g) => (
            <Swatch key={g.name} name={g.name} cssVar={g.var} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Dark theme grays</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {darkGrays.map((g) => (
            <Swatch key={g.name} name={g.name} cssVar={g.var} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Mapped surfaces</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {surfaces.map((s) => (
            <Swatch key={s.name} name={s.name} cssVar={`--${s.name}`} border={s.name === "border"} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{ background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}>
            <div className="text-sm opacity-70 mb-2">Card example</div>
            <div className="text-base">Primary text on card</div>
            <div className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Muted text</div>
            <button
              className="mt-3 px-3 py-1.5 rounded-md text-sm transition-colors"
              style={{
                background: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground))",
              }}
            >
              Accent button
            </button>
          </div>

          <div className="rounded-lg p-4 border" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="text-sm opacity-70 mb-2">Border and text</div>
            <div className="text-base" style={{ color: "hsl(var(--foreground))" }}>Foreground text</div>
            <input
              className="mt-3 w-full rounded-md bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              placeholder="Input using --input and --ring"
              style={{
                border: "1px solid",
                borderColor: "hsl(var(--input))",
                boxShadow: "0 0 0 0 hsl(var(--ring))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
