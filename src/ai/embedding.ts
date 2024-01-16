import axios from "axios"

const embeddings = {
    embedQuery: async (text: string) => (await axios.get(`http://localhost:8030/sparse/${text}`)).data,
    embedDocuments: async (texts: string[]) => {
        const embeddings = [];

        for (const text of texts) {
            embeddings.push((await axios.get(`http://localhost:8030/sparse/${text}`)).data)
        }

        return embeddings
    }
}

export default embeddings;