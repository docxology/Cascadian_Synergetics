/**
 * grove-geometry.js - the synergetic geometry both games draw, kept in one place
 *
 *   jitterbug(r, E)              the eight triangles and six squares of the jitterbug at a/b = r, edge E
 *   jitterVolume(J, E)           its volume in tetravolumes of a tetrahedron with edge E
 *   ivmLattice(radius, edge)     isotropic vector matrix nodes and struts within a radius
 *   latticeAddress(x, y, z, e)   a node's whole quadray address in QuadCraft's convention
 *   veSolid(E)                   a vector equilibrium as twenty triangles, for the ash
 *   aModules(V)                  Fuller's 24 A quanta modules of the tetrahedron with corners V
 *
 * Needs QuadCraft's Quadray (vendor/quadcraft/quadray.js) and aceTetravolume (lib/tetravolume.js)
 * spliced before it. tools/build.mjs splices this file, unchanged, into both games.
 */
/* jitterbug: cyclic permutations of (0, ±a, ±b); a = b is the vector equilibrium, a/b = 1/phi the icosahedron, a = 0 the octahedron */
function jitterbug(r, E){
  const a = r, b = 1, e = Math.sqrt(a * a + b * b + (a - b) * (a - b)), k = E / e, tris = [];
  for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) tris.push([[0, sy * a * k, sz * b * k], [sx * b * k, 0, sz * a * k], [sx * a * k, sy * b * k, 0]]);
  const cyc = v => [v[2], v[0], v[1]], squares = [];
  for (const s of [1, -1]){ let q = [[s * b * k, 0, a * k], [s * a * k, b * k, 0], [s * b * k, 0, -a * k], [s * a * k, -b * k, 0]]; squares.push(q); q = q.map(cyc); squares.push(q); q = q.map(cyc); squares.push(q); }
  return { tris, squares };
}
/* isotropic vector matrix: face-centred cubic points, every node joined to its twelve neighbours by equal edges.
   Axis-aligned like this, it sits in QuadCraft's own frame: scale by 2 / edge and every node's quadray is whole. */
function ivmLattice(radius, edge){
  const s = edge / Math.SQRT2, n = Math.ceil(radius / s) + 1, nodes = [], edges = [];
  const inside = (i, j, k) => Math.hypot(i * s, j * s, k * s) <= radius;
  const NB = [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) for (let k = -n; k <= n; k++){
    if ((((i + j + k) % 2) + 2) % 2 || !inside(i, j, k)) continue;
    nodes.push([i * s, j * s, k * s]);
    for (const d of NB){ const a = i + d[0], b = j + d[1], cc = k + d[2]; if (inside(a, b, cc)) edges.push([[i * s, j * s, k * s], [a * s, b * s, cc * s]]); }
  }
  return { nodes, edges, s };
}
/* a node's address: its quadray in QuadCraft's convention, one lattice edge being two units, measured from the lattice's origin (each game puts it at the foot of the Ring) */
function latticeAddress(x, y, z, edge){
  const k = 2 / edge, q = Quadray.fromCartesian(x * k, y * k, z * k), a = [q.a, q.b, q.c, q.d], r = a.map(Math.round);
  return a.every((v, i) => Math.abs(v - r[i]) < 1e-6) ? r : null;
}
/* the jitterbug's volume in tetravolumes of a tetrahedron with its own edge: cones from the centre to the eight
   triangles and to the six squares, each square folded on its shorter diagonal, each cone counted by the 5x5 determinant */
function jitterVolume(J, E){
  const k = 2 / E, o = [0, 0, 0, 0], d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const qOf = v => { const q = Quadray.fromCartesian(v[0] * k, v[1] * k, v[2] * k); return [q.a, q.b, q.c, q.d]; };
  let V = 0; const cone = (a, b, c) => { V += aceTetravolume(o, qOf(a), qOf(b), qOf(c)); };
  for (const t of J.tris) cone(t[0], t[1], t[2]);
  for (const q of J.squares){ if (d(q[0], q[2]) <= d(q[1], q[3])){ cone(q[0], q[1], q[2]); cone(q[0], q[2], q[3]); } else { cone(q[1], q[2], q[3]); cone(q[1], q[3], q[0]); } }
  return V;
}
/* a vector equilibrium as twenty triangles: the shape of each flake of ash over the station */
function veSolid(E){
  const J = jitterbug(1, E), pos = [];
  for (const t of J.tris) for (const v of t) pos.push(...v);
  for (const q of J.squares) for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) pos.push(...q[a], ...q[b], ...q[c]);
  return pos;
}
/* Fuller's A quanta modules: the tetrahedron with corners V cut into 24 equal pieces. Each joins the centre, a corner,
   the midpoint of an edge at that corner and the centre of a face holding both; half turn one way, half the other.
   Works in any coordinates where averages mean midpoints: XYZ, or quadrays. */
function aModules(V){
  const avg = (...ps) => ps[0].map((_, k) => ps.reduce((s, p) => s + p[k], 0) / ps.length), c = avg(...V), out = [];
  for (let f = 0; f < 4; f++){
    const face = [0, 1, 2, 3].filter(i => i !== f), fc = avg(...face.map(i => V[i]));
    for (const v of face) for (const w of face) if (w !== v) out.push([c, V[v], avg(V[v], V[w]), fc]);
  }
  return out;
}
