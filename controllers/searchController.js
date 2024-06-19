require("dotenv").config();
// const Fuse = require("fuse.js");
const OpenAI = require("openai");
const Item = require("../models/item");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.getSearchBox = (req, res) => {
  res.render("searchBox");
};

module.exports.getSearchResults = async (req, res) => {
  const { searchWord } = req.query;
  const items = await Item.find({});

  // // Fuse.js options
  // const options = {
  //   keys: ["title", "category", "description"],
  //   threshold: 0.3, // Adjust this value to make the search more or less fuzzy
  // };

  // const fuse = new Fuse(items, options);
  // const results = fuse.search(searchWord).map((result) => result.item);

  // Generate embeddings for items with field boosting
  const itemEmbeddings = await Promise.all(
    items.map(async (item) => {
      const titleResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: item.title,
      });
      const categoryResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: item.category,
      });
      const descriptionResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: item.description,
      });

      return {
        item,
        embedding: {
          title: titleResponse.data[0].embedding,
          category: categoryResponse.data[0].embedding,
          description: descriptionResponse.data[0].embedding,
        },
      };
    })
  );

  // Generate embedding for search query
  const queryResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: searchWord,
  });
  const queryEmbedding = queryResponse.data[0].embedding;

  // Calculate similarity scores with field boosting
  const similarities = itemEmbeddings.map(({ item, embedding }) => {
    const titleSimilarity = cosineSimilarity(queryEmbedding, embedding.title);
    const categorySimilarity = cosineSimilarity(
      queryEmbedding,
      embedding.category
    );
    const descriptionSimilarity = cosineSimilarity(
      queryEmbedding,
      embedding.description
    );

    // Weighted score: title and category are more important
    const weightedSimilarity =
      0.4 * titleSimilarity +
      0.5 * categorySimilarity +
      0.1 * descriptionSimilarity;
    return { item, similarity: weightedSimilarity };
  });

  // Sort items by similarity score and apply threshold
  similarities.sort((a, b) => b.similarity - a.similarity);
  const similarityThreshold = 0.85;
  const results = similarities
    .filter(({ similarity }) => similarity >= similarityThreshold)
    .map(({ item }) => item);

  // Debugging: Print similarity scores for validation
  similarities.forEach(({ item, similarity }) => {
    console.log(`Item: ${item.title}, Similarity: ${similarity}`);
  });

  res.render("searchResults", { items: results, searchWord });
};

// Function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}
