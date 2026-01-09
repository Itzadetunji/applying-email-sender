import { open } from "sqlite";
import sqlite3 from "sqlite3";

(async () => {
	const db = await open({
		filename: "./agent_emails.db",
		driver: sqlite3.Database,
	});

	const rows = await db.all("SELECT * FROM leads");
	console.log(JSON.stringify(rows, null, 2));
})();
