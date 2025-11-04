import { tr } from "@faker-js/faker";
import { INestApplication, SetMetadata, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function appCreate(app: INestApplication):void{

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions:{
                enableImplicitConversion: true,
            }
        })
    )

    const config = new DocumentBuilder().setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app,config);
    SwaggerModule.setup('api',app,document);

    // app.enableCors()

}