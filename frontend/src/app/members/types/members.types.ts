export type FormDataType = {
    id?: string;
    firstName: string;
    userName: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    spiritualStatus: 'BELIEVER' | 'NON_BELIEVER' | 'SEEKER' | 'UNDECIDED';
    profilePic?: FileList | null | Blob | string;
    roles: string;
    anniversaryDate: string;
    email: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    address: string;
    signature: Blob;
};

export interface membersResponseObject {
    _id: string;
    userName: string;
    password: string;
    roles: string[];
    profilePic: {
        profilePicName: string;
        profilePicPath: string;
    };
    phone: string;
    email?: string;
    spiritualStatus: string;
    dateOfBirth: string;
    anniversaryDate: string;
    address: string;
    lastName: string;
    firstName: string;
    motherName: string;
    fatherName: string;
    householdId?: { _id: string; name: string } | string;
    householdRole?: string;
}

// Column Config
export type Member = {
    _id: string;
    id: string;
    userName: string;
    password: string;
    phone: string;
    email?: string;
    role: string;
    spiritualStatus: string;
    dateOfBirth: string;
    anniversaryDate?: string;
    household?: string;
    householdRole?: string;
    rawHouseholdId?: string;
    rawHouseholdRole?: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    address: string;
    profilePicUrl: string | null;
};
