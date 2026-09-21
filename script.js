/**
 * Matrix Operation System - Web Dashboard JavaScript
 * Object-Oriented Client-Side Implementation
 */

// =============================================================================
// 1. Matrix Class Definition (OOP Core)
// =============================================================================
class Matrix {
  constructor(rows, cols, initialData = null) {
    this.rows = Math.max(0, parseInt(rows, 10));
    this.cols = Math.max(0, parseInt(cols, 10));
    
    if (initialData && Array.isArray(initialData)) {
      this.data = initialData.map(row => [...row]);
    } else {
      this.data = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }
  }

  getRows() {
    return this.rows;
  }

  getCols() {
    return this.cols;
  }

  getElement(r, c) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      return this.data[r][c];
    }
    throw new Error(`Index out of bounds: [${r}][${c}]`);
  }

  setElement(r, c, val) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.data[r][c] = Number(val);
    } else {
      throw new Error(`Index out of bounds: [${r}][${c}]`);
    }
  }

  canAdd(other) {
    return (
      other instanceof Matrix &&
      this.rows === other.rows &&
      this.cols === other.cols &&
      this.rows > 0 &&
      this.cols > 0
    );
  }

  canMultiply(other) {
    return (
      other instanceof Matrix &&
      this.cols === other.rows &&
      this.rows > 0 &&
      this.cols > 0 &&
      other.cols > 0
    );
  }

  add(other) {
    if (!this.canAdd(other)) {
      throw new Error("Dimension Error: Matrix addition requires identical dimensions.");
    }
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + other.data[i][j];
      }
    }
    return result;
  }

  subtract(other) {
    if (!this.canAdd(other)) {
      throw new Error("Dimension Error: Matrix subtraction requires identical dimensions.");
    }
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] - other.data[i][j];
      }
    }
    return result;
  }

  multiply(other) {
    if (!this.canMultiply(other)) {
      throw new Error(
        `Dimension Error: Columns of Matrix A (${this.cols}) must match Rows of Matrix B (${other.rows}).`
      );
    }
    const result = new Matrix(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  transpose() {
    const result = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }
}

// =============================================================================
// 2. Web Application UI Controller
// =============================================================================
const MatrixApp = {
  currentOp: "add", // 'add', 'sub', 'mul', 'trans'

  opConfigs: {
    add: {
      title: "Matrix Addition",
      desc: "Computes element-wise sum of two matrices. Both matrices must have identical dimensions ($r_A = r_B$ and $c_A = c_B$).",
      rule: "Dim(A) == Dim(B)",
      symbol: "+",
      badge: "Result = A + B",
      isBinary: true
    },
    sub: {
      title: "Matrix Subtraction",
      desc: "Computes element-wise difference of two matrices ($A - B$). Both matrices must have identical dimensions ($r_A = r_B$ and $c_A = c_B$).",
      rule: "Dim(A) == Dim(B)",
      symbol: "−",
      badge: "Result = A − B",
      isBinary: true
    },
    mul: {
      title: "Matrix Multiplication",
      desc: "Computes matrix product via row-by-column dot product ($A \\times B$). Requires columns of A to equal rows of B ($c_A = r_B$).",
      rule: "Cols(A) == Rows(B)",
      symbol: "×",
      badge: "Result = A × B",
      isBinary: true
    },
    trans: {
      title: "Matrix Transpose",
      desc: "Interchanges the rows and columns of Matrix A ($A^T$). Converts an ($r \\times c$) matrix into a ($c \\times r$) matrix.",
      rule: "Dimension Inversion (r × c → c × r)",
      symbol: "Aᵀ",
      badge: "Result = Aᵀ",
      isBinary: false
    }
  },

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.setOperation("add");
  },

  cacheDOM() {
    // Tabs
    this.tabButtons = document.querySelectorAll(".tab-btn");
    
    // Operation Info
    this.opTitle = document.getElementById("op-title");
    this.opDescription = document.getElementById("op-description");
    this.ruleText = document.getElementById("rule-text");
    this.displayOpSymbol = document.getElementById("display-op-symbol");

    // Dimension Inputs
    this.rowsAInput = document.getElementById("rows-a");
    this.colsAInput = document.getElementById("cols-a");
    this.rowsBInput = document.getElementById("rows-b");
    this.colsBInput = document.getElementById("cols-b");
    this.dimBoxB = document.getElementById("dim-box-b");

    // Dimension Tags
    this.tagDimA = document.getElementById("tag-dim-a");
    this.tagDimB = document.getElementById("tag-dim-b");

    // Containers
    this.gridA = document.getElementById("grid-a");
    this.gridB = document.getElementById("grid-b");
    this.cardB = document.getElementById("card-matrix-b");
    this.operatorDivider = document.getElementById("operator-divider");
    this.workspaceGrid = document.getElementById("workspace-grid");

    // Action Buttons
    this.btnCalculate = document.getElementById("btn-calculate");
    this.btnFillAll = document.getElementById("btn-fill-all");
    this.btnReset = document.getElementById("btn-reset");
    this.btnSampleA = document.getElementById("btn-sample-a");
    this.btnClearA = document.getElementById("btn-clear-a");
    this.btnSampleB = document.getElementById("btn-sample-b");
    this.btnClearB = document.getElementById("btn-clear-b");

    // Presets
    this.preset2x2 = document.getElementById("preset-2x2");
    this.preset3x3 = document.getElementById("preset-3x3");
    this.preset2x3 = document.getElementById("preset-2x3-3x2");

    // Alert & Result
    this.alertContainer = document.getElementById("alert-container");
    this.alertTitle = document.getElementById("alert-title");
    this.alertMessage = document.getElementById("alert-message");
    this.btnCloseAlert = document.getElementById("btn-close-alert");

    this.resultSection = document.getElementById("result-section");
    this.gridResult = document.getElementById("grid-result");
    this.tagResultDim = document.getElementById("tag-result-dim");
    this.resultOpBadge = document.getElementById("result-op-badge");
    this.resultSummaryText = document.getElementById("result-summary-text");
  },

  bindEvents() {
    // Tab switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const op = btn.getAttribute("data-op");
        this.setOperation(op);
      });
    });

    // Dimension change listeners
    const handleDimChange = () => {
      this.sanitizeDimensions();
      this.renderGrids();
      this.hideResult();
      this.hideAlert();
    };

    this.rowsAInput.addEventListener("input", handleDimChange);
    this.colsAInput.addEventListener("input", handleDimChange);
    this.rowsBInput.addEventListener("input", handleDimChange);
    this.colsBInput.addEventListener("input", handleDimChange);

    // Presets
    this.preset2x2.addEventListener("click", () => this.applyPreset(2, 2, 2, 2));
    this.preset3x3.addEventListener("click", () => this.applyPreset(3, 3, 3, 3));
    this.preset2x3.addEventListener("click", () => this.applyPreset(2, 3, 3, 2));

    // Card Tools
    this.btnSampleA.addEventListener("click", () => this.fillSample("A"));
    this.btnClearA.addEventListener("click", () => this.clearGrid("A"));
    this.btnSampleB.addEventListener("click", () => this.fillSample("B"));
    this.btnClearB.addEventListener("click", () => this.clearGrid("B"));

    // Global Actions
    this.btnCalculate.addEventListener("click", () => this.calculate());
    this.btnFillAll.addEventListener("click", () => this.fillAllSamples());
    this.btnReset.addEventListener("click", () => this.resetAll());
    this.btnCloseAlert.addEventListener("click", () => this.hideAlert());
  },

  setOperation(op) {
    this.currentOp = op;
    const config = this.opConfigs[op];

    // Update active tab styling
    this.tabButtons.forEach(btn => {
      if (btn.getAttribute("data-op") === op) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update info banner
    this.opTitle.textContent = config.title;
    this.opDescription.textContent = config.desc;
    this.ruleText.textContent = config.rule;
    this.displayOpSymbol.textContent = config.symbol;
    this.resultOpBadge.textContent = config.badge;

    // Toggle Matrix B visibility for Unary operations (Transpose)
    if (config.isBinary) {
      this.cardB.style.display = "flex";
      this.dimBoxB.style.display = "block";
      this.operatorDivider.style.display = "flex";
      this.workspaceGrid.classList.remove("single-matrix");
    } else {
      this.cardB.style.display = "none";
      this.dimBoxB.style.display = "none";
      this.operatorDivider.style.display = "none";
      this.workspaceGrid.classList.add("single-matrix");
    }

    // Adapt default dimensions if switching to addition/subtraction to be user friendly
    if ((op === "add" || op === "sub") && 
        (this.rowsAInput.value !== this.rowsBInput.value || this.colsAInput.value !== this.colsBInput.value)) {
      this.rowsBInput.value = this.rowsAInput.value;
      this.colsBInput.value = this.colsAInput.value;
    } else if (op === "mul" && this.colsAInput.value !== this.rowsBInput.value) {
      this.rowsBInput.value = this.colsAInput.value;
    }

    this.renderGrids();
    this.hideResult();
    this.hideAlert();
  },

  sanitizeDimensions() {
    const clamp = (val) => Math.min(6, Math.max(1, parseInt(val, 10) || 1));
    this.rowsAInput.value = clamp(this.rowsAInput.value);
    this.colsAInput.value = clamp(this.colsAInput.value);
    this.rowsBInput.value = clamp(this.rowsBInput.value);
    this.colsBInput.value = clamp(this.colsBInput.value);
  },

  applyPreset(rA, cA, rB, cB) {
    this.rowsAInput.value = rA;
    this.colsAInput.value = cA;
    this.rowsBInput.value = rB;
    this.colsBInput.value = cB;
    this.renderGrids();
    this.hideResult();
    this.hideAlert();
  },

  renderGrids() {
    const rA = parseInt(this.rowsAInput.value, 10);
    const cA = parseInt(this.colsAInput.value, 10);
    const rB = parseInt(this.rowsBInput.value, 10);
    const cB = parseInt(this.colsBInput.value, 10);

    // Update dimension badges
    this.tagDimA.textContent = `(${rA} × ${cA})`;
    this.tagDimB.textContent = `(${rB} × ${cB})`;

    // Render Matrix A
    this.buildGridDOM(this.gridA, "A", rA, cA);

    // Render Matrix B (if binary op)
    if (this.opConfigs[this.currentOp].isBinary) {
      this.buildGridDOM(this.gridB, "B", rB, cB);
    }
  },

  buildGridDOM(container, matrixLabel, rows, cols) {
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    container.style.gridTemplateRows = `repeat(${rows}, auto)`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "any";
        input.className = "matrix-cell-input";
        input.id = `cell_${matrixLabel}_${i}_${j}`;
        input.placeholder = "0";
        input.value = "0";
        input.setAttribute("aria-label", `Matrix ${matrixLabel} element row ${i + 1} column ${j + 1}`);
        container.appendChild(input);
      }
    }
  },

  extractMatrix(matrixLabel, rows, cols) {
    const matrix = new Matrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const el = document.getElementById(`cell_${matrixLabel}_${i}_${j}`);
        const val = el && el.value !== "" ? parseFloat(el.value) : 0;
        matrix.setElement(i, j, isNaN(val) ? 0 : val);
      }
    }
    return matrix;
  },

  fillSample(target) {
    if (target === "A") {
      const r = parseInt(this.rowsAInput.value, 10);
      const c = parseInt(this.colsAInput.value, 10);
      let count = 1;
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          const el = document.getElementById(`cell_A_${i}_${j}`);
          if (el) el.value = count++;
        }
      }
    } else if (target === "B") {
      const r = parseInt(this.rowsBInput.value, 10);
      const c = parseInt(this.colsBInput.value, 10);
      let val = 5;
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          const el = document.getElementById(`cell_B_${i}_${j}`);
          if (el) el.value = val++;
        }
      }
    }
  },

  clearGrid(target) {
    const prefix = target === "A" ? "A" : "B";
    const r = parseInt(target === "A" ? this.rowsAInput.value : this.rowsBInput.value, 10);
    const c = parseInt(target === "A" ? this.colsAInput.value : this.colsBInput.value, 10);
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        const el = document.getElementById(`cell_${prefix}_${i}_${j}`);
        if (el) el.value = "0";
      }
    }
  },

  fillAllSamples() {
    this.fillSample("A");
    if (this.opConfigs[this.currentOp].isBinary) {
      this.fillSample("B");
    }
  },

  resetAll() {
    this.rowsAInput.value = 2;
    this.colsAInput.value = 2;
    this.rowsBInput.value = 2;
    this.colsBInput.value = 2;
    this.renderGrids();
    this.hideResult();
    this.hideAlert();
  },

  calculate() {
    this.hideAlert();
    const rA = parseInt(this.rowsAInput.value, 10);
    const cA = parseInt(this.colsAInput.value, 10);
    const rB = parseInt(this.rowsBInput.value, 10);
    const cB = parseInt(this.colsBInput.value, 10);

    // Dimension Validations
    if (this.currentOp === "add" || this.currentOp === "sub") {
      if (rA !== rB || cA !== cB) {
        const opWord = this.currentOp === "add" ? "addition" : "subtraction";
        this.showAlert(
          "Incompatible Dimensions for " + (this.currentOp === "add" ? "Addition" : "Subtraction") + "!",
          `Matrix ${opWord} requires both matrices to have identical dimensions. Matrix A is (${rA} × ${cA}) while Matrix B is (${rB} × ${cB}).`
        );
        this.hideResult();
        return;
      }
    } else if (this.currentOp === "mul") {
      if (cA !== rB) {
        this.showAlert(
          "Incompatible Dimensions for Multiplication!",
          `Matrix multiplication requires Columns of Matrix A (${cA}) to match Rows of Matrix B (${rB}). Cannot multiply (${rA} × ${cA}) by (${rB} × ${cB}).`
        );
        this.hideResult();
        return;
      }
    }

    try {
      const matA = this.extractMatrix("A", rA, cA);
      let resultMatrix;

      switch (this.currentOp) {
        case "add": {
          const matB = this.extractMatrix("B", rB, cB);
          resultMatrix = matA.add(matB);
          this.resultSummaryText.textContent = `Calculated sum of Matrix A (${rA}×${cA}) and Matrix B (${rB}×${cB}).`;
          break;
        }
        case "sub": {
          const matB = this.extractMatrix("B", rB, cB);
          resultMatrix = matA.subtract(matB);
          this.resultSummaryText.textContent = `Calculated difference of Matrix A (${rA}×${cA}) minus Matrix B (${rB}×${cB}).`;
          break;
        }
        case "mul": {
          const matB = this.extractMatrix("B", rB, cB);
          resultMatrix = matA.multiply(matB);
          this.resultSummaryText.textContent = `Calculated dot product of Matrix A (${rA}×${cA}) and Matrix B (${rB}×${cB}) resulting in a (${rA}×${cB}) matrix.`;
          break;
        }
        case "trans": {
          resultMatrix = matA.transpose();
          this.resultSummaryText.textContent = `Inverted Matrix A from (${rA}×${cA}) into transposed Matrix Aᵀ (${cA}×${rA}).`;
          break;
        }
      }

      this.displayResult(resultMatrix);
    } catch (err) {
      this.showAlert("Execution Error", err.message);
      this.hideResult();
    }
  },

  displayResult(resultMatrix) {
    const rows = resultMatrix.getRows();
    const cols = resultMatrix.getCols();

    this.tagResultDim.textContent = `(${rows} × ${cols})`;
    this.gridResult.innerHTML = "";
    this.gridResult.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    this.gridResult.style.gridTemplateRows = `repeat(${rows}, auto)`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = resultMatrix.getElement(i, j);
        const cell = document.createElement("div");
        cell.className = "result-cell";
        // Format to up to 2 decimals if not whole
        cell.textContent = Number.isInteger(val) ? val.toString() : val.toFixed(2);
        this.gridResult.appendChild(cell);
      }
    }

    this.resultSection.style.display = "block";
    this.resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  hideResult() {
    this.resultSection.style.display = "none";
  },

  showAlert(title, message) {
    this.alertTitle.textContent = title;
    this.alertMessage.textContent = message;
    this.alertContainer.style.display = "block";
  },

  hideAlert() {
    this.alertContainer.style.display = "none";
  }
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  MatrixApp.init();
});
