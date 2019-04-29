module.exports.basicAuth = (request, response, next) => {
    const authorization = request.headers.authorization;  // 'Basic xxxx'
    console.log('authorization ', authorization);
    const encoded = authorization.replace('Basic ', '');
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [login, password] = decoded.split(':');
    if (login === 'User' && password === 'hitema') return next();
    response.sendStatus(401);
}
