import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMaxSize } from "class-validator"
import { Transform, Type } from "class-transformer"
import { FormFieldDto } from "./form-field.dto"

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    eventName: string
    @IsString()
    @IsNotEmpty()
    eventDate: Date
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
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsString()
    recurrenceType?: string

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsString()
    recurrenceDay?: string

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsDateString() // Using IsDateString because frontend sends JSON
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
    @IsArray()
    @ArrayMaxSize(10, { message: 'Maximum 10 custom fields allowed' })
    @ValidateNested({ each: true })
    @Type(() => FormFieldDto)
    formFields?: FormFieldDto[];
}
