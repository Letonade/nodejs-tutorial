const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const v1 = express.Router();
require('dotenv').config();

const { basicAuth } = require('./middleware/basic-auth');
const MessageService = require('./services/message');
const messageService = new MessageService();
const FileService = require('./services/file');
const fileService = new FileService();
const multer = require('multer');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/v1', v1);
const upload = multer({dest: 'upload/temp/'});

v1.get('/message', (request, response) => {
    messageService.getMessages()
    .then(data => {
        response.send(data);
    });
});
v1.get('/message/:id', (request, response) => {
    const id = request.params.id;
    messageService.getMessage(id)
    .then(message => {
        message ? response.send(message) : response.sendStatus(404);
    })
    .catch(error => {
        response.sendStatus(400).end(error)
    });
});
v1.post('/message', basicAuth, (request, response) => {
    const message = request.body;
    messageService.insertMessage(message)
    .then(result => {
        response.send(result);
    })
    .catch(error => {
        console.log('error occurs: ', error);
        response.sendStatus(400).end(error);
    });
});

v1.put('/message/:id', basicAuth, (request, response) => {
    const id = request.params.id;
    const message = request.body;
    messageService.updateMessage(message, id)
    .then((res) => {
        if (!res.isFind) return response.sendStatus(404);
        if (!res.isModified) return response.sendStatus(304);
        response.sendStatus(200);
    })
    .catch(error => {
        console.log('error occurs: ', error);
        response.sendStatus(400).end(error);
    });
});

v1.delete('/message/:id', basicAuth, (request, response) => {
    const id = request.params.id;
    messageService.deleteMessage(id)
    .then((isDeleted) => {
        response.sendStatus(isDeleted ? 200 : 404);
    })
    .catch(error => {
        response.sendStatus(400).end(error);
    });
});

v1.post('/file', upload.single('myFile'), (request, response) => {
    console.log('myFile? ', request.file);
    fileService.saveFileInfos(request.file)
    .then(()=>{
        response.sendStatus(200);
    })
    .catch(error => {
        console.log('error:',error);
        response.sendStatus(400).end(error);
    })
});
/*
v1.get('/file', (request, response) => {
    //response.download('./data/map.pdf');
    const fs = require('fs');
    const readStream = fs.createReadStream('./data/map.pdf');
    readStream.pipe(response);
});*/


v1.get('/file', (request, response) => {
    fileService.getFileInfos()
    .then(result => {
        response.send(result);
    })
    .catch(error => {
        console.log('error: ', error);
        response.sendStatus(500).end(error);
    });
});



app.listen(process.env.APP_PORT, () => {
    console.log('Server listening on port:', process.env.APP_PORT);
});

