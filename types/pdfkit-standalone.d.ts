// pdfkit's default entry reads its standard-font .afm files off disk at
// runtime, which breaks once Next.js bundles the route handler — the
// standalone build inlines fonts as base64 instead, so it needs its own
// module declaration since @types/pdfkit only covers the main entry.
declare module 'pdfkit/js/pdfkit.standalone.js' {
  import PDFDocument from 'pdfkit';
  export default PDFDocument;
}
