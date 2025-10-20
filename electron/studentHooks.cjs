const fs = require('fs');
const path = require('path');

// Путь к JSON файлу
const { app } = require('electron');
const studentsFilePath = path.join(__dirname, '../db/students.json');
//const studentsFilePath = path.join(app.getPath('userData'), 'db/students.json');

// Инициализация файла если он не существует
function initializeStudentsFile() {
    if (!fs.existsSync(studentsFilePath)) {
        fs.writeFileSync(studentsFilePath, JSON.stringify([], null, 2));
    }
}

function getAllStudents(platoonId) {
    try {
        initializeStudentsFile();
        const content = fs.readFileSync(studentsFilePath, 'utf8');
        let data = JSON.parse(content);
        if (platoonId) {
            data = data.filter(student => student.platoonId === platoonId);
        }
        return { data };
    } catch (error) {
        console.error('Ошибка при чтении файла студентов:', error);
        return { error: `Ошибка при чтении файла студентов: ${error}` };
    }
}

// Получение студента по ID
function getStudentById(id) {
    try {
        const { data } = getAllStudents();
        const student = data.find(item => item.id === id);
        return { data: student };
    } catch (error) {
        console.error('Ошибка при поиске студента:', error);
        return { error: `Ошибка при поиске студента: ${error}` };
    }
}

// Добавление нового студента
function addStudent(newStudent) {
    try {
        const { data } = getAllStudents();
        data.push(newStudent);
        fs.writeFileSync(studentsFilePath, JSON.stringify(data, null, 2));
        return { data: newStudent };
    } catch (error) {
        console.error('Ошибка при добавлении студента:', error);
        return { error: `Ошибка при добавлении студента: ${error}` };
    }
}

// Обновление студента по ID
function updateStudent(id, updatedData) {
    try {
        const { data } = getAllStudents();
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            const newData = [...data];
            newData[index] = { ...newData[index], ...updatedData, id };
            fs.writeFileSync(studentsFilePath, JSON.stringify(newData, null, 2));
            return { data: newData[index] };
        } else {
            return { error: 'Студент не найден' };
        }
    } catch (error) {
        console.error('Ошибка при обновлении студента:', error);
        return { error: `Ошибка при обновлении студента: ${error}` };
    }
}

// Удаление студента по ID
function deleteStudent(id) {
    try {
        const { data } = getAllStudents();
        const filteredData = data.filter(item => item.id !== id);
        fs.writeFileSync(studentsFilePath, JSON.stringify(filteredData, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка при удалении студента:', error);
        return false;
    }
}

module.exports = {
    getAllStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
};