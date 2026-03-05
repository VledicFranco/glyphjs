import { createLowlight, common } from 'lowlight';

// ── Functional languages ──────────────────────────────────────
import scala from 'highlight.js/lib/languages/scala';
import haskell from 'highlight.js/lib/languages/haskell';
import clojure from 'highlight.js/lib/languages/clojure';
import clojureRepl from 'highlight.js/lib/languages/clojure-repl';
import elixir from 'highlight.js/lib/languages/elixir';
import erlang from 'highlight.js/lib/languages/erlang';
import erlangRepl from 'highlight.js/lib/languages/erlang-repl';
import fsharp from 'highlight.js/lib/languages/fsharp';
import ocaml from 'highlight.js/lib/languages/ocaml';
import elm from 'highlight.js/lib/languages/elm';
import scheme from 'highlight.js/lib/languages/scheme';
import sml from 'highlight.js/lib/languages/sml';
import lisp from 'highlight.js/lib/languages/lisp';
import reasonml from 'highlight.js/lib/languages/reasonml';
import hy from 'highlight.js/lib/languages/hy';
import flix from 'highlight.js/lib/languages/flix';
import clean from 'highlight.js/lib/languages/clean';

// ── Math / scientific languages ───────────────────────────────
import julia from 'highlight.js/lib/languages/julia';
import juliaRepl from 'highlight.js/lib/languages/julia-repl';
import matlab from 'highlight.js/lib/languages/matlab';
import mathematica from 'highlight.js/lib/languages/mathematica';
import latex from 'highlight.js/lib/languages/latex';
import scilab from 'highlight.js/lib/languages/scilab';
import maxima from 'highlight.js/lib/languages/maxima';
import gauss from 'highlight.js/lib/languages/gauss';
import stan from 'highlight.js/lib/languages/stan';
import stata from 'highlight.js/lib/languages/stata';
import fortran from 'highlight.js/lib/languages/fortran';
import mizar from 'highlight.js/lib/languages/mizar';
import coq from 'highlight.js/lib/languages/coq';
import prolog from 'highlight.js/lib/languages/prolog';

// ── Singleton highlighter ─────────────────────────────────────
export const highlighter = createLowlight(common);

highlighter.register({
  scala,
  haskell,
  clojure,
  'clojure-repl': clojureRepl,
  elixir,
  erlang,
  'erlang-repl': erlangRepl,
  fsharp,
  ocaml,
  elm,
  scheme,
  sml,
  lisp,
  reasonml,
  hy,
  flix,
  clean,
  julia,
  'julia-repl': juliaRepl,
  matlab,
  mathematica,
  latex,
  scilab,
  maxima,
  gauss,
  stan,
  stata,
  fortran,
  mizar,
  coq,
  prolog,
});

// ── Token → CSS variable mapping ─────────────────────────────
export const HLJS_TOKEN_VARS: Record<string, string> = {
  'hljs-keyword': 'var(--glyph-code-token-keyword, #d73a49)',
  'hljs-string': 'var(--glyph-code-token-string, #032f62)',
  'hljs-comment': 'var(--glyph-code-token-comment, #6a737d)',
  'hljs-number': 'var(--glyph-code-token-number, #005cc5)',
  'hljs-title': 'var(--glyph-code-token-function, #6f42c1)',
  'hljs-type': 'var(--glyph-code-token-type, #e36209)',
  'hljs-built_in': 'var(--glyph-code-token-builtin, #6f42c1)',
  'hljs-attr': 'var(--glyph-code-token-attr, #005cc5)',
  'hljs-literal': 'var(--glyph-code-token-literal, #005cc5)',
  'hljs-operator': 'var(--glyph-code-token-operator, #d73a49)',
  'hljs-variable': 'var(--glyph-code-token-variable, #e36209)',
  'hljs-regexp': 'var(--glyph-code-token-regexp, #032f62)',
  'hljs-meta': 'var(--glyph-code-token-meta, #6a737d)',
};
