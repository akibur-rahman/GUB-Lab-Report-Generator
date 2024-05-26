// src/services/pdfService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (reportData) => {
    const doc = new jsPDF();

    doc.setFont('Times-Roman');
    doc.setFontSize(12);

    doc.text('Green University of Bangladesh', 10, 10);
    doc.text('Department of Computer Science and Engineering(CSE)', 10, 20);
    doc.text('Faculty of Sciences and Engineering', 10, 30);
    doc.text(`Semester: (Spring, Year: 2024), B.Sc. in CSE (Day)`, 10, 40);
    doc.text('LAB REPORT NO # 04', 10, 50);

    doc.text(`Course Title: Web Programming Lab`, 10, 60);
    doc.text(`Course Code: CSE 302                 Section: 213D7`, 10, 70);
    doc.text(`Lab Experiment Name: ${reportData.title}`, 10, 80);

    doc.text(`Student Details`, 10, 90);
    doc.autoTable({
        startY: 100,
        head: [['Name', 'ID']],
        body: reportData.students.map(student => [student.name, student.id])
    });

    doc.text(`Lab Date: ${reportData.labDate}`, 10, 130);
    doc.text(`Submission Date: ${reportData.submissionDate}`, 10, 140);
    doc.text(`Course Teacher’s Name: ${reportData.courseTeacher}`, 10, 150);

    doc.text('1. TITLE OF THE LAB EXPERIMENT', 10, 160);
    doc.text(reportData.title, 10, 170);

    doc.text('2. OBJECTIVES', 10, 180);
    doc.text(reportData.objectives, 10, 190);

    doc.text('3. PROCEDURE', 10, 200);
    doc.text(reportData.procedure, 10, 210);

    doc.text('4. IMPLEMENTATION', 10, 220);
    doc.text(reportData.implementation, 10, 230);

    doc.text('5. OUTPUT', 10, 240);
    doc.text(reportData.output, 10, 250);

    doc.text('6. DISCUSSION', 10, 260);
    doc.text(reportData.discussion, 10, 270);

    doc.text('7. SUMMARY', 10, 280);
    doc.text(reportData.summary, 10, 290);

    doc.save('lab_report.pdf');
};
