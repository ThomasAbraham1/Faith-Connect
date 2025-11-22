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