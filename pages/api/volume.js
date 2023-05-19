import { connectToDatabase } from "../../lib/connectToDatabase";

export default async function handler(request, response) {
  try {
    const { mongoClient } = await connectToDatabase();
    const db = mongoClient.db("FundingRateData");
    const collection = db.collection("volumedatas");
    const results = await collection
      .find({})
      .project({ _id: 0 }) // Remove o campo _id da resposta
      .toArray();

    const formattedResults = results.map((result) => ({
      exchangeName: result.exchangeName,
      volume: result.volume,
    }));

    response.status(200).json(formattedResults);
  } catch (e) {
    console.error(e);
    response.status(500).json(e);
  }
}
