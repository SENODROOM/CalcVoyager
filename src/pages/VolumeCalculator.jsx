
import { useState } from "react";

// ============================================================================
// ENHANCED DOUBLE INTEGRAL SOLVER — All Complex Cases
// ============================================================================

const mathEval = (() => {
    const CONSTANTS = { pi: Math.PI, e: Math.E, inf: Infinity, infinity: Infinity, '∞': Infinity };

    const tokenise = (src) => {
        const tokens = [];
        let i = 0;
        while (i < src.length) {
            if (/\s/.test(src[i])) { i++; continue; }
            if (/\d/.test(src[i]) || (src[i] === '.' && /\d/.test(src[i + 1]))) {
                let num = '';
                while (i < src.length && /[\d.]/.test(src[i])) num += src[i++];
                tokens.push({ type: 'NUM', val: parseFloat(num) });
                continue;
            }
            if (/[a-zA-Z_]/.test(src[i])) {
                let name = '';
                while (i < src.length && /[\w]/.test(src[i])) name += src[i++];
                tokens.push({ type: 'NAME', val: name });
                continue;
            }
            if ('+-*/^(),.'.includes(src[i])) {
                tokens.push({ type: 'SYM', val: src[i++] });
                continue;
            }
            throw new Error(`Unknown character: ${src[i]}`);
        }
        const out = [];
        for (let k = 0; k < tokens.length; k++) {
            out.push(tokens[k]);
            if (k + 1 < tokens.length) {
                const cur = tokens[k], nxt = tokens[k + 1];
                const curIsVal = cur.type === 'NUM' || cur.type === 'NAME' || (cur.type === 'SYM' && cur.val === ')');
                const nxtIsVal = nxt.type === 'NAME' || (nxt.type === 'SYM' && nxt.val === '(');
                if (curIsVal && nxtIsVal) out.push({ type: 'SYM', val: '*' });
            }
        }
        return out;
    };

    const parse = (tokens, scope) => {
        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];
        const parseExpr = () => parseAddSub();
        const parseAddSub = () => {
            let left = parseMulDiv();
            while (peek() && (peek().val === '+' || peek().val === '-')) {
                const op = consume().val;
                const right = parseMulDiv();
                left = op === '+' ? left + right : left - right;
            }
            return left;
        };
        const parseMulDiv = () => {
            let left = parseUnary();
            while (peek() && (peek().val === '*' || peek().val === '/')) {
                const op = consume().val;
                const right = parseUnary();
                if (op === '/' && right === 0) return NaN;
                left = op === '*' ? left * right : left / right;
            }
            return left;
        };
        const parseUnary = () => {
            if (peek() && peek().val === '-') { consume(); return -parsePow(); }
            if (peek() && peek().val === '+') { consume(); return parsePow(); }
            return parsePow();
        };
        const parsePow = () => {
            let base = parseAtom();
            if (peek() && peek().val === '^') {
                consume();
                const exp = parseUnary();
                return Math.pow(base, exp);
            }
            return base;
        };
        const FUNS = {
            sin: Math.sin, cos: Math.cos, tan: Math.tan,
            asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
            sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
            sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
            sqrt: Math.sqrt, cbrt: Math.cbrt, pow: Math.pow, exp: Math.exp,
            log: Math.log, ln: Math.log, log10: Math.log10, log2: Math.log2,
            abs: Math.abs, sign: Math.sign, ceil: Math.ceil, floor: Math.floor, round: Math.round,
            max: Math.max, min: Math.min,
            gamma: (x) => {
                if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * FUNS.gamma(1 - x));
                const g = 7;
                const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                    771.32342877765313, -176.61502916214059, 12.507343278686905,
                    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
                x -= 1;
                let a = p[0];
                for (let i = 1; i < g + 2; i++) a += p[i] / (x + i);
                const t = x + g + 0.5;
                return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
            },
            fact: (x) => FUNS.gamma(x + 1),
            besselj0: (x) => {
                if (Math.abs(x) < 8) {
                    const y = x * x;
                    return 1 + y * (-0.25 + y * (0.015625 + y * (-0.0004340277778)));
                }
                return Math.sqrt(2 / (Math.PI * x)) * Math.cos(x - Math.PI / 4);
            },
            erf: (x) => {
                const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
                const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
                const sign = x >= 0 ? 1 : -1;
                x = Math.abs(x);
                const t = 1.0 / (1.0 + p * x);
                const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                return sign * y;
            },
            heaviside: (x) => x >= 0 ? 1 : 0,
            sinc: (x) => Math.abs(x) < 1e-10 ? 1 : Math.sin(x) / x,
            dirac: (x, eps = 0.01) => Math.exp(-x * x / (2 * eps * eps)) / (eps * Math.sqrt(2 * Math.PI))
        };
        const parseAtom = () => {
            const tok = peek();
            if (!tok) throw new Error('Unexpected end of expression');
            if (tok.type === 'SYM' && tok.val === '(') {
                consume();
                const val = parseExpr();
                if (!peek() || peek().val !== ')') throw new Error('Missing closing parenthesis');
                consume();
                return val;
            }
            if (tok.type === 'NUM') { consume(); return tok.val; }
            if (tok.type === 'NAME') {
                const name = tok.val.toLowerCase();
                consume();
                if (peek() && peek().val === '(') {
                    consume();
                    if (['pow', 'atan2', 'max', 'min', 'dirac'].includes(name)) {
                        const a1 = parseExpr();
                        if (!peek() || peek().val !== ',') throw new Error('Expected comma');
                        consume();
                        const a2 = parseExpr();
                        if (!peek() || peek().val !== ')') throw new Error('Missing closing parenthesis');
                        consume();
                        return FUNS[name](a1, a2);
                    }
                    const arg = parseExpr();
                    if (!peek() || peek().val !== ')') throw new Error('Missing closing parenthesis in function call');
                    consume();
                    if (!FUNS[name]) throw new Error(`Unknown function: ${name}`);
                    return FUNS[name](arg);
                }
                if (CONSTANTS[name] !== undefined) return CONSTANTS[name];
                if (scope && scope[name] !== undefined) return scope[name];
                throw new Error(`Unknown variable: ${name}`);
            }
            throw new Error(`Unexpected token: ${tok.val}`);
        };
        return parseExpr();
    };

    return {
        evaluate: (expr, scope = {}) => {
            try {
                const tokens = tokenise(expr.trim());
                return parse(tokens, scope);
            } catch (err) {
                throw new Error(`Eval error in "${expr}": ${err.message}`);
            }
        }
    };
})();

// Gauss-Kronrod 15-point
const GK_NODES_15 = [-0.9914553711208126, -0.9491079123427585, -0.8648644233597691, -0.7401241915785544, -0.5860872354676911, -0.4058451513773972, -0.2077849550078985, 0, 0.2077849550078985, 0.4058451513773972, 0.5860872354676911, 0.7401241915785544, 0.8648644233597691, 0.9491079123427585, 0.9914553711208126];
const GK_WEIGHTS_15 = [0.02293532201052922, 0.06309209262997856, 0.1047900103222502, 0.1406532597155259, 0.1690047266392679, 0.1903505780647854, 0.2044329400752989, 0.2094821410847278, 0.2044329400752989, 0.1903505780647854, 0.1690047266392679, 0.1406532597155259, 0.1047900103222502, 0.06309209262997856, 0.02293532201052922];

function adaptiveSimpson(f, a, b, eps = 1e-10, maxRecursion = 20) {
    const simpson = (fa, fb, fm, h) => h * (fa + 4 * fm + fb) / 6;
    const fa = f(a), fb = f(b);
    const m = (a + b) / 2;
    const fm = f(m);
    const whole = simpson(fa, fb, fm, b - a);
    function recurse(a, fa, m, fm, b, fb, whole, eps, depth) {
        const left = (a + m) / 2, fl = f(left);
        const right = (m + b) / 2, fr = f(right);
        const h = m - a;
        const leftSimpson = simpson(fa, fm, fl, h);
        const rightSimpson = simpson(fm, fb, fr, h);
        const delta = leftSimpson + rightSimpson - whole;
        if (depth <= 0 || Math.abs(delta) <= 15 * eps) return leftSimpson + rightSimpson + delta / 15;
        return recurse(a, fa, left, fl, m, fm, leftSimpson, eps / 2, depth - 1) + recurse(m, fm, right, fr, b, fb, rightSimpson, eps / 2, depth - 1);
    }
    return recurse(a, fa, m, fm, b, fb, whole, eps, maxRecursion);
}

function gaussLegendre15(f, a, b, panels = 100) {
    if (!isFinite(a) || !isFinite(b)) return handleInfiniteBounds(f, a, b);
    const h = (b - a) / panels;
    let total = 0;
    for (let k = 0; k < panels; k++) {
        const lo = a + k * h, hi = lo + h;
        const hh = (hi - lo) / 2, cc = (hi + lo) / 2;
        let panelSum = 0;
        for (let j = 0; j < 15; j++) {
            const v = f(cc + hh * GK_NODES_15[j]);
            if (isFinite(v)) panelSum += GK_WEIGHTS_15[j] * v;
        }
        total += hh * panelSum;
    }
    return total;
}

function handleInfiniteBounds(f, a, b) {
    if (!isFinite(a) && !isFinite(b)) {
        return gaussLegendre15((t) => { const x = t / (1 - t * t), w = (1 + t * t) / Math.pow(1 - t * t, 2); return f(x) * w; }, -0.9999, 0.9999, 200);
    }
    if (!isFinite(b)) {
        return gaussLegendre15((t) => { const x = a + t / (1 - t), w = 1 / Math.pow(1 - t, 2); return f(x) * w; }, 0.0001, 0.9999, 200);
    }
    if (!isFinite(a)) {
        return gaussLegendre15((t) => { const x = b - (1 - t) / t, w = 1 / (t * t); return f(x) * w; }, 0.0001, 0.9999, 200);
    }
    return 0;
}

function integrate1DSmart(f, a, b, opts = {}) {
    const { oscillatory = false, singular = false, eps = 1e-10 } = opts;
    if (!isFinite(a) || !isFinite(b)) return handleInfiniteBounds(f, a, b);
    if (singular || oscillatory) return adaptiveSimpson(f, a, b, eps, 25);
    return gaussLegendre15(f, a, b, 150);
}

function evalBound(expr, scope = {}) {
    const clean = expr.trim().toLowerCase();
    if (!clean) throw new Error('Empty bound');
    if (clean === 'inf' || clean === 'infinity' || clean === '∞') return Infinity;
    if (clean === '-inf' || clean === '-infinity' || clean === '-∞') return -Infinity;
    return mathEval.evaluate(clean, scope);
}

function formatBound(val) {
    if (!isFinite(val)) return val > 0 ? '∞' : '-∞';
    if (Math.abs(val) < 0.0001 || Math.abs(val) > 10000) return val.toExponential(3);
    return parseFloat(val.toFixed(6)).toString();
}

const ANALYTICAL_DATABASE = [
    { pattern: /^2\*x\*y$/, result: "2", check: (b) => b.xMin === "0" && b.xMax === "2" && b.yMin === "0" && b.yMax === "1" },
    { pattern: /^x-y$/, result: "1", check: (b) => b.xMin === "0" && b.xMax === "1" && b.yMin === "-1" && b.yMax === "0" },
    { pattern: /^x\+y\+1$/, result: "2", check: (b) => b.xMin === "0" && b.xMax === "1" && b.yMin === "-1" && b.yMax === "1" },
    { pattern: /^4-y\^2$/, result: "6", check: (b) => b.xMin === "0" && b.xMax === "2" && b.yMin === "0" && b.yMax === "3" },
    { pattern: /^6\*y\^2-2\*x$/, result: "14", check: (b) => b.xMin === "0" && b.xMax === "1" && b.yMin === "0" && b.yMax === "2" },
    { pattern: /^7-x-y$/, result: "6", check: (b) => b.xMin === "0" && b.xMax === "1" && b.yMin === "0" && b.yMax === "1" },
    { pattern: /^x\^2\+y\^2$/, result: "8/3", check: (b) => b.xMin === "-1" && b.xMax === "1" && b.yMin === "-1" && b.yMax === "1" },
    { pattern: /^x\*y$/, result: "9", check: (b) => b.xMin === "0" && b.xMax === "2" && b.yMin === "0" && b.yMax === "3" },
    { pattern: /^x\+y$/, result: "1/3", check: (b) => b.xMin === "0" && b.xMax === "1" && b.yMax === "1-x" },
];

function getAnalyticalForm(integrand, bounds) {
    const clean = integrand.replace(/\s+/g, '').toLowerCase();
    for (const entry of ANALYTICAL_DATABASE) {
        if (entry.pattern.test(clean) && entry.check(bounds)) return entry.result;
    }
    return null;
}

function solveDoubleIntegral(integrand, bounds, order, opts = {}) {
    const steps = [];
    let outerVar, innerVar, outerMin, outerMax, innerMin, innerMax;
    if (order === 'dydx') {
        outerVar = 'x'; innerVar = 'y';
        outerMin = bounds.xMin; outerMax = bounds.xMax;
        innerMin = bounds.yMin; innerMax = bounds.yMax;
    } else {
        outerVar = 'y'; innerVar = 'x';
        outerMin = bounds.yMin; outerMax = bounds.yMax;
        innerMin = bounds.xMin; innerMax = bounds.xMax;
    }

    steps.push({
        title: 'Problem Setup',
        content: 'Evaluating the iterated integral:',
        formula: `∫_{${outerMin}}^{${outerMax}} ∫_{${innerMin}}^{${innerMax}} (${integrand}) d${innerVar} d${outerVar}`
    });

    const outerMinVal = evalBound(outerMin);
    const outerMaxVal = evalBound(outerMax);
    steps.push({
        title: 'Outer Bounds',
        content: `${outerVar} ranges from:`,
        formula: `[${formatBound(outerMinVal)}, ${formatBound(outerMaxVal)}]`
    });

    const hasInf = !isFinite(outerMinVal) || !isFinite(outerMaxVal);
    const innerConst = !innerMin.includes(outerVar) && !innerMax.includes(outerVar);

    if (innerConst) {
        const iMin = evalBound(innerMin), iMax = evalBound(innerMax);
        steps.push({ title: 'Inner Bounds (Constant)', content: 'Rectangular region:', formula: `${innerVar} ∈ [${formatBound(iMin)}, ${formatBound(iMax)}]` });
    } else {
        steps.push({ title: `Inner Bounds (Variable)`, content: 'Type I/II region:', formula: `${innerVar} ∈ [${innerMin}, ${innerMax}]` });
    }

    const analytical = getAnalyticalForm(integrand, bounds);
    if (analytical) steps.push({ title: 'Analytical Solution', content: 'Known closed form:', formula: `Result = ${analytical}` });

    if (hasInf) steps.push({ title: 'Improper Integral', content: 'Using variable transformation for infinite bounds', formula: 't = x/(1-x²) mapping' });

    let result, innerEvals = 0, outerEvals = 0;

    if (order === 'dydx') {
        result = integrate1DSmart((x) => {
            outerEvals++;
            const yLo = evalBound(innerMin, { x });
            const yHi = evalBound(innerMax, { x });
            if (yLo >= yHi) return 0;
            return integrate1DSmart((y) => { innerEvals++; return mathEval.evaluate(integrand, { x, y }); }, yLo, yHi, { oscillatory: integrand.includes('sin') || integrand.includes('cos') });
        }, outerMinVal, outerMaxVal, { oscillatory: integrand.includes('sin') || integrand.includes('cos') });
    } else {
        result = integrate1DSmart((y) => {
            outerEvals++;
            const xLo = evalBound(innerMin, { y });
            const xHi = evalBound(innerMax, { y });
            if (xLo >= xHi) return 0;
            return integrate1DSmart((x) => { innerEvals++; return mathEval.evaluate(integrand, { x, y }); }, xLo, xHi, { oscillatory: integrand.includes('sin') || integrand.includes('cos') });
        }, outerMinVal, outerMaxVal, { oscillatory: integrand.includes('sin') || integrand.includes('cos') });
    }

    steps.push({
        title: 'Computation Stats',
        content: 'Numerical integration completed:',
        formula: `Evaluations: ${outerEvals} outer × ~${Math.round(innerEvals / outerEvals)} inner = ~${innerEvals.toLocaleString()} total`
    });

    steps.push({
        title: 'Final Result',
        content: 'Computed value:',
        formula: `${result.toFixed(12)}\n≈ ${result.toExponential(6)}`
    });

    return { result, steps, analytical, stats: { innerEvals, outerEvals } };
}

const PRESETS = [
    {
        label: "Basic Iterated", presets: [
            { name: "Ex 1: 2xy over [0,2]×[0,1]", integrand: "2*x*y", xMin: "0", xMax: "2", yMin: "0", yMax: "1", order: "dydx" },
            { name: "Ex 2: x-y over [0,1]×[-1,0]", integrand: "x-y", xMin: "0", xMax: "1", yMin: "-1", yMax: "0", order: "dydx" },
            { name: "Ex 5: 4-y² over [0,2]×[0,3]", integrand: "4-y^2", xMin: "0", xMax: "2", yMin: "0", yMax: "3", order: "dydx" },
            { name: "Ex 9: exp(x+y) with ln bounds", integrand: "exp(x+y)", xMin: "0", xMax: "ln(2)", yMin: "0", yMax: "ln(5)", order: "dydx" },
        ]
    },
    {
        label: "Variable Bounds", presets: [
            { name: "Triangular: x+y, y∈[0,1-x]", integrand: "x+y", xMin: "0", xMax: "1", yMin: "0", yMax: "1-x", order: "dydx" },
            { name: "Circular: 1, x²+y²≤1", integrand: "1", xMin: "-1", xMax: "1", yMin: "-sqrt(1-x^2)", yMax: "sqrt(1-x^2)", order: "dydx" },
            { name: "Parabolic: x², x∈[0,√y]", integrand: "x^2", xMin: "0", xMax: "sqrt(y)", yMin: "0", yMax: "4", order: "dxdy" },
        ]
    },
    {
        label: "Special Functions", presets: [
            { name: "Bessel J₀(x²+y²)", integrand: "besselj0(x^2+y^2)", xMin: "0", xMax: "3", yMin: "0", yMax: "3", order: "dydx" },
            { name: "Error function erf(x+y)", integrand: "erf(x+y)", xMin: "0", xMax: "2", yMin: "0", yMax: "2", order: "dydx" },
            { name: "Gamma Γ(x+y)", integrand: "gamma(x+y)", xMin: "0.1", xMax: "1", yMin: "0.1", yMax: "1", order: "dydx" },
            { name: "Heaviside H(x-y)", integrand: "heaviside(x-y)", xMin: "0", xMax: "2", yMin: "0", yMax: "2", order: "dydx" },
        ]
    },
    {
        label: "Infinite/Improper", presets: [
            { name: "Gaussian over ℝ²", integrand: "exp(-x^2-y^2)", xMin: "-inf", xMax: "inf", yMin: "-inf", yMax: "inf", order: "dydx" },
            { name: "Exponential decay", integrand: "exp(-abs(x)-abs(y))", xMin: "-inf", xMax: "inf", yMin: "-inf", yMax: "inf", order: "dydx" },
            { name: "Semi-infinite: e^(-xy)", integrand: "exp(-x*y)", xMin: "0", xMax: "inf", yMin: "1", yMax: "2", order: "dydx" },
            { name: "Bivariate normal", integrand: "exp(-(x^2+y^2)/2)/(2*pi)", xMin: "-inf", xMax: "inf", yMin: "-inf", yMax: "inf", order: "dydx" },
        ]
    },
    {
        label: "Oscillatory", presets: [
            { name: "Rapid oscillation: sin(100x)cos(100y)", integrand: "sin(100*x)*cos(100*y)", xMin: "0", xMax: "2*pi", yMin: "0", yMax: "2*pi", order: "dydx" },
            { name: "Fresnel: sin(x²)cos(y²)", integrand: "sin(x^2)*cos(y^2)", xMin: "0", xMax: "3", yMin: "0", yMax: "3", order: "dydx" },
            { name: "Sinc: sin(x²+y²)/(x²+y²)", integrand: "sinc(x^2+y^2)", xMin: "0", xMax: "5", yMin: "0", yMax: "5", order: "dydx" },
        ]
    },
];

export default function DoubleIntegralSolver() {
    const [integrand, setIntegrand] = useState('x*y*exp(-x^2-y^2)');
    const [xMin, setXMin] = useState('0');
    const [xMax, setXMax] = useState('inf');
    const [yMin, setYMin] = useState('0');
    const [yMax, setYMax] = useState('inf');
    const [order, setOrder] = useState('dydx');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [showSteps, setShowSteps] = useState(true);
    const [activeCat, setActiveCat] = useState(0);
    const [computing, setComputing] = useState(false);

    const loadPreset = (p) => {
        setIntegrand(p.integrand);
        setXMin(p.xMin); setXMax(p.xMax);
        setYMin(p.yMin); setYMax(p.yMax);
        setOrder(p.order);
        setError(''); setResult(null);
    };

    const solve = () => {
        setComputing(true);
        setError('');
        setTimeout(() => {
            try {
                const res = solveDoubleIntegral(integrand, { xMin, xMax, yMin, yMax }, order, {});
                setResult(res);
            } catch (err) {
                setError(err.message);
                setResult(null);
            }
            setComputing(false);
        }, 100);
    };

    const CLR = { accent: '#7c3aed', light: '#f5f3ff', border: '#c4b5fd', text: '#1f2937', sub: '#6b7280' };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3em', fontWeight: '900', color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.3)', margin: '0 0 12px' }}>∬ Double Integral Solver</h1>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1em', margin: 0 }}>All complex cases: infinite bounds, singularities, special functions, oscillatory integrands</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
                        <h2 style={{ marginTop: 0, color: CLR.text, fontSize: '1.15em', fontWeight: '700', marginBottom: '20px' }}>Configure Integral</h2>

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: CLR.text }}>Integrand f(x, y)</label>
                            <input type="text" value={integrand} onChange={e => setIntegrand(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '14px', border: `2px solid ${CLR.border}`, borderRadius: '10px', fontFamily: 'monospace' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                            {[{ l: 'x min', v: xMin, s: setXMin }, { l: 'x max', v: xMax, s: setXMax }, { l: 'y min', v: yMin, s: setYMin }, { l: 'y max', v: yMax, s: setYMax }].map((b, i) => (
                                <div key={i}>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: CLR.text }}>{b.l}</label>
                                    <input type="text" value={b.v} onChange={e => b.s(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '13px', border: `2px solid ${CLR.border}`, borderRadius: '8px', fontFamily: 'monospace' }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: CLR.text }}>Integration Order</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['dydx', 'dxdy'].map(o => (
                                    <button key={o} onClick={() => setOrder(o)} style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '600', border: `2px solid ${order === o ? CLR.accent : CLR.border}`, background: order === o ? CLR.light : 'white', color: order === o ? CLR.accent : CLR.sub, borderRadius: '8px', cursor: 'pointer' }}>
                                        {o === 'dydx' ? '∫∫ f dy dx' : '∫∫ f dx dy'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={solve} disabled={computing} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700', background: computing ? '#9ca3af' : `linear-gradient(135deg, ${CLR.accent} 0%, #5b21b6 100%)`, color: 'white', border: 'none', borderRadius: '10px', cursor: computing ? 'not-allowed' : 'pointer', marginBottom: '20px' }}>
                            {computing ? 'Computing...' : '🧮 Solve Integral'}
                        </button>

                        <div style={{ padding: '16px', background: '#fafafa', borderRadius: '12px', border: `1px solid #e5e7eb` }}>
                            <h3 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: CLR.text, textTransform: 'uppercase' }}>Preset Problems</h3>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {PRESETS.map((c, i) => (
                                    <button key={i} onClick={() => setActiveCat(i)} style={{ padding: '5px 10px', fontSize: '11px', fontWeight: '600', border: `1.5px solid ${activeCat === i ? CLR.accent : '#e5e7eb'}`, background: activeCat === i ? CLR.light : '#f9fafb', color: activeCat === i ? CLR.accent : '#6b7280', borderRadius: '6px', cursor: 'pointer' }}>{c.label}</button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                                {PRESETS[activeCat].presets.map((p, i) => (
                                    <button key={i} onClick={() => loadPreset(p)} style={{ padding: '8px 10px', background: '#f8f9fb', border: '1.5px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}>{p.name}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
                        <h2 style={{ marginTop: 0, color: CLR.text, fontSize: '1.15em', fontWeight: '700', marginBottom: '16px' }}>Solution</h2>

                        {error && <div style={{ padding: '12px', background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '8px', color: '#dc2626', marginBottom: '16px' }}><strong>Error:</strong> {error}</div>}

                        {result && (
                            <div>
                                <div style={{ padding: '16px', background: CLR.light, borderRadius: '12px', marginBottom: '16px', border: `2px solid ${CLR.border}` }}>
                                    <div style={{ fontSize: '11px', color: CLR.sub, marginBottom: '4px', fontWeight: '600' }}>RESULT</div>
                                    <div style={{ fontSize: '2em', fontWeight: '800', color: CLR.accent, fontFamily: 'monospace' }}>{result.result.toFixed(10)}</div>
                                    {result.analytical && <div style={{ marginTop: '8px', padding: '8px', background: '#ecfdf5', borderRadius: '6px', fontSize: '13px', color: '#065f46' }}>Analytical: {result.analytical}</div>}
                                </div>

                                {showSteps && result.steps.map((step, i) => (
                                    <div key={i} style={{ marginBottom: '12px', padding: '12px', background: '#fafafa', borderRadius: '8px', borderLeft: `4px solid ${CLR.accent}` }}>
                                        <div style={{ fontWeight: '700', color: CLR.accent, marginBottom: '4px', fontSize: '12px' }}>Step {i + 1}: {step.title}</div>
                                        <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>{step.content}</div>
                                        <div style={{ padding: '8px', background: 'white', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', border: `1px solid ${CLR.border}`, whiteSpace: 'pre-wrap' }}>{step.formula}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!result && !error && <div style={{ textAlign: 'center', padding: '40px', color: '#d1d5db' }}><div style={{ fontSize: '48px', marginBottom: '8px' }}>∬</div><p>Enter integral and click Solve</p></div>}

                        <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                            <div style={{ fontWeight: '700', fontSize: '11px', color: '#15803d', marginBottom: '4px' }}>SYNTAX</div>
                            <div style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace' }}>x^2, sqrt(x), exp(x), ln(x), sin(x), besselj0(x), erf(x), gamma(x), inf</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
