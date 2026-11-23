/**
 * tetravolume.js - exact tetravolumes on the isotropic vector matrix
 *
 * A JavaScript port of three pieces of QuadMath (https://github.com/docxology/QuadMath,
 * Apache-2.0), commit 6e1f004, whose Python sources are vendored in vendor/quadmath/:
 *
 *   bareissDeterminant    <- bareiss_determinant_int  src/quadmath/core/linalg_utils.py
 *   aceTetravolumeExact   <- ace_tetravolume_5x5       src/quadmath/core/quadray.py
 *   IVM_NEIGHBOR_MOVES    <- IVM_NEIGHBOR_MOVES        src/quadmath/core/quadray.py
 *
 * tests/check.mjs holds the port to answers that the vendored Python computed
 * (tests/fixtures/quadmath.json). aceTetravolume is a floating-point companion for
 * real-valued quadrays; it is not part of QuadMath and is not exact.
 *
 * Quadrays may be [a, b, c, d] arrays or objects with a, b, c, d fields (QuadCraft's Quadray).
 * tools/build.mjs splices this file, unchanged, into src/field-station.html.
 */

function quadrayComponents(q) {
    return Array.isArray(q) ? q : [q.a, q.b, q.c, q.d];
}

/**
 * Exact integer determinant by Bareiss's fraction-free elimination, with the same
 * partial pivoting as QuadMath. Takes integers (numbers or BigInt), returns a BigInt.
 * BigInt() refuses a non-integer entry, so floats never reach the exact path.
 */
function bareissDeterminant(matrix) {
    const n = matrix.length;
    if (n === 0) return 1n;
    for (const row of matrix) {
        if (row.length !== n) throw new Error('Matrix must be square');
    }
    const a = matrix.map(row => row.map(v => BigInt(v)));
    let denom = 1n;
    let sign = 1n;
    for (let k = 0; k < n - 1; k++) {
        if (a[k][k] === 0n) {
            let pivotRow = -1;
            for (let r = k + 1; r < n; r++) {
                if (a[r][k] !== 0n) { pivotRow = r; break; }
            }
            if (pivotRow < 0) return 0n;
            [a[k], a[pivotRow]] = [a[pivotRow], a[k]];
            sign = -sign;
        }
        const pivot = a[k][k];
        for (let i = k + 1; i < n; i++) {
            for (let j = k + 1; j < n; j++) {
                let num = a[i][j] * pivot - a[i][k] * a[k][j];
                // Exact: denom divides num whenever the inputs are integers, so truncating
                // BigInt division agrees with Python's floor division here.
                if (denom !== 1n) num /= denom;
                a[i][j] = num;
            }
        }
        denom = pivot;
    }
    return sign * a[n - 1][n - 1];
}

/** Tom Ace's 5x5 matrix: one row [a, b, c, d, 1] per vertex, then [1, 1, 1, 1, 0]. */
function aceMatrix(p0, p1, p2, p3) {
    return [p0, p1, p2, p3].map(p => [...quadrayComponents(p), 1]).concat([[1, 1, 1, 1, 0]]);
}

/**
 * Tetravolume = |det(Ace matrix)| / 4, exact for integer quadrays, as a reduced
 * fraction [numerator, denominator] of BigInts. The unit IVM tetrahedron (the origin
 * and three neighbour moves) is [1n, 1n]; the primitive one (the origin and three
 * basis tips) is [1n, 4n].
 */
function aceTetravolumeExact(p0, p1, p2, p3) {
    let num = bareissDeterminant(aceMatrix(p0, p1, p2, p3));
    if (num < 0n) num = -num;
    let x = num, y = 4n;
    while (y) [x, y] = [y, x % y];
    return [num / x, 4n / x];
}

/** The same 5x5 determinant in floating point, for real-valued quadrays. Not exact. */
function aceTetravolume(p0, p1, p2, p3) {
    const m = aceMatrix(p0, p1, p2, p3);
    let det = 1;
    for (let k = 0; k < 5; k++) {
        let piv = k;
        for (let r = k + 1; r < 5; r++) if (Math.abs(m[r][k]) > Math.abs(m[piv][k])) piv = r;
        if (m[piv][k] === 0) return 0;
        if (piv !== k) { [m[k], m[piv]] = [m[piv], m[k]]; det = -det; }
        det *= m[k][k];
        for (let i = k + 1; i < 5; i++) {
            const f = m[i][k] / m[k][k];
            for (let j = k; j < 5; j++) m[i][j] -= f * m[k][j];
        }
    }
    return Math.abs(det) / 4;
}

/** The 12 IVM neighbour moves: the distinct permutations of (2, 1, 1, 0), sorted. */
const IVM_NEIGHBOR_MOVES = (() => {
    const out = new Set();
    const permute = (rest, acc) => {
        if (!rest.length) { out.add(acc.join(',')); return; }
        rest.forEach((v, i) => permute(rest.filter((_, j) => j !== i), acc.concat(v)));
    };
    permute([2, 1, 1, 0], []);
    return [...out].sort().map(s => s.split(',').map(Number));
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bareissDeterminant, aceMatrix, aceTetravolumeExact, aceTetravolume, IVM_NEIGHBOR_MOVES };
}
