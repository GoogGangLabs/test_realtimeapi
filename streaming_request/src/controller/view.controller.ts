import { All, Controller, Get, Render } from '@nestjs/common';

@Controller('/')
class ViewController {
  @Get()
  @Render('index.ejs')
  index() {
    return;
  }

  @All(':page')
  @Render('404.ejs')
  notFound() {
    return;
  }
}

export default ViewController;
