 (function () {
      const expressionEl = document.getElementById('expression');
      const resultEl = document.getElementById('result');
      const buttons = Array.from(document.querySelectorAll('button.key'));
      let expression = '';
      let lastResult = null;
      let justEvaluated = false;

      function isOperator(char) {
        return ['+', '-', '*', '/', '%'].includes(char);
      }

      function sanitizeExpression(exp) {
        // Only digits, operators, decimal point, parentheses
        return exp.replace(/[^0-9+\-*/%.()]/g, '');
      }

      function formatResult(value) {
        if (!isFinite(value)) return 'Error';
        const num = Number(value);
        if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
          return num.toExponential(6).replace(/\.?0+e/, 'e');
        }
        const str = num.toFixed(8).replace(/\.?0+$/, '');
        return str;
      }

      function updateDisplay(previewOnly = false) {
        expressionEl.textContent = expression;
        if (!expression) {
          resultEl.textContent = '0';
          return;
        }

        const safe = sanitizeExpression(expression);
        try {
          const maybeOpEnd = isOperator(safe[safe.length - 1]);
          const evalExp = maybeOpEnd ? safe.slice(0, -1) : safe;
          if (!evalExp.trim()) {
            resultEl.textContent = '0';
            return;
          }
          const value = Function('"use strict";return (' + evalExp + ')')();
          if (value === undefined || value === null || Number.isNaN(value)) return;
          if (!previewOnly) lastResult = value;
          resultEl.textContent = formatResult(value);
        } catch (e) {
          // For invalid intermediate expressions, keep previous preview
        }
      }

      function clearAll() {
        expression = '';
        lastResult = null;
        justEvaluated = false;
        updateDisplay();
      }

      function handleInput(input) {
        if (input === 'clear') {
          clearAll();
          return;
        }
        if (input === 'backspace') {
          if (justEvaluated) {
            clearAll();
            return;
          }
          expression = expression.slice(0, -1);
          updateDisplay(true);
          return;
        }
        if (input === '=') {
          if (!expression) return;
          const safe = sanitizeExpression(expression);
          try {
            const trimmed = isOperator(safe[safe.length - 1]) ? safe.slice(0, -1) : safe;
            if (!trimmed.trim()) return;
            const value = Function('"use strict";return (' + trimmed + ')')();
            if (!isFinite(value)) {
              resultEl.textContent = 'Error';
              justEvaluated = true;
              return;
            }
            lastResult = value;
            expression = formatResult(value);
            resultEl.textContent = expression;
            justEvaluated = true;
          } catch {
            resultEl.textContent = 'Error';
            justEvaluated = true;
          }
          return;
        }

        if (typeof input === 'string') {
          // Starting new expression after evaluation
          if (justEvaluated && !isOperator(input) && input !== '%') {
            expression = '';
            justEvaluated = false;
          }

          const lastChar = expression.slice(-1);

          if (isOperator(input)) {
            justEvaluated = false;
            if (!expression && lastResult !== null) {
              // start from last result if user presses operator after equals
              expression = String(lastResult);
            } else if (!expression) {
              // ignore leading operator (except minus for negative numbers)
              if (input !== '-') return;
            }
            if (isOperator(lastChar)) {
              // replace operator
              expression = expression.slice(0, -1) + input;
            } else {
              expression += input;
            }
            updateDisplay(true);
            return;
          }

          if (input === '.') {
            // prevent multiple decimals in the current number token
            const parts = expression.split(/[\+\-\*\/%]/);
            const current = parts[parts.length - 1];
            if (current.includes('.')) return;
            expression += input;
            justEvaluated = false;
            updateDisplay(true);
            return;
          }

          // Number
          if (/\d/.test(input)) {
            expression += input;
            justEvaluated = false;
            updateDisplay(true);
            return;
          }
        }
      }

      function findButtonByKey(key) {
        return buttons.find(btn => btn.dataset.key === key);
      }

      function flashButton(btn) {
        if (!btn) return;
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 120);
      }

      // Button click handlers
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const key = button.dataset.key;
          handleInput(key);
          flashButton(button);
        });
      });

      // Keyboard support
      window.addEventListener('keydown', (e) => {
        const { key } = e;

        if (key === 'Escape') {
          e.preventDefault();
          handleInput('clear');
          flashButton(findButtonByKey('clear'));
          return;
        }

        if (key === 'Backspace') {
          e.preventDefault();
          handleInput('backspace');
          flashButton(findButtonByKey('backspace'));
          return;
        }

        if (key === 'Enter' || key === '=') {
          e.preventDefault();
          handleInput('=');
          flashButton(findButtonByKey('='));
          return;
        }

        if (/^[0-9]$/.test(key)) {
          handleInput(key);
          flashButton(findButtonByKey(key));
          return;
        }

        if (['+', '-', '*', '/', '%', '.'].includes(key)) {
          handleInput(key);
          flashButton(findButtonByKey(key));
          return;
        }
      });

      // Initial display
      updateDisplay();
    })();