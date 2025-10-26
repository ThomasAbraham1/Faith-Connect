import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useEffect } from "react";
import { toast } from "sonner";


type Role = {
    _id: string,
    name: string,
    Permissions: string[]
}
type ChurchDocumentType = {
    _id: string,
    churchName: string,
    phone: string,
    email: string,
    roles: Role[],
}
type UserDocumentType = {
    _id: string,
    churchId: string,
    userName: string,
    password: string,
    roles: string[],
}
type userContextType = {
    church: ChurchDocumentType | null,
    user: UserDocumentType | null,
    setChurch: (church: ChurchDocumentType | null) => void,
    setUser: (user: UserDocumentType | null) => void,
    setShdInitialUserQueryRun: (val: boolean) => void,
}

const userContext = createContext<userContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [shdInitialUserQueryRun, setShdInitialUserQueryRun] = React.useState(true);
    const [church, setChurch] = React.useState<ChurchDocumentType | null>(null);
    const [user, setUser] = React.useState<UserDocumentType | null>(null);
    // useEffect(() => {
    //     console.log({ church, user })
    // }, [church, user])
    useQuery({
        queryKey: ['getUserInfo'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                setChurch(response.data.data.church)
                setUser(response.data.data.user)
                // console.log(response)
                return response
            } catch (error: any) {
                toast.error(error.response.data.data.message || 'Error fetching user data')
                throw error
            }
        },
        enabled: shdInitialUserQueryRun,
    })


    return (
        <userContext.Provider value={{ church, setChurch, user, setUser, setShdInitialUserQueryRun }}>
            {children}
        </userContext.Provider>
    )
}

export const useUser = (): userContextType => {
    const context = React.useContext(userContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}