export default function useDeleteStudent() {
    const deleteStudent = async (id) => {
        const result = await window.electronAPI.deleteStudent(id);
        return result;
    };

    return {
        deleteStudent,
    };
}
