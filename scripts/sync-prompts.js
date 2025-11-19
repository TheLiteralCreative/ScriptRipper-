#!/usr/bin/env node

/**
 * Prompt Synchronization Script
 *
 * This script syncs prompts from a markdown file to:
 * 1. Database (via admin API)
 * 2. JSON files (web/src/app/configure/prompts/)
 * 3. API scripts (api/scripts/)
 * 4. PROMPT_DESCRIPTIONS in configure page
 *
 * Usage: node scripts/sync-prompts.js <path-to-markdown-file>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8000';
const BASE_DIR = path.join(__dirname, '..');

// Paths
const PATHS = {
  webPromptsDir: path.join(BASE_DIR, 'web/src/app/configure/prompts'),
  apiScriptsDir: path.join(BASE_DIR, 'api/scripts'),
  configurePage: path.join(BASE_DIR, 'web/src/app/configure/page.tsx'),
  archiveDir: path.join(BASE_DIR, 'prompt-archive/versions'),
};

/**
 * Parse markdown file to extract prompts
 */
function parseMarkdownPrompts(markdownPath) {
  console.log(`📖 Reading markdown file: ${markdownPath}`);
  const content = fs.readFileSync(markdownPath, 'utf-8');

  const prompts = [];

  // Split by section headers (##)
  const sections = content.split(/^## /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0].trim();

    // Skip if not a lettered section (A), B), etc.)
    if (!/^[A-Z]\)/.test(header)) continue;

    let taskName = '';
    let promptJson = '';
    let description = { what: '', why: '', how: '', who: '' };
    let inJsonBlock = false;
    let inDescriptionBlock = false;
    let currentDescField = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Extract JSON block
      if (line.includes('"task_name":')) {
        const match = line.match(/"task_name":\s*"([^"]+)"/);
        if (match) taskName = match[1];
      }

      if (line.trim() === '{') {
        inJsonBlock = true;
        promptJson = '{\n';
        continue;
      }

      if (inJsonBlock) {
        promptJson += line + '\n';
        if (line.trim() === '}') {
          inJsonBlock = false;
        }
      }

      // Extract website description
      if (line.startsWith('### Website description')) {
        inDescriptionBlock = true;
        continue;
      }

      if (inDescriptionBlock) {
        if (line.startsWith('What:')) {
          currentDescField = 'what';
          description.what = line.replace('What:', '').trim();
        } else if (line.startsWith('Why:')) {
          currentDescField = 'why';
          description.why = line.replace('Why:', '').trim();
        } else if (line.startsWith('How:')) {
          currentDescField = 'how';
          description.how = line.replace('How:', '').trim();
        } else if (line.startsWith('Who:')) {
          currentDescField = 'who';
          description.who = line.replace('Who:', '').trim();
        } else if (line.trim() && currentDescField && !line.startsWith('##')) {
          // Continuation of previous field
          description[currentDescField] += ' ' + line.trim();
        }
      }
    }

    // Try to parse the JSON to extract the actual prompt
    let actualPrompt = '';
    try {
      const parsed = JSON.parse(promptJson);
      actualPrompt = parsed.prompt || '';
      if (!taskName) taskName = parsed.task_name || '';
    } catch (e) {
      console.warn(`⚠️  Failed to parse JSON for section ${header}:`, e.message);
    }

    if (taskName && actualPrompt) {
      prompts.push({
        task_name: taskName,
        prompt: actualPrompt,
        description: description,
        category: inferCategory(taskName),
      });
    }
  }

  console.log(`✅ Parsed ${prompts.length} prompts from markdown`);
  return prompts;
}

/**
 * Infer category from task name
 */
function inferCategory(taskName) {
  const presentationKeywords = [
    'expanded outline',
    'metadata',
    'nuggets',
    'dependency',
    'activation',
    'credibility',
    'health check',
    'takeaways',
    'terminology',
    'tutorial',
    'how-to',
  ];

  const lowerName = taskName.toLowerCase();
  for (const keyword of presentationKeywords) {
    if (lowerName.includes(keyword)) {
      return 'presentations';
    }
  }

  return 'meetings';
}

/**
 * Archive current prompts
 */
function archiveCurrentPrompts() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const archivePath = path.join(PATHS.archiveDir, timestamp);

  console.log(`📦 Archiving current prompts to: ${archivePath}`);

  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(archivePath, { recursive: true });
  }

  // Archive web JSON files
  const webFiles = ['meetings_prompts.json', 'presentations_prompts.json'];
  for (const file of webFiles) {
    const srcPath = path.join(PATHS.webPromptsDir, file);
    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf-8');
      fs.writeFileSync(path.join(archivePath, file), content);
    }
  }

  // Create a changes.md file
  const changesPath = path.join(archivePath, 'changes.md');
  const changesContent = `# Prompt Changes - ${timestamp}

## Summary

Bulk update from tightened prompts markdown file.

## Modified Prompts

All prompts updated to new tightened format with 4-part structure:
1. Role & Goal
2. Core Instruction
3. Formatting Constraints
4. Negative Constraints

## Added Prompts

- Tutorial Step-Down & Actionable How-To Extractor

## Removed Prompts

None
`;

  fs.writeFileSync(changesPath, changesContent);
  console.log(`✅ Archived to ${archivePath}`);

  return archivePath;
}

/**
 * Update JSON files
 */
function updateJsonFiles(prompts) {
  console.log('📝 Updating JSON files...');

  // Group by category
  const meetingsPrompts = prompts.filter(p => p.category === 'meetings');
  const presentationsPrompts = prompts.filter(p => p.category === 'presentations');

  // Format for JSON files (only task_name and prompt)
  const formatForJson = (prompts) => {
    return prompts.map(p => ({
      task_name: p.task_name,
      prompt: p.prompt,
    }));
  };

  // Update web prompts
  fs.writeFileSync(
    path.join(PATHS.webPromptsDir, 'meetings_prompts.json'),
    JSON.stringify(formatForJson(meetingsPrompts), null, 2) + '\n'
  );

  fs.writeFileSync(
    path.join(PATHS.webPromptsDir, 'presentations_prompts.json'),
    JSON.stringify(formatForJson(presentationsPrompts), null, 2) + '\n'
  );

  // Update API scripts
  fs.writeFileSync(
    path.join(PATHS.apiScriptsDir, 'meetings_prompts.json'),
    JSON.stringify(formatForJson(meetingsPrompts), null, 2) + '\n'
  );

  fs.writeFileSync(
    path.join(PATHS.apiScriptsDir, 'presentations_prompts.json'),
    JSON.stringify(formatForJson(presentationsPrompts), null, 2) + '\n'
  );

  console.log(`✅ Updated JSON files (${meetingsPrompts.length} meetings, ${presentationsPrompts.length} presentations)`);
}

/**
 * Generate PROMPT_DESCRIPTIONS object for configure page
 */
function generatePromptDescriptions(prompts) {
  console.log('🎨 Generating PROMPT_DESCRIPTIONS object...');

  let output = 'const PROMPT_DESCRIPTIONS: Record<string, PromptDescription> = {\n';

  for (const prompt of prompts) {
    const desc = prompt.description;
    output += `  '${prompt.task_name}': {\n`;
    output += `    what: '${desc.what}',\n`;
    output += `    why: '${desc.why}',\n`;
    output += `    how: '${desc.how}',\n`;
    output += `    who: '${desc.who}',\n`;
    output += `  },\n`;
  }

  output += '};\n';

  return output;
}

/**
 * Update PROMPT_DESCRIPTIONS in configure page
 */
function updateConfigurePage(prompts) {
  console.log('📄 Updating configure page PROMPT_DESCRIPTIONS...');

  const configPath = PATHS.configurePage;
  let content = fs.readFileSync(configPath, 'utf-8');

  const newDescriptions = generatePromptDescriptions(prompts);

  // Replace the PROMPT_DESCRIPTIONS object
  const regex = /const PROMPT_DESCRIPTIONS: Record<string, PromptDescription> = \{[\s\S]*?\n\};/;

  if (regex.test(content)) {
    content = content.replace(regex, newDescriptions.trim());
    fs.writeFileSync(configPath, content);
    console.log('✅ Updated configure page');
  } else {
    console.warn('⚠️  Could not find PROMPT_DESCRIPTIONS in configure page');
  }
}

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Update database via admin API
 */
async function updateDatabase(prompts, accessToken) {
  console.log('🗄️  Updating database via admin API...');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  // Get existing prompts
  let existingPrompts = [];
  try {
    existingPrompts = await makeRequest(`${API_URL}/api/v1/admin/prompts`, { headers });
    console.log(`📊 Found ${existingPrompts.length} existing prompts in database`);
  } catch (error) {
    console.error('❌ Failed to fetch existing prompts:', error.message);
    return;
  }

  // Create a map of existing prompts by task_name
  const existingMap = new Map();
  for (const prompt of existingPrompts) {
    existingMap.set(prompt.task_name, prompt);
  }

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const prompt of prompts) {
    const existing = existingMap.get(prompt.task_name);

    const data = {
      task_name: prompt.task_name,
      description: `What: ${prompt.description.what}\nWhy: ${prompt.description.why}\nHow: ${prompt.description.how}\nWho: ${prompt.description.who}`,
      prompt_json: prompt.prompt,
      category: prompt.category,
    };

    try {
      if (existing) {
        // Update existing prompt
        await makeRequest(`${API_URL}/api/v1/admin/prompts/${existing.id}`, {
          method: 'PATCH',
          headers,
          body: data,
        });
        updated++;
        console.log(`  ✏️  Updated: ${prompt.task_name}`);
      } else {
        // Create new prompt
        await makeRequest(`${API_URL}/api/v1/admin/prompts`, {
          method: 'POST',
          headers,
          body: data,
        });
        created++;
        console.log(`  ➕ Created: ${prompt.task_name}`);
      }
    } catch (error) {
      errors++;
      console.error(`  ❌ Error with ${prompt.task_name}:`, error.message);
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Database sync complete: ${created} created, ${updated} updated, ${errors} errors`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node scripts/sync-prompts.js <path-to-markdown-file> [access-token]');
    console.error('   Example: node scripts/sync-prompts.js ./ScriptRipper_Tightened-Prompts_(20251118).md YOUR_TOKEN');
    process.exit(1);
  }

  const markdownPath = args[0];
  const accessToken = args[1] || process.env.ACCESS_TOKEN;

  if (!fs.existsSync(markdownPath)) {
    console.error(`❌ File not found: ${markdownPath}`);
    process.exit(1);
  }

  console.log('\n🚀 Starting Prompt Sync Process...\n');

  try {
    // Step 1: Parse markdown
    const prompts = parseMarkdownPrompts(markdownPath);

    // Step 2: Archive current prompts
    const archivePath = archiveCurrentPrompts();

    // Step 3: Update JSON files
    updateJsonFiles(prompts);

    // Step 4: Update configure page
    updateConfigurePage(prompts);

    // Step 5: Update database (if token provided)
    if (accessToken) {
      await updateDatabase(prompts, accessToken);
    } else {
      console.log('\n⚠️  No access token provided, skipping database update');
      console.log('   To update database, provide token as second argument or set ACCESS_TOKEN env var');
    }

    console.log('\n🎉 Prompt sync completed successfully!\n');
    console.log('Summary:');
    console.log(`  📦 Archived to: ${archivePath}`);
    console.log(`  📝 Updated JSON files in web/src/app/configure/prompts/`);
    console.log(`  📝 Updated JSON files in api/scripts/`);
    console.log(`  📄 Updated PROMPT_DESCRIPTIONS in configure page`);
    if (accessToken) {
      console.log(`  🗄️  Updated database via admin API`);
    }

  } catch (error) {
    console.error('\n❌ Error during sync:', error);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main();
}

module.exports = { parseMarkdownPrompts, archiveCurrentPrompts, updateJsonFiles, updateConfigurePage };
