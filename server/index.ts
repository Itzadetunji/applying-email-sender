import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import morgan from "morgan";
import nodemailer from "nodemailer";
import { type Database, open } from "sqlite";
import sqlite3 from "sqlite3";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Database setup
let db: Database;

(async () => {
	try {
		db = await open({
			filename: "./emails.db",
			driver: sqlite3.Database,
		});

		await db.exec(`
      CREATE TABLE IF NOT EXISTS sent_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT,
        company TEXT,
        email_type TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        error_message TEXT
      )
    `);
		console.log("Connected to SQLite database");
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
})();

// Email Transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Email Templates
const getOpportunitySawBody = (name: string, company: string) => {
	return `<p>Hey ${name},</p>
<p>I saw an opportunity for a software engineer for ${company} and I have applied but decided to reach out to show my genuine interest in the opportunity.</p>
<p>My name is Adetunji Adeyinka. I am a software engineer with 5 years of experience and here are three ways I can add to your team.</p>
<ol>
<li>I am a full-stack developer with experience building systems</li>
<li>I am a cross-path problem solver, and if there is a need for me to jump on a different stack to solve an issue, I am available</li>
<li>I am an avid team player and love working with incredible teams</li>
</ol>
<p>Here are a couple of my recent projects</p>
<ul>
<li><a href="https://migranium.com" target="_blank" rel="noopener noreferrer">Migranium</a></li>
<li><a href="https://eva.world" target="_blank" rel="noopener noreferrer">Eva World</a></li>
<li><a href="https://hemline.studio" target="_blank" rel="noopener noreferrer">Hemline Studio</a></li>
</ul>
<p>Thanks for your time. I would love to hear from you.</p>
<p>Adetunji</p>
<p>LinkedIn: <a href="https://linkedin.com/in/itzadetunji" target="_blank" rel="noopener noreferrer">https://linkedin.com/in/itzadetunji</a><br>
Portfolio: <a href="https://contra.com/itzadetunji" target="_blank" rel="noopener noreferrer">https://contra.com/itzadetunji</a><br>
Resume: <a href="https://www.icloud.com/iclouddrive/0806AErjem_6L2sfJhxX6qD0g#Adetunji_Adeyinka__Resume_-_December_2025" target="_blank" rel="noopener noreferrer">https://www.icloud.com/iclouddrive/0806AErjem_6L2sfJhxX6qD0g#Adetunji_Adeyinka__Resume_-_December_2025</a></p>`;
};

const getLoveTheirWorkBody = (name: string, company: string) => {
	return `<p>Hey ${name},</p>
<p>I know you’re really busy, and I would love to just have 30 seconds of your time.</p>
<p>I have been following your work at ${company}, and I really love what the company does and it’s approach in solving a real need in tech which I resonate with and I would love to be part of such a dynamic team.</p>
<p>I am able to move within technologies, as I have experience in full-stack web development and mobile development.</p>
<p>I have worked on</p>
<ul>
<li><a href="https://migranium.com">Migranium</a>: A Canadian based healthcare startup to streamline health services</li>
<li><a href="https://eva.world">Eva World</a>: Global Esim for users around the world</li>
<li><a href="https://hemline.studio">Hemline Studio</a>: An Idea turned into app for fashion designers to manage their workflow</li>
</ul>
<p>Thanks for your time. I would love to hear from you.</p>
<p>Adetunji</p>
<p>LinkedIn: <a href="https://linkedin.com/in/itzadetunji">https://linkedin.com/in/itzadetunji</a></p>`;
};

const getWaysToAddToTeamBody = (name: string, company: string) => {
	return `<p>Hey ${name},</p>
<p>I know you’re really busy, and I would love to just have 30 seconds of your time.</p>
<p>My name is Adetunji Adeyinka. I am a software engineer with 5 years of experience and here are three ways I can add to your teamm at ${company}</p>
<ol>
<li>I am a full-stack developer with experience building systems</li>
<li>I am a cross-path problem solver, and if there is a need for me to jump on a different stack to solve an issue, I am available</li>
<li>I am an avid team player and love working with incredible teams</li>
</ol>
<p>Here are a couple of my recent projects</p>
<ul>
<li><a href="https://migranium.com" target="_blank" rel="noopener noreferrer">Migranium</a></li>
<li><a href="https://eva.world" target="_blank" rel="noopener noreferrer">Eva World</a></li>
<li><a href="https://hemline.studio" target="_blank" rel="noopener noreferrer">Hemline Studio</a></li>
</ul>
<p>Thanks for your time. I would love to hear from you.</p>
<p>Adetunji</p>
<p>LinkedIn: <a href="https://linkedin.com/in/itzadetunji" target="_blank" rel="noopener noreferrer">https://linkedin.com/in/itzadetunji</a><br>
Portfolio: <a href="https://contra.com/itzadetunji" target="_blank" rel="noopener noreferrer">https://contra.com/itzadetunji</a><br>
Resume: <a href="https://www.icloud.com/iclouddrive/0806AErjem_6L2sfJhxX6qD0g#Adetunji_Adeyinka__Resume_-_December_2025" target="_blank" rel="noopener noreferrer">https://www.icloud.com/iclouddrive/0806AErjem_6L2sfJhxX6qD0g#Adetunji_Adeyinka__Resume_-_December_2025</a></p>`;
};

const getDefaultBody = (name: string, company: string) => {
	return getWaysToAddToTeamBody(name, company);
};

const getEmailBody = (type: string, name: string, company: string) => {
	switch (type) {
		case "opportunity_saw":
			return getOpportunitySawBody(name, company);
		case "love_their_work":
			return getLoveTheirWorkBody(name, company);
		case "ways_to_add_to_team":
			return getWaysToAddToTeamBody(name, company);
		default:
			return getDefaultBody(name, company);
	}
};

const getEmailSubject = (type: string, _company: string) => {
	switch (type) {
		case "opportunity_saw":
			return `30 seconds of your time is all I need`;
		case "love_their_work":
			return `30 seconds of your time is all I need`;
		case "ways_to_add_to_team":
			return `30 seconds of your time is all I need`;
		default:
			return `30 seconds of your time is all I need`;
	}
};

// Endpoints

// 1. Check if server is running
app.get("/", (_: Request, res: Response) => {
	res.json({ status: "Server is running" });
});

// 2. Send email
app.post("/send-email", async (req: Request, res: Response): Promise<any> => {
	const { name, emails, company, type } = req.body;

	if (
		!name ||
		!emails ||
		!Array.isArray(emails) ||
		emails.length === 0 ||
		!company ||
		!type
	) {
		return res
			.status(400)
			.json({ error: "Missing required fields or invalid emails array" });
	}

	const validTypes = [
		"opportunity_saw",
		"love_their_work",
		"ways_to_add_to_team",
	];
	if (!validTypes.includes(type)) {
		return res.status(400).json({ error: "Invalid email type" });
	}

	const results = [];

	for (const email of emails) {
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: getEmailSubject(type, company),
			html: getEmailBody(type, name, company),
		};

		try {
			const info = await transporter.sendMail(mailOptions);
			console.log(`Email sent to ${email}: ${info.response}`);

			if (db) {
				await db.run(
					"INSERT INTO sent_emails (recipient_email, recipient_name, company, email_type, status) VALUES (?, ?, ?, ?, ?)",
					[email, name, company, type, "SENT"],
				);
			}

			results.push({ email, status: "sent", messageId: info.messageId });
		} catch (error: any) {
			console.error(`Error sending email to ${email}:`, error);

			if (db) {
				await db.run(
					"INSERT INTO sent_emails (recipient_email, recipient_name, company, email_type, status, error_message) VALUES (?, ?, ?, ?, ?, ?)",
					[email, name, company, type, "FAILED", error.message],
				);
			}

			results.push({ email, status: "failed", error: error.message });
		}
	}

	res.json({ message: "Email processing complete", results });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
