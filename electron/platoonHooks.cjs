const fs = require('fs');
const path = require('path');

const { app } = require('electron');
const dataFilePath = path.join(app.getPath('userData'), 'db/platoon.json');

// Инициализация файла если он не существует
function initializeFile() {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
    }
}

// Получение всех данных
function getAllPlatoons() {
    try {
        initializeFile();
        const content = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(content);
        return { data };
    } catch (error) {
        console.error('Ошибка при чтении файла:', error);
        return [];
    }
}

// Получение данных по ID
function getPlatoonById(id) {
    try {
        const { data } = getAllPlatoons();
        const platoon = data.find(item => item.id === id);
        return { data: platoon }
    } catch (error) {
        console.error('Ошибка при поиске данных:', error);
        return { error: `Ошибка при поиске взвода: ${error}` };
    }
}

// Добавление новых данных
function addPlatoon(newItem) {
    try {
        const { data } = getAllPlatoons();

        const isAlready = data.some(item => item.number === newItem.number)
        if (isAlready) return { error: "Взвод уже существует!" }

        data.push(newItem);
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return { data: newItem };
    } catch (error) {
        console.error('Ошибка при добавлении данных:', error);
        return null;
    }
}

function updatePlatoon(id, updatedData) {
    try {
        const { data } = getAllPlatoons();
        const index = data.findIndex(item => item.id === id);

        if (index !== -1) {
            // Создаём копию массива, чтобы не мутировать оригинальные данные
            const newData = [...data];
            newData[index] = { ...newData[index], ...updatedData, id };
            fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
            return {data: newData[index]};
        } else {
            return { error: 'Взвод не найден' };
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        return { error: `Ошибка при обновлении данных: ${error}` };
    }
}

// Удаление данных по ID
function deletePlatoon(id) {
    try {
        const { data: allData } = getAllPlatoons();
        const filteredData = allData.filter(item => String(item.id) !== String(id));
        fs.writeFileSync(dataFilePath, JSON.stringify(filteredData, null, 2));

        // === Удаление студентов этого взвода ===
        const studentsFilePath = path.join(__dirname, '../db/students.json');
        if (fs.existsSync(studentsFilePath)) {
            const studentsContent = fs.readFileSync(studentsFilePath, 'utf8');
            const students = JSON.parse(studentsContent);
            const filteredStudents = students.filter(student => String(student.platoonId) !== String(id));
            fs.writeFileSync(studentsFilePath, JSON.stringify(filteredStudents, null, 2));
        }
        // === END ===
        return true;
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        return false;
    }
}

module.exports = {
    getAllPlatoons,
    getPlatoonById,
    addPlatoon,
    updatePlatoon,
    deletePlatoon
};