export default function useAddStudent() {
    const addStudent = async (studentObject) => {
        const { data, error } = await window.electronAPI.addStudent(studentObject);
        return { data, error };
    };

    return {
        addStudent,
    };
}
