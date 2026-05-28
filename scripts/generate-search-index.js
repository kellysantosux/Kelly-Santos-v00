#!/usr/bin/env node
/*
 * generate-search-index.js
 * Scans .html files under the workspace, extracts title and a short snippet,
 * and writes `search-index.json` to the workspace root.
 *
 * Usage (from workspace root):
 *   node ./scripts/generate-search-index.js
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outFile = path.join(root, 'search-index.json');

function walk(dir) {
	const results = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	for (const dirent of list) {
		const full = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			// skip node_modules and .git
			if (dirent.name === 'node_modules' || dirent.name === '.git') continue;
			results.push(...walk(full));
		} else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.html')) {
			results.push(full);
		}
	}
	return results;
}

function extract(html) {
	// title
	const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
	const title = titleMatch ? titleMatch[1].trim() : '';
	// meta description
	const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
	const desc = descMatch ? descMatch[1].trim() : '';
	// first H1 or first paragraph as snippet
	const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
	const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
	const snippet = desc || (h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : (pMatch ? pMatch[1].replace(/<[^>]+>/g, '').trim() : ''));
	return { title, snippet };
}

function toUrl(filePath) {
	const rel = path.relative(root, filePath).replace(/\\/g, '/');
	return '/' + rel;
}

function main() {
	console.log('Scanning HTML files...');
	const files = walk(root);
	const items = [];
	for (const f of files) {
		try {
			const contents = fs.readFileSync(f, 'utf8');
			const data = extract(contents);
			// skip index-like blank titles
			const title = data.title || path.basename(f);
			items.push({ title: title, url: toUrl(f), snippet: data.snippet || '' });
		} catch (e) {
			console.error('Failed to read', f, e && e.message);
		}
	}

	fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf8');
	console.log('Wrote', outFile, '(', items.length, 'entries)');
}

main();
