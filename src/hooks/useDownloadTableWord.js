import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from "docx";
import { saveAs } from "file-saver";

export default function useDownloadTableWord({ filteredStudents, data }) {
    const exportToWord = () => {
        const tableHeaders = ["№", "ФИО", "Уч. группа", "Статус"];
        const rows = filteredStudents.map((student, idx) => [
            (idx + 1).toString(),
            student.fio || "",
            student.fieldOfStudy || "",
            student.status || "",
        ]);
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Взвод ${data?.number || ''}${data?.type ? ` (${data.type})` : ''}`,
                                    bold: true,
                                    size: 28,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: tableHeaders.map(h => new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
                                    })),
                                }),
                                ...rows.map(row =>
                                    new TableRow({
                                        children: row.map(cell => new TableCell({ children: [new Paragraph(cell)] })),
                                    })
                                ),
                            ],
                        }),
                    ],
                },
            ],
        });
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `Взвод_${data?.number || ''}.docx`);
        });
    };

    return {
        exportToWord,
    }
}