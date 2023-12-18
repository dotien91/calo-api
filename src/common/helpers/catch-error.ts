import {
    BadRequestException,
    ForbiddenException,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  
  /**
   * @author Tony Vu
   * @function catchError
   * @param error 
   */
  export const catchError = (error: any) => {
    switch (error.status) {
      case HttpStatus.BAD_REQUEST:
        throw new BadRequestException(error.message);
        break;
  
      case HttpStatus.UNAUTHORIZED:
        throw new UnauthorizedException(error.message);
        break;
      case HttpStatus.FORBIDDEN:
        throw new ForbiddenException(error.message);
        break;
  
      case HttpStatus.NOT_FOUND:
        throw new NotFoundException(error.message);
        break;
  
      default:
        throw new BadRequestException(error.message);
        break;
    }
  };
  