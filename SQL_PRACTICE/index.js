import { faker } from '@faker-js/faker';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'practice_app',
  password: "StrongPassword123"
});

try {
    const [results] = await connection.query('SHOW TABLES');
    console.log(results);
} catch (error) {
    console.log(error)
} finally {
    await connection.end();
}

// const createRandomUser = ()=> {
//   return {

//     userId: faker.string.uuid(),
//     username: faker.internet.username(),
//     email: faker.internet.email(),
//     avatar: faker.image.avatar(),
//     password: faker.internet.password(),
//     birthdate: faker.date.birthdate(),
//     registeredAt: faker.date.past(),
//   };
// }

