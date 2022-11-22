const express = require('express');
const {fileServices} = require("./services");


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Запит юзерів у БД
app.get('/users', async (req, res) => {
    const users = await fileServices.reader();

    res.json(users);
})

// Додавання юзерів у БД
app.post('/users', async (req, res) => {
    const userInfo = req.body;

    if (userInfo.name.length < 3 || typeof userInfo.name  !== 'string') {
        return res.status(400).json(`User not found`);
    }
    if (userInfo.age < 0 || Number.isNaN(+userInfo.age)) {
        return res.status(400).json(`Wrong age`);
    }

    const users = await fileServices.reader();
    const user = {
        id: users[users.length -1].id + 1,
        name: userInfo.name,
        age: userInfo.age
    };

    users.push(user);

    await fileServices.writer(users);

    res.status(201).json(user);
})

// Запит конкретного юзера у БД
app.get('/users/:userId', async (req, res) => {
    const {userId} = req.params;
    const users = await fileServices.reader();
    const user = users.find((u) => u.id === +userId);

    if (!user) {
        return res.status(300).json(`User ${userId} not found`);
    }

    res.json(user);
})

// Редагування конкретного юзера в БД
app.put('/users/:userId', async (req, res) => {
    const newUserInfo = req.body;
    const {userId} = req.params;
    const users = await fileServices.reader();
    const index = users.findIndex((u) => u.id === +userId);

    if (index === -1) {
        return res.status(300).json(`User ${userId} not found`);
    }

    users[index] = {...users[index], ...newUserInfo};
    await fileServices.writer(users);

    res.status(201).json(users[index]);
})

// Видалення конкретного юзера з БД
app.delete('/users/:userId', async (req, res) => {
    const {userId} = req.params;
    const users = await fileServices.reader();
    const index = users.findIndex((u) => u.id === +userId);

    if (index === -1) {
        return res.status(300).json(`User ${userId} not found`);
    }

    users.splice(index, 1);
    await fileServices.writer(users);

    res.sendStatus(204);
})


app.get('/', (req, res) => {
    res.json('Welcome');
})


app.listen(5000, () => {
    console.log('Server listen 5000!');
})