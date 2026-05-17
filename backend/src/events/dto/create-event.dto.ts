import { IsArray, IsBoolean, IsDate, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMaxSize } from "class-validator"
import { Transform, Type } from "class-transformer"
import { FormFieldDto } from "./form-field.dto"

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    eventName: string
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date
    
    @IsOptional()
    @Transform(({ value }) => (value === "" || value === "null" || value === null) ? undefined : new Date(value))
    @IsDate()
    endDate?: Date

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "" || value === "null" || value === null) return undefined;
        if (typeof value === 'string') return value.split(',').filter(Boolean);
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    invitedGroups?: string[]

    @IsString()
    @IsNotEmpty()
    eventLocation: string
    @IsString()
    @IsNotEmpty()
    description: string
    @IsString()
    @IsNotEmpty()
    organizer: string

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isRecurring?: boolean

    @IsOptional()
    @Transform(({ value }) => (value === "" || value === "null" || value === null) ? undefined : value)
    @IsString()
    recurrenceType?: string

    @IsOptional()
    @Transform(({ value }) => (value === "" || value === "null" || value === null) ? undefined : value)
    @IsString()
    recurrenceDay?: string

    @IsOptional()
    @Transform(({ value }) => (value === "" || value === "null" || value === null) ? undefined : value)
    @IsDateString()
    recurrenceEndDate?: Date

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    registrationOpen?: boolean;

    @IsOptional()
    @IsString()
    churchId?: string;

    @IsOptional()
    @IsString()
    coverImageUrl?: string;

    @IsOptional()
    @IsString()
    registrationFee?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10, { message: 'Maximum 10 custom fields allowed' })
    @ValidateNested({ each: true })
    @Type(() => FormFieldDto)
    formFields?: FormFieldDto[];
}
