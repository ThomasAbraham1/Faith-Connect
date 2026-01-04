export type FormDataType = {
    id?: string;
    firstName: string;
    userName: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    spiritualStatus: 'BELIEVER' | 'NON_BELIEVER' | 'SEEKER' | 'UNDECIDED';
    profilePic?: FileList | null | Blob;
    roles: string;
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
    spiritualStatus: string;
    dateOfBirth: string;
    address: string;
    lastName: string;
    firstName: string;
    motherName: string;
    fatherName: string;
}

// Column Config
export type Member = {
    id: string;
    userName: string;
    password: string;
    phone: string;
    role: string;
    spiritualStatus: string;
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    address: string;
    profilePicUrl: string | null;
};
