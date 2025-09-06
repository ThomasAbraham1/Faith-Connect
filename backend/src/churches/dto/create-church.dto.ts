import { IsNotEmpty } from "class-validator";

export class CreateChurchDto {
    @IsNotEmpty()
    churchName: string;
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    phone: string;
}
