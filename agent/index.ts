import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import fs from "fs";
import { parse } from "csv-parse/sync";
import axios from "axios";
import dotenv from "dotenv";
import morgan from "morgan"; // Imported as requested

dotenv.config();

// Define types for Company
interface Company {
	Company: string;
	Website: string;
	"One line": string;
	Size: string;
	Sector: string;
	Batch: string;
	Status: string;
	Tags: string;
}

// Database setup
let db: Database;

const initDb = async () => {
	try {
		db = await open({
			filename: "./agent_emails.db",
			driver: sqlite3.Database,
		});

		// Replicating server DB structure, adding fields for found data
		await db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        company_website TEXT,
        founder_name TEXT,
        founder_linkedin TEXT,
        founder_email TEXT,
        email_type TEXT,
        generated_email_body TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT
      )
    `);
		console.log("Connected to SQLite database");
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};

// Email Templates (Copied and adapted from server)
const getLoveTheirWorkBody = (name: string, company: string) => {
	return `<p>Hey ${name},</p>
<p>I know you're really busy, and I would love to just have 30 seconds of your time.</p>
<p>I have been following your work at ${company}, and I really love what the company does and it's approach in solving a real need in tech which I resonate with and I would love to be part of such a dynamic team.</p>
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
<p>I know you're really busy, and I would love to just have 30 seconds of your time.</p>
<p>My name is Adetunji Adeyinka. I am a software engineer with 5 years of experience and here are three ways I can add to your team at ${company}.</p>
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

// Step 1: Serper Search
const findFounder = async (company: Company) => {
	const query = `site:linkedin.com/in (engineer OR developer OR CTO) ${company.Website}`;
	console.log(
		`Searching for founder of ${company.Company} with query: ${query}`,
	);

	try {
		const response = await axios.post(
			"https://google.serper.dev/search",
			{
				q: query,
			},
			{
				headers: {
					"X-API-KEY": process.env.SERPER_API_KEY,
					"Content-Type": "application/json",
				},
			},
		);

		if (response.data.organic && response.data.organic.length > 0) {
			// Try to extract name from title
			// Title format usually: "Name - Title - Company | LinkedIn"
			const firstResult = response.data.organic[0];
			const title = firstResult.title;
			const link = firstResult.link;

			// Basic heuristic to get name: Take string before " - " or " | "
			const namePart = title.split(" - ")[0].split(" | ")[0];
			// Clean up name part (remove credentials like PHD, etc if simple)
			const cleanName = namePart.trim();

			console.log(`Found potential founder: ${cleanName} (${link})`);
			return { name: cleanName, link: link };
		}
		return null;
	} catch (error: any) {
		console.error(`Error searching for ${company.Company}:`, error.message);
		return null;
	}
};

// Step 2: Findymail Search
const findEmail = async (name: string, domain: string) => {
	console.log(`Finding email for ${name} @ ${domain}`);
	try {
		const response = await axios.post(
			"https://app.findymail.com/api/search/name",
			{
				name: name,
				domain: domain,
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.FINDY_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (response.data) {
			const email =
				response.data.email ||
				(response.data.contact && response.data.contact.email);
			if (email) {
				console.log(`Found email: ${email}`);
				return email;
			}
		}
		return null;
	} catch (error: any) {
		// Findymail might return 404 or other errors if not found
		console.error(`Error finding email for ${name}:`, error.message);
		return null;
	}
};

// Main Process
const main = async () => {
	if (!process.env.SERPER_API_KEY || !process.env.FINDY_API_KEY) {
		console.error("Missing SERPER_API_KEY or FINDY_API_KEY in .env");
		process.exit(1);
	}

	await initDb();

	// Read CSV
	const csvContent = fs.readFileSync("./companies.csv", "utf-8");
	const records: Company[] = parse(csvContent, {
		columns: true,
		skip_empty_lines: true,
	});

	// Get limit from arg, default 3.
	const limit = process.argv[2] ? parseInt(process.argv[2]) : 3;
	let processedCount = 0;

	console.log(
		`Processing companies from the top (Limit: ${limit} active/valid)...`,
	);

	for (const company of records) {
		if (processedCount >= limit) {
			console.log(`Reached limit of ${limit} processed companies.`);
			break;
		}

		console.log(`\n--- Processing ${company.Company} ---`);

		// Check if exists in DB
		const existing = await db.get(
			"SELECT id FROM leads WHERE company_name = ?",
			[company.Company],
		);
		if (existing) {
			console.log(`Skipping ${company.Company}: Already processed.`);
			continue;
		}

		// Check Status
		// User: "make sure to check if they are still active or have not been acuired - Acquired & Inactive "
		// Logic: if status is NOT active, skip. Or if it IS Inactive or Acquired, skip.
		// The check should pass if they ARE active and NOT acquired.
		const status = company.Status || "";
		if (status === "Inactive" || status.includes("Acquired")) {
			console.log(`Skipping ${company.Company}: Status is ${status}`);
			continue;
		}

		processedCount++;

		// 1. Find Founder
		const founder = await findFounder(company);
		if (!founder) {
			console.log("No founder found. Skipping.");
			continue;
		}

		// Clean domain from website URL
		let domain = company.Website.replace(/^https?:\/\//, "").replace(
			/^www\./,
			"",
		);
		domain = domain.split("/")[0]; // simple domain extraction

		// 2. Find Email
		const email = await findEmail(founder.name, domain);

		if (!email) {
			console.log(
				`No email found for ${founder.name}. Skipping database entry.`,
			);
			continue;
		}

		// 3. Generate Messages & Store
		const emailTypes = ["love_their_work", "ways_to_add_to_team"];
		const selectedType =
			emailTypes[Math.floor(Math.random() * emailTypes.length)];
		console.log(`Selected email type: ${selectedType}`);

		// Use first name for email body
		const firstName = founder.name.split(" ")[0];

		let body = "";
		if (selectedType === "love_their_work") {
			body = getLoveTheirWorkBody(firstName, company.Company);
		} else {
			body = getWaysToAddToTeamBody(firstName, company.Company);
		}

		// Store in DB
		try {
			await db.run(
				`INSERT INTO leads (
                    company_name, company_website, founder_name, founder_linkedin, 
                    founder_email, email_type, generated_email_body, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					company.Company,
					company.Website,
					founder.name,
					founder.link,
					email,
					selectedType,
					body,
					"READY",
				],
			);
			console.log(`Saved lead for ${company.Company} [${selectedType}]`);
		} catch (err) {
			console.error("Error saving to DB:", err);
		}
	}
};

main();
