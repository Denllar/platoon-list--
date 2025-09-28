export default function useUpdateStudent() {
    const updateStudent = async (id, updatedStudent) => {
        const { data, error } = await window.electronAPI.updateStudent(id, updatedStudent);
        return { data, error };
    };

    return {
        updateStudent,
    };
}
