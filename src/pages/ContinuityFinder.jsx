import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { latexToMathJs } from '../utils/Latex Convertor/LatexToMathJs';

const ContinuityFinder = () => {
    const [selectedFunction, setSelectedFunction] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState('');
    const [continuityResult, setContinuityResult] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);

    // Functions from the images - Exercises 31-40
    const functions = [
        // Exercise 31
        { id: '31a', latex: '\\sin(x+y)', point: '', vars: ['x', 'y'], desc: 'Exercise 31a: f(x,y) = sin(x+y)' },
        { id: '31b', latex: '\\ln(x^2+y^2)', point: '', vars: ['x', 'y'], desc: 'Exercise 31b: f(x,y) = ln(x²+y²)' },

        // Exercise 32
        { id: '32a', latex: '\\frac{x+y}{x-y}', point: '', vars: ['x', 'y'], desc: 'Exercise 32a: f(x,y) = (x+y)/(x-y)' },
        { id: '32b', latex: '\\frac{y}{x^2+1}', point: '', vars: ['x', 'y'], desc: 'Exercise 32b: f(x,y) = y/(x²+1)' },

        // Exercise 33
        { id: '33a', latex: '\\sin\\frac{1}{xy}', point: '', vars: ['x', 'y'], desc: 'Exercise 33a: g(x,y) = sin(1/xy)' },
        { id: '33b', latex: '\\frac{x+y}{2+\\cos x}', point: '', vars: ['x', 'y'], desc: 'Exercise 33b: g(x,y) = (x+y)/(2+cos x)' },

        // Exercise 34
        { id: '34a', latex: '\\frac{x^2+y^2}{x^2-3x+2}', point: '', vars: ['x', 'y'], desc: 'Exercise 34a: g(x,y) = (x²+y²)/(x²-3x+2)' },
        { id: '34b', latex: '\\frac{1}{x^2-y}', point: '', vars: ['x', 'y'], desc: 'Exercise 34b: g(x,y) = 1/(x²-y)' },

        // Exercise 35
        { id: '35a', latex: 'x^2+y^2-2z^2', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 35a: f(x,y,z) = x²+y²-2z²' },
        { id: '35b', latex: '\\sqrt{x^2+y^2-1}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 35b: f(x,y,z) = √(x²+y²-1)' },

        // Exercise 36
        { id: '36a', latex: '\\ln(xyz)', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 36a: f(x,y,z) = ln(xyz)' },
        { id: '36b', latex: 'e^{xy}\\cos z', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 36b: f(x,y,z) = e^(xy)cos z' },

        // Exercise 37
        { id: '37a', latex: 'xy\\sin\\frac{1}{z}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 37a: h(x,y,z) = xy sin(1/z)' },
        { id: '37b', latex: '\\frac{1}{x^2+z^2-1}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 37b: h(x,y,z) = 1/(x²+z²-1)' },

        // Exercise 38
        { id: '38a', latex: '\\frac{1}{|y|+|z|}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 38a: h(x,y,z) = 1/(|y|+|z|)' },
        { id: '38b', latex: '\\frac{1}{|xy|+|z|}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 38b: h(x,y,z) = 1/(|xy|+|z|)' },

        // Exercise 39
        { id: '39a', latex: '\\ln(z-x^2-y^2-1)', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 39a: h(x,y,z) = ln(z-x²-y²-1)' },
        { id: '39b', latex: '\\frac{1}{z-\\sqrt{x^2+y^2}}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 39b: h(x,y,z) = 1/(z-√(x²+y²))' },

        // Exercise 40
        { id: '40a', latex: '\\sqrt{4-x^2-y^2-z^2}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 40a: h(x,y,z) = √(4-x²-y²-z²)' },
        { id: '40b', latex: '\\frac{1}{4-\\sqrt{x^2+y^2+z^2-9}}', point: '', vars: ['x', 'y', 'z'], desc: 'Exercise 40b: h(x,y,z) = 1/(4-√(x²+y²+z²-9))' },
    ];

    // Analyze continuity of a function
    const analyzeContinuity = (func, pointStr) => {
        setLoading(true);
        setContinuityResult(null);
        setSteps([]);

        try {
            const analysisSteps = [];
            const mathJsExpr = latexToMathJs(func.latex);

            analysisSteps.push({
                title: 'Step 1: Function Analysis',
                explanation: `Analyzing f(${func.vars.join(',')}) with expression: ${mathJsExpr}`,
                math: func.latex
            });

            // Parse the point if provided
            let testPoint = {};
            if (pointStr) {
                const pointParts = pointStr.split(',').map(p => p.trim());
                func.vars.forEach((v, i) => {
                    if (pointParts[i]) {
                        const match = pointParts[i].match(/[a-z]=(.+)/);
                        if (match) {
                            testPoint[v] = match[1];
                        }
                    }
                });
            }

            // Determine continuity based on function type
            const result = determineContinuity(func, mathJsExpr, testPoint);

            analysisSteps.push({
                title: 'Step 2: Continuity Analysis',
                explanation: result.explanation,
                math: result.condition
            });

            analysisSteps.push({
                title: 'Step 3: Conclusion',
                explanation: result.conclusion,
                math: result.domain
            });

            setContinuityResult(result);
            setSteps(analysisSteps);

        } catch (error) {
            setContinuityResult({
                isContinuous: false,
                explanation: `Error analyzing function: ${error.message}`,
                conclusion: 'Unable to determine continuity'
            });
        }

        setLoading(false);
    };

    const determineContinuity = (func, expr, point) => {
        const id = func.id;

        // Analysis for each function
        const analyses = {
            '31a': {
                isContinuous: true,
                explanation: 'sin(x+y) is a composition of continuous functions (addition and sine)',
                condition: '\\text{Continuous everywhere}',
                conclusion: 'The function is continuous for all (x,y) ∈ ℝ²',
                domain: '\\text{Domain: } \\mathbb{R}^2'
            },
            '31b': {
                isContinuous: false,
                explanation: 'ln(x²+y²) requires x²+y² > 0, which fails at (0,0)',
                condition: 'x^2 + y^2 > 0',
                conclusion: 'The function is continuous everywhere except at (0,0)',
                domain: '\\text{Domain: } \\mathbb{R}^2 \\setminus \\{(0,0)\\}'
            },
            '32a': {
                isContinuous: false,
                explanation: 'The denominator (x-y) = 0 when x = y',
                condition: 'x \\neq y',
                conclusion: 'The function is continuous everywhere except on the line x = y',
                domain: '\\{(x,y) : x \\neq y\\}'
            },
            '32b': {
                isContinuous: true,
                explanation: 'The denominator x²+1 is always positive (≥ 1)',
                condition: '\\text{Continuous everywhere}',
                conclusion: 'The function is continuous for all (x,y) ∈ ℝ²',
                domain: '\\text{Domain: } \\mathbb{R}^2'
            },
            '33a': {
                isContinuous: false,
                explanation: 'sin(1/xy) is undefined when xy = 0 (x=0 or y=0)',
                condition: 'xy \\neq 0',
                conclusion: 'The function is continuous everywhere except on the coordinate axes',
                domain: '\\{(x,y) : x \\neq 0, y \\neq 0\\}'
            },
            '33b': {
                isContinuous: true,
                explanation: 'The denominator 2+cos x is always positive (between 1 and 3)',
                condition: '\\text{Continuous everywhere}',
                conclusion: 'The function is continuous for all (x,y) ∈ ℝ²',
                domain: '\\text{Domain: } \\mathbb{R}^2'
            },
            '34a': {
                isContinuous: false,
                explanation: 'The denominator x²-3x+2 = (x-1)(x-2) = 0 when x=1 or x=2',
                condition: 'x \\neq 1, x \\neq 2',
                conclusion: 'The function is continuous everywhere except on the lines x=1 and x=2',
                domain: '\\{(x,y) : x \\neq 1, x \\neq 2\\}'
            },
            '34b': {
                isContinuous: false,
                explanation: 'The denominator x²-y = 0 when y = x²',
                condition: 'y \\neq x^2',
                conclusion: 'The function is continuous everywhere except on the parabola y = x²',
                domain: '\\{(x,y) : y \\neq x^2\\}'
            },
            '35a': {
                isContinuous: true,
                explanation: 'x²+y²-2z² is a polynomial, which is continuous everywhere',
                condition: '\\text{Continuous everywhere}',
                conclusion: 'The function is continuous for all (x,y,z) ∈ ℝ³',
                domain: '\\text{Domain: } \\mathbb{R}^3'
            },
            '35b': {
                isContinuous: false,
                explanation: 'Square root requires x²+y²-1 ≥ 0, so x²+y² ≥ 1',
                condition: 'x^2 + y^2 \\geq 1',
                conclusion: 'The function is continuous on and outside the unit circle',
                domain: '\\{(x,y,z) : x^2 + y^2 \\geq 1\\}'
            },
            '36a': {
                isContinuous: false,
                explanation: 'ln(xyz) requires xyz > 0',
                condition: 'xyz > 0',
                conclusion: 'The function is continuous where xyz > 0',
                domain: '\\{(x,y,z) : xyz > 0\\}'
            },
            '36b': {
                isContinuous: true,
                explanation: 'e^(xy)cos z is a composition of continuous functions',
                condition: '\\text{Continuous everywhere}',
                conclusion: 'The function is continuous for all (x,y,z) ∈ ℝ³',
                domain: '\\text{Domain: } \\mathbb{R}^3'
            },
            '37a': {
                isContinuous: false,
                explanation: 'sin(1/z) is undefined when z = 0',
                condition: 'z \\neq 0',
                conclusion: 'The function is continuous everywhere except on the xy-plane (z=0)',
                domain: '\\{(x,y,z) : z \\neq 0\\}'
            },
            '37b': {
                isContinuous: false,
                explanation: 'The denominator x²+z²-1 = 0 when x²+z² = 1',
                condition: 'x^2 + z^2 \\neq 1',
                conclusion: 'The function is continuous everywhere except on the cylinder x²+z² = 1',
                domain: '\\{(x,y,z) : x^2 + z^2 \\neq 1\\}'
            },
            '38a': {
                isContinuous: false,
                explanation: 'The denominator |y|+|z| = 0 when both y=0 and z=0',
                condition: '(y,z) \\neq (0,0)',
                conclusion: 'The function is continuous everywhere except on the x-axis',
                domain: '\\{(x,y,z) : y \\neq 0 \\text{ or } z \\neq 0\\}'
            },
            '38b': {
                isContinuous: false,
                explanation: 'The denominator |xy|+|z| = 0 when xy=0 and z=0',
                condition: 'xy \\neq 0 \\text{ or } z \\neq 0',
                conclusion: 'The function is continuous everywhere except where both xy=0 and z=0',
                domain: '\\{(x,y,z) : xy \\neq 0 \\text{ or } z \\neq 0\\}'
            },
            '39a': {
                isContinuous: false,
                explanation: 'ln requires z-x²-y²-1 > 0, so z > x²+y²+1',
                condition: 'z > x^2 + y^2 + 1',
                conclusion: 'The function is continuous above the paraboloid z = x²+y²+1',
                domain: '\\{(x,y,z) : z > x^2 + y^2 + 1\\}'
            },
            '39b': {
                isContinuous: false,
                explanation: 'The denominator z-√(x²+y²) = 0 when z = √(x²+y²)',
                condition: 'z \\neq \\sqrt{x^2 + y^2}',
                conclusion: 'The function is continuous everywhere except on the cone z = √(x²+y²)',
                domain: '\\{(x,y,z) : z \\neq \\sqrt{x^2 + y^2}\\}'
            },
            '40a': {
                isContinuous: false,
                explanation: 'Square root requires 4-x²-y²-z² ≥ 0, so x²+y²+z² ≤ 4',
                condition: 'x^2 + y^2 + z^2 \\leq 4',
                conclusion: 'The function is continuous inside and on the sphere of radius 2',
                domain: '\\{(x,y,z) : x^2 + y^2 + z^2 \\leq 4\\}'
            },
            '40b': {
                isContinuous: false,
                explanation: 'Requires x²+y²+z²-9 ≥ 0 and 4-√(x²+y²+z²-9) ≠ 0',
                condition: 'x^2 + y^2 + z^2 \\geq 9, \\sqrt{x^2 + y^2 + z^2 - 9} \\neq 4',
                conclusion: 'The function is continuous outside the sphere of radius 3, except on the sphere of radius 5',
                domain: '\\{(x,y,z) : 9 \\leq x^2 + y^2 + z^2 \\neq 25\\}'
            }
        };

        return analyses[id] || {
            isContinuous: false,
            explanation: 'Analysis not available for this function',
            condition: '',
            conclusion: 'Please check the function manually',
            domain: ''
        };
    };

    // Render KaTeX
    useEffect(() => {
        if (window.katex) {
            functions.forEach((func) => {
                const el = document.getElementById(`func-${func.id}`);
                if (el) {
                    try {
                        window.katex.render(func.latex, el, { throwOnError: false });
                    } catch {
                        el.textContent = func.latex;
                    }
                }
            });

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
    }, [functions, steps]);

    return (
        <div className="continuity-finder-container">
            <style>{`
                .continuity-finder-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }

                .header {
                    text-align: center;
                    color: white;
                    margin-bottom: 30px;
                }

                .header h1 {
                    font-size: 2.5em;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .header p {
                    font-size: 1.1em;
                    opacity: 0.9;
                }

                .functions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .function-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                    transition: transform 0.3s, box-shadow 0.3s;
                    cursor: pointer;
                }

                .function-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
                }

                .function-card.selected {
                    border: 3px solid #667eea;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .function-title {
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 10px;
                    font-size: 0.9em;
                }

                .function-math {
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    margin: 15px 0;
                }

                .function-vars {
                    font-size: 0.85em;
                    color: #666;
                    margin-top: 10px;
                }

                .analyze-button {
                    width: 100%;
                    padding: 10px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1em;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-top: 10px;
                }

                .analyze-button:hover {
                    background: #5568d3;
                }

                .analyze-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .point-input-section {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                    margin-bottom: 30px;
                }

                .point-input-section h3 {
                    color: #667eea;
                    margin-bottom: 15px;
                }

                .point-input-section input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1em;
                    margin-bottom: 10px;
                }

                .point-input-section input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .result-section {
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                }

                .result-box {
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .result-box.continuous {
                    background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
                    border-left: 5px solid #4caf50;
                }

                .result-box.discontinuous {
                    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
                    border-left: 5px solid #ff9800;
                }

                .result-title {
                    font-size: 1.4em;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                }

                .result-text {
                    font-size: 1.1em;
                    line-height: 1.6;
                    color: #555;
                }

                .steps-container {
                    margin-top: 30px;
                }

                .step-item {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    border-left: 4px solid #667eea;
                }

                .step-title {
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 10px;
                    font-size: 1.1em;
                }

                .step-explanation {
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }

                .step-math {
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    margin-top: 10px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    font-size: 1.2em;
                    color: #667eea;
                }

                @media (max-width: 768px) {
                    .functions-grid {
                        grid-template-columns: 1fr;
                    }

                    .header h1 {
                        font-size: 2em;
                    }
                }
            `}</style>

            <div className="header">
                <h1>🔍 Continuity Finder</h1>
                <p>Analyze the continuity of multivariable functions (Exercises 31-40)</p>
            </div>

            <div className="functions-grid">
                {functions.map((func) => (
                    <div
                        key={func.id}
                        className={`function-card ${selectedFunction?.id === func.id ? 'selected' : ''}`}
                        onClick={() => setSelectedFunction(func)}
                    >
                        <div className="function-title">{func.desc}</div>
                        <div className="function-math" id={`func-${func.id}`}></div>
                        <div className="function-vars">
                            Variables: {func.vars.join(', ')}
                        </div>
                        <button
                            className="analyze-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                analyzeContinuity(func, selectedPoint);
                            }}
                            disabled={loading}
                        >
                            {loading && selectedFunction?.id === func.id ? 'Analyzing...' : 'Analyze Continuity'}
                        </button>
                    </div>
                ))}
            </div>

            {selectedFunction && (
                <div className="point-input-section">
                    <h3>Optional: Test at a specific point</h3>
                    <input
                        type="text"
                        placeholder={`Enter point (e.g., ${selectedFunction.vars.map((v, i) => `${v}=0`).join(', ')})`}
                        value={selectedPoint}
                        onChange={(e) => setSelectedPoint(e.target.value)}
                    />
                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                        Leave empty for general continuity analysis
                    </p>
                </div>
            )}

            {continuityResult && (
                <div className="result-section">
                    <div className={`result-box ${continuityResult.isContinuous ? 'continuous' : 'discontinuous'}`}>
                        <div className="result-title">
                            {continuityResult.isContinuous ? '✓ Continuous' : '⚠ Not Continuous Everywhere'}
                        </div>
                        <div className="result-text">
                            {continuityResult.conclusion}
                        </div>
                    </div>

                    <div className="steps-container">
                        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>📝 Detailed Analysis</h2>
                        {steps.map((step, index) => (
                            <div key={index} className="step-item">
                                <div className="step-title">{step.title}</div>
                                <div className="step-explanation">{step.explanation}</div>
                                {step.math && (
                                    <div className="step-math" id={`step-math-${index}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading">
                    <div>⏳ Analyzing continuity...</div>
                </div>
            )}
        </div>
    );
};

export default ContinuityFinder;