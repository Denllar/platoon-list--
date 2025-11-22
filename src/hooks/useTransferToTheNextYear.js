import useUpdatePlatoon from "./useUpdatePlatoon";
import useUpdateStudent from "./useUpdateStudent";
import useDeletePlatoon from "./useDeletePlatoon";

export default function useTransferToTheNextYear() {
    const { updatePlatoon } = useUpdatePlatoon();
    const { updateStudent } = useUpdateStudent();
    const { deletePlatoon } = useDeletePlatoon();

    // Вспомогательная функция для обновления fieldOfStudy
    const updateStudentFieldOfStudy = (fieldOfStudy) => {
        if (!fieldOfStudy) return fieldOfStudy;

        const lastDashIndex = fieldOfStudy.lastIndexOf('-');
        if (lastDashIndex === -1) return fieldOfStudy;

        const beforeDash = fieldOfStudy.substring(0, lastDashIndex + 1);
        const afterDash = fieldOfStudy.substring(lastDashIndex + 1);

        // Ищем первую цифру после тире
        const match = afterDash.match(/^(\d+)/);
        if (!match) return fieldOfStudy;

        const numbers = match[1];
        const newNumbers = String(parseInt(numbers) + 1);

        return beforeDash + afterDash.replace(/^\d+/, newNumbers);
    };

    const transferToTheNextYear = async () => {
        try {
            // Получаем все данные один раз
            const { data: platoons = [] } = await window.electronAPI.getAllPlatoons();
            const { data: students = [] } = await window.electronAPI.getAllStudents();

            // Настройки лимита курса
            const maxCourse = {
                'Кадровые офицеры': 6,
                'Офицеры запаса': 4,
                'Солдаты запаса': 3
            };

            // Сортируем взводы по номеру (от большего к меньшему чтобы избежать конфликтов)
            const sortedPlatoons = [...platoons].sort((a, b) => b.number - a.number);

            for (const platoon of sortedPlatoons) {
                // Получаем текущий курс (первая цифра номера)
                const platoonStr = String(platoon.number);
                const currCourse = parseInt(platoonStr[0]);
                const newCourse = currCourse + 1;

                const typeLimit = maxCourse[platoon.type] || 6;

                if (newCourse > typeLimit) {
                    // Удаляем взвод если превышен лимит курса
                    await updatePlatoon(platoon.id, {
                        ...platoon,
                        isInArchive: true,
                    })
                    //await deletePlatoon(platoon.id);
                    continue;
                }

                // Формируем новый номер взвода
                const newPlatoonNumber = parseInt(String(newCourse) + platoonStr.slice(1));

                // Обновляем взвод
                await updatePlatoon(platoon.id, {
                    ...platoon,
                    number: newPlatoonNumber
                });

                // Обновляем студентов этого взвода
                const platoonStudents = students.filter(s => s.platoonId === platoon.id);

                for (const student of platoonStudents) {
                    const newFieldOfStudy = updateStudentFieldOfStudy(student.fieldOfStudy);
                    if (newFieldOfStudy !== student.fieldOfStudy) {
                        await updateStudent(student.id, {
                            ...student,
                            fieldOfStudy: newFieldOfStudy
                        });
                    }
                }
            }

            return { success: true, message: 'Перевод на следующий год выполнен успешно' };
        } catch (error) {
            console.error('Ошибка при переводе на следующий год:', error);
            return {
                success: false,
                error: `Ошибка при переводе на следующий год: ${error.message}`
            };
        }
    };

    return { transferToTheNextYear };
}