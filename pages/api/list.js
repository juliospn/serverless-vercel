import { connectToDatabase } from "../../lib/connectToDatabase";

export default async function handler (request, response) {
    try {
        const { mongoClient } = await connectToDatabase();
        const db = mongoClient.db("FundingRateData");
        const collection = db.collection("fundingratedatas");
        const results = await collection
            .find({})
            .project({
                timestamp:0,
                globalFundnigRate:0,
            })
            .limit(10)
            .toArray();

        response.status(200).json(results);
    }   catch(e) {
        console.error(e);
        response.status(500).json(e);
    }
}