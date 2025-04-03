// Carpenter's Calculator
document.addEventListener('DOMContentLoaded', function() {
    let sawdustEnabled = true;
    const toggleSawdustBtn = document.getElementById('toggleSawdust');

    // Sawdust toggle functionality
    toggleSawdustBtn.addEventListener('click', function() {
        sawdustEnabled = !sawdustEnabled;
        this.innerHTML = `<i class="bi bi-snow"></i> Saw Effect: ${sawdustEnabled ? 'ON' : 'OFF'}`;
        this.classList.toggle('btn-outline-light', sawdustEnabled);
        this.classList.toggle('btn-light', !sawdustEnabled);
    });

    // Add saw blade effect
    document.addEventListener('mousemove', function(e) {
        if (!sawdustEnabled) return;

        const sawBlade = document.createElement('div');
        sawBlade.className = 'sawdust';
        
        // Random size between 1x and 2x base size
        const baseSize = 5.5;
        const randomScale = 1 + Math.random();
        const size = baseSize * randomScale;
        
        sawBlade.style.width = size + 'px';
        sawBlade.style.height = size + 'px';
        sawBlade.style.left = (e.pageX - size/2) + 'px';
        sawBlade.style.top = (e.pageY - size/2) + 'px';
        document.body.appendChild(sawBlade);

        // Random initial rotation and spinning speed
        const rotation = Math.random() * 360;
        const spinSpeed = 20 + Math.random() * 40; // Random speed between 20 and 60 degrees per frame
        sawBlade.style.transform = `rotate(${rotation}deg) scale(${randomScale})`;

        // Spin animation
        let currentRotation = rotation;
        const spinInterval = setInterval(() => {
            currentRotation += spinSpeed;
            sawBlade.style.transform = `rotate(${currentRotation}deg) scale(${randomScale})`;
        }, 30);

        // Cleanup with longer duration for larger blades
        const duration = 800 + (randomScale * 400);
        setTimeout(() => {
            clearInterval(spinInterval);
            sawBlade.style.opacity = '0';
            setTimeout(() => sawBlade.remove(), 2000);
        }, duration);
    });

    const feetInput = document.getElementById('feet');
    const inchesInput = document.getElementById('inches');
    const fractionInput = document.getElementById('fraction');
    const totalInput = document.getElementById('total');

    function updateTotal() {
        const feet = parseFloat(feetInput.value) || 0;
        const inches = parseFloat(inchesInput.value) || 0;
        const fraction = parseFloat(fractionInput.value) || 0;
        const total = (feet * 12) + inches + fraction;
        totalInput.value = total.toFixed(3);
    }

    [feetInput, inchesInput, fractionInput].forEach(input => {
        input.addEventListener('input', updateTotal);
    });

    // Cut List Management
    const cutList = [];
    const addPieceBtn = document.getElementById('addPiece');
    const cutListTable = document.getElementById('cutList').getElementsByTagName('tbody')[0];
    const optimizeBtn = document.getElementById('optimize');
    const exportPdfBtn = document.getElementById('exportPdf');
    const canvas = document.getElementById('layoutCanvas');
    const ctx = canvas.getContext('2d');

    // Sheet navigation controls
    const prevSheetBtn = document.getElementById('prevSheet');
    const nextSheetBtn = document.getElementById('nextSheet');
    const sheetIndicator = document.getElementById('sheetIndicator');
    let currentSheetIndex = 0;
    let sheetLayouts = [];

    function addPiece() {
        const piece = {
            width: 0,
            length: 0,
            quantity: 1
        };
        cutList.push(piece);
        updateCutListTable();
    }

    function updateCutListTable() {
        cutListTable.innerHTML = '';
        cutList.forEach((piece, index) => {
            const row = cutListTable.insertRow();
            row.innerHTML = `
                <td><input type="number" class="form-control" value="${piece.width}" onchange="updatePiece(${index}, 'width', this.value)"></td>
                <td><input type="number" class="form-control" value="${piece.length}" onchange="updatePiece(${index}, 'length', this.value)"></td>
                <td><input type="number" class="form-control" value="${piece.quantity}" onchange="updatePiece(${index}, 'quantity', this.value)"></td>
                <td><button class="btn btn-sm btn-danger" onclick="removePiece(${index})">Remove</button></td>
            `;
        });
    }

    window.updatePiece = function(index, property, value) {
        cutList[index][property] = parseFloat(value) || 0;
    };

    window.removePiece = function(index) {
        cutList.splice(index, 1);
        updateCutListTable();
    };

    function drawSheet(layout) {
        // Reset canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const scale = Math.min(canvas.width / layout.sheetWidth, canvas.height / layout.sheetLength);

        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw sheet outline
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, layout.sheetWidth * scale, layout.sheetLength * scale);

        // Draw pieces
        layout.pieces.forEach(piece => {
            ctx.fillStyle = piece.color;
            ctx.fillRect(
                piece.x * scale,
                piece.y * scale,
                piece.width * scale,
                piece.length * scale
            );
            ctx.strokeRect(
                piece.x * scale,
                piece.y * scale,
                piece.width * scale,
                piece.length * scale
            );

            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(
                `${piece.width}"×${piece.length}"`,
                (piece.x + 2) * scale,
                (piece.y + piece.length/2) * scale
            );
        });
    }

    function optimizeCuts() {
        const sheetWidth = parseFloat(document.getElementById('sheetWidth').value) || 48;
        const sheetLength = parseFloat(document.getElementById('sheetLength').value) || 96;
        const sheetCount = parseInt(document.getElementById('sheetCount').value) || 1;
        const kerf = parseFloat(document.getElementById('kerf').value) || 0.125;

        // Reset layouts
        sheetLayouts = [];
        let remainingPieces = [];

        // Create a flat list of all pieces
        cutList.forEach(piece => {
            for (let i = 0; i < piece.quantity; i++) {
                remainingPieces.push({
                    width: piece.width,
                    length: piece.length,
                    color: `hsl(${Math.random() * 360}, 70%, 80%)`
                });
            }
        });

        // Create layouts for each sheet
        for (let sheetIndex = 0; sheetIndex < sheetCount && remainingPieces.length > 0; sheetIndex++) {
            const layout = {
                sheetWidth,
                sheetLength,
                pieces: [],
                unusedArea: sheetWidth * sheetLength
            };

            let currentX = 0;
            let currentY = 0;
            let maxHeightInRow = 0;
            let piecesForThisSheet = [...remainingPieces];
            remainingPieces = [];

            piecesForThisSheet.forEach(piece => {
                if (currentX + piece.width > sheetWidth) {
                    currentX = 0;
                    currentY += maxHeightInRow + kerf;
                    maxHeightInRow = 0;
                }

                if (currentY + piece.length <= sheetLength) {
                    piece.x = currentX;
                    piece.y = currentY;
                    layout.pieces.push(piece);
                    layout.unusedArea -= piece.width * piece.length;
                    
                    currentX += piece.width + kerf;
                    maxHeightInRow = Math.max(maxHeightInRow, piece.length);
                } else {
                    remainingPieces.push(piece);
                }
            });

            sheetLayouts.push(layout);
        }

        // Update navigation controls
        currentSheetIndex = 0;
        updateSheetNavigation();
        
        // Show warning if not all pieces fit
        if (remainingPieces.length > 0) {
            alert(`Warning: ${remainingPieces.length} pieces did not fit on the available sheets.`);
        }
    }

    function updateSheetNavigation() {
        const totalSheets = sheetLayouts.length;
        sheetIndicator.textContent = `Sheet ${currentSheetIndex + 1} of ${totalSheets}`;
        
        prevSheetBtn.disabled = currentSheetIndex === 0;
        nextSheetBtn.disabled = currentSheetIndex >= totalSheets - 1;
        sheetIndicator.disabled = totalSheets <= 1;

        if (totalSheets > 0) {
            drawSheet(sheetLayouts[currentSheetIndex]);
        }
    }

    async function exportToPdf() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'letter');
        const margin = 40;
        let yOffset = margin;

        // Add title
        pdf.setFontSize(20);
        pdf.text('Cutting Layout Report', margin, yOffset);
        yOffset += 30;

        // Add project details
        pdf.setFontSize(12);
        const sheetWidth = parseFloat(document.getElementById('sheetWidth').value) || 48;
        const sheetLength = parseFloat(document.getElementById('sheetLength').value) || 96;
        const sheetCount = parseInt(document.getElementById('sheetCount').value) || 1;
        const kerf = parseFloat(document.getElementById('kerf').value) || 0.125;

        pdf.text(`Sheet Size: ${sheetWidth}" × ${sheetLength}"`, margin, yOffset);
        yOffset += 20;
        pdf.text(`Number of Sheets: ${sheetCount}`, margin, yOffset);
        yOffset += 20;
        pdf.text(`Blade Kerf: ${kerf}"`, margin, yOffset);
        yOffset += 30;

        // Add cut list
        pdf.setFontSize(14);
        pdf.text('Cut List:', margin, yOffset);
        yOffset += 20;

        pdf.setFontSize(12);
        cutList.forEach((piece, index) => {
            pdf.text(`${index + 1}. ${piece.width}" × ${piece.length}" (Quantity: ${piece.quantity})`, margin + 10, yOffset);
            yOffset += 15;
        });
        yOffset += 20;

        // Add each sheet's layout
        sheetLayouts.forEach((layout, index) => {
            // Add page break if needed
            if (yOffset > pdf.internal.pageSize.height - 200) {
                pdf.addPage();
                yOffset = margin;
            }

            pdf.setFontSize(14);
            pdf.text(`Sheet ${index + 1} Layout:`, margin, yOffset);
            yOffset += 20;

            // Draw current sheet
            drawSheet(layout);
            
            // Convert canvas to image and add to PDF
            const canvasImage = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.width - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(canvasImage, 'PNG', margin, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 40;

            // Add usage statistics
            const usedArea = layout.sheetWidth * layout.sheetLength - layout.unusedArea;
            const efficiency = ((usedArea / (layout.sheetWidth * layout.sheetLength)) * 100).toFixed(1);
            pdf.setFontSize(12);
            pdf.text(`Sheet ${index + 1} Efficiency: ${efficiency}%`, margin, yOffset);
            yOffset += 30;
        });

        // Save the PDF
        pdf.save('cutting-layout.pdf');

        // Restore the current sheet view
        drawSheet(sheetLayouts[currentSheetIndex]);
    }

    // Event Listeners
    addPieceBtn.addEventListener('click', addPiece);
    optimizeBtn.addEventListener('click', optimizeCuts);
    exportPdfBtn.addEventListener('click', exportToPdf);
    prevSheetBtn.addEventListener('click', () => {
        if (currentSheetIndex > 0) {
            currentSheetIndex--;
            updateSheetNavigation();
        }
    });
    nextSheetBtn.addEventListener('click', () => {
        if (currentSheetIndex < sheetLayouts.length - 1) {
            currentSheetIndex++;
            updateSheetNavigation();
        }
    });

    // Add initial piece
    addPiece();
});
