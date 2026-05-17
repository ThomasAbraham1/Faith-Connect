import { Transform } from "class-transformer";

export class DeleteRegistrationDto {
    @Transform(({ value }) => value.split(','))
    regId: string[]
}
