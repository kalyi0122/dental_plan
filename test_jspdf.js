const { jsPDF } = require('jspdf');
const doc = new jsPDF();

try {
  doc.moveTo(10, 10);
  doc.bezierCurveTo(20, 10, 20, 20, 10, 20);
  doc.setDrawColor(255, 0, 0);
  doc.setFillColor(0, 0, 255);
  doc.stroke();
  doc.fill();
  
  console.log("length of pdf", doc.output().length)
} catch (e) {
  console.log("ERROR", e.message);
}
