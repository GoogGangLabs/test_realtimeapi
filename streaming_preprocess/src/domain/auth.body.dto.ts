import { IsNotEmpty, IsString } from 'class-validator';

class AuthBodyDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export default AuthBodyDto;
