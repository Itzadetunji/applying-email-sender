import nodemailer from "nodemailer";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

// Re-using subject logic
const getEmailSubject = (type: string, _company: string) => {
	switch (type) {
		case "opportunity_saw":
			return `30 seconds of your time is all I need`;
		case "love_their_work":
			return `I love your work at ${_company}`;
		case "ways_to_add_to_team":
			return `3 ways I can add to your team`;
		default:
			return `I love your work at ${_company}`;
	}
};

const sendEmails = async () => {
	// 1. Setup DB
	const db = await open({
		filename: "./agent_emails.db",
		driver: sqlite3.Database,
	});

	// 2. Setup Transporter
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	// 3. Get READY leads
	const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;
	const leads = await db.all(
		"SELECT * FROM leads WHERE status = 'READY' LIMIT ?",
		[limit],
	);
	console.log(`Found ${leads.length} leads ready to send (Limit: ${limit}).`);

	for (const lead of leads) {
		console.log(
			`Sending email to ${lead.founder_name} at ${lead.founder_email}...`,
		);

		if (!lead.founder_email || lead.founder_email === "NOT_FOUND") {
			console.log("Skipping due to invalid email.");
			await db.run("UPDATE leads SET status = 'SKIPPED' WHERE id = ?", [
				lead.id,
			]);
			console.log("");
			continue;
		}

		const mailOptions = {
			from: `"Adetunji" <${process.env.EMAIL_USER}>`,
			to: lead.founder_email,
			subject: getEmailSubject(lead.email_type, lead.company_name),
			html: lead.generated_email_body,
		};

		try {
			const info = await transporter.sendMail(mailOptions);
			console.log(`Email sent: ${info.response}`);
			await db.run(
				"UPDATE leads SET status = 'SENT', error_message = ? WHERE id = ?",
				[`MessageID: ${info.messageId}`, lead.id],
			);
		} catch (error: any) {
			console.error(`Failed to send email to ${lead.founder_email}:`, error);
			await db.run(
				"UPDATE leads SET status = 'FAILED', error_message = ? WHERE id = ?",
				[error.message, lead.id],
			);
		}
		console.log("");
	}
};

sendEmails();
