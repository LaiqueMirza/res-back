// initiate a node js application with express js, dot env, cookie parser  and more
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const path = require("path");
// const connectDB = require("./config/db");

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs,
	standardHeaders: false,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later",
	},
	JSON: true,
});
// app.use(limiter);

const corsOptions = {
	origin: process.env.CORS_ORIGIN,
	optionsSuccessStatus: 200,
	credentials: true,
};

// app.use(cors(corsOptions));
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use(express.json({ limit: "20mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
	if (req.body) {
		const originalBody = JSON.stringify(req.body);
		const htmlScriptRegex = /<[^>]*>|[<>]/;
		if (htmlScriptRegex.test(originalBody)) {
			return res
				.status(400)
				.json({
					success: false,
					error: true,
					message: "Invalid request: Unsanitized data",
				});
		}
    }
    next();
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({
            success: false,
            error: true,
            message: "Invalid JSON request",
        });
    }
    next();
});

dotenv.config({
	path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env.dev",
});

app.use("/v1", require("./src/routes/index"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        // await connectDB();
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});

