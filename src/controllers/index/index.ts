import { Controller, Get, Redirect, Render, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
@ApiExcludeController()
export class IndexController {
  constructor() {}


  @Get()
  //@Redirect("/swagger")
  @Render("index")
  async index(@Res() response: Response) {}
}