import { faker } from '@faker-js/faker';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: "mysql123"
});

const createRandomUser = ()=> {
  return {
    
    userId: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

