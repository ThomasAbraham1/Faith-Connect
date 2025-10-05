import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import type { formDataType } from ".";


export const attendanceFormSubmitHandler = async (data: formDataType) => {
    try {
        console.log(data)
        const result = await api.post('/attendance', data)
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}
