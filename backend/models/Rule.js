import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema(
    {
        ruleString: { type: String, required: true },
        ast: { type: Object, required: true },
    },
    { timestamps: true } // Enable createdAt and updatedAt timestamps
);

export const Rule = mongoose.model('Rule', ruleSchema);
