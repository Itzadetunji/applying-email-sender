import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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

		console.log("Status:", response.status);
		console.log("Data:", JSON.stringify(response.data, null, 2));

		if (response.data && response.data.email) {
			console.log(`Found email: ${response.data.email}`);
			return response.data.email;
		} else {
			console.log("Email not found in response data.");
		}
		return null;
	} catch (error: any) {
		console.error(`Error finding email for ${name}:`, error.message);
		if (error.response) {
			console.log(
				"Error Response Data:",
				JSON.stringify(error.response.data, null, 2),
			);
		}
		return null;
	}
};

findEmail("Daniel Chatfield", "monzo.com");
