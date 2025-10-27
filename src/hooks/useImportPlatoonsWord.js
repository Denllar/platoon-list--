import { useState } from "react";
import mammoth from "mammoth";
import useAddPlatoon from "./useAddPlatoon";
import useAddStudent from "./useAddStudent";
import useGetStudents from "./useGetStudents";
import useGetPlatoons from "./useGetPlatoons";

function extractPlatoonInfo(title = "") {
    // Ищем номер взвода, который может содержать цифры и буквы (например: 312р, 301д)
    const numberMatch = title.match(/взвод.*?(\d+[а-яa-z]*)/i);
    let number = numberMatch ? numberMatch[1] : "";
    
    let type = '';
    if (/кадров/i.test(title)) type = 'Кадровые офицеры';
    else if (/офицер/i.test(title)) type = 'Офицеры запаса';
    else if (/солдат/i.test(title)) type = 'Солдаты запаса';
    return { number, type };
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
        
        // Загружаем данные только когда они действительно нужны
        await getPlatoons();
        await getStudents();
        
        setImportStatus("Импортирую...");
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            const { value } = await mammoth.convertToHtml({ 
                arrayBuffer,
                styleMap: [
                    "r[color='FF0000'] => red",
                    "r[color='red'] => red",
                    "r[style*='color:red'] => red"
                ]
            });
            
            const doc = document.createElement("div");
            doc.innerHTML = value;

            const nodes = Array.from(doc.childNodes);
            let platoonBlocks = [];
            let currentTitle = null;
            let debugLog = [];

            // Определяем текущий тип взвода
            let currentPlatoonType = 'Кадровые офицеры';
            
            nodes.forEach(node => {
                if (node.nodeType === 1) {
                    const text = node.textContent.trim();
                    
                    if (text) {
                        // Обновляем тип взвода при обнаружении разделов
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
                        
                        // Ищем заголовки учебных взводов (включая солдат запаса с буквами в номере)
                        if (/учебн.*взвод.*\d+[а-яa-z]*/i.test(text) || /взвод.*\d+[а-яa-z]*/i.test(text)) {
                            currentTitle = text;
                            debugLog.push(`Найден взвод: ${text}, тип: ${currentPlatoonType}`);
                        }
                    }
                }
                
                // Обрабатываем таблицы после заголовка взвода
                if (node.tagName === 'TABLE' && currentTitle) {
                    // Для солдат запаса с буквами в номере принудительно устанавливаем тип
                    const { number } = extractPlatoonInfo(currentTitle);
                    let finalType = currentPlatoonType;
                    
                    // Если номер содержит буквы (312р, 301д и т.д.) и текущий тип не солдаты,
                    // принудительно меняем на солдат запаса
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
            
            for (const block of platoonBlocks) {
                const { number } = extractPlatoonInfo(block.title);
                
                if (!number) {
                    debugLog.push(`Не удалось извлечь номер из: ${block.title}`);
                    continue;
                }
                
                debugLog.push(`Обрабатываем взвод №${number}, тип: ${block.type}`);
                
                // Проверяем, существует ли уже такой взвод
                const existingPlatoon = platoons.find(
                    p => p.number === number && p.type === block.type
                );
                
                let usedPlatoonId;
                
                if (existingPlatoon) {
                    // Используем существующий взвод
                    usedPlatoonId = existingPlatoon.id;
                    debugLog.push(`Взвод ${number} уже существует, используем ID: ${usedPlatoonId}`);
                    skippedPlatoons++;
                } else {
                    // Создаем новый взвод
                    const platoonId = Date.now().toString() + Math.floor(Math.random()*1000);
                    const newPlatoon = { 
                        id: platoonId, 
                        number, 
                        type: block.type
                    };
                    
                    const platoonRes = await createPlatoon(newPlatoon);
                    if (!platoonRes?.data) {
                        debugLog.push(`Ошибка создания взвода ${number}`);
                        continue;
                    }
                    
                    totalPlatoons++;
                    usedPlatoonId = platoonRes.data.id || platoonId;
                    
                    // Обновляем локальное состояние взводов
                    setPlatoons(prev => [...prev, { ...newPlatoon, id: usedPlatoonId }]);
                }
                
                // Обрабатываем таблицу студентов
                const rows = Array.from(block.table.rows);
                debugLog.push(`Найдено строк в таблице: ${rows.length}`);
                
                if (rows.length < 2) {
                    debugLog.push(`Таблица взвода ${number} слишком мала`);
                    continue;
                }
                
                // Определяем заголовки таблицы
                const headerCells = Array.from(rows[0].cells);
                const headers = headerCells.map(cell => cell.textContent.trim().toLowerCase());
                debugLog.push(`Заголовки таблицы: ${headers.join(', ')}`);
                
                // Находим индексы колонок
                const fioIndex = headers.findIndex(h => /фио|ф\.и\.о/i.test(h));
                const groupIndex = headers.findIndex(h => /учебн.*групп|групп/i.test(h));
                const statusIndex = headers.findIndex(h => /статус/i.test(h));
                
                // Альтернативный поиск колонок, если не нашли по основным шаблонам
                const finalFioIndex = fioIndex !== -1 ? fioIndex : 
                                    headers.findIndex(h => h.includes('фио') || h.includes('ф.и.о'));
                const finalGroupIndex = groupIndex !== -1 ? groupIndex : 
                                      headers.findIndex(h => h.includes('учеб') || h.includes('групп'));
                
                if (finalFioIndex === -1) {
                    debugLog.push(`Не найдена колонка ФИО в таблице взвода ${number}`);
                    continue;
                }
                
                debugLog.push(`Индексы колонок - ФИО: ${finalFioIndex}, Группа: ${finalGroupIndex}, Статус: ${statusIndex}`);
                
                // Обрабатываем строки студентов (пропускаем заголовок)
                for (let i = 1; i < rows.length; i++) {
                    const cells = Array.from(rows[i].cells);
                    
                    if (cells.length <= finalFioIndex) {
                        continue;
                    }
                    
                    const fioCell = cells[finalFioIndex];
                    const fioText = fioCell.textContent.trim();
                    
                    // Пропускаем пустые строки и строки с названиями институтов/факультетов
                    if (!fioText || 
                        fioText.includes('Институт') || 
                        fioText.includes('Факультет') ||
                        fioText.includes('№ п/п') ||
                        fioText.length < 2) {
                        continue;
                    }
                    
                    // Проверяем красный цвет текста
                    let isRed = false;
                    try {
                        isRed = fioCell.innerHTML.includes('color:red') || 
                                fioCell.innerHTML.includes('color="red"') ||
                                Array.from(fioCell.getElementsByTagName('red')).length > 0 ||
                                fioCell.innerHTML.includes('FF0000');
                    } catch (e) {
                        console.warn('Ошибка проверки цвета:', e);
                    }
                    
                    const studentData = {
                        fio: fioText,
                        fieldOfStudy: finalGroupIndex !== -1 && cells[finalGroupIndex] ? 
                            cells[finalGroupIndex].textContent.trim() : '',
                        status: isRed ? 'Отстранён' : (statusIndex !== -1 && cells[statusIndex] ? 
                            cells[statusIndex].textContent.trim() : 'Зачислен')
                    };
                    
                    // Проверяем, существует ли уже такой студент во взводе
                    const existingStudent = students.find(
                        s => s.fio === studentData.fio && s.platoonId === usedPlatoonId
                    );
                    
                    if (existingStudent) {
                        debugLog.push(`Студент ${studentData.fio} уже существует во взводе ${number}, пропускаем`);
                        skippedStudents++;
                        continue;
                    }
                    
                    debugLog.push(`Студент: ${studentData.fio}, статус: ${studentData.status}`);
                    
                    // Добавляем студента
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
                        
                        // Обновляем локальное состояние студентов
                        setStudents(prev => [...prev, { ...newStudent, id: studentRes.data.id || newStudent.id }]);
                    } else {
                        debugLog.push(`Ошибка добавления студента: ${studentData.fio}`);
                    }
                }
                
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