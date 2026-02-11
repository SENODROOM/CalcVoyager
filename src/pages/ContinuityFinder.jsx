import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as math from 'mathjs';
import { latexToMathJs } from '../utils/Latex Convertor/LatexToMathJs';

const ContinuityFinder = () => {
    const [variables, setVariables] = useState([{ name: 'x', value: '0' }, { name: 'y', value: '0' }]);
    const [result, setResult] = useState(null);
    const [steps, setSteps] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [analysisType, setAnalysisType] = useState('general'); // 'general' or 'point'

    const functionFieldRef = useRef(null);
    const mathFieldRef = useRef(null);
    const inputSectionRef = useRef(null);
    const resultSectionRef = useRef(null);

    // Demo examples from the exercises
    const demoExamples = useMemo(() => [
        // Two Variables
        { num: '31a', latex: '\\sin(x+y)', point: '', desc: 'sin(x+y)', category: 'Two Variables' },
        { num: '31b', latex: '\\ln(x^2+y^2)', point: 'x=0,y=0', desc: 'ln(x²+y²)', category: 'Two Variables' },
        { num: '32a', latex: '\\frac{x+y}{x-y}', point: 'x=1,y=1', desc: '(x+y)/(x-y)', category: 'Two Variables' },
        { num: '32b', latex: '\\frac{y}{x^2+1}', point: '', desc: 'y/(x²+1)', category: 'Two Variables' },
        { num: '33a', latex: '\\sin\\frac{1}{xy}', point: 'x=0,y=0', desc: 'sin(1/xy)', category: 'Two Variables' },
        { num: '33b', latex: '\\frac{x+y}{2+\\cos x}', point: '', desc: '(x+y)/(2+cos x)', category: 'Two Variables' },
        { num: '34a', latex: '\\frac{x^2+y^2}{x^2-3x+2}', point: 'x=1,y=0', desc: '(x²+y²)/(x²-3x+2)', category: 'Two Variables' },
        { num: '34b', latex: '\\frac{1}{x^2-y}', point: 'x=1,y=1', desc: '1/(x²-y)', category: 'Two Variables' },

        // Three Variables
        { num: '35a', latex: 'x^2+y^2-2z^2', point: '', desc: 'x²+y²-2z²', category: 'Three Variables' },
        { num: '35b', latex: '\\sqrt{x^2+y^2-1}', point: 'x=0,y=0,z=0', desc: '√(x²+y²-1)', category: 'Three Variables' },
        { num: '36a', latex: '\\ln(xyz)', point: 'x=0,y=0,z=0', desc: 'ln(xyz)', category: 'Three Variables' },
        { num: '36b', latex: 'e^{xy}\\cos z', point: '', desc: 'e^(xy)cos z', category: 'Three Variables' },
        { num: '37a', latex: 'xy\\sin\\frac{1}{z}', point: 'x=0,y=0,z=0', desc: 'xy sin(1/z)', category: 'Three Variables' },
        { num: '37b', latex: '\\frac{1}{x^2+z^2-1}', point: 'x=1,y=0,z=0', desc: '1/(x²+z²-1)', category: 'Three Variables' },
    ], []);

    // Initialize MathQuill
    useEffect(() => {
        if (window.MathQuill && functionFieldRef.current && !mathFieldRef.current) {
            const MQ = window.MathQuill.getInterface(2);
            const mathField = MQ.MathField(functionFieldRef.current, {
                spaceBehavesLikeTab: true,
                handlers: {
                    enter: function () {
                        analyzeContinuity();
                    }
                }
            });
            mathFieldRef.current = mathField;
            mathField.latex('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Scroll to results
    useEffect(() => {
        if (showResult && steps.length > 0) {
            requestAnimationFrame(() => {
                if (resultSectionRef.current) {
                    resultSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }, [showResult, steps]);

    const insertSymbol = (latex) => {
        if (mathFieldRef.current) {
            mathFieldRef.current.cmd(latex);
            mathFieldRef.current.focus();
        }
    };

    const loadExample = (example) => {
        if (mathFieldRef.current) {
            mathFieldRef.current.latex(example.latex);
            const parsedVars = parsePointToVariables(example.point || '');
            setVariables(parsedVars);
            showToastMessage(`Loaded: ${example.desc}`);
            setTimeout(() => {
                if (inputSectionRef.current) {
                    inputSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }
    };

    const parsePointToVariables = (pointStr) => {
        if (!pointStr) return [{ name: 'x', value: '0' }, { name: 'y', value: '0' }];

        const vars = [];
        const parts = pointStr.split(',');

        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('=')) {
                const [name, value] = trimmed.split('=');
                vars.push({ name: name.trim(), value: value.trim() });
            }
        });

        return vars.length > 0 ? vars : [{ name: 'x', value: '0' }, { name: 'y', value: '0' }];
    };

    const clearFunction = () => {
        if (mathFieldRef.current) {
            mathFieldRef.current.latex('');
            mathFieldRef.current.focus();
        }
    };

    const showToastMessage = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 2000);
    };

    const addVariable = () => {
        const nextVarChar = String.fromCharCode(120 + variables.length);
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

    const evaluateSpecialValue = (str) => {
        if (!str) return 0;

        let expr = str
            .replace(/\\pi/g, 'pi')
            .replace(/π/g, 'pi')
            .replace(/\\ln/g, 'log')
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
            .replace(/\\sqrt\{([^}]+)\}/g, '(sqrt($1))');

        try {
            const result = math.evaluate(expr);
            if (typeof result === 'number') {
                return result;
            }
            const num = parseFloat(str);
            return isNaN(num) ? 0 : num;
        } catch {
            const num = parseFloat(str);
            return isNaN(num) ? 0 : num;
        }
    };

    // Analyze continuity
    const analyzeContinuity = useCallback(async () => {
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

            console.log('=== ANALYZING CONTINUITY ===');
            console.log('LaTeX:', latex);
            console.log('Variables:', variables);

            const expr = latexToMathJs(latex);
            console.log('Expression:', expr);

            const analysisSteps = [];

            // Step 1: Function identification
            analysisSteps.push({
                title: 'Step 1: Function Analysis',
                explanation: `Analyzing f(${variables.map(v => v.name).join(',')}) = ${latex}`,
                math: latex
            });

            // Step 2: Domain analysis
            const domainAnalysis = analyzeDomain(latex, expr, variables);
            analysisSteps.push({
                title: 'Step 2: Domain Analysis',
                explanation: domainAnalysis.explanation,
                math: domainAnalysis.domainLatex
            });

            // Step 3: Check continuity at point (if specified)
            let continuityResult = null;
            if (analysisType === 'point') {
                continuityResult = checkContinuityAtPoint(expr, variables);
                analysisSteps.push({
                    title: 'Step 3: Continuity at Point',
                    explanation: continuityResult.explanation,
                    math: continuityResult.math
                });
            } else {
                analysisSteps.push({
                    title: 'Step 3: General Continuity',
                    explanation: domainAnalysis.continuityExplanation,
                    math: domainAnalysis.continuityCondition
                });
            }

            // Step 4: Conclusion
            const conclusion = generateConclusion(domainAnalysis, continuityResult, variables);
            analysisSteps.push({
                title: 'Step 4: Conclusion',
                explanation: conclusion.explanation,
                math: conclusion.math
            });

            setResult(conclusion.isContinuous);
            setSteps(analysisSteps);
            setShowResult(true);
            showToastMessage('Analysis complete!');

        } catch (error) {
            console.error('ERROR:', error);
            showToastMessage('Error: ' + error.message);
        }
    }, [variables, analysisType]);

    // Analyze the domain of the function
    const analyzeDomain = (latex, expr, vars) => {
        let restrictions = [];
        let domainLatex = '\\mathbb{R}^{' + vars.length + '}';
        let explanation = 'Analyzing the domain of the function...';
        let continuityExplanation = '';
        let continuityCondition = '';

        // Check for ln (requires positive argument)
        if (latex.includes('\\ln') || latex.includes('\\log')) {
            restrictions.push('logarithm');
            const lnMatch = latex.match(/\\ln\(([^)]+)\)/) || latex.match(/\\ln\{([^}]+)\}/);
            if (lnMatch) {
                const arg = lnMatch[1];
                explanation = `The natural logarithm requires its argument to be positive: ${arg} > 0`;
                domainLatex = `\\{(${vars.map(v => v.name).join(',')}) : ${arg} > 0\\}`;
                continuityExplanation = `The function is continuous wherever ${arg} > 0`;
                continuityCondition = arg + ' > 0';
            }
        }

        // Check for sqrt (requires non-negative argument)
        if (latex.includes('\\sqrt')) {
            restrictions.push('square root');
            const sqrtMatch = latex.match(/\\sqrt\{([^}]+)\}/);
            if (sqrtMatch) {
                const arg = sqrtMatch[1];
                explanation = `The square root requires its argument to be non-negative: ${arg} ≥ 0`;
                domainLatex = `\\{(${vars.map(v => v.name).join(',')}) : ${arg} \\geq 0\\}`;
                continuityExplanation = `The function is continuous wherever ${arg} ≥ 0`;
                continuityCondition = arg + ' \\geq 0';
            }
        }

        // Check for fractions (denominator cannot be zero)
        if (latex.includes('\\frac')) {
            restrictions.push('fraction');
            const fracMatch = latex.match(/\\frac\{[^}]+\}\{([^}]+)\}/);
            if (fracMatch) {
                const denom = fracMatch[1];
                explanation = `The denominator cannot be zero: ${denom} ≠ 0`;
                domainLatex = `\\{(${vars.map(v => v.name).join(',')}) : ${denom} \\neq 0\\}`;
                continuityExplanation = `The function is continuous wherever ${denom} ≠ 0`;
                continuityCondition = denom + ' \\neq 0';
            }
        }

        // Check for division by variable expressions
        const divPatterns = [
            /\/(xy|x\*y)/i,
            /\/([a-z])/i,
            /\/(x\^2[+-]y)/i,
        ];

        for (const pattern of divPatterns) {
            if (expr.match(pattern)) {
                const match = expr.match(pattern);
                if (match && !restrictions.includes('fraction')) {
                    restrictions.push('division');
                    const divisor = match[1];
                    explanation = `Division requires ${divisor} ≠ 0`;
                    domainLatex = `\\{(${vars.map(v => v.name).join(',')}) : ${divisor} \\neq 0\\}`;
                    continuityExplanation = `The function is continuous wherever ${divisor} ≠ 0`;
                    continuityCondition = divisor + ' \\neq 0';
                }
            }
        }

        // If no restrictions found
        if (restrictions.length === 0) {
            explanation = 'This function is composed of continuous elementary functions (polynomials, trigonometric functions, exponentials)';
            continuityExplanation = `The function is continuous everywhere in its domain (all of ℝ${vars.length > 1 ? '^' + vars.length : ''})`;
            continuityCondition = '\\text{Continuous everywhere}';
        }

        return {
            restrictions,
            domainLatex,
            explanation,
            continuityExplanation,
            continuityCondition
        };
    };

    // Check continuity at a specific point
    const checkContinuityAtPoint = (expr, vars) => {
        try {
            const scope = {};
            vars.forEach(v => {
                scope[v.name] = evaluateSpecialValue(v.value);
            });

            // Try to evaluate at the point
            const valueAtPoint = math.evaluate(expr, scope);

            if (typeof valueAtPoint === 'number' && isFinite(valueAtPoint)) {
                return {
                    isContinuous: true,
                    explanation: `At point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}), the function equals ${valueAtPoint.toFixed(4)}. The function is defined and finite at this point.`,
                    math: `f(${vars.map(v => v.value).join(',')}) = ${valueAtPoint.toFixed(4)}`
                };
            } else if (valueAtPoint === Infinity || valueAtPoint === -Infinity) {
                return {
                    isContinuous: false,
                    explanation: `At point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}), the function approaches infinity. The function is not continuous at this point.`,
                    math: `f(${vars.map(v => v.value).join(',')}) = ${valueAtPoint === Infinity ? '\\infty' : '-\\infty'}`
                };
            } else {
                return {
                    isContinuous: false,
                    explanation: `At point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}), the function is undefined.`,
                    math: `f(${vars.map(v => v.value).join(',')}) = \\text{undefined}`
                };
            }
        } catch (error) {
            return {
                isContinuous: false,
                explanation: `At point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}), the function is undefined or has a discontinuity.`,
                math: `f(${vars.map(v => v.value).join(',')}) = \\text{undefined}`
            };
        }
    };

    // Generate conclusion
    const generateConclusion = (domainAnalysis, continuityResult, vars) => {
        if (analysisType === 'point' && continuityResult) {
            return {
                isContinuous: continuityResult.isContinuous ? 'Continuous' : 'Discontinuous',
                explanation: continuityResult.isContinuous
                    ? `The function is continuous at the point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}).`
                    : `The function is NOT continuous at the point (${vars.map(v => `${v.name}=${v.value}`).join(', ')}).`,
                math: continuityResult.math
            };
        } else {
            const hasRestrictions = domainAnalysis.restrictions.length > 0;
            return {
                isContinuous: hasRestrictions ? 'Continuous on Domain' : 'Continuous Everywhere',
                explanation: domainAnalysis.continuityExplanation,
                math: domainAnalysis.domainLatex
            };
        }
    };

    return (
        <div className="app-body">
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .app-body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }

                .app-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .app-title {
                    text-align: center;
                    color: white;
                    font-size: 3em;
                    font-weight: 700;
                    margin-bottom: 10px;
                    text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.2);
                }

                .app-subtitle {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1.2em;
                    margin-bottom: 40px;
                }

                .demo-section {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 30px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                }

                .section-title {
                    font-size: 1.8em;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .category-section {
                    margin-bottom: 30px;
                }

                .category-title {
                    font-size: 1.3em;
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 15px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #667eea;
                }

                .examples-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }

                .example-card {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .example-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                    border-color: #667eea;
                }

                .example-label {
                    font-size: 0.85em;
                    color: #666;
                    margin-bottom: 8px;
                }

                .example-function {
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1em;
                }

                .input-section {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 30px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                }

                .limit-builder {
                    margin-bottom: 25px;
                }

                .limit-display {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .limit-part {
                    font-size: 1.5em;
                    font-weight: 600;
                    color: #333;
                }

                .limit-label {
                    font-family: 'Times New Roman', serif;
                }

                .variables-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .variable-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .variable-name-input {
                    width: 60px;
                    padding: 8px 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1.1em;
                    text-align: center;
                    transition: border 0.3s;
                }

                .variable-name-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .limit-arrow {
                    font-size: 1.3em;
                    color: #667eea;
                }

                .limit-input-inline {
                    width: 100px;
                    padding: 8px 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1.1em;
                    text-align: center;
                    transition: border 0.3s;
                }

                .limit-input-inline:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .add-var-btn, .remove-var-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    font-size: 1.3em;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .add-var-btn {
                    background: #667eea;
                    color: white;
                }

                .add-var-btn:hover {
                    background: #5568d3;
                    transform: scale(1.1);
                }

                .remove-var-btn {
                    background: #ff6b6b;
                    color: white;
                }

                .remove-var-btn:hover {
                    background: #ee5a52;
                    transform: scale(1.1);
                }

                .analysis-type-selector {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 12px;
                }

                .radio-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .radio-option input[type="radio"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .radio-option label {
                    font-size: 1em;
                    cursor: pointer;
                }

                .function-label {
                    font-size: 1.1em;
                    color: #333;
                    margin-bottom: 10px;
                    font-weight: 500;
                }

                .function-field {
                    min-height: 60px;
                    padding: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 1.3em;
                    transition: border 0.3s;
                    background: white;
                }

                .function-field:focus-within {
                    border-color: #667eea;
                }

                .toolbar-section {
                    margin-top: 20px;
                }

                .toolbar-title {
                    font-size: 0.95em;
                    color: #666;
                    margin-bottom: 10px;
                }

                .toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .toolbar-button {
                    padding: 8px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95em;
                    transition: all 0.3s;
                }

                .toolbar-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 25px;
                }

                .calculate-button, .clear-button {
                    flex: 1;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .calculate-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .calculate-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }

                .clear-button {
                    background: #f5f5f5;
                    color: #333;
                }

                .clear-button:hover {
                    background: #e0e0e0;
                }

                .result-section {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    animation: slideUp 0.5s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .answer-box {
                    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 15px rgba(132, 250, 176, 0.3);
                }

                .answer-label {
                    font-size: 1.1em;
                    color: #333;
                    margin-bottom: 10px;
                    font-weight: 600;
                }

                .answer-value {
                    font-size: 2em;
                    font-weight: 700;
                    color: #2d3748;
                }

                .steps-box {
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                }

                .steps-title {
                    font-size: 1.5em;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 20px;
                }

                .steps-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .step-item {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #667eea;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .step-number {
                    font-size: 1.1em;
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 10px;
                }

                .step-content {
                    font-size: 1em;
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }

                .step-math {
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 10px;
                }

                .toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: #333;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s;
                    z-index: 1000;
                }

                .toast-show {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .app-title {
                        font-size: 2em;
                    }

                    .examples-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="app-container">
                <h1 className="app-title">Continuity Analyzer</h1>
                <div className="app-subtitle">Multi-Variable Function Continuity Analysis</div>

                {/* Demo Examples */}
                <div className="demo-section">
                    <div className="section-title">📚 Example Functions</div>

                    {['Two Variables', 'Three Variables'].map(category => (
                        <div key={category} className="category-section">
                            <div className="category-title">{category}</div>
                            <div className="examples-grid">
                                {demoExamples
                                    .filter(ex => ex.category === category)
                                    .map(example => (
                                        <div
                                            key={example.num}
                                            className="example-card"
                                            onClick={() => loadExample(example)}
                                        >
                                            <div className="example-label">Ex {example.num}</div>
                                            <div className="example-function" id={`demo-${example.num}`}></div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Section */}
                <div className="input-section" ref={inputSectionRef}>
                    <div className="section-title">Enter Your Function</div>

                    <div className="limit-builder">
                        {/* Analysis Type Selector */}
                        <div className="analysis-type-selector">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="general"
                                    name="analysisType"
                                    value="general"
                                    checked={analysisType === 'general'}
                                    onChange={(e) => setAnalysisType(e.target.value)}
                                />
                                <label htmlFor="general">General Continuity Analysis</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="point"
                                    name="analysisType"
                                    value="point"
                                    checked={analysisType === 'point'}
                                    onChange={(e) => setAnalysisType(e.target.value)}
                                />
                                <label htmlFor="point">Continuity at Specific Point</label>
                            </div>
                        </div>

                        {analysisType === 'point' && (
                            <div className="limit-display">
                                <div className="limit-part">
                                    <span className="limit-label">at point</span>
                                </div>

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
                                            <span className="limit-arrow">=</span>
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
                            </div>
                        )}

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
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="actions">
                        <button onClick={analyzeContinuity} className="calculate-button">
                            🔍 Analyze Continuity
                        </button>
                        <button onClick={clearFunction} className="clear-button">
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                {/* Results */}
                {showResult && (
                    <div className="result-section" ref={resultSectionRef}>
                        <div className="answer-box">
                            <div className="answer-label">
                                Result:
                            </div>
                            <div className="answer-value">
                                {result}
                            </div>
                        </div>

                        <div className="steps-box">
                            <div className="steps-title">📝 Detailed Analysis</div>
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

export default ContinuityFinder;