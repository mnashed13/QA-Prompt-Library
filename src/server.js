const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

// Function to read documentation files
async function readDocFile(filename) {
	try {
		const content = await fs.readFile(
			path.join(__dirname, '..', filename),
			'utf8'
		);
		return { filename, content };
	} catch (error) {
		console.error(`Error reading ${filename}:`, error);
		return { filename, error: 'File not found or unable to read' };
	}
}

// Get all documentation files
app.get('/api/docs', async (req, res) => {
	try {
		const files = [
			'mint.json',
			'introduction.mdx',
			'index.mdx',
			'docs.json',
			'quickstart.mdx',
			'bug-reporting.mdx',
			'README.md',
			'test-planning.mdx',
			'automation-testing.mdx',
			'deployment.mdx',
		];

		const docs = await Promise.all(files.map(readDocFile));
		res.json(docs);
	} catch (error) {
		res.status(500).json({ error: 'Failed to retrieve documentation' });
	}
});

// Get specific documentation file by name
app.get('/api/docs/:filename', async (req, res) => {
	try {
		const { filename } = req.params;
		const doc = await readDocFile(filename);

		if (doc.error) {
			return res.status(404).json(doc);
		}

		res.json(doc);
	} catch (error) {
		res.status(500).json({ error: 'Failed to retrieve documentation' });
	}
});

// Search through documentation
app.get('/api/search', async (req, res) => {
	try {
		const { query } = req.query;

		if (!query) {
			return res.status(400).json({ error: 'Search query is required' });
		}

		const files = [
			'mint.json',
			'introduction.mdx',
			'index.mdx',
			'docs.json',
			'quickstart.mdx',
			'bug-reporting.mdx',
			'README.md',
			'test-planning.mdx',
			'automation-testing.mdx',
			'deployment.mdx',
		];

		const results = [];

		for (const file of files) {
			const content = await readDocFile(file);
			if (
				!content.error &&
				content.content.toLowerCase().includes(query.toLowerCase())
			) {
				results.push({
					filename: file,
					content: content.content,
				});
			}
		}

		res.json(results);
	} catch (error) {
		res.status(500).json({ error: 'Failed to search documentation' });
	}
});

app.listen(port, () => {
	console.log(`Documentation API running on port ${port}`);
});
