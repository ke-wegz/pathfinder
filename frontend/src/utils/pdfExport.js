import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export const containsArabic = (text) => ARABIC_REGEX.test(String(text || ''));

export const needsArabicPdf = (...texts) =>
    texts.some((text) => containsArabic(text));

export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/**
 * Renders an off-screen HTML element and saves it as a multi-page A4 PDF.
 * Uses the browser font stack so Arabic/RTL text renders correctly.
 */
export const saveElementAsPdf = async (element, filename) => {
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
    });

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0;
    const contentWidth = pageWidth - margin * 2;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(filename);
};

export const createPdfContainer = (dir = 'ltr') => {
    const tag = 'd' + 'iv';
    const container = document.createElement(tag);
    container.setAttribute('dir', dir);
    container.style.cssText = [
        'position:fixed',
        'left:-10000px',
        'top:0',
        'width:595px',
        'padding:40px',
        'background:#fff',
        'color:#111',
        'font-family:"Segoe UI",Tahoma,"Noto Sans Arabic",Arial,sans-serif',
        'font-size:14px',
        'line-height:1.5',
        'box-sizing:border-box',
    ].join(';');
    document.body.appendChild(container);
    return container;
};

export const removePdfContainer = (container) => {
    if (container?.parentNode) {
        container.parentNode.removeChild(container);
    }
};
