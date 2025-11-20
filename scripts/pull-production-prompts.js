#!/usr/bin/env node

/**
 * Pull Production Prompts to Local Database
 *
 * This script:
 * 1. Fetches all prompts from production API
 * 2. Syncs them to local database via admin API
 * 3. Creates a backup before updating
 *
 * Usage:
 *   1. Login to local dev at http://localhost:3000/login
 *   2. Open DevTools → Application → Local Storage
 *   3. Copy the 'access_token' value
 *   4. Run: ACCESS_TOKEN=<your_token> node scripts/pull-production-prompts.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PROD_API = 'https://scriptripper-api.onrender.com';
const LOCAL_API = process.env.LOCAL_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ ERROR: ACCESS_TOKEN environment variable is required');
  console.error('\nUsage:');
  console.error('  1. Login at http://localhost:3000/login');
  console.error('  2. Open DevTools → Application → Local Storage');
  console.error('  3. Copy the "access_token" value');
  console.error('  4. Run: ACCESS_TOKEN=<your_token> node scripts/pull-production-prompts.js\n');
  process.exit(1);
}

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = lib.request(url, requestOptions, (res) => {
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
 * Fetch prompts from production
 */
async function fetchProductionPrompts() {
  console.log('📥 Fetching prompts from production...');
  console.log(`   URL: ${PROD_API}/api/v1/prompts`);

  try {
    const prompts = await makeRequest(`${PROD_API}/api/v1/prompts`);
    const totalPrompts = (prompts.meetings?.length || 0) + (prompts.presentations?.length || 0);

    console.log(`✅ Found ${totalPrompts} prompts in production`);
    console.log(`   - Meetings: ${prompts.meetings?.length || 0}`);
    console.log(`   - Presentations: ${prompts.presentations?.length || 0}`);

    return prompts;
  } catch (error) {
    console.error('❌ Failed to fetch production prompts:', error.message);
    throw error;
  }
}

/**
 * Fetch all prompts from local database (for backup)
 */
async function fetchLocalPrompts() {
  console.log('\n📦 Backing up local prompts...');

  try {
    const headers = {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    };

    const localPrompts = await makeRequest(
      `${LOCAL_API}/api/v1/admin/prompts`,
      { headers }
    );

    const totalLocal = localPrompts.length || 0;
    console.log(`✅ Backed up ${totalLocal} local prompts`);

    // Save backup
    const backupDir = path.join(__dirname, '..', 'prompt-archive', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `local-prompts-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(localPrompts, null, 2));

    console.log(`   Saved to: ${backupPath}`);

    return localPrompts;
  } catch (error) {
    console.error('❌ Failed to backup local prompts:', error.message);
    throw error;
  }
}

/**
 * Sync a single prompt to local database
 */
async function syncPrompt(prompt, category) {
  const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  };

  try {
    // Check if prompt exists
    const existingPrompts = await makeRequest(
      `${LOCAL_API}/api/v1/admin/prompts`,
      { headers }
    );

    const existing = existingPrompts.find(
      p => p.task_name === prompt.task_name && p.category === category
    );

    if (existing) {
      // Update existing prompt
      await makeRequest(
        `${LOCAL_API}/api/v1/admin/prompts/${existing.id}`,
        {
          method: 'PUT',
          headers,
          body: {
            task_name: prompt.task_name,
            category: category,
            description: prompt.description,
            prompt_json: prompt.prompt,
            is_active: true,
          },
        }
      );
      return 'updated';
    } else {
      // Create new prompt
      await makeRequest(
        `${LOCAL_API}/api/v1/admin/prompts`,
        {
          method: 'POST',
          headers,
          body: {
            task_name: prompt.task_name,
            category: category,
            description: prompt.description,
            prompt_json: prompt.prompt,
            is_active: true,
          },
        }
      );
      return 'created';
    }
  } catch (error) {
    console.error(`   ❌ Failed to sync "${prompt.task_name}":`, error.message);
    return 'failed';
  }
}

/**
 * Main sync function
 */
async function main() {
  try {
    console.log('🔄 Syncing Production Prompts → Local Database\n');
    console.log('═'.repeat(60));

    // Step 1: Fetch production prompts
    const prodPrompts = await fetchProductionPrompts();

    // Step 2: Backup local prompts
    await fetchLocalPrompts();

    // Step 3: Sync prompts
    console.log('\n🔄 Syncing prompts to local database...\n');

    let created = 0;
    let updated = 0;
    let failed = 0;

    // Sync meetings
    for (const prompt of prodPrompts.meetings || []) {
      process.stdout.write(`   Syncing "${prompt.task_name}"... `);
      const result = await syncPrompt(prompt, 'meetings');

      if (result === 'created') {
        console.log('✅ created');
        created++;
      } else if (result === 'updated') {
        console.log('✅ updated');
        updated++;
      } else {
        console.log('❌ failed');
        failed++;
      }
    }

    // Sync presentations
    for (const prompt of prodPrompts.presentations || []) {
      process.stdout.write(`   Syncing "${prompt.task_name}"... `);
      const result = await syncPrompt(prompt, 'presentations');

      if (result === 'created') {
        console.log('✅ created');
        created++;
      } else if (result === 'updated') {
        console.log('✅ updated');
        updated++;
      } else {
        console.log('❌ failed');
        failed++;
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Sync Complete!\n');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed:  ${failed}`);
    console.log('\n📊 Verify at: http://localhost:3000/configure\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Run
main();
