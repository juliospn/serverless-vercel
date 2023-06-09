import { connectToDatabase } from "../../lib/connectToDatabase";

export default async function handler(request, response) {
  try {
    const { mongoClient } = await connectToDatabase();
    const db = mongoClient.db("FundingRateData");
    const collection = db.collection("fundingratedatas");

    const results = await collection.find({}).toArray();

    if (results.length >= 144) {
      // Ordenar os resultados pela propriedade "timestamp" em ordem ascendente
      results.sort((a, b) => a.timestamp - b.timestamp);

      // Excluir o registro mais antigo
      await collection.deleteOne({ _id: results[0]._id });

      // Recuperar os últimos 336 registros novamente
      const updatedResults = await collection
        .find({})
        .project({
          timestamp: 1,
          globalFundingRate: 1,
          _id: 0
        })
        .toArray();

      response.status(200).json(updatedResults);
    } else {
      // Se a quantidade de registros for menor que 336, retornar os resultados existentes
      response.status(200).json(results);
    }
  } catch (e) {
    console.error(e);
    response.status(500).json(e);
  }
}
