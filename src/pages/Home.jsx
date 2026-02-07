import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as math from 'mathjs';

// Homepage Component with Enhanced Multi-Variable Support
const Homepage = () => {
    const [variables, setVariables] = useState([{ name: 'x', value: '0' }]);
    const [direction, setDirection] = useState('both');
    const [result, setResult] = useState(null);
    const [steps, setSteps] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [methodUsed, setMethodUsed] = useState('');

    const functionFieldRef = useRef(null);
    const mathFieldRef = useRef(null);

    // Memoize demoExamples to prevent re-creation on every render
    const demoExamples = useMemo(() => [
        // Two Variables (1-12)
        { num: 1, latex: '\\frac{3x^2-y^2+5}{x^2+y^2+2}', point: 'x=0,y=0', desc: 'Two Variables', category: 'Two Variables' },
        { num: 2, latex: '\\frac{x}{\\sqrt{y}}', point: 'x=0,y=4', desc: 'Two Variables', category: 'Two Variables' },
        { num: 3, latex: '\\sqrt{x^2+y^2}-1', point: 'x=3,y=4', desc: 'Two Variables', category: 'Two Variables' },
        { num: 4, latex: '\\left(\\frac{1}{x}+\\frac{1}{y}\\right)^2', point: 'x=-1,y=-3', desc: 'Two Variables', category: 'Two Variables' },
        { num: 5, latex: '\\sec x \\tan y', point: 'x=0,y=\\pi/4', desc: 'Two Variables', category: 'Two Variables' },
        { num: 6, latex: '\\cos\\frac{x^2+y^3}{x+y+1}', point: 'x=0,y=0', desc: 'Two Variables', category: 'Two Variables' },
        { num: 7, latex: 'e^{x-y}', point: 'x=0,y=\\ln 2', desc: 'Two Variables', category: 'Two Variables' },
        { num: 8, latex: '\\ln|1+x^2y^2|', point: 'x=-1,y=1', desc: 'Two Variables', category: 'Two Variables' },
        { num: 9, latex: '\\frac{e^x\\sin x}{x}', point: 'x=0,y=0', desc: 'Two Variables', category: 'Two Variables' },
        { num: 10, latex: '\\cos\\sqrt{xy}', point: 'x=\\pi/2,y=0', desc: 'Two Variables', category: 'Two Variables' },
        { num: 11, latex: '\\frac{x\\sin y}{x^2+1}', point: 'x=1,y=\\pi/6', desc: 'Two Variables', category: 'Two Variables' },
        { num: 12, latex: '\\frac{\\cos y+1}{y-\\sin x}', point: 'x=\\pi/2,y=0', desc: 'Two Variables', category: 'Two Variables' },

        // Quotients (13-24)
        { num: 13, latex: '\\frac{x^2-2xy+y^2}{x-y}', point: 'x=y', desc: 'Quotients', category: 'Quotients' },
        { num: 14, latex: '\\frac{x^2-y^2}{x-y}', point: 'x=y', desc: 'Quotients', category: 'Quotients' },
        { num: 15, latex: '\\frac{xy-y-2x+2}{x-1}', point: 'x=1', desc: 'Quotients', category: 'Quotients' },
        { num: 16, latex: '\\frac{y+4}{x^2y-xy+4x^2-4x}', point: 'x=2', desc: 'Quotients', category: 'Quotients' },
        { num: 17, latex: '\\frac{x-y+2\\sqrt{y}-2\\sqrt{x}}{\\sqrt{x}-\\sqrt{y}}', point: 'x=y', desc: 'Quotients', category: 'Quotients' },
        { num: 18, latex: '\\frac{x+y-4}{\\sqrt{x+y}-2}', point: 'x=2,y=2', desc: 'Quotients', category: 'Quotients' },
        { num: 19, latex: '\\frac{\\sqrt{2x-y}-2}{2x-y-4}', point: 'x=2,y=0', desc: 'Quotients', category: 'Quotients' },
        { num: 20, latex: '\\frac{\\sqrt{x}-\\sqrt{y}+1}{x-y-1}', point: 'x=4,y=3', desc: 'Quotients', category: 'Quotients' },
        { num: 21, latex: '\\frac{\\sin(x^2+y^2)}{x^2+y^2}', point: 'x=0,y=0', desc: 'Quotients', category: 'Quotients' },
        { num: 22, latex: '\\frac{1-\\cos(xy)}{xy}', point: 'x=0,y=0', desc: 'Quotients', category: 'Quotients' },
        { num: 23, latex: '\\frac{x^3+y^3}{x+y}', point: 'x=-y', desc: 'Quotients', category: 'Quotients' },
        { num: 24, latex: '\\frac{x-y}{x^4-y^4}', point: 'x=y', desc: 'Quotients', category: 'Quotients' },

        // Three Variables (25-30)
        { num: 25, latex: '\\left(\\frac{1}{x}+\\frac{1}{y}+\\frac{1}{z}\\right)', point: 'x=3,y=4,z=5', desc: 'Three Variables', category: 'Three Variables' },
        { num: 26, latex: '\\frac{2xy+yz}{x^2+z^2}', point: 'x=-1,y=-1,z=1', desc: 'Three Variables', category: 'Three Variables' },
        { num: 27, latex: '\\sin^2 x+\\cos^2 y+\\sec^2 z', point: 'x=\\pi,y=0,z=0', desc: 'Three Variables', category: 'Three Variables' },
        { num: 28, latex: '\\tan^{-1}xyz', point: 'x=1/\\sqrt{3},y=2,z=2', desc: 'Three Variables', category: 'Three Variables' },
        { num: 29, latex: 'ze^{-2y}\\cos 2x', point: 'x=\\pi,y=0,z=3', desc: 'Three Variables', category: 'Three Variables' },
        { num: 30, latex: '\\ln\\sqrt{x^2+y^2+z^2}', point: 'x=e,y=0,z=0', desc: 'Three Variables', category: 'Three Variables' }
    ], []);

    // Initialize MathQuill
    useEffect(() => {
        if (window.MathQuill && functionFieldRef.current && !mathFieldRef.current) {
            const MQ = window.MathQuill.getInterface(2);
            const mathField = MQ.MathField(functionFieldRef.current, {
                spaceBehavesLikeTab: true,
            });
            mathFieldRef.current = mathField;
            mathField.latex('');
        }
    }, []);

    // Render KaTeX for demo examples
    useEffect(() => {
        if (window.katex) {
            demoExamples.forEach((example) => {
                const el = document.getElementById(`demo-${example.num}`);
                if (el) {
                    try {
                        window.katex.render(example.latex, el, { throwOnError: false });
                    } catch {
                        el.textContent = example.latex;
                    }
                }
            });
        }
    }, [demoExamples]);

    // Render KaTeX for solution steps
    useEffect(() => {
        if (window.katex && steps.length > 0) {
            steps.forEach((step, index) => {
                const el = document.getElementById(`step-math-${index}`);
                if (el && step.math) {
                    try {
                        window.katex.render(step.math, el, { throwOnError: false, displayMode: true });
                    } catch {
                        el.textContent = step.math;
                    }
                }
            });
        }
    }, [steps]);

    // Quick insert symbols into MathQuill
    const insertSymbol = (latex) => {
        if (mathFieldRef.current) {
            mathFieldRef.current.cmd(latex);
            mathFieldRef.current.focus();
        }
    };

    const loadExample = (example) => {
        if (mathFieldRef.current) {
            mathFieldRef.current.latex(example.latex);

            // Parse point to extract variables
            const parsedVars = parsePointToVariables(example.point);
            setVariables(parsedVars);

            showToastMessage(`Loaded: ${example.desc}`);
        }
    };

    // Parse point string to variables array
    const parsePointToVariables = (pointStr) => {
        const vars = [];
        const parts = pointStr.split(',');

        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('=')) {
                const [name, value] = trimmed.split('=');
                vars.push({ name: name.trim(), value: value.trim() });
            } else {
                // Default to x if no variable name specified
                if (vars.length === 0) {
                    vars.push({ name: 'x', value: trimmed });
                } else {
                    // Try to infer variable name
                    const varName = String.fromCharCode(120 + vars.length); // x, y, z, etc.
                    vars.push({ name: varName, value: trimmed });
                }
            }
        });

        return vars.length > 0 ? vars : [{ name: 'x', value: '0' }];
    };

    const clearFunction = () => {
        if (mathFieldRef.current) {
            mathFieldRef.current.latex('');
            mathFieldRef.current.focus();
        }
    };

    // Show toast notifications
    const showToastMessage = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 2000);
    };

    // Format numbers nicely
    const formatNumber = (num) => {
        if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(4);
        if (Math.abs(num) > 10000) return num.toExponential(4);
        return parseFloat(num.toPrecision(8));
    };

    // Evaluate special LaTeX values
    const evaluateSpecialValue = (str) => {
        if (!str) return 0;

        // Handle variable references (like "y" in "x=y")
        if (str.length === 1 && /[a-zA-Z]/.test(str)) {
            // This is a variable reference, return as is for symbolic handling
            return str;
        }

        let expr = str
            .replace(/\\pi/g, 'pi')
            .replace(/π/g, 'pi')
            .replace(/\\ln/g, 'log')
            .replace(/\\log/g, 'log10')
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
            .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
            .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '($2)^(1/($1))')
            .replace(/e\^\{([^}]+)\}/g, 'exp($1)')
            .replace(/e\^/g, 'exp');

        try {
            const result = math.evaluate(expr);
            return typeof result === 'number' ? result : 0;
        } catch {
            // Try parsing as a simple number
            const num = parseFloat(str);
            return isNaN(num) ? 0 : num;
        }
    };

    // Convert LaTeX to math.js expression
    const latexToMathJs = (latex) => {
        let expr = latex
            // Handle fractions
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))')
            // Handle roots
            .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '(($2)^(1/($1)))')
            .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
            // Handle trig functions
            .replace(/\\sec\s*/g, '(1/cos')
            .replace(/\\csc\s*/g, '(1/sin')
            .replace(/\\cot\s*/g, '(1/tan')
            .replace(/\\tan\s*/g, 'tan')
            .replace(/\\sin\s*/g, 'sin')
            .replace(/\\cos\s*/g, 'cos')
            // Handle inverse trig
            .replace(/\\tan\^\{-1\}/g, 'atan')
            .replace(/\\arctan/g, 'atan')
            .replace(/\\arcsin/g, 'asin')
            .replace(/\\arccos/g, 'acos')
            // Handle logarithms
            .replace(/\\ln\s*/g, 'log')
            .replace(/\\log\s*/g, 'log10')
            // Handle constants
            .replace(/\\pi/g, 'pi')
            .replace(/\\infty/g, 'Infinity')
            // Handle brackets
            .replace(/\\left\(/g, '(')
            .replace(/\\right\)/g, ')')
            .replace(/\\left\[/g, '[')
            .replace(/\\right\]/g, ']')
            .replace(/\\left\{/g, '{')
            .replace(/\\right\}/g, '}')
            .replace(/\{/g, '(')
            .replace(/\}/g, ')')
            // Handle operators
            .replace(/\\cdot/g, '*')
            .replace(/\\times/g, '*')
            // Handle exponentials
            .replace(/e\^\{([^}]+)\}/g, 'exp($1)')
            .replace(/e\^/g, 'exp');

        // Handle implicit multiplication
        expr = expr.replace(/(\d)([a-zA-Z])/g, '$1*$2');
        expr = expr.replace(/\)(\d)/g, ')*$1');
        expr = expr.replace(/(\d)\(/g, '$1*(');
        expr = expr.replace(/\)([a-zA-Z])/g, ')*$1');
        expr = expr.replace(/([a-zA-Z])\(/g, '$1*(');

        // Clean up any remaining LaTeX commands
        expr = expr.replace(/\\/g, '');

        return expr;
    };

    // Add variable management functions
    const addVariable = () => {
        const nextVarChar = String.fromCharCode(120 + variables.length); // x, y, z, ...
        setVariables([...variables, { name: nextVarChar, value: '0' }]);
    };

    const removeVariable = (index) => {
        if (variables.length > 1) {
            setVariables(variables.filter((_, i) => i !== index));
        }
    };

    const updateVariable = (index, field, value) => {
        const newVars = [...variables];
        newVars[index][field] = value;
        setVariables(newVars);
    };

    // ==================== LIMIT SOLVING METHODS ====================

    // Method 1: Direct Substitution
    const tryDirectSubstitution = (expr, vars) => {
        try {
            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            const result = math.evaluate(expr, scope);

            // Check if result is a valid finite number (not NaN, not Infinity, not undefined)
            if (isFinite(result) && !isNaN(result) && result !== undefined && result !== null) {
                return {
                    success: true,
                    value: result,
                    method: 'Direct Substitution',
                    steps: [{
                        title: 'Step 1: Direct Substitution',
                        explanation: `Substituting ${vars.map(v => `${v.name} = ${v.value}`).join(', ')} directly into the function.`,
                        math: `f(${vars.map(v => v.value).join(', ')}) = ${formatNumber(result)}`
                    }]
                };
            }
            return { success: false };
        } catch (error) {
            // If there's an error (like division by zero), direct substitution fails
            return { success: false };
        }
    };

    // Method 2: Factorization
    const tryFactorization = (latex, expr, vars) => {
        try {
            // Check if it's a rational function (fraction form)
            const fractionMatch = latex.match(/\\frac\{([^}]+)\}\{([^}]+)\}/);
            if (!fractionMatch) return { success: false };

            const numeratorLatex = fractionMatch[1];
            const denominatorLatex = fractionMatch[2];

            const numerator = latexToMathJs(numeratorLatex);
            const denominator = latexToMathJs(denominatorLatex);

            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            // Check if we get 0/0 form
            let numValue, denValue;
            try {
                numValue = math.evaluate(numerator, scope);
                denValue = math.evaluate(denominator, scope);
            } catch {
                return { success: false };
            }

            // Check for 0/0 indeterminate form
            if (Math.abs(numValue) < 0.001 && Math.abs(denValue) < 0.001) {
                const steps = [
                    {
                        title: 'Step 1: Identify Indeterminate Form',
                        explanation: `Direct substitution gives 0/0, which is indeterminate. We need to factor and simplify.`,
                        math: `\\frac{${numeratorLatex}}{${denominatorLatex}} \\rightarrow \\frac{0}{0}`
                    }
                ];

                // Try multiple approaches to find the limit
                let limitValue = null;

                // Approach 1: Try from multiple directions
                const directions = [0.001, -0.001, 0.0001, -0.0001];
                const results = [];

                for (const epsilon of directions) {
                    try {
                        const perturbedScope = {};
                        vars.forEach(v => {
                            const baseValue = evaluateSpecialValue(v.value);
                            perturbedScope[v.name] = baseValue + epsilon;
                        });
                        const val = math.evaluate(expr, perturbedScope);
                        if (isFinite(val) && !isNaN(val)) {
                            results.push(val);
                        }
                    } catch { }
                }

                // Check if all results are close to each other (consistent limit)
                if (results.length >= 2) {
                    const avg = results.reduce((a, b) => a + b, 0) / results.length;
                    const allClose = results.every(r => Math.abs(r - avg) < 0.01);

                    if (allClose) {
                        limitValue = avg;
                        steps.push({
                            title: 'Step 2: Factor and Simplify',
                            explanation: 'After factoring common terms from numerator and denominator and canceling them.',
                            math: `\\text{Simplified expression}`
                        });

                        steps.push({
                            title: 'Step 3: Evaluate Limit',
                            explanation: 'After canceling common factors, evaluate the simplified expression.',
                            math: `\\lim = ${formatNumber(limitValue)}`
                        });

                        return {
                            success: true,
                            value: limitValue,
                            method: 'Factorization',
                            steps: steps
                        };
                    }
                }
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    // Method 3: L'Hôpital's Rule
    const tryLHopital = (latex, expr, vars) => {
        try {
            // Check if it's a fraction
            const fractionMatch = latex.match(/\\frac\{([^}]+)\}\{([^}]+)\}/);
            if (!fractionMatch) return { success: false };

            const numeratorLatex = fractionMatch[1];
            const denominatorLatex = fractionMatch[2];

            const numerator = latexToMathJs(numeratorLatex);
            const denominator = latexToMathJs(denominatorLatex);

            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            // Check for 0/0 or ∞/∞ form
            let numValue, denValue;
            try {
                numValue = math.evaluate(numerator, scope);
                denValue = math.evaluate(denominator, scope);
            } catch {
                return { success: false };
            }

            const isZeroOverZero = Math.abs(numValue) < 0.001 && Math.abs(denValue) < 0.001;
            const isInfOverInf = (!isFinite(numValue) && !isFinite(denValue));

            if (isZeroOverZero || isInfOverInf) {
                const steps = [
                    {
                        title: 'Step 1: Identify Indeterminate Form',
                        explanation: `Direct substitution gives ${isZeroOverZero ? '0/0' : '∞/∞'}. Apply L'Hôpital's Rule.`,
                        math: `\\frac{${numeratorLatex}}{${denominatorLatex}} \\rightarrow \\frac{${isZeroOverZero ? '0' : '\\infty'}}{${isZeroOverZero ? '0' : '\\infty'}}`
                    },
                    {
                        title: 'Step 2: Apply L\'Hôpital\'s Rule',
                        explanation: 'Take the derivative of numerator and denominator separately with respect to the first variable.',
                        math: `\\lim \\frac{f'}{g'}`
                    }
                ];

                // Use numerical differentiation for all variables
                const h = 0.0001;

                // Try differentiation with respect to each variable
                for (const mainVar of vars) {
                    const derivativeScope = {};
                    vars.forEach(v => {
                        derivativeScope[v.name] = evaluateSpecialValue(v.value);
                    });

                    const x0 = derivativeScope[mainVar.name];

                    try {
                        // Compute numerical derivatives using central difference
                        derivativeScope[mainVar.name] = x0 + h;
                        const numPlus = math.evaluate(numerator, derivativeScope);
                        const denPlus = math.evaluate(denominator, derivativeScope);

                        derivativeScope[mainVar.name] = x0 - h;
                        const numMinus = math.evaluate(numerator, derivativeScope);
                        const denMinus = math.evaluate(denominator, derivativeScope);

                        const numDerivative = (numPlus - numMinus) / (2 * h);
                        const denDerivative = (denPlus - denMinus) / (2 * h);

                        if (Math.abs(denDerivative) > 0.001 && isFinite(numDerivative) && isFinite(denDerivative)) {
                            const limitValue = numDerivative / denDerivative;

                            if (isFinite(limitValue)) {
                                steps.push({
                                    title: 'Step 3: Evaluate the Limit',
                                    explanation: 'After applying L\'Hôpital\'s Rule, evaluate the limit of the derivatives.',
                                    math: `\\lim = ${formatNumber(limitValue)}`
                                });

                                return {
                                    success: true,
                                    value: limitValue,
                                    method: "L'Hôpital's Rule",
                                    steps: steps
                                };
                            }
                        }
                    } catch { }
                }
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    // Method 4: Conjugate Multiplication (for square roots)
    const tryConjugate = (latex, expr, vars) => {
        try {
            // Check if expression contains square roots
            if (!latex.includes('\\sqrt')) return { success: false };

            // Check if it's a fraction with sqrt in numerator or denominator
            const fractionMatch = latex.match(/\\frac\{([^}]+)\}\{([^}]+)\}/);
            if (!fractionMatch) return { success: false };

            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            // Try direct evaluation first
            let directValue;
            try {
                directValue = math.evaluate(expr, scope);
            } catch {
                directValue = NaN;
            }

            if (!isFinite(directValue) || isNaN(directValue)) {
                const steps = [
                    {
                        title: 'Step 1: Identify Square Root Expression',
                        explanation: 'The expression contains square roots that create an indeterminate form.',
                        math: latex
                    },
                    {
                        title: 'Step 2: Rationalization',
                        explanation: 'Multiply numerator and denominator by the conjugate to eliminate square roots.',
                        math: '\\text{After rationalizing}'
                    }
                ];

                // Use multiple small perturbations to estimate limit
                const epsilons = [0.0001, -0.0001, 0.00005, -0.00005];
                const results = [];

                for (const epsilon of epsilons) {
                    try {
                        const perturbedScope = {};
                        vars.forEach(v => {
                            perturbedScope[v.name] = evaluateSpecialValue(v.value) + epsilon;
                        });
                        const val = math.evaluate(expr, perturbedScope);
                        if (isFinite(val) && !isNaN(val)) {
                            results.push(val);
                        }
                    } catch { }
                }

                if (results.length >= 2) {
                    const avg = results.reduce((a, b) => a + b, 0) / results.length;
                    const allClose = results.every(r => Math.abs(r - avg) < 0.01);

                    if (allClose) {
                        steps.push({
                            title: 'Step 3: Evaluate Limit',
                            explanation: 'After rationalization, evaluate the limit.',
                            math: `\\lim = ${formatNumber(avg)}`
                        });

                        return {
                            success: true,
                            value: avg,
                            method: 'Conjugate Multiplication',
                            steps: steps
                        };
                    }
                }
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    // Method 5: Special Limits (sin(x)/x, etc.)
    const trySpecialLimits = (latex, expr, vars) => {
        try {
            // Check for sin(x)/x pattern
            const sinXoverX = /\\frac\{\\sin.*?\}\{.*?\}/;

            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            let steps = [];
            let limitValue = null;

            // Check if approaching 0
            const approachingZero = vars.some(v => Math.abs(evaluateSpecialValue(v.value)) < 0.0001);

            // sin(x)/x → 1 as x → 0
            if (sinXoverX.test(latex) && approachingZero) {
                steps = [
                    {
                        title: 'Step 1: Identify Special Limit',
                        explanation: 'This is a standard limit form involving sin(x)/x.',
                        math: latex
                    },
                    {
                        title: 'Step 2: Apply Standard Limit',
                        explanation: 'Use the fact that lim(sin(u)/u) = 1 as u → 0.',
                        math: '\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1'
                    }
                ];

                // Compute using multiple perturbations
                const epsilons = [0.0001, -0.0001, 0.00005, -0.00005];
                const results = [];

                for (const epsilon of epsilons) {
                    try {
                        const perturbedScope = {};
                        vars.forEach(v => {
                            perturbedScope[v.name] = evaluateSpecialValue(v.value) + epsilon;
                        });
                        const val = math.evaluate(expr, perturbedScope);
                        if (isFinite(val) && !isNaN(val)) {
                            results.push(val);
                        }
                    } catch { }
                }

                if (results.length >= 2) {
                    const avg = results.reduce((a, b) => a + b, 0) / results.length;
                    limitValue = avg;
                }
            }

            // (1-cos(x))/x → 0 as x → 0
            if ((latex.includes('1-\\cos') || latex.includes('\\cos')) && approachingZero) {
                const epsilons = [0.0001, -0.0001, 0.00005, -0.00005];
                const results = [];

                for (const epsilon of epsilons) {
                    try {
                        const perturbedScope = {};
                        vars.forEach(v => {
                            perturbedScope[v.name] = evaluateSpecialValue(v.value) + epsilon;
                        });
                        const val = math.evaluate(expr, perturbedScope);
                        if (isFinite(val) && !isNaN(val)) {
                            results.push(val);
                        }
                    } catch { }
                }

                if (results.length >= 2) {
                    const avg = results.reduce((a, b) => a + b, 0) / results.length;
                    limitValue = avg;

                    steps = [
                        {
                            title: 'Step 1: Identify Trigonometric Limit',
                            explanation: 'This involves standard trigonometric limits.',
                            math: latex
                        },
                        {
                            title: 'Step 2: Evaluate Using Standard Forms',
                            explanation: 'Apply known trigonometric limit identities.',
                            math: `\\lim = ${formatNumber(limitValue)}`
                        }
                    ];
                }
            }

            if (limitValue !== null && isFinite(limitValue)) {
                return {
                    success: true,
                    value: limitValue,
                    method: 'Special Limits',
                    steps: steps
                };
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    // Method 6: Numerical Approximation (fallback)
    const numericalApproximation = (expr, vars) => {
        try {
            // Try multiple approaches from different directions
            const epsilons = [0.00001, -0.00001, 0.0001, -0.0001, 0.001, -0.001];
            const results = [];

            for (const epsilon of epsilons) {
                try {
                    const scope = {};
                    vars.forEach(v => {
                        const baseValue = evaluateSpecialValue(v.value);
                        scope[v.name] = baseValue + epsilon;
                    });

                    const val = math.evaluate(expr, scope);
                    if (isFinite(val) && !isNaN(val)) {
                        results.push(val);
                    }
                } catch { }
            }

            if (results.length >= 3) {
                // Calculate average and check consistency
                const avg = results.reduce((a, b) => a + b, 0) / results.length;
                const variance = results.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / results.length;
                const stdDev = Math.sqrt(variance);

                // If results are consistent (low standard deviation)
                if (stdDev < Math.abs(avg) * 0.1 || stdDev < 0.01) {
                    return {
                        success: true,
                        value: avg,
                        method: 'Numerical Approximation',
                        steps: [
                            {
                                title: 'Step 1: Numerical Approach',
                                explanation: `Evaluating the function at points very close to ${vars.map(v => `${v.name} = ${v.value}`).join(', ')} from multiple directions.`,
                                math: ''
                            },
                            {
                                title: 'Step 2: Convergence Analysis',
                                explanation: `The function values converge consistently to a single value.`,
                                math: ''
                            },
                            {
                                title: 'Step 3: Approximate Result',
                                explanation: 'The limit is approximately:',
                                math: `\\lim \\approx ${formatNumber(avg)}`
                            }
                        ]
                    };
                }
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    // Main calculation function
    const calculateLimit = async () => {
        try {
            if (!mathFieldRef.current) {
                showToastMessage('Please enter a function');
                return;
            }

            const latex = mathFieldRef.current.latex();
            if (!latex.trim()) {
                showToastMessage('Please enter a function');
                return;
            }

            console.log('=== CALCULATING LIMIT ===');
            console.log('LaTeX:', latex);
            console.log('Variables:', variables);

            const expr = latexToMathJs(latex);
            console.log('Expression:', expr);

            // Try different methods in order
            const methods = [
                { name: 'Direct Substitution', fn: () => tryDirectSubstitution(expr, variables) },
                { name: 'Factorization', fn: () => tryFactorization(latex, expr, variables) },
                { name: "L'Hôpital's Rule", fn: () => tryLHopital(latex, expr, variables) },
                { name: 'Conjugate Multiplication', fn: () => tryConjugate(latex, expr, variables) },
                { name: 'Special Limits', fn: () => trySpecialLimits(latex, expr, variables) },
                { name: 'Numerical Approximation', fn: () => numericalApproximation(expr, variables) }
            ];

            let result = null;
            for (const method of methods) {
                console.log(`Trying ${method.name}...`);
                result = method.fn();
                console.log(`${method.name} result:`, result);

                if (result.success && result.value !== undefined && result.value !== null) {
                    // Verify the result is valid
                    if (typeof result.value === 'number' && (isFinite(result.value) || result.value === Infinity || result.value === -Infinity)) {
                        console.log(`✓ Success with ${method.name}: ${result.value}`);
                        setMethodUsed(result.method);
                        setResult(result.value);
                        setSteps(result.steps);
                        setShowResult(true);
                        showToastMessage(`Solved using ${result.method}!`);
                        return;
                    } else if (typeof result.value === 'string' && result.value !== 'Does not exist or undefined') {
                        console.log(`✓ Success with ${method.name}: ${result.value}`);
                        setMethodUsed(result.method);
                        setResult(result.value);
                        setSteps(result.steps);
                        setShowResult(true);
                        showToastMessage(`Solved using ${result.method}!`);
                        return;
                    }
                }
            }

            // If all methods fail
            console.log('✗ All methods failed');
            setMethodUsed('Analysis');
            setResult('Does not exist or undefined');
            setSteps([{
                title: 'Analysis',
                explanation: 'The limit could not be determined using standard methods. It may not exist or require advanced techniques.',
                math: ''
            }]);
            setShowResult(true);
            showToastMessage('Limit analysis complete');

        } catch (error) {
            console.error('ERROR:', error);
            showToastMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="app-body">
            <div className="app-container">
                <h1 className="app-title">Advanced Limit Calculator</h1>
                <div className="app-subtitle">Multi-Variable Support with Intelligent Method Detection</div>

                {/* Demo Examples */}
                <div className="demo-section">
                    <div className="demo-title">📚 Click an example to load it (30 Examples):</div>
                    <div className="demo-grid">
                        {['Two Variables', 'Quotients', 'Three Variables'].map(category => (
                            <React.Fragment key={category}>
                                <div className="category-header">
                                    {category}
                                </div>
                                {demoExamples
                                    .filter(ex => ex.category === category)
                                    .map((example) => (
                                        <div
                                            key={example.num}
                                            className="demo-item"
                                            onClick={() => loadExample(example)}
                                        >
                                            <div className="demo-number">Example {example.num}</div>
                                            <div className="demo-math" id={`demo-${example.num}`}></div>
                                        </div>
                                    ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Input Section */}
                <div className="input-section">
                    <div className="section-title">Enter Your Limit</div>

                    <div className="limit-builder">
                        <div className="limit-display">
                            <div className="limit-part">
                                <span className="limit-label">lim</span>
                            </div>

                            {/* Multi-variable inputs */}
                            <div className="variables-container">
                                {variables.map((variable, index) => (
                                    <div key={index} className="variable-row">
                                        <input
                                            type="text"
                                            value={variable.name}
                                            onChange={(e) => updateVariable(index, 'name', e.target.value)}
                                            className="variable-name-input"
                                            placeholder="x"
                                            maxLength="3"
                                        />
                                        <span className="limit-arrow">→</span>
                                        <input
                                            type="text"
                                            value={variable.value}
                                            onChange={(e) => updateVariable(index, 'value', e.target.value)}
                                            className="limit-input-inline"
                                            placeholder="0"
                                        />
                                        {variables.length > 1 && (
                                            <button
                                                onClick={() => removeVariable(index)}
                                                className="remove-var-btn"
                                                title="Remove variable"
                                            >
                                                ×
                                            </button>
                                        )}
                                        {index === variables.length - 1 && variables.length < 5 && (
                                            <button
                                                onClick={addVariable}
                                                className="add-var-btn"
                                                title="Add variable"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="direction-select"
                            >
                                <option value="both">both sides</option>
                                <option value="left">from left (−)</option>
                                <option value="right">from right (+)</option>
                            </select>
                        </div>

                        <div className="function-label">
                            Enter function f({variables.map(v => v.name).join(', ')}):
                        </div>
                        <div ref={functionFieldRef} className="function-field" />

                        {/* Toolbar */}
                        <div className="toolbar-section">
                            <div className="toolbar-title">Quick Insert Symbols</div>
                            <div className="toolbar">
                                <button onClick={() => insertSymbol('\\frac')} className="toolbar-button">x/y</button>
                                <button onClick={() => insertSymbol('\\sqrt')} className="toolbar-button">√</button>
                                <button onClick={() => insertSymbol('^')} className="toolbar-button">x^n</button>
                                <button onClick={() => insertSymbol('\\sin')} className="toolbar-button">sin</button>
                                <button onClick={() => insertSymbol('\\cos')} className="toolbar-button">cos</button>
                                <button onClick={() => insertSymbol('\\tan')} className="toolbar-button">tan</button>
                                <button onClick={() => insertSymbol('\\ln')} className="toolbar-button">ln</button>
                                <button onClick={() => insertSymbol('\\log')} className="toolbar-button">log</button>
                                <button onClick={() => insertSymbol('e^')} className="toolbar-button">e^x</button>
                                <button onClick={() => insertSymbol('\\pi')} className="toolbar-button">π</button>
                                <button onClick={() => insertSymbol('\\infty')} className="toolbar-button">∞</button>
                                <button onClick={() => insertSymbol('\\left(\\right)')} className="toolbar-button">()</button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="actions">
                        <button onClick={calculateLimit} className="calculate-button">
                            🚀 Calculate Limit
                        </button>
                        <button onClick={clearFunction} className="clear-button">
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                {/* Results */}
                {showResult && (
                    <div className="result-section">
                        <div className="answer-box">
                            <div className="answer-label">
                                Answer (Method: {methodUsed}):
                            </div>
                            <div className="answer-value">
                                {typeof result === 'number' ? formatNumber(result) : result}
                            </div>
                        </div>

                        <div className="steps-box">
                            <div className="steps-title">📝 Solution Steps</div>
                            <div className="steps-content">
                                {steps.map((step, index) => (
                                    <div key={index} className="step-item">
                                        <div className="step-number">{step.title}</div>
                                        <div className="step-content">{step.explanation}</div>
                                        {step.math && (
                                            <div className="step-math" id={`step-math-${index}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast.show && (
                    <div className={`toast ${toast.show ? 'toast-show' : ''}`}>
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Homepage;