import { useState } from "react";
import mammoth from "mammoth";
import JSZip from "jszip";
import useAddPlatoon from "./useAddPlatoon";
import useAddStudent from "./useAddStudent";
import useGetStudents from "./useGetStudents";
import useGetPlatoons from "./useGetPlatoons";

function extractPlatoonInfo(title = "") {
    const numberMatch = title.match(/взвод.*?(\d+[а-яa-z]*)/i);
    let number = numberMatch ? numberMatch[1] : "";
    
    let type = '';
    if (/кадров/i.test(title)) type = 'Кадровые офицеры';
    else if (/офицер/i.test(title)) type = 'Офицеры запаса';
    else if (/солдат/i.test(title)) type = 'Солдаты запаса';
    return { number, type };
}

// Функция для получения информации о цветных строках из DOCX
async function getColoredRowsInfo(fileBuffer) {
    try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const documentXml = await zip.file('word/document.xml').async('text');
        
        // Создаем парсер для XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
        
        const coloredRows = [];
        const tables = xmlDoc.getElementsByTagName('w:tbl');
        
        for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
            const table = tables[tableIndex];
            const rows = table.getElementsByTagName('w:tr');
            
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = rows[rowIndex];
                const cells = row.getElementsByTagName('w:tc');
                let isColored = false;
                
                // Проверяем все ячейки в строке на наличие цвета
                for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                    const cell = cells[cellIndex];
                    
                    // Проверяем заливку ячейки
                    const tcPr = cell.getElementsByTagName('w:tcPr')[0];
                    if (tcPr) {
                        const shd = tcPr.getElementsByTagName('w:shd')[0];
                        if (shd && shd.getAttribute('w:fill')) {
                            const fillColor = shd.getAttribute('w:fill');
                            // Если цвет заливки не белый и не прозрачный
                            if (fillColor && fillColor !== 'auto' && fillColor !== 'FFFFFF' && fillColor !== '000000') {
                                isColored = true;
                                break;
                            }
                        }
                    }
                    
                    // Проверяем цвет текста в ячейке
                    const paragraphs = cell.getElementsByTagName('w:p');
                    for (let p = 0; p < paragraphs.length; p++) {
                        const runs = paragraphs[p].getElementsByTagName('w:r');
                        for (let r = 0; r < runs.length; r++) {
                            const run = runs[r];
                            const rPr = run.getElementsByTagName('w:rPr')[0];
                            if (rPr) {
                                const color = rPr.getElementsByTagName('w:color')[0];
                                if (color && color.getAttribute('w:val')) {
                                    const colorVal = color.getAttribute('w:val');
                                    // Если цвет текста не черный и не авто
                                    if (colorVal && colorVal !== 'auto' && colorVal !== '000000' && colorVal !== 'FFFFFF') {
                                        isColored = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (isColored) break;
                    }
                    if (isColored) break;
                }
                
                if (isColored) {
                    coloredRows.push({
                        tableIndex,
                        rowIndex
                    });
                }
            }
        }
        
        return coloredRows;
    } catch (error) {
        console.error('Ошибка при анализе цветов:', error);
        return [];
    }
}

export default function useImportPlatoonsWord() {
    const [importStatus, setImportStatus] = useState("");
    const [platoons, setPlatoons] = useState([]);
    const [students, setStudents] = useState([]);
    
    const { createPlatoon } = useAddPlatoon();
    const { addStudent } = useAddStudent();
    const { getStudents } = useGetStudents({ setStudents });
    const { getPlatoons } = useGetPlatoons({ setPlatoons });

    const importFromWord = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        await getPlatoons();
        await getStudents();
        
        setImportStatus("Импортирую...");
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Получаем информацию о цветных строках
            const coloredRowsInfo = await getColoredRowsInfo(arrayBuffer);
            console.log('Цветные строки:', coloredRowsInfo);
            
            // Используем Mammoth для извлечения текста
            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            
            const doc = document.createElement("div");
            doc.innerHTML = value;

            const nodes = Array.from(doc.childNodes);
            let platoonBlocks = [];
            let currentTitle = null;
            let debugLog = [];
            let currentPlatoonType = 'Кадровые офицеры';
            
            nodes.forEach(node => {
                if (node.nodeType === 1) {
                    const text = node.textContent.trim();
                    
                    if (text) {
                        if (/кадров|офицер.*кадр/i.test(text)) {
                            currentPlatoonType = 'Кадровые офицеры';
                            debugLog.push(`Определен тип: ${currentPlatoonType}`);
                        } else if (/офицер.*запас|ОФИЦЕРЫ ЗАПАСА/i.test(text)) {
                            currentPlatoonType = 'Офицеры запаса';
                            debugLog.push(`Определен тип: ${currentPlatoonType}`);
                        } else if (/солдат.*запас|СОЛДАТЫ ЗАПАСА/i.test(text)) {
                            currentPlatoonType = 'Солдаты запаса';
                            debugLog.push(`Определен тип: ${currentPlatoonType}`);
                        }
                        
                        if (/учебн.*взвод.*\d+[а-яa-z]*/i.test(text) || /взвод.*\d+[а-яa-z]*/i.test(text)) {
                            currentTitle = text;
                            debugLog.push(`Найден взвод: ${text}, тип: ${currentPlatoonType}`);
                        }
                    }
                }
                
                if (node.tagName === 'TABLE' && currentTitle) {
                    const { number } = extractPlatoonInfo(currentTitle);
                    let finalType = currentPlatoonType;
                    
                    if (number && /[а-яa-z]$/i.test(number) && currentPlatoonType !== 'Солдаты запаса') {
                        finalType = 'Солдаты запаса';
                        debugLog.push(`Принудительно установлен тип "Солдаты запаса" для взвода ${number}`);
                    }
                    
                    platoonBlocks.push({ 
                        title: currentTitle, 
                        table: node,
                        type: finalType
                    });
                    debugLog.push(`Добавлена таблица для взвода: ${currentTitle}, тип: ${finalType}`);
                    currentTitle = null;
                }
            });

            let totalPlatoons = 0, totalStudents = 0;
            let skippedPlatoons = 0, skippedStudents = 0;
            let tableIndex = 0;
            
            for (const block of platoonBlocks) {
                const { number } = extractPlatoonInfo(block.title);
                
                if (!number) {
                    debugLog.push(`Не удалось извлечь номер из: ${block.title}`);
                    tableIndex++;
                    continue;
                }
                
                debugLog.push(`Обрабатываем взвод №${number}, тип: ${block.type}`);
                
                const existingPlatoon = platoons.find(
                    p => p.number === number && p.type === block.type
                );
                
                let usedPlatoonId;
                
                if (existingPlatoon) {
                    usedPlatoonId = existingPlatoon.id;
                    debugLog.push(`Взвод ${number} уже существует, используем ID: ${usedPlatoonId}`);
                    skippedPlatoons++;
                } else {
                    const platoonId = Date.now().toString() + Math.floor(Math.random()*1000);
                    const newPlatoon = { 
                        id: platoonId, 
                        number, 
                        type: block.type
                    };
                    
                    const platoonRes = await createPlatoon(newPlatoon);
                    if (!platoonRes?.data) {
                        debugLog.push(`Ошибка создания взвода ${number}`);
                        tableIndex++;
                        continue;
                    }
                    
                    totalPlatoons++;
                    usedPlatoonId = platoonRes.data.id || platoonId;
                    setPlatoons(prev => [...prev, { ...newPlatoon, id: usedPlatoonId }]);
                }
                
                const rows = Array.from(block.table.rows);
                debugLog.push(`Найдено строк в таблице: ${rows.length}`);
                
                if (rows.length < 2) {
                    debugLog.push(`Таблица взвода ${number} слишком мала`);
                    tableIndex++;
                    continue;
                }
                
                const headerCells = Array.from(rows[0].cells);
                const headers = headerCells.map(cell => cell.textContent.trim().toLowerCase());
                debugLog.push(`Заголовки таблицы: ${headers.join(', ')}`);
                
                const fioIndex = headers.findIndex(h => /фио|ф\.и\.о/i.test(h));
                const groupIndex = headers.findIndex(h => /учебн.*групп|групп/i.test(h));
                
                if (fioIndex === -1) {
                    debugLog.push(`Не найдена колонка ФИО в таблице взвода ${number}`);
                    tableIndex++;
                    continue;
                }
                
                debugLog.push(`Индексы колонок - ФИО: ${fioIndex}, Группа: ${groupIndex}`);
                
                // Обрабатываем строки студентов
                for (let i = 1; i < rows.length; i++) {
                    const cells = Array.from(rows[i].cells);
                    
                    if (cells.length <= fioIndex) {
                        continue;
                    }
                    
                    const fioCell = cells[fioIndex];
                    const fioText = fioCell.textContent.trim();
                    
                    if (!fioText || 
                        fioText.includes('Институт') || 
                        fioText.includes('Факультет') ||
                        fioText.includes('№ п/п') ||
                        fioText.length < 2) {
                        continue;
                    }
                    
                    // Проверяем, является ли эта строка цветной
                    const isColoredRow = coloredRowsInfo.some(info => 
                        info.tableIndex === tableIndex && info.rowIndex === i
                    );
                    
                    const studentData = {
                        fio: fioText,
                        fieldOfStudy: groupIndex !== -1 && cells[groupIndex] ? 
                            cells[groupIndex].textContent.trim() : '',
                        status: isColoredRow ? 'Отстранён' : 'Зачислен'
                    };
                    
                    const existingStudent = students.find(
                        s => s.fio === studentData.fio && s.platoonId === usedPlatoonId
                    );
                    
                    if (existingStudent) {
                        debugLog.push(`Студент ${studentData.fio} уже существует во взводе ${number}, пропускаем`);
                        skippedStudents++;
                        continue;
                    }
                    
                    debugLog.push(`Студент: ${studentData.fio}, статус: ${studentData.status}, цветная строка: ${isColoredRow}`);
                    
                    const newStudent = {
                        id: Date.now().toString() + Math.floor(Math.random()*1000),
                        platoonId: usedPlatoonId,
                        fio: studentData.fio,
                        fieldOfStudy: studentData.fieldOfStudy,
                        status: studentData.status
                    };
                    
                    const studentRes = await addStudent(newStudent);
                    if (studentRes?.data) {
                        totalStudents++;
                        debugLog.push(`Успешно добавлен студент: ${studentData.fio}`);
                        setStudents(prev => [...prev, { ...newStudent, id: studentRes.data.id || newStudent.id }]);
                    } else {
                        debugLog.push(`Ошибка добавления студента: ${studentData.fio}`);
                    }
                }
                
                tableIndex++;
                debugLog.push(`Взвод ${number}: обработано студентов - ${totalStudents}, пропущено - ${skippedStudents}`);
            }
            
            const resultMessage = `Импорт завершен. 
                Создано взводов: ${totalPlatoons}, пропущено: ${skippedPlatoons}
                Создано студентов: ${totalStudents}, пропущено: ${skippedStudents}`;
            setImportStatus(resultMessage);
            console.log('Результат импорта:', resultMessage);
            console.log('Детали:', debugLog);
            window.location.reload();
        } catch (err) {
            console.error('Ошибка импорта:', err);
            setImportStatus('Ошибка импорта: ' + err.message);
        } finally {
            event.target.value = "";
            setTimeout(() => setImportStatus(""), 15000);
        }
    };

    return { importFromWord, importStatus };
}