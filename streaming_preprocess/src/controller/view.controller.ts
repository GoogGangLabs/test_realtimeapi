import { All, Controller, Get, Render } from '@nestjs/common';

@Controller('')
class ViewController {
  @Get()
  @Render('index.html')
  index() {
    return { environment: process.env.NODE_ENV };
  }

  @Get('/entrypoint')
  @Render('entrypoint.html')
  entrypoint() {
    return;
  }

  @All(':page')
  @Render('404.html')
  notFound() {
    return;
  }
}

export default ViewController;
