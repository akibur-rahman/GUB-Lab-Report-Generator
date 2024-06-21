import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { marked } from "marked";

export const generatePDF = (responses) => {
    const doc = new jsPDF();

    doc.setFont("Times", "normal");
    doc.setFontSize(14);

    let yPos = 30;

    for (const [key, value] of Object.entries(responses)) {
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text(key.toUpperCase(), 20, yPos);
        yPos += 10;

        const tokens = marked.lexer(value.response);

        doc.setFontSize(12);
        doc.setFont("Times", "normal");

        for (const token of tokens) {
            switch (token.type) {
                case 'paragraph':
                    yPos = addParagraph(doc, token.text, yPos);
                    break;
                case 'heading':
                    yPos = addHeading(doc, token.text, token.depth, yPos);
                    break;
                case 'code':
                    yPos = addCodeBlock(doc, token.text, yPos);
                    break;
                case 'list':
                    yPos = addList(doc, token.items, yPos);
                    break;
                case 'table':
                    yPos = addTable(doc, token, yPos);
                    break;
            }

            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        }

        yPos += 10;
    }

    doc.save("lab_report.pdf");
};

function addParagraph(doc, text, y) {
    const parts = text.split(/(\*\*.*?\*\*)/);
    let currentX = 20;
    let lineHeight = 7;
    let maxWidth = 170;

    doc.setFont("Times", "normal");

    parts.forEach((part, index) => {
        let isBold = false;
        if (part.startsWith('**') && part.endsWith('**')) {
            doc.setFont("Times", "bold");
            part = part.slice(2, -2); // Remove ** from start and end
            isBold = true;
        } else {
            doc.setFont("Times", "normal");
        }

        const words = part.split(' ');
        let line = '';

        words.forEach((word, wordIndex) => {
            const testLine = line + (line ? ' ' : '') + word;
            const testWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;

            if (testWidth > maxWidth) {
                if (line) {
                    doc.text(line, currentX, y);
                    y += lineHeight;
                    currentX = 20;
                    line = word;
                } else {
                    // If a single word is too long, force-break it
                    doc.text(word, currentX, y);
                    y += lineHeight;
                    currentX = 20;
                    line = '';
                }
            } else {
                line = testLine;
            }

            // Check if we need to move to a new page
            if (y > 270) {
                doc.addPage();
                y = 20;
                currentX = 20;
            }
        });

        // Print any remaining text
        if (line) {
            doc.text(line, currentX, y);
            y += lineHeight;
            currentX = 20;
        }

        if (isBold) {
            doc.setFont("Times", "normal");
        }
    });

    return y;
}

function addList(doc, items, y) {
    const lineHeight = 7;
    const maxWidth = 165;

    items.forEach((item) => {
        let currentY = y;
        doc.text("•", 20, currentY);
        const parts = item.text.split(/(\*\*.*?\*\*)/);
        let currentX = 25;

        parts.forEach((part, index) => {
            let isBold = false;
            if (part.startsWith('**') && part.endsWith('**')) {
                doc.setFont("Times", "bold");
                part = part.slice(2, -2); // Remove ** from start and end
                isBold = true;
            } else {
                doc.setFont("Times", "normal");
            }

            const words = part.split(' ');
            let line = '';

            words.forEach((word, wordIndex) => {
                const testLine = line + (line ? ' ' : '') + word;
                const testWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;

                if (testWidth > maxWidth) {
                    if (line) {
                        doc.text(line, currentX, currentY);
                        currentY += lineHeight;
                        currentX = 25;
                        line = word;
                    } else {
                        // If a single word is too long, force-break it
                        doc.text(word, currentX, currentY);
                        currentY += lineHeight;
                        currentX = 25;
                        line = '';
                    }
                } else {
                    line = testLine;
                }

                // Check if we need to move to a new page
                if (currentY > 270) {
                    doc.addPage();
                    currentY = 20;
                    currentX = 25;
                }
            });

            // Print any remaining text
            if (line) {
                doc.text(line, currentX, currentY);
                currentY += lineHeight;
                currentX = 25;
            }

            if (isBold) {
                doc.setFont("Times", "normal");
            }
        });

        y = currentY;
    });

    return y;
}

function addHeading(doc, text, depth, y) {
    const fontSize = 16 - depth * 2;
    doc.setFont("Times", "bold");
    doc.setFontSize(fontSize);
    doc.text(text, 20, y);
    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    return y + 10;
}

function addCodeBlock(doc, code, y) {
    doc.setFont("Courier", "normal");
    doc.setFontSize(9);
    doc.setFillColor(255, 255, 255);
    const lines = doc.splitTextToSize(code, 170);
    let currentY = y;

    while (lines.length > 0) {
        // Calculate how many lines fit on the current page
        const linesOnPage = Math.min(
            lines.length,
            Math.floor((270 - currentY) / 5)
        );

        // Draw background for this page's portion of the code block
        const blockHeight = linesOnPage * 5 + 10;
        doc.setFillColor(255, 255, 255);
        doc.rect(15, currentY - 5, 180, blockHeight, 'F');

        // Draw text for this page's portion
        doc.setTextColor(0, 0, 0);
        for (let i = 0; i < linesOnPage; i++) {
            doc.text(lines[i], 20, currentY);
            currentY += 5;
        }

        // Remove the lines we've drawn
        lines.splice(0, linesOnPage);

        // If there are more lines, add a new page
        if (lines.length > 0) {
            doc.addPage();
            currentY = 20;
        }
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont("Times", "normal");
    doc.setFontSize(12);

    return currentY + 5;
}



function addTable(doc, token, y) {
    const headers = token.header.map(cell => cell.text);
    const rows = token.rows.map(row => row.map(cell => cell.text));

    doc.autoTable({
        startY: y,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, font: "Times" },
        headStyles: { fillColor: [200, 200, 200], textColor: 0 },
        margin: { left: 20, right: 20 },
    });

    return doc.lastAutoTable.finalY + 10;
}