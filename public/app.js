// Global variables
let cutListItems = [];
let cutListCounter = 0;

// Carpenter's Calculator Functions
function convertFraction() {
    const fractionInput = document.getElementById('fraction').value;
    const parts = fractionInput.split('/');
    if (parts.length === 2) {
        const decimal = parseFloat(parts[0]) / parseFloat(parts[1]);
        document.getElementById('decimal-result').textContent = `${decimal.toFixed(3)} inches`;
    }
}

function calculateBoardFeet() {
    const thickness = parseFloat(document.getElementById('thickness').value);
    const width = parseFloat(document.getElementById('width').value);
    const length = parseFloat(document.getElementById('length').value);
    
    if (thickness && width && length) {
        const boardFeet = (thickness * width * length) / 144;
        document.getElementById('boardfeet-result').textContent = `${boardFeet.toFixed(2)} board feet`;
    }
}

// Cut List Functions
function addCutListItem() {
    cutListCounter++;
    const itemHtml = `
        <div class="cut-list-item" id="item-${cutListCounter}">
            <div class="row">
                <div class="col">
                    <input type="number" class="form-control" placeholder="Width (inches)" required>
                </div>
                <div class="col">
                    <input type="number" class="form-control" placeholder="Length (inches)" required>
                </div>
                <div class="col">
                    <input type="number" class="form-control" placeholder="Quantity" value="1" required>
                </div>
                <div class="col">
                    <button class="btn btn-danger" onclick="removeCutListItem(${cutListCounter})">Remove</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('cut-list').insertAdjacentHTML('beforeend', itemHtml);
}

function removeCutListItem(id) {
    document.getElementById(`item-${id}`).remove();
}

function optimizeCuts() {
    const sheetWidth = parseFloat(document.getElementById('sheet-width').value);
    const sheetLength = parseFloat(document.getElementById('sheet-length').value);
    const bladeKerf = parseFloat(document.getElementById('blade-kerf').value) || 0.125;

    if (!sheetWidth || !sheetLength) {
        alert('Please enter sheet dimensions');
        return;
    }

    // Collect all cut list items
    const pieces = [];
    document.querySelectorAll('.cut-list-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        const width = parseFloat(inputs[0].value);
        const length = parseFloat(inputs[1].value);
        const quantity = parseInt(inputs[2].value);

        if (width && length && quantity) {
            // Add kerf to each dimension
            const withKerf = {
                width: width + bladeKerf,
                length: length + bladeKerf,
                originalWidth: width,
                originalLength: length,
                quantity: quantity
            };
            pieces.push(withKerf);
        }
    });

    if (pieces.length === 0) {
        alert('Please add some pieces to cut');
        return;
    }

    // Simple optimization algorithm
    const results = optimizeLayout(pieces, sheetWidth, sheetLength);
    displayResults(results);
}

function optimizeLayout(pieces, sheetWidth, sheetLength) {
    // Simple implementation - can be improved with more sophisticated algorithms
    let sheets = [];
    let currentSheet = { pieces: [], remainingWidth: sheetWidth, remainingLength: sheetLength };
    sheets.push(currentSheet);

    pieces.forEach(piece => {
        for (let i = 0; i < piece.quantity; i++) {
            let placed = false;
            for (let sheet of sheets) {
                if (piece.width <= sheet.remainingWidth && piece.length <= sheet.remainingLength) {
                    sheet.pieces.push({
                        width: piece.originalWidth,
                        length: piece.originalLength,
                        x: sheetWidth - sheet.remainingWidth,
                        y: sheetLength - sheet.remainingLength
                    });
                    sheet.remainingWidth -= piece.width;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                let newSheet = { pieces: [], remainingWidth: sheetWidth, remainingLength: sheetLength };
                newSheet.pieces.push({
                    width: piece.originalWidth,
                    length: piece.originalLength,
                    x: 0,
                    y: 0
                });
                newSheet.remainingWidth = sheetWidth - piece.width;
                sheets.push(newSheet);
            }
        }
    });

    return sheets;
}

function displayResults(sheets) {
    const resultsDiv = document.getElementById('optimization-results');
    resultsDiv.innerHTML = `<h6>Number of sheets needed: ${sheets.length}</h6>`;

    sheets.forEach((sheet, index) => {
        const sheetDiv = document.createElement('div');
        sheetDiv.className = 'optimization-sheet';
        sheetDiv.innerHTML = `<h6>Sheet ${index + 1}</h6>`;
        
        sheet.pieces.forEach(piece => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'cut-piece';
            pieceDiv.textContent = `${piece.width}" × ${piece.length}"`;
            sheetDiv.appendChild(pieceDiv);
        });

        resultsDiv.appendChild(sheetDiv);
    });
}
