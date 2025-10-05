import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
}



export class AttendanceRecordDto {
    @IsString()
    @IsNotEmpty()
    memberId: string;

    @IsEnum(AttendanceStatus, {
        message: 'status must be one of PRESENT and ABSENT',
    })
    status: AttendanceStatus;
}

export class CreateAttendanceDto {
    @IsString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    churchId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto) // Needed for nested validation
    records: AttendanceRecordDto[];
}