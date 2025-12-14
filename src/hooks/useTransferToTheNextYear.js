import useUpdatePlatoon from "./useUpdatePlatoon";
import useUpdateStudent from "./useUpdateStudent";

export default function useTransferToTheNextYear() {
    const { updatePlatoon } = useUpdatePlatoon();
    const { updateStudent } = useUpdateStudent();

    // Вспомогательная функция для обновления fieldOfStudy
    const updateStudentFieldOfStudy = (fieldOfStudy) => {
        if (!fieldOfStudy) return fieldOfStudy;

        const lastDashIndex = fieldOfStudy.lastIndexOf('-');
        if (lastDashIndex === -1) return fieldOfStudy;

        const beforeDash = fieldOfStudy.substring(0, lastDashIndex + 1);
        const afterDash = fieldOfStudy.substring(lastDashIndex + 1);

        // Ищем первую цифру после тире
        const updated = afterDash.replace(/^(\d)/, (d) => String(+d + 1));
        return beforeDash + updated;
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
                // Пропускаем архивные взвода при переводе вперед
                if (platoon.isInArchive) continue;

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
                        transferedAt: new Date().toISOString(),
                    })
                    continue;
                }

                // Формируем новый номер взвода
                const newPlatoonNumber = parseInt(String(newCourse) + platoonStr.slice(1));

                // Обновляем взвод
                await updatePlatoon(platoon.id, {
                    ...platoon,
                    number: newPlatoonNumber,
                    transferedAt: null,
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

    // Вспомогательная функция для понижения fieldOfStudy
    const downgradeStudentFieldOfStudy = (fieldOfStudy) => {
        if (!fieldOfStudy) return fieldOfStudy;
        const lastDashIndex = fieldOfStudy.lastIndexOf('-');
        if (lastDashIndex === -1) return fieldOfStudy;
        const beforeDash = fieldOfStudy.substring(0, lastDashIndex + 1);
        const afterDash = fieldOfStudy.substring(lastDashIndex + 1);
        // Ищем первую цифру после тире
        const updated = afterDash.replace(/^(\d)/, (d) => {
            const val = +d - 1;
            return val > 0 ? String(val) : String(d); // не понижаем меньше 1
        });
        return beforeDash + updated;
    };

    const transferToPrevYear = async () => {
        try {
            const { data: platoons = [] } = await window.electronAPI.getAllPlatoons();
            const { data: students = [] } = await window.electronAPI.getAllStudents();

            // Минимальный курс для разных типов взводов:
            const minCourse = {
                'Кадровые офицеры': 1,
                'Офицеры запаса': 1,
                'Солдаты запаса': 1
            };

            // Сортируем взводы по номеру (от меньшего к большему для предотвращения конфликтов)
            const sortedPlatoons = [...platoons].sort((a, b) => a.number - b.number);

            for (const platoon of sortedPlatoons) {
                // Если архивный взвод (и пустой transferedAt) - не трогаем
                if (platoon.isInArchive && !platoon.transferedAt) continue;
                // Если архивный и transferedAt заполнен — только разархивируем!
                if (platoon.isInArchive && platoon.transferedAt) {
                    await updatePlatoon(platoon.id, {
                        ...platoon,
                        isInArchive: false,
                        transferedAt: null,
                    });
                    continue;
                }
                // Обычные взвода:
                const platoonStr = String(platoon.number);
                const currCourse = parseInt(platoonStr[0]);
                const newCourse = currCourse - 1;
                const typeLimit = minCourse[platoon.type] || 1;
                if (newCourse < typeLimit) {
                    // Поместить в архив или сделать неактивным
                    await updatePlatoon(platoon.id, {
                        ...platoon,
                        isInArchive: false,
                        transferedAt: new Date().toISOString(),
                    });
                    continue;
                }
                // Формируем новый номер взвода
                const newPlatoonNumber = parseInt(String(newCourse) + platoonStr.slice(1));
                // Обновляем взвод (только для неархивных)
                await updatePlatoon(platoon.id, {
                    ...platoon,
                    number: newPlatoonNumber,
                });
                // Обновляем студентов этого взвода (только для неархивных)
                const platoonStudents = students.filter(s => s.platoonId === platoon.id);
                for (const student of platoonStudents) {
                    const newFieldOfStudy = downgradeStudentFieldOfStudy(student.fieldOfStudy);
                    if (newFieldOfStudy !== student.fieldOfStudy) {
                        await updateStudent(student.id, {
                            ...student,
                            fieldOfStudy: newFieldOfStudy
                        });
                    }
                }
            }
            return { success: true, message: 'Понижение на год выполнено успешно' };
        } catch (error) {
            console.error('Ошибка при понижении на год:', error);
            return {
                success: false,
                error: `Ошибка при понижении на год: ${error.message}`
            };
        }
    };

    return { transferToTheNextYear, transferToPrevYear };
}
