const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    source: {
        type: String, // e.g., "FRA Act 2006", "Rules 2008"
        required: true
    },
    category: {
        type: String, // e.g., "Legal", "Scheme", "Guideline"
        default: "General"
    },
    embedding: {
        type: [Number], // Vector embedding
        required: true,
        index: 'vector' // Special index for vector search (requires Atlas Search setup)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
