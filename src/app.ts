import express from 'express';
import * as swaggerUi from 'swagger-ui-express';

import swaggerDocument from '../swagger.json';
import * as dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';



const app = express();
app.use(express.json());

app.use('/api/users', userRoutes); // ✅ PASANG ROUTER, bukan HANDLER
app.use('/api/companies', companyRoutes);


app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
