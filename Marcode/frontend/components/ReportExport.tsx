/**
 * Report Export Component
 * Handles PDF export of comparison results using jsPDF.
 */

import React from 'react';

interface ComparisonResults {
  fingerprint: number;
  lcs: number;
  levenshtein: number;
  structural: number;
  finalScore: number;
}

interface ReportExportProps {
  results: ComparisonResults;
  code1: string;
  code2: string;
  filename1: string;
  filename2: string;
  matches?: Array<{
    fromA: { start: number; end: number };
    fromB: { start: number; end: number };
    score: number;
    tokens: string[];
  }>;
}

const ReportExport: React.FC<ReportExportProps> = ({
  results,
  code1,
  code2,
  filename1,
  filename2,
  matches = []
}) => {
  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const getRiskColor = (score: number): string => {
    if (score >= 80) return '#dc2626'; // red
    if (score >= 50) return '#d97706'; // orange
    return '#16a34a'; // green
  };

  const handleExportPDF = async () => {
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Return height used
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Marcode - Plagiarism Detection Report', margin, yPosition);
      yPosition += 10;

      // Timestamp
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const timestamp = new Date().toLocaleString();
      doc.text(`Generated: ${timestamp}`, margin, yPosition);
      yPosition += 15;

      // File names
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Files Compared:', margin, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`File A: ${filename1}`, margin + 5, yPosition);
      yPosition += 5;
      doc.text(`File B: ${filename2}`, margin + 5, yPosition);
      yPosition += 10;

      // Similarity Scores
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Similarity Scores:', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const scores = [
        { label: 'Fingerprint:', value: `${results.fingerprint.toFixed(1)}%` },
        { label: 'LCS:', value: `${results.lcs.toFixed(1)}%` },
        { label: 'Levenshtein:', value: `${results.levenshtein.toFixed(1)}%` },
        { label: 'Structural:', value: `${results.structural.toFixed(1)}%` },
      ];

      scores.forEach(score => {
        doc.text(`${score.label} ${score.value}`, margin + 5, yPosition);
        yPosition += 5;
      });

      // Final Score
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition += 3;
      doc.text('Final Score:', margin, yPosition);
      yPosition += 7;
      
      doc.setFontSize(18);
      doc.setTextColor(getRiskColor(results.finalScore));
      doc.text(`${results.finalScore.toFixed(1)}%`, margin + 5, yPosition);
      doc.setTextColor(0, 0, 0); // Reset color
      yPosition += 10;

      // Risk Assessment
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Assessment:', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(11);
      doc.setTextColor(getRiskColor(results.finalScore));
      doc.setFont('helvetica', 'bold');
      doc.text(getRiskLevel(results.finalScore), margin + 5, yPosition);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      yPosition += 10;

      // Check if new page needed
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }

      // Top 3 Similar Code Snippets
      if (matches.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Similar Code Snippets (Top 3):', margin, yPosition);
        yPosition += 7;

        const topMatches = matches
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        topMatches.forEach((match, index) => {
          // Check if new page needed
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Match ${index + 1} (${match.score.toFixed(1)}% similarity):`, margin, yPosition);
          yPosition += 5;

          // File A snippet
          const linesA = code1.split('\n');
          const snippetA = linesA.slice(match.fromA.start, match.fromA.end + 1).join('\n');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const snippetAHeight = addWrappedText(
            `File A (Lines ${match.fromA.start + 1}-${match.fromA.end + 1}):\n${snippetA}`,
            margin + 5,
            yPosition,
            contentWidth - 10,
            8
          );
          yPosition += snippetAHeight + 3;

          // File B snippet
          const linesB = code2.split('\n');
          const snippetB = linesB.slice(match.fromB.start, match.fromB.end + 1).join('\n');
          const snippetBHeight = addWrappedText(
            `File B (Lines ${match.fromB.start + 1}-${match.fromB.end + 1}):\n${snippetB}`,
            margin + 5,
            yPosition,
            contentWidth - 10,
            8
          );
          yPosition += snippetBHeight + 8;
        });
      }

      // Footer
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Marcode - Hybrid Code Plagiarism Detector', margin, footerY);

      // Save PDF
      const fileName = `marcode-report-${filename1}-${filename2}-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please make sure jsPDF is installed.');
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export Report as PDF
    </button>
  );
};

export default ReportExport;

