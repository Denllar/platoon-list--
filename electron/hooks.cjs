const fs = require('fs');
const path = require('path');

// Путь к JSON файлу
const dataFilePath = path.join(__dirname, '../platoon.json');

// Инициализация файла если он не существует
function initializeFile() {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
    }
}

// Получение всех данных
function getAllData() {
    try {
        initializeFile();
        const content = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(content);
        return data;
    } catch (error) {
        console.error('Ошибка при чтении файла:', error);
        return [];
    }
}

// Получение данных по ID
function getDataById(id) {
    try {
        const allData = getAllData();
        return allData.find(item => item.id === id) || null;
    } catch (error) {
        console.error('Ошибка при поиске данных:', error);
        return null;
    }
}

// Добавление новых данных
function addData(newItem) {
    try {
        const allData = getAllData();
        
        const isAlready = allData.some(item => item.number === newItem.number)
        if (isAlready) return {error: "Взвод уже существует!"}

        allData.push(newItem);
        fs.writeFileSync(dataFilePath, JSON.stringify(allData, null, 2));
        return {data: newItem};
    } catch (error) {
        console.error('Ошибка при добавлении данных:', error);
        return null;
    }
}

// Обновление данных по ID
function updateData(id, updatedData) {
    try {
        const allData = getAllData();
        const index = allData.findIndex(item => item.id === id);
        
        if (index !== -1) {
            allData[index] = { ...allData[index], ...updatedData, id: id };
            fs.writeFileSync(dataFilePath, JSON.stringify(allData, null, 2));
            return allData[index];
        }
        return null;
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        return null;
    }
}

// Удаление данных по ID
function deleteData(id) {
    try {
        const allData = getAllData();
        const filteredData = allData.filter(item => item.id !== id);
        
        fs.writeFileSync(dataFilePath, JSON.stringify(filteredData, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        return false;
    }
}

module.exports = {
    getAllData,
    getDataById,
    addData,
    updateData,
    deleteData
};