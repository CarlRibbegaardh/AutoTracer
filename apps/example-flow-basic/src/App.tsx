import { useCallback, useState } from "react";
import "./App.css";

/**
 * Basic math operations to demonstrate flow tracing.
 * All functions will be automatically instrumented.
 */

function add(a: number, b: number): number {
  return a + b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

/**
 * Nested function calls to show call stack tracking.
 */
function calculateTotal(prices: number[]): number {
  const sum = prices.reduce((acc, price) => add(acc, price), 0);
  return sum;
}

function calculateAverage(prices: number[]): number {
  const total = calculateTotal(prices);
  const count = prices.length;
  return divide(total, count);
}

/**
 * Function with error handling.
 */
function safeDivide(a: number, b: number): number | string {
  try {
    return divide(a, b);
  } catch (error) {
    return "Error: Cannot divide by zero";
  }
}

/**
 * Async function to demonstrate async tracing.
 */
async function fetchData(delay: number): Promise<string> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, delay));
  const result = multiply(2, 3);
  return `Fetched after ${delay}ms: ${result}`;
}

function App({ hello }: { hello: string }) {
  const [result, setResult] = useState<string>(hello);

  console.log("Hey!");

  function subtract(a: number, b: number): number {
    return a - b;
  }

  function handleAdd() {
    const value = add(5, 3);
    setResult(`add(5, 3) = ${value}`);
  }

  function handleSubtract() {
    const value = subtract(10, 4);
    setResult(`subtract(10, 4) = ${value}`);
  }

  const handleMultiply = () => {
    const value = multiply(6, 7);
    setResult(`multiply(6, 7) = ${value}`);
  };

  const handleDivide = useCallback(() => {
    const value = divide(20, 4);
    setResult(`divide(20, 4) = ${value}`);
  }, []);

  function handleNested() {
    const prices = [10.5, 20.0, 15.75, 30.25];
    const avg = calculateAverage(prices);
    setResult(`calculateAverage([${prices.join(", ")}]) = ${avg.toFixed(2)}`);
  }

  function handleError() {
    const value = safeDivide(10, 0);
    setResult(`safeDivide(10, 0) = ${value}`);
  }

  async function handleAsync() {
    setResult("Fetching...");
    const data = await fetchData(500);
    setResult(data);
  }

  return (
    <div className="app">
      <h1>Flow Tracing - Basic Example</h1>

      <div className="instructions">
        <p>
          <strong>📊 Open Browser Console</strong> to see function flow traces
        </p>
        <p>
          Each function call shows: <code>→ enter</code>, <code>← exit</code>,
          and <code>💥 exceptions</code>
        </p>
      </div>

      <div className="section">
        <h2>Simple Operations</h2>
        <div className="button-group">
          <button onClick={handleAdd}>Add</button>
          <button onClick={handleSubtract}>Subtract</button>
          <button onClick={handleMultiply}>Multiply</button>
          <button onClick={handleDivide}>Divide</button>
        </div>
      </div>

      <div className="section">
        <h2>Nested Calls</h2>
        <p>Watch the call stack build up in the console</p>
        <div className="button-group">
          <button onClick={handleNested}>Calculate Average</button>
        </div>
      </div>

      <div className="section">
        <h2>Error Handling</h2>
        <p>See how exceptions are logged and caught</p>
        <div className="button-group">
          <button onClick={handleError}>Divide by Zero</button>
        </div>
      </div>

      <div className="section">
        <h2>Async Operations</h2>
        <p>Watch async function traces (flat logging, no broken nesting)</p>
        <div className="button-group">
          <button onClick={handleAsync}>Fetch Data</button>
        </div>
      </div>

      {result && (
        <div className="result">
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  );
}

export default App;
