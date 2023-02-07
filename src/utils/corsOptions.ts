const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://54.83.145.51:3000',
    'https://aa4f-136-232-118-126.in.ngrok.io',
    'https://api.razorpay.com'
];

const corsOptions = {
    origin: (origin: any, callback: Function) => {
        if (allowedOrigins.indexOf(origin) !== -1 || (!origin || origin === 'null')) {

            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions;