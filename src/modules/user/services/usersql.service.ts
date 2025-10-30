import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSql } from '../schemas/user.entity';

@Injectable()
export class UserSqlService {
  constructor(
    @InjectRepository(UserSql)
    private userRepository: Repository<UserSql>,
  ) { }

  async findAll(): Promise<UserSql[]> {
    const data = await this.userRepository.find();
    console.log('Raw users from DB:', data);

    return data
  }

  async create(body: CreateUserDto, res: Response, req: ExpressRequestDto) {
    const user = this.userRepository.create(body);
    await this.userRepository.save(user);
    return res.status(HttpStatus.OK).json({ message: 'User created successfully', user });
  }
}
