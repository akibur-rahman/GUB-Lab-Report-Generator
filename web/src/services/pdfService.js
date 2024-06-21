import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { marked } from "marked";

export const generatePDF = (responses) => {
    const doc = new jsPDF();

    doc.setFont("times");
    doc.setFontSize(16);
    doc.text("Lab Report", 105, 15, null, null, "center");

    let yPos = 30;

    for (const [key, value] of Object.entries(responses)) {
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text(key.toUpperCase(), 20, yPos);
        yPos += 10;

        const tokens = marked.lexer(value.response);

        doc.setFontSize(12);
        doc.setFont("times", "normal");

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
    const parts = text.split(/(\*\*.*?\*\*)/g);
    let x = 20;

    parts.forEach(part => {
        let lines;
        if (part.startsWith('**') && part.endsWith('**')) {
            doc.setFont("times", "bold");
            const boldText = part.slice(2, -2);
            lines = doc.splitTextToSize(boldText, 170 - (x - 20));
        } else {
            doc.setFont("times", "normal");
            lines = doc.splitTextToSize(part, 170 - (x - 20));
        }

        lines.forEach((line, index) => {
            if (x + doc.getTextWidth(line) > 190) {
                const words = line.split(' ');
                let newLine = '';
                words.forEach(word => {
                    if (x + doc.getTextWidth(newLine + word + ' ') <= 190) {
                        newLine += word + ' ';
                    } else {
                        doc.text(newLine.trim(), x, y);
                        newLine = word + ' ';
                        x = 20;
                        y += 7;
                    }
                });
                line = newLine.trim();
            }
            doc.text(line, x, y);
            if (index < lines.length - 1) {
                x = 20;
                y += 7;
            } else {
                x += doc.getTextWidth(line);
            }
        });

        doc.setFont("times", "normal");
    });

    return y + 7;
}

function addHeading(doc, text, depth, y) {
    const fontSize = 16 - depth * 2;
    doc.setFont("times", "bold");
    doc.setFontSize(fontSize);
    doc.text(text, 20, y);
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    return y + 10;
}

function addCodeBlock(doc, code, y) {
    doc.setFont("courier", "normal");
    doc.setFillColor(240, 240, 240);

    const lines = doc.splitTextToSize(code, 160);
    const blockHeight = lines.length * 7 + 10;

    doc.rect(15, y - 5, 180, blockHeight, 'F');
    doc.setTextColor(0, 100, 0);
    doc.text(lines, 20, y);

    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");

    return y + blockHeight + 5;
}

function addList(doc, items, y) {
    items.forEach((item) => {
        doc.text("•", 20, y);
        const lines = doc.splitTextToSize(item.text, 165);
        doc.text(lines, 25, y);
        y += lines.length * 7;
    });
    return y;
}

function addTable(doc, token, y) {
    const headers = token.header.map(cell => cell.text);
    const rows = token.rows.map(row => row.map(cell => cell.text));

    doc.autoTable({
        startY: y,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, font: "times" },
        headStyles: { fillColor: [200, 200, 200], textColor: 0 },
        margin: { left: 20, right: 20 },
    });

    return doc.lastAutoTable.finalY + 10;
}
