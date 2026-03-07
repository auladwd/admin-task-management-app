import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDate, formatStatus } from './helpers';

/**
 * Export report to PDF
 */
export const exportToPDF = (tasks, stats, filters) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Task Management Report', 14, 20);

  // Report Info
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Tasks: ${stats.total}`, 14, 36);

  // Statistics
  doc.setFontSize(12);
  doc.text('Summary Statistics', 14, 46);
  doc.setFontSize(10);
  doc.text(`Pending: ${stats.pending}`, 14, 52);
  doc.text(`In Progress: ${stats.inProgress}`, 14, 58);
  doc.text(`Completed: ${stats.completed}`, 14, 64);
  doc.text(`Overdue: ${stats.overdue}`, 14, 70);

  // Tasks Table
  const tableData = tasks.map(task => [
    task.title,
    task.assigneeName,
    formatDate(task.dueDate),
    task.priority,
    formatStatus(task.status),
  ]);

  doc.autoTable({
    startY: 80,
    head: [['Task', 'Assignee', 'Due Date', 'Priority', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Save
  doc.save(`task-report-${Date.now()}.pdf`);
};

/**
 * Export report to Excel
 */
export const exportToExcel = (tasks, stats) => {
  // Prepare data
  const data = tasks.map(task => ({
    'Task Title': task.title,
    Description: task.description,
    Assignee: task.assigneeName,
    'Due Date': formatDate(task.dueDate),
    Priority: task.priority,
    Status: formatStatus(task.status),
    Created: formatDate(task.createdAt),
    'Created By': task.createdByName,
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Tasks sheet
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

  // Statistics sheet
  const statsData = [
    ['Metric', 'Count'],
    ['Total Tasks', stats.total],
    ['Pending', stats.pending],
    ['In Progress', stats.inProgress],
    ['Completed', stats.completed],
    ['Overdue', stats.overdue],
    ['High Priority', stats.high],
    ['Medium Priority', stats.medium],
    ['Low Priority', stats.low],
  ];
  const statsWs = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');

  // Save
  XLSX.writeFile(wb, `task-report-${Date.now()}.xlsx`);
};

/**
 * Print report
 */
export const printReport = () => {
  window.print();
};
