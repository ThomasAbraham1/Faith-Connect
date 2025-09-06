import api from "@/api/api"

export const twofaMemoryChecker = async () =>{
    return await api.post('/auth/twofaMemoryCheck')
} 
// export const load