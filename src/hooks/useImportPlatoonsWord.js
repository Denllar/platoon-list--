import { useState } from "react";
import mammoth from "mammoth";
import useAddPlatoon from "./useAddPlatoon";
import useAddStudent from "./useAddStudent";

function extractPlatoonInfo(title = "") {
    const numberMatch = title.match(/\d+/);
    let number = numberMatch ? numberMatch[0] : "";
    let type = '';
    if (/кадров/i.test(title)) type = 'Кадровые офицеры';
    else if (/офицер/i.test(title)) type = 'Офицеры запаса';
    else if (/солдат/i.test(title)) type = 'Солдаты запаса';
    return { number, type };
}

function extractStudentData(table, columnsMap) {
    return table.map(row => ({
        fio: row[columnsMap.fio] || '',
        fieldOfStudy: row[columnsMap.fieldOfStudy] || '',
        status: row[columnsMap.status] || '',
    }));
}

export default function useImportPlatoonsWord() {
    const [importStatus, setImportStatus] = useState("");
    const { createPlatoon } = useAddPlatoon();
    const { addStudent } = useAddStudent();

    const importFromWord = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImportStatus("Импортирую...");
        try {
            const arrayBuffer = await file.arrayBuffer();
            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            const doc = document.createElement("div");
            doc.innerHTML = value;

            const nodes = Array.from(doc.childNodes);
            let platoonBlocks = [];
            let currentTitle = null;
            let debugLog = [];

            nodes.forEach(node => {
                if (node.nodeType === 1 && node.tagName !== 'TABLE') {
                    const t = node.textContent.trim();
                    if (t) {
                        currentTitle = t;
                        debugLog.push(`Заголовок: [${node.tagName}] '${t.slice(0,30)}...'`);
                    }
                }
                if (node.tagName === 'TABLE' && currentTitle) {
                    platoonBlocks.push({ title: currentTitle, table: node });
                    debugLog.push(`Таблица после заголовка: ${currentTitle.slice(0,20)} ... cols: ${node.rows[0]?.cells.length || 0}`);
                    currentTitle = null;
                }
            });

            let totalPlatoons = 0, totalStudents = 0;
            for (const block of platoonBlocks) {
                const { number, type } = extractPlatoonInfo(block.title);
                if (!number) continue;
                // Генерируем id для взвода сразу
                const platoonId = Date.now().toString() + Math.floor(Math.random()*1000);
                const newPlatoon = { id: platoonId, number, type };
                const platoonRes = await createPlatoon(newPlatoon);
                if (!platoonRes?.data?.id && !platoonRes?.data?.number) continue;
                totalPlatoons++;
                // Если сервер вернул id - используем его, иначе — свой
                const usedPlatoonId = platoonRes?.data?.id || platoonId;
                // Таблица: первая строка - заголовки
                const rows = Array.from(block.table.rows).map(r => Array.from(r.cells).map(c => c.textContent.trim()));
                const headers = rows[0].map(h => h.toLowerCase());
                const columnsMap = {
                    fio: headers.findIndex(h => /фио/i.test(h)),
                    fieldOfStudy: headers.findIndex(h => /уч.*групп/i.test(h)),
                    status: headers.findIndex(h => /статус/i.test(h)),
                };
                if (columnsMap.fio < 0) continue;
                const students = extractStudentData(rows.slice(1), columnsMap);
                for (const student of students) {
                    // Формируем объект с id и platoonId
                    const newStudent = {
                        id: Date.now().toString() + Math.floor(Math.random()*1000),
                        platoonId: usedPlatoonId,
                        fio: student.fio,
                        fieldOfStudy: student.fieldOfStudy,
                        status: student.status
                    };
                    const stRes = await addStudent(newStudent);
                    if (stRes?.data) totalStudents++;
                }
            }
            const log = `Импортировано: взводов ${totalPlatoons}, студентов ${totalStudents}.\nDebug: ${debugLog.join(' // ')}`
            debugLog.push(`platoonBlocks всего: ${platoonBlocks.length}, создано ${totalPlatoons} взводов, ${totalStudents} студентов`);
            setImportStatus(log);
            console.warn(log, debugLog);
        } catch (err) {
            setImportStatus('Ошибка импорта: ' + err.message);
        } finally {
            event.target.value = "";
            setTimeout(() => setImportStatus(""), 8000);
        }
    };

    return { importFromWord, importStatus };
}
